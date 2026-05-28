# ONG Amadas 💙

Projeto semestral — Curso de ADS — IFSP

Sistema web para a ONG Amadas (Associação de Mães e Pais de Autistas de Bragança Paulista).

## Tecnologias utilizadas

**Frontend**
- React + Vite
- React Router DOM
- CSS responsivo

**Backend**
- Python + Flask
- Flask-SQLAlchemy
- Flask-CORS
- Werkzeug (hash de senhas)
- SQLite

## Como rodar o projeto

**Backend:**

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend:**

Crie um arquivo `.env` dentro da pasta `frontend` com o conteúdo:

```
VITE_API_URL=http://localhost:5000
```

Depois:

```cmd
cd frontend
npm install
npm run dev
```

## Funcionalidades

- Página inicial com carrossel de imagens
- Como ajudar (doações via PIX)
- Contato com mapa integrado
- Sistema de cadastro e login com banco de dados
- Painel administrativo (rota `/admin`, acesso via credenciais no `Login.jsx`)