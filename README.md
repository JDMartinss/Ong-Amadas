# ONG Amadas 💙

Projeto semestral — Curso de ADS — IFSP

Sistema web para a ONG Amadas (Associação de Mães e Pais de Autistas de Bragança Paulista).

## Tecnologias utilizadas

**Frontend**
- React + Vite
- React Router DOM
- CSS responsivo
- Consumo da API Flask com `fetch`

**Backend**
- Python + Flask
- Flask-SQLAlchemy
- Flask-CORS
- Werkzeug para hash de senha
- SQLite

## Como rodar o projeto

### Backend

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

O backend roda em:

```txt
http://localhost:5000
```

### Frontend

Crie um arquivo `.env` dentro da pasta `frontend` com o conteúdo:

```txt
VITE_API_URL=http://localhost:5000
```

Depois rode:

```cmd
cd frontend
npm install
npm run dev
```

O frontend roda normalmente em:

```txt
http://localhost:5173
```

## Funcionalidades do projeto

- Página inicial com carrossel de imagens.
- Sistema de cadastro e login de usuários.
- Painel administrativo protegido pela rota `/admin`.
- Upload, listagem, edição de descrição e remoção de imagens do carrossel.
- Cadastro de eventos no painel administrativo.
- Inscrição de usuários em eventos.
- Listagem das 4 tabelas principais no painel administrativo.
- Filtro de usuários por nome/e-mail.
- Filtro de eventos por nome, data, local ou descrição.
- Filtros também refletem na listagem de inscrições.

## Tabelas do banco de dados

O projeto usa SQLite com as seguintes tabelas principais:

1. `usuarios`
2. `imagens_carrossel`
3. `eventos`
4. `inscricoes_eventos`

A tabela `eventos` possui os campos:

- `id_evento` — chave primária
- `nome_evento`
- `data`
- `local`
- `descricao`

A tabela `inscricoes_eventos` relaciona usuários e eventos:

- `id_inscricao` — chave primária
- `usuario_id` — chave estrangeira ligada à tabela `usuarios`
- `evento_id` — chave estrangeira ligada à tabela `eventos`
- `data_inscricao`

## Rotas principais da API

- `POST /cadastro` — cadastra usuário.
- `POST /login` — faz login.
- `GET /carrossel` — lista imagens ativas do carrossel.
- `GET /admin/dados` — lista usuários, imagens, eventos e inscrições para o painel administrativo. Aceita filtros `usuario` e `evento` pela URL.
- `GET /admin/carrossel` — lista imagens no painel administrativo.
- `POST /admin/carrossel` — adiciona imagem ao carrossel.
- `PUT /admin/carrossel/<id>` — edita descrição/ordem/status da imagem.
- `DELETE /admin/carrossel/<id>` — remove imagem do carrossel.
- `POST /admin/eventos` — cadastra evento.
- `DELETE /admin/eventos/<id_evento>` — remove evento.
- `POST /admin/inscricoes` — cadastra uma inscrição de usuário em evento.
- `DELETE /admin/inscricoes/<id_inscricao>` — remove uma inscrição.


