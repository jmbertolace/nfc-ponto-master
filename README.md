# EduPoints Bank

BANCO ESCOLAR NFC — PROF. JOBER



Crie um aplicativo web responsivo, com aparência de aplicativo Android, chamado BANCO ESCOLAR NFC — PROF. JOBER.



O sistema será utilizado por professores e alunos em atividades pedagógicas. A proposta é utilizar cartões NFC para identificar os alunos e um celular Android com NFC como terminal de consulta e lançamento.



IMPORTANTE: o sistema NÃO envolve dinheiro real, pagamentos reais ou qualquer integração financeira.



A moeda/pontuação fictícia utilizada no sistema deve ser chamada de:



P$



Onde P$ significa Pontos.



Nunca utilizar R$, reais, dinheiro real ou qualquer símbolo de moeda financeira.



---



1. OBJETIVO DO SISTEMA



O aplicativo deve funcionar como uma espécie de "banco de pontos" pedagógico.



Cada aluno possui:



- Cadastro;

- Cartão NFC vinculado;

- Saldo em P$;

- Histórico de movimentações;

- Atividades;

- Avaliações;

- Notas;

- Desempenho acadêmico.



O professor possui controle total sobre os lançamentos.



Os alunos possuem apenas acesso de consulta.



---



2. PERFIS DE USUÁRIO



Criar dois níveis de acesso:



PROFESSOR



Acesso administrativo protegido por autenticação.



O professor pode:



- cadastrar alunos;

- editar alunos;

- cadastrar turmas;

- vincular cartões NFC;

- alterar cartão NFC;

- lançar P$;

- retirar P$;

- corrigir P$;

- fazer transferências;

- lançar atividades;

- lançar notas;

- alterar notas;

- consultar histórico;

- gerar relatórios;

- visualizar desempenho;

- bloquear/desbloquear alunos;

- iniciar e encerrar jogos;

- configurar o sistema.



ALUNO



Acesso somente para consulta.



O aluno NÃO pode:



- alterar P$;

- lançar P$;

- excluir P$;

- alterar notas;

- excluir atividades;

- alterar seu cadastro;

- fazer transferências;

- acessar dados administrativos de outros alunos.



O aluno poderá consultar:



- seu saldo em P$;

- seu histórico;

- suas atividades;

- suas avaliações;

- suas notas;

- sua média;

- seu desempenho.



---



3. TELA INICIAL



Criar uma tela inicial moderna, simples e visualmente semelhante a uma maquininha de cartão.



Título:



BANCO ESCOLAR NFC



Subtítulo:



PROF. JOBER



Mostrar:



💳 APROXIME SEU CARTÃO



Status:



🟢 NFC ATIVO



Botões:



- CONSULTAR CARTÃO

- ACESSO DO PROFESSOR



A tela deve funcionar muito bem em celular Android.



---



4. LEITOR NFC



Criar uma tela específica chamada:



LEITOR NFC



Mostrar uma animação/indicador visual de aproximação do cartão.



Mensagem:



Aproxime o cartão NFC do celular



Quando um cartão NFC for detectado:



1. Ler o identificador NFC;

2. Procurar o cartão no banco de dados;

3. Encontrar o aluno vinculado;

4. Mostrar os dados do aluno.



Exemplo:



JOÃO SILVA



Turma: 2º Ano do Ensino Médio



Saldo:



P$ 1.850



Não armazenar o saldo diretamente no cartão NFC.



O cartão NFC deve funcionar somente como identificador.



---



5. CADASTRO DE CARTÃO NFC



No modo professor criar:



CADASTRAR CARTÃO



Fluxo:



1. Professor seleciona o aluno;

2. Clica em "Vincular cartão";

3. O sistema solicita:

   "Aproxime o cartão NFC";

4. O sistema lê o identificador;

5. Confirma a vinculação.



Mostrar:



Aluno: João Silva



Cartão:



NFC ID: XXXXXXXX



Status:



🟢 Vinculado



Permitir trocar o cartão caso seja perdido ou danificado.



O saldo e histórico devem permanecer vinculados ao aluno, não ao cartão.



---



6. CADASTRO DE TURMAS



Criar tela:



TURMAS



Permitir:



- criar turma;

- editar turma;

- arquivar turma;

- visualizar alunos.



Exemplos:



- 6º Ano

- 7º Ano

- 8º Ano

- 9º Ano

- 1º Ano Ensino Médio

- 2º Ano Ensino Médio

- 3º Ano Ensino Médio



Permitir cadastrar nome personalizado.



---



7. CADASTRO DE ALUNOS



Criar tela:



ALUNOS



Campos:



- Nome completo;

- Nome de exibição;

- Turma;

- Número/chamada;

- Identificador;

- Cartão NFC;

- Status ativo/inativo;

- Avatar opcional.



Mostrar lista dos alunos com:



Nome | Turma | Saldo P$ | Status



---



8. SISTEMA DE PONTOS P$



O saldo de cada aluno deve ser calculado e armazenado como pontos.



Exemplo:



Saldo atual: P$ 1.500



Operações possíveis:



- Receber P$;

- Descontar P$;

- Bônus;

- Penalidade;

- Transferência;

- Correção manual.



Todos os valores devem aparecer sempre com o prefixo:



P$



Exemplos:



P$ 50

P$ 100

P$ 1.500



Nunca utilizar R$.



---



9. LANÇAMENTO DE P$



Somente o professor pode fazer lançamentos.



Criar tela:



LANÇAR PONTOS



Campos:



Aluno;



Tipo:



- Bônus;

- Atividade;

- Participação;

- Desafio;

- Trabalho;

- Outros.



Valor:



P$ ______



Descrição/motivo:



---



Botão:



CONFIRMAR LANÇAMENTO



Antes de confirmar mostrar:



Aluno: João Silva



Operação:



+ P$ 100



Motivo:



Atividade concluída



[ CANCELAR ]



[ CONFIRMAR ]



---



10. DESCONTO DE P$



Somente professor.



Criar operação:



DESCONTAR PONTOS



Campos:



Aluno;



Valor;



Motivo.



Mostrar confirmação antes de executar.



Nunca permitir que uma operação faça o saldo ficar abaixo de zero, exceto se o professor habilitar uma opção de saldo negativo nas configurações.



---



11. TRANSFERÊNCIA DE P$



Somente professor.



Criar tela:



TRANSFERÊNCIA



Campos:



Aluno de origem;



Aluno de destino;



Valor;



Motivo opcional.



Exemplo:



João Silva → Maria Souza



P$ 200



Após confirmação:



João:



P$ 1.500 → P$ 1.300



Maria:



P$ 800 → P$ 1.000



Registrar duas movimentações vinculadas à mesma transação.



---



12. HISTÓRICO



Criar tela:



HISTÓRICO



Registrar absolutamente todas as alterações de P$.



Cada registro deve conter:



- data;

- horário;

- aluno;

- tipo;

- valor;

- saldo anterior;

- saldo posterior;

- motivo;

- usuário responsável;

- identificador da transação.



Exemplo:



14/09/2026 — 16:30



João Silva



Atividade concluída



+ P$ 100



Saldo anterior: P$ 1.400



Saldo atual: P$ 1.500



Responsável: Prof. Jober



---



13. AUDITORIA



Criar sistema de auditoria.



Toda alteração feita pelo professor deve ser registrada.



Registrar:



- quem realizou;

- data;

- horário;

- aluno afetado;

- valor anterior;

- valor novo;

- motivo;

- operação.



O histórico de auditoria não deve poder ser apagado pelo aluno.



---



14. ATIVIDADES



Preparar a estrutura para a V2.



Criar módulo:



ATIVIDADES



Campos:



- Nome da atividade;

- Disciplina;

- Turma;

- Data;

- Prazo;

- Valor;

- Descrição;

- Status.



Cada aluno poderá ter:



- Pendente;

- Entregue;

- Não entregue;

- Entregue atrasado.



Preparar estrutura para lançamento de nota.



---



15. AVALIAÇÕES



Criar módulo:



AVALIAÇÕES



Campos:



- Nome;

- Disciplina;

- Turma;

- Data;

- Valor máximo;

- Descrição.



Cada aluno terá uma nota.



Exemplo:



Avaliação Trimestral de Matemática



Valor: 10 pontos



João:



8,5



Maria:



9,0



---



16. DESEMPENHO DO ALUNO



Criar tela:



MEU DESEMPENHO



Mostrar somente os dados do aluno autenticado/identificado.



Exibir:



P$ ATUAIS



P$ 1.850



ATIVIDADES



Entregues: 8



Pendentes: 2



AVALIAÇÕES



Média: 8,5



DESEMPENHO



Mostrar gráfico simples de evolução.



---



17. CONSULTA DO ALUNO PELO NFC



Quando o aluno aproximar seu cartão:



Mostrar:



JOÃO SILVA



2º Ano do Ensino Médio



P$ 1.850



Botões somente de consulta:



- 💳 Meu saldo

- 📜 Meu histórico

- 📚 Minhas atividades

- 📝 Minhas avaliações

- 📊 Meu desempenho



Não mostrar botões administrativos.



Não permitir qualquer edição.



---



18. ACESSO DO PROFESSOR



Criar tela:



ACESSO DO PROFESSOR



Utilizar autenticação segura.



Após login mostrar:



PAINEL DO PROFESSOR



Cards:



👥 Alunos



🏫 Turmas



💳 Cartões NFC



💰 Pontos P$



📚 Atividades



📝 Avaliações



📊 Desempenho



📜 Histórico



⚙️ Configurações



---



19. DASHBOARD DO PROFESSOR



Mostrar:



Total de alunos;



Total de turmas;



Total de P$ distribuídos;



Quantidade de transações;



Atividades cadastradas;



Avaliações cadastradas.



Criar gráficos simples:



- distribuição de pontos;

- evolução da turma;

- média das avaliações;

- atividades entregues.



---



20. SEGURANÇA



Implementar controle de acesso baseado em função:



ROLE_PROFESSOR



ROLE_ALUNO



O professor possui permissões de leitura e escrita.



O aluno possui apenas permissões de leitura dos próprios dados.



Um aluno nunca poderá consultar os dados de outro aluno.



Todas as operações administrativas devem exigir autenticação.



---



21. BANCO DE DADOS



Criar estrutura organizada para:



USERS



- id

- nome

- email

- role



TURMAS



- id

- nome

- ano

- status



ALUNOS



- id

- nome

- turma_id

- numero

- status



CARTOES_NFC



- id

- aluno_id

- nfc_uid

- status

- data_vinculacao



SALDOS



- id

- aluno_id

- saldo_pontos



TRANSACOES



- id

- aluno_id

- tipo

- valor

- saldo_anterior

- saldo_posterior

- motivo

- usuario_id

- data_hora

- transaction_group_id



ATIVIDADES



- id

- turma_id

- nome

- disciplina

- data

- prazo

- valor



ENTREGAS_ATIVIDADES



- id

- atividade_id

- aluno_id

- status

- nota

- data_entrega



AVALIACOES



- id

- turma_id

- nome

- disciplina

- data

- valor_maximo



NOTAS_AVALIACOES



- id

- avaliacao_id

- aluno_id

- nota



AUDITORIA



- id

- usuario_id

- aluno_id

- operacao

- valor_anterior

- valor_novo

- motivo

- data_hora



---



22. DESIGN



Criar interface moderna, limpa e intuitiva.



Estilo:



- aplicativo financeiro/gamificado;

- cards arredondados;

- ícones grandes;

- excelente leitura em celular;

- botões grandes;

- navegação simples;

- responsivo.



Identidade:



BANCO ESCOLAR NFC



PROF. JOBER



Utilizar uma identidade visual relacionada a:



- Matemática;

- tecnologia;

- NFC;

- educação;

- pontos/gamificação.



Não utilizar aparência de banco financeiro real.



Deixar visualmente claro que:



P$ = Pontos pedagógicos.



---



23. MENU INFERIOR NO CELULAR



No modo professor:



🏠 Início



👥 Alunos



💳 NFC



📚 Atividades



📊 Mais



No modo aluno:



🏠 Início



💳 Meu cartão



📚 Atividades



📊 Desempenho



---



24. FUNCIONAMENTO OFFLINE



A primeira versão deve priorizar funcionamento offline ou com conexão instável.



O sistema deve evitar depender de internet para:



- consultar aluno;

- ler NFC;

- consultar saldo;

- consultar histórico;

- realizar lançamentos locais.



Preparar a arquitetura para futura sincronização em nuvem.



---



25. IMPORTANTE SOBRE NFC



O sistema deve ser preparado para utilizar o NFC nativo de aparelhos Android compatíveis.



O aplicativo deve:



- detectar aproximação;

- ler o identificador disponível;

- localizar o cartão cadastrado;

- identificar o aluno;

- mostrar os dados correspondentes.



Não armazenar informações financeiras reais no cartão.



O NFC serve somente como identificação.



Caso o navegador/PWA não tenha acesso adequado ao NFC, manter a arquitetura preparada para que posteriormente seja criado um APK Android nativo com suporte completo ao NFC.



---



26. PRIMEIRA VERSÃO FUNCIONAL



Priorizar primeiro estas funções:



1. Login do professor;

2. Cadastro de turma;

3. Cadastro de aluno;

4. Cadastro/vinculação de cartão NFC;

5. Leitura/identificação do cartão;

6. Cadastro do saldo inicial;

7. Lançamento de P$;

8. Desconto de P$;

9. Transferência de P$;

10. Consulta do saldo;

11. Histórico;

12. Controle de permissões;

13. Auditoria.



As telas de atividades e avaliações devem ser criadas na estrutura do projeto, mas podem inicialmente funcionar como módulos preparados para a segunda etapa.



---



27. REGRA FUNDAMENTAL



O sistema nunca deve utilizar dinheiro real.



Toda ocorrência de pontuação deve utilizar:



P$ = Pontos



Exemplo:



P$ 100



e não:



R$ 100



O objetivo é criar uma ferramenta educacional de gamificação para utilização em sala de aula.



Nome oficial:



BANCO ESCOLAR NFC — PROF. JOBER



Crie a aplicação com código organizado, componentes reutilizáveis, banco de dados estruturado e arquitetura preparada para expansão futura.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nfc-ponto-master.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4d50b0ed-22b0-419f-81e6-56d0420390b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
