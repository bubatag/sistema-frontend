# 🐃 BUBATAG — Sistema de Monitoramento

### Monitoramento inteligente de rebanhos por meio de IoT, software e dados.

O **BUBATAG Sistema** é uma plataforma web desenvolvida para auxiliar produtores rurais no gerenciamento e monitoramento de rebanhos bubalinos.

A aplicação reúne informações dos animais, dispositivos IoT e indicadores de monitoramento em uma interface centralizada, permitindo acompanhar dados importantes relacionados à saúde, localização e condições dos equipamentos.

Por meio da integração entre Internet das Coisas (IoT), desenvolvimento de software e análise de dados, o BUBATAG busca tornar o manejo do rebanho mais seguro, eficiente e inteligente, contribuindo para o bem-estar animal e uma produção mais sustentável.

---

## 🚀 Acesse o BUBATAG

O sistema BUBATAG está hospedado na plataforma **Render**, permitindo que produtores rurais, avaliadores, integrantes da equipe e demais interessados acessem a aplicação diretamente pelo navegador, sem precisar instalar dependências ou executar o projeto localmente.

### 🌐 Sistema online

**[CLIQUE AQUI PARA ACESSAR O BUBATAG](https://sistema-frontend-sor9.onrender.com/login)**

🔗 Link direto: https://sistema-frontend-sor9.onrender.com/login

A aplicação pode ser acessada de qualquer dispositivo com conexão à internet e um navegador compatível.

### Como acessar?

1. Clique no link de acesso à plataforma.
2. Aguarde o carregamento da aplicação.
3. Na tela de login, informe suas credenciais de acesso.
4. Após a autenticação, navegue pelos módulos disponíveis para conhecer as funcionalidades do sistema.

**Observação:** o frontend está hospedado no Render e utiliza a API do BUBATAG para comunicação e gerenciamento dos dados.

Caso queira executar o projeto localmente para desenvolvimento, manutenção ou modificações no código, consulte a seção [Como executar o projeto localmente](#-como-executar-o-projeto-localmente).

---

## 📌 Sobre o projeto

O sistema foi desenvolvido para facilitar o acompanhamento das atividades relacionadas à criação de búfalos, oferecendo ao produtor ferramentas para consultar e gerenciar informações do rebanho.

A plataforma permite centralizar informações dos animais e suas respectivas coleiras inteligentes, facilitando a identificação de possíveis ocorrências que necessitam de atenção.

### Objetivos do sistema

- Centralizar as informações dos animais e dispositivos de monitoramento.
- Acompanhar indicadores relacionados à saúde dos bubalinos.
- Facilitar a identificação de animais em situação de alerta.
- Gerenciar o cadastro e a vinculação das coleiras inteligentes.
- Visualizar a localização dos animais em um mapa interativo.
- Auxiliar o produtor na tomada de decisões relacionadas ao manejo.

## ✨ Funcionalidades

A plataforma possui diferentes módulos, organizados para facilitar a navegação e o gerenciamento do rebanho.

| Módulo | Descrição |
|---|---|
| Início | Apresenta uma visão geral do rebanho, indicadores e alertas ativos. |
| Dashboard | Exibe indicadores de monitoramento, temperatura média, coleiras e gráficos. |
| Bubalinos | Permite cadastrar, consultar, editar, pesquisar e excluir animais. |
| Coleiras | Gerencia os dispositivos IoT, seus cadastros, estados e vínculos com os animais. |
| Localização | Apresenta os animais em um mapa interativo, conforme as coordenadas disponíveis. |
| Histórico | Permite acompanhar informações e registros anteriores de monitoramento. |
| Perfil | Disponibiliza informações e configurações relacionadas ao usuário. |
| Autenticação | Oferece funcionalidades de login, cadastro e gerenciamento de sessão. |

### Monitoramento dos animais

Entre as informações acompanhadas estão:

- Temperatura corporal.
- Frequência cardíaca.
- Estado de saúde e estresse.
- Identificação do animal por etiqueta.
- Localização geográfica.
- Informações da coleira vinculada.

### Estados de monitoramento

| Status | Significado |
|---|---|
| 🟢 Saudável | Animal sem alerta de saúde identificado. |
| 🔴 Estressado | Animal identificado em situação de alerta relacionado ao estresse. |
| 🟡 Fora da área | Animal identificado fora da área monitorada. |
| ⚪ Sem conexão | Ausência de comunicação ou de dados recentes do dispositivo. |

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| React | Construção das interfaces e componentes da aplicação. |
| Vite | Ferramenta de desenvolvimento e compilação do frontend. |
| JavaScript | Linguagem de programação. |
| Tailwind CSS | Estilização e construção dos layouts. |
| React Router | Gerenciamento das rotas e navegação. |
| TanStack Query | Gerenciamento e atualização dos dados obtidos pela API. |
| Axios | Comunicação HTTP com o backend. |
| Leaflet | Exibição de mapas interativos. |
| React Leaflet | Integração dos mapas com React. |
| Lucide React | Biblioteca de ícones. |
| Radix UI | Componentes de interface e elementos interativos. |
| Sonner | Exibição de notificações e mensagens ao usuário. |

---

## 💻 Como executar o projeto localmente

Embora o sistema já esteja disponível online pelo Render, também é possível executar o projeto localmente para desenvolvimento, manutenção e testes.

Siga as instruções abaixo para configurar e executar o sistema em seu computador.

### 1. Pré-requisitos

Antes de começar, certifique-se de possuir as seguintes ferramentas instaladas:

- Node.js: versão 20 LTS recomendada.
- npm: gerenciador de pacotes instalado junto com o Node.js.
- Git: ferramenta para clonar e gerenciar o repositório.
- Visual Studio Code: editor de código recomendado.

Links para instalação:

- [Download do Node.js](https://nodejs.org/)
- [Download do Git](https://git-scm.com/)
- [Download do Visual Studio Code](https://code.visualstudio.com/)

Para verificar se as ferramentas estão instaladas, abra o terminal e execute:

```bash
node -v
npm -v
git --version
```

### 2. Clonar o repositório

Abra o terminal ou PowerShell e execute:

```bash
git clone https://github.com/bubatag/sistema-frontend.git
```

Entre na pasta do repositório:

```bash
cd sistema-frontend
```

### 3. Entrar na pasta da aplicação

O código do frontend está dentro da pasta `sistema-front`. É necessário entrar nela antes de instalar as dependências.

```bash
cd sistema-front
```

A estrutura do caminho deverá estar assim:

```text
sistema-frontend/
└── sistema-front/
    ├── package.json
    ├── package-lock.json
    └── src/
```

### 4. Instalar as dependências

Agora que o terminal está dentro da pasta `sistema-front`, execute:

```bash
npm ci
```

Esse comando instala as dependências utilizando as versões registradas no arquivo `package-lock.json`.

**Importante:** não execute esse comando na pasta principal `sistema-frontend`, pois o arquivo `package.json` está dentro de `sistema-front`.

### 5. Executar o projeto

Após instalar as dependências, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite iniciará a aplicação e exibirá um endereço no terminal.

Normalmente, o endereço será:

```text
http://localhost:5173
```

Abra esse endereço no navegador para acessar o sistema.

### 6. Encerrar a execução

Para interromper o servidor de desenvolvimento, volte ao terminal e pressione:

```text
Ctrl + C
```

---

## ⚙️ Scripts disponíveis

Os seguintes comandos estão configurados no `package.json`:

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento utilizando Vite. |
| `npm run build` | Gera a versão compilada para produção na pasta `dist/`. |
| `npm run preview` | Executa uma prévia local da versão compilada. |
| `npm run lint` | Executa a análise estática do código utilizando ESLint. |

### Verificar o projeto antes de publicar

Para verificar se o código está compilando corretamente, execute:

```bash
npm run lint
npm run build
```

Caso ambos os comandos sejam executados sem erros, o projeto terá passado pelas verificações de lint e compilação.

---

## 🔗 Integração com a API

O frontend se comunica com a API do BUBATAG para consultar e gerenciar as informações dos usuários, animais e coleiras.

A comunicação é realizada por meio do Axios, enquanto o TanStack Query auxilia no gerenciamento das consultas e atualização dos dados.

### Endereço da API

Atualmente, o projeto utiliza os seguintes endereços:

| Ambiente | Endereço |
|---|---|
| API hospedada | `https://api-bubatag.onrender.com` |
| API local | `http://localhost:3000` |

O endereço hospedado é utilizado como padrão. Caso o serviço remoto esteja indisponível por falha de conexão ou determinados erros de servidor, o frontend tenta utilizar a API local.

### Autenticação

A aplicação utiliza autenticação baseada em token JWT.

Após realizar o login:

1. O backend retorna os dados do usuário e o token de autenticação.
2. O frontend armazena essas informações no `localStorage`.
3. O Axios adiciona automaticamente o token às requisições.
4. As rotas da aplicação são disponibilizadas conforme o estado de autenticação.

Caso a sessão expire, os dados locais de autenticação são removidos e o usuário é direcionado para a tela de login.

### Executar com a API local

Caso queira desenvolver utilizando o backend em sua máquina, primeiro é necessário clonar e executar o projeto da API.

**Repositório:**

[API-BUBATAG](https://github.com/bubatag/API-bubatag)

Depois, certifique-se de que a API esteja funcionando na porta `3000`.

O frontend já possui uma configuração de fallback para tentar essa conexão quando a API hospedada estiver indisponível.

Observação: o endereço da API está definido no arquivo `src/services/api.js`. Para modificar os endereços utilizados, consulte esse arquivo.

---

## 🐃 Ambiente de demonstração — Dados de teste

O BUBATAG possui uma proposta de ambiente de demonstração para que novos integrantes da equipe, avaliadores e interessados possam conhecer as funcionalidades do sistema sem precisar cadastrar manualmente um rebanho.

A ideia é disponibilizar um usuário de teste previamente cadastrado, com animais, etiquetas e coleiras associados à sua conta.

**Credenciais propostas para demonstração:**

| Campo | Informação |
|---|---|
| Nome | Produtor Demonstração |
| E-mail | `leo@gmail.com` |
| Senha | `123456` |

**Atenção:** essas credenciais são uma configuração proposta para a conta de demonstração. Elas somente funcionarão depois que o usuário for criado no banco de dados pelo backend. Não representam uma conta cuja existência ou funcionamento já tenha sido confirmado.

### Dados do rebanho de demonstração

A conta de demonstração deverá possuir quatro bubalinos cadastrados, seguindo a referência visual da plataforma.

| Etiqueta | Raça | Idade | Sexo | Coleira |
|---|---|---:|---|---|
| B-001 | Murrah | 6 anos | Macho | COL-01 |
| B-002 | Murrah | 9 anos | Macho | COL-02 |
| B-003 | Murrah | 4 anos | Fêmea | Sem coleira |
| B-004 | Murrah | 7 anos | Fêmea | COL-04 |

### Informações de monitoramento

Os dados iniciais de demonstração deverão apresentar a seguinte situação:

| Etiqueta | Temperatura | Batimentos | Situação |
|---|---|---|---|
| B-001 | 34,6 °C | 77 bpm | Saudável |
| B-002 | Sem leitura | Sem leitura | Sem conexão |
| B-003 | Sem leitura | Sem leitura | Sem conexão |
| B-004 | Sem leitura | Sem leitura | Sem conexão |

Essas informações são fictícias e destinadas exclusivamente à demonstração da interface. Não representam medições reais dos animais.

### Como funcionará o cadastro dos dados de demonstração?

Os dados deverão ser inseridos no banco MongoDB por meio de um script de inicialização (*seed*) disponibilizado no projeto da API.

O processo deverá contemplar:

1. Criação do usuário de demonstração.
2. Cadastro dos quatro bubalinos.
3. Geração das respectivas etiquetas de identificação.
4. Cadastro das três coleiras.
5. Associação das coleiras aos animais correspondentes.
6. Inserção dos dados iniciais de monitoramento.
7. Associação de todos os registros ao usuário de demonstração.

O seed deverá verificar se os registros já existem antes de inseri-los, evitando duplicações quando executado novamente.

**Importante:** o seed pertence ao backend, pois é a API que controla a persistência dos dados e a associação entre usuários, animais e coleiras. O frontend apenas consulta e apresenta essas informações.

### Como acessar a demonstração?

Depois que a conta e os dados forem provisionados pelo backend:

1. Acesse o [BUBATAG pelo Render](https://sistema-frontend-sor9.onrender.com/login).
2. Abra a tela de login.
3. Faça login com as credenciais de demonstração, caso já estejam cadastradas e habilitadas.
4. Após autenticar, acesse o módulo **Bubalinos**.
5. Consulte os quatro animais cadastrados e suas respectivas informações.

Dessa forma, será possível explorar a interface com dados previamente cadastrados, incluindo a identificação dos animais, as etiquetas, os dispositivos e os indicadores de monitoramento.

> **Nota de desenvolvimento:** até que o seed seja implementado e executado na API, a conta e os registros descritos nesta seção permanecem como dados planejados para o ambiente de demonstração.

---

## 📁 Estrutura do projeto

O frontend está organizado em diretórios que separam páginas, componentes reutilizáveis, serviços, hooks e configurações.

```text
sistema-frontend/
│
├── .github/
│   └── workflows/                 # Fluxos de automação do GitHub
│
├── sistema-front/
│   │
│   ├── public/                    # Arquivos públicos e recursos estáticos
│   │
│   ├── src/
│   │   ├── api/                   # Integrações e adaptadores de dados
│   │   │
│   │   ├── components/            # Componentes reutilizáveis
│   │   │   ├── brand/             # Identidade visual e logotipo
│   │   │   ├── shared/            # Componentes compartilhados
│   │   │   ├── layout/            # Estrutura geral da aplicação
│   │   │   ├── ui/                # Componentes de interface
│   │   │   ├── bubalinos/         # Componentes do módulo de bubalinos
│   │   │   ├── coleiras/          # Componentes do módulo de coleiras
│   │   │   └── dashboard/         # Componentes do dashboard
│   │   │
│   │   ├── hooks/                 # Hooks personalizados
│   │   │
│   │   ├── lib/                   # Contextos e funções auxiliares
│   │   │
│   │   ├── pages/                 # Páginas principais
│   │   │   ├── HomePage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Bubalinos.jsx
│   │   │   ├── Coleiras.jsx
│   │   │   ├── Localizacao.jsx
│   │   │   ├── Perfil.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Cadastro.jsx
│   │   │
│   │   ├── services/              # Serviços de comunicação com a API
│   │   │
│   │   ├── App.jsx                # Rotas e organização da aplicação
│   │   ├── main.jsx               # Ponto de entrada do React
│   │   └── index.css              # Estilos globais
│   │
│   ├── index.html
│   ├── package.json               # Dependências e scripts
│   ├── package-lock.json          # Versões das dependências
│   ├── vite.config.js             # Configuração do Vite
│   ├── tailwind.config.js         # Configuração do Tailwind CSS
│   └── README.md                  # Documentação da aplicação
│
├── LICENSE
└── README.md                      # Documentação principal
```

### Organização dos principais diretórios

| Diretório | Responsabilidade |
|---|---|
| `components/` | Reúne os elementos reutilizáveis da interface. |
| `pages/` | Contém as telas principais do sistema. |
| `hooks/` | Centraliza hooks personalizados para gerenciamento de dados e comportamentos. |
| `lib/` | Contém contextos, configurações e funções auxiliares. |
| `services/` | Responsável pela comunicação com serviços externos e API. |
| `api/` | Reúne adaptadores e integrações relacionadas aos dados. |

---

## 🎨 Identidade visual

A interface do BUBATAG foi desenvolvida com uma identidade visual moderna, buscando equilibrar tecnologia, sustentabilidade e facilidade de utilização.

Entre os principais elementos visuais estão:

- Tons de verde associados à natureza e sustentabilidade.
- Interface em tema escuro.
- Componentes com organização visual e hierarquia de informações.
- Indicadores de status para facilitar a identificação de alertas.
- Ícones específicos para representar animais, dispositivos e informações.
- Layout responsivo para diferentes tamanhos de tela.

A experiência de utilização busca facilitar o acesso às informações, considerando também produtores que não possuem familiaridade com sistemas complexos.

---

## 🎓 Sobre o desenvolvimento

O BUBATAG é um Projeto Integrador desenvolvido no curso de Tecnologia em Desenvolvimento de Software Multiplataforma, da Faculdade de Tecnologia de Registro (Fatec Registro), vinculada ao Centro Paula Souza.

O projeto integra conhecimentos de desenvolvimento de software, Internet das Coisas (IoT), banco de dados e tecnologia aplicada ao agronegócio.

A proposta é desenvolver uma solução que auxilie os produtores na gestão do rebanho, utilizando tecnologia para melhorar o acompanhamento dos animais e contribuir para uma produção mais sustentável.

---

🐃 **BUBATAG — Conectando tradição e inovação.**

Tecnologia a serviço do bem-estar animal e da produção sustentável.

**Links do projeto:**

- [💻 Repositório do Frontend](https://github.com/bubatag/sistema-frontend)
- [🔌 Repositório da API](https://github.com/bubatag/API-bubatag)
- [🌐 Acessar o BUBATAG online — Render](https://sistema-frontend-sor9.onrender.com/login)
