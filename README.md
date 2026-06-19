# ONG Amadas 💙

Projeto semestral do curso de ADS. A aplicação apresenta a ONG Amadas e possui frontend React, API Flask e banco SQLite com quatro tabelas relacionais.

## Tecnologias

### Frontend
- React
- Vite
- React Router DOM
- CSS
- Fetch API

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Werkzeug
- SQLite3

## Estrutura

```txt
Ong-Amadas-main/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── uploads/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
└── README.md
```

## Como executar

### 1. Backend Flask + SQLite

No Windows:

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

A API será iniciada em `http://localhost:5000`. Na primeira execução, o Flask-SQLAlchemy cria automaticamente o banco SQLite e suas tabelas.

### 2. Frontend React

Em outro terminal:

```cmd
cd frontend
copy .env.example .env
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:5173`.

Conteúdo do arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Publicação na Vercel

A Vercel publica apenas o frontend. Ao importar o repositório, defina:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

O arquivo `frontend/vercel.json` evita erro 404 ao atualizar rotas como `/contato`, `/login` e `/como-ajudar`.

Sem o backend publicado, o site continua mostrando as páginas institucionais e o carrossel padrão. Cadastro, login, painel administrativo e operações do banco devem ser demonstrados localmente.

## Funcionalidades

- Página inicial e carrossel.
- Página de contato.
- Página “Como ajudar”.
- Cadastro e login.
- Rota administrativa protegida.
- Upload e gerenciamento de imagens.
- Cadastro e remoção de eventos.
- Inscrição de usuários em eventos.
- Pesquisa e exibição dos dados das quatro tabelas.

## Tabelas SQLite

1. `usuarios`
2. `imagens_carrossel`
3. `eventos`
4. `inscricoes_eventos`

## Principais rotas da API

- `POST /cadastro`
- `POST /login`
- `GET /carrossel`
- `GET /admin/dados`
- `GET` e `POST /admin/carrossel`
- `PUT` e `DELETE /admin/carrossel/<id>`
- `POST /admin/eventos`
- `DELETE /admin/eventos/<id_evento>`
- `POST /admin/inscricoes`
- `DELETE /admin/inscricoes/<id_inscricao>`

