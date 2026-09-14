
CREATE OR REPLACE FUNCTION public.registrar_transacao(
  _aluno_id uuid, _tipo text, _valor integer, _motivo text, _group uuid DEFAULT NULL
) RETURNS public.transacoes
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _anterior integer;
  _posterior integer;
  _neg boolean;
  _nome text;
  _t public.transacoes;
BEGIN
  IF NOT public.has_role(auth.uid(),'professor') THEN
    RAISE EXCEPTION 'Apenas o professor pode movimentar pontos';
  END IF;
  SELECT saldo_pontos INTO _anterior FROM public.alunos WHERE id = _aluno_id FOR UPDATE;
  IF _anterior IS NULL THEN RAISE EXCEPTION 'Aluno nao encontrado'; END IF;
  SELECT permitir_saldo_negativo INTO _neg FROM public.configuracoes WHERE id = 1;
  _posterior := _anterior + _valor;
  IF _posterior < 0 AND NOT COALESCE(_neg,false) THEN
    RAISE EXCEPTION 'Saldo insuficiente: a operacao deixaria o aluno com saldo negativo';
  END IF;
  UPDATE public.alunos SET saldo_pontos = _posterior WHERE id = _aluno_id;
  SELECT nome INTO _nome FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.transacoes (aluno_id, tipo, valor, saldo_anterior, saldo_posterior, motivo, usuario_id, usuario_nome, transaction_group_id)
  VALUES (_aluno_id, _tipo, _valor, _anterior, _posterior, _motivo, auth.uid(), COALESCE(_nome,'Professor'), _group)
  RETURNING * INTO _t;
  INSERT INTO public.auditoria (usuario_id, usuario_nome, aluno_id, operacao, valor_anterior, valor_novo, motivo)
  VALUES (auth.uid(), COALESCE(_nome,'Professor'), _aluno_id, _tipo, _anterior::text, _posterior::text, _motivo);
  RETURN _t;
END; $$;
REVOKE ALL ON FUNCTION public.registrar_transacao(uuid,text,integer,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_transacao(uuid,text,integer,text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.transferir_pontos(
  _origem uuid, _destino uuid, _valor integer, _motivo text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _g uuid := gen_random_uuid();
BEGIN
  IF NOT public.has_role(auth.uid(),'professor') THEN
    RAISE EXCEPTION 'Apenas o professor pode transferir pontos';
  END IF;
  IF _valor <= 0 THEN RAISE EXCEPTION 'Valor deve ser maior que zero'; END IF;
  IF _origem = _destino THEN RAISE EXCEPTION 'Selecione alunos diferentes'; END IF;
  PERFORM public.registrar_transacao(_origem, 'Transferencia enviada', -_valor, _motivo, _g);
  PERFORM public.registrar_transacao(_destino, 'Transferencia recebida', _valor, _motivo, _g);
  RETURN _g;
END; $$;
REVOKE ALL ON FUNCTION public.transferir_pontos(uuid,uuid,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transferir_pontos(uuid,uuid,integer,text) TO authenticated;
