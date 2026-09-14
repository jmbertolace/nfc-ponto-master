import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Leitura do NFC nativo do Android via Web NFC (Chrome Android).
 * O cartão é usado SOMENTE como identificador — nenhum dado de saldo é gravado nele.
 * Em navegadores sem suporte, a arquitetura continua a mesma: a UI oferece
 * digitação manual do identificador, e um APK nativo pode enviar o mesmo UID.
 */
type NfcStatus = "indisponivel" | "pronto" | "lendo" | "erro";

export function useNfc(onRead: (uid: string) => void) {
  const [status, setStatus] = useState<NfcStatus>("indisponivel");
  const [erro, setErro] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const callbackRef = useRef(onRead);
  callbackRef.current = onRead;

  useEffect(() => {
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      setStatus("pronto");
    }
    return () => abortRef.current?.abort();
  }, []);

  const iniciar = useCallback(async () => {
    setErro(null);
    const NDEFReaderCtor = (window as unknown as { NDEFReader?: new () => NdefReaderLike })
      .NDEFReader;
    if (!NDEFReaderCtor) {
      setStatus("indisponivel");
      setErro("Este aparelho/navegador não expõe o NFC. Use a leitura manual do identificador.");
      return;
    }
    try {
      const reader = new NDEFReaderCtor();
      const controller = new AbortController();
      abortRef.current = controller;
      await reader.scan({ signal: controller.signal });
      setStatus("lendo");
      reader.onreading = (event) => {
        const uid = (event.serialNumber || "").trim();
        if (uid) callbackRef.current(uid.toUpperCase());
      };
      reader.onreadingerror = () => setErro("Não foi possível ler o cartão. Aproxime novamente.");
    } catch (e) {
      setStatus("erro");
      setErro(e instanceof Error ? e.message : "Falha ao ativar o NFC.");
    }
  }, []);

  const parar = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus(typeof window !== "undefined" && "NDEFReader" in window ? "pronto" : "indisponivel");
  }, []);

  return { status, erro, iniciar, parar, suportado: status !== "indisponivel" };
}

type NdefReaderLike = {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: { serialNumber?: string }) => void) | null;
  onreadingerror: (() => void) | null;
};
