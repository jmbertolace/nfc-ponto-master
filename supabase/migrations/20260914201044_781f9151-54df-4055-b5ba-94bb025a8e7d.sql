
CREATE TYPE public.app_role AS ENUM ('professor','aluno');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT 'Professor',
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_self_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', 'Professor'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'professor')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ano text,
  status text NOT NULL DEFAULT 'ativa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "turmas_prof_all" ON public.turmas FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));
CREATE TRIGGER turmas_updated BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  nome_exibicao text,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  numero integer,
  identificador text,
  avatar_url text,
  saldo_pontos integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alunos_prof_all" ON public.alunos FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));
CREATE TRIGGER alunos_updated BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cartoes_nfc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  nfc_uid text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ativo',
  data_vinculacao timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cartoes_nfc TO authenticated;
GRANT ALL ON public.cartoes_nfc TO service_role;
ALTER TABLE public.cartoes_nfc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cartoes_prof_all" ON public.cartoes_nfc FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  valor integer NOT NULL,
  saldo_anterior integer NOT NULL,
  saldo_posterior integer NOT NULL,
  motivo text,
  usuario_id uuid,
  usuario_nome text,
  transaction_group_id uuid,
  data_hora timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transacoes TO authenticated;
GRANT ALL ON public.transacoes TO service_role;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transacoes_prof_select" ON public.transacoes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'professor'));
CREATE POLICY "transacoes_prof_insert" ON public.transacoes FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid,
  usuario_nome text,
  aluno_id uuid,
  operacao text NOT NULL,
  valor_anterior text,
  valor_novo text,
  motivo text,
  data_hora timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.auditoria TO authenticated;
GRANT ALL ON public.auditoria TO service_role;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auditoria_prof_select" ON public.auditoria FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'professor'));
CREATE POLICY "auditoria_prof_insert" ON public.auditoria FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  disciplina text,
  data date,
  prazo date,
  valor integer NOT NULL DEFAULT 0,
  descricao text,
  status text NOT NULL DEFAULT 'aberta',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "atividades_prof_all" ON public.atividades FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.entregas_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pendente',
  nota numeric(5,2),
  data_entrega timestamptz,
  UNIQUE (atividade_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entregas_atividades TO authenticated;
GRANT ALL ON public.entregas_atividades TO service_role;
ALTER TABLE public.entregas_atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entregas_prof_all" ON public.entregas_atividades FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  disciplina text,
  data date,
  valor_maximo numeric(5,2) NOT NULL DEFAULT 10,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avaliacoes_prof_all" ON public.avaliacoes FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.notas_avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  nota numeric(5,2),
  UNIQUE (avaliacao_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_avaliacoes TO authenticated;
GRANT ALL ON public.notas_avaliacoes TO service_role;
ALTER TABLE public.notas_avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notas_prof_all" ON public.notas_avaliacoes FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));

CREATE TABLE public.configuracoes (
  id integer PRIMARY KEY DEFAULT 1,
  permitir_saldo_negativo boolean NOT NULL DEFAULT false,
  nome_professor text NOT NULL DEFAULT 'PROF. JOBER',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT configuracoes_single_row CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_prof_all" ON public.configuracoes FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'professor')) WITH CHECK (public.has_role(auth.uid(),'professor'));
INSERT INTO public.configuracoes (id) VALUES (1);

INSERT INTO public.turmas (nome, ano) VALUES
 ('6º Ano','Fundamental'), ('7º Ano','Fundamental'), ('8º Ano','Fundamental'), ('9º Ano','Fundamental'),
 ('1º Ano Ensino Médio','Médio'), ('2º Ano Ensino Médio','Médio'), ('3º Ano Ensino Médio','Médio');
