# Publicação do projeto ONG Amadas

## 1. Backend no Render

Crie um **Web Service** conectado a este repositório e configure:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn main:app`

Variáveis de ambiente no Render:

- `FRONTEND_ORIGIN=https://ong-amadas.vercel.app`
- `SECRET_KEY`: use um valor aleatório e longo

O arquivo `render.yaml` também permite criar o serviço como Blueprint.

Depois do deploy, abra a URL do Render. A rota `/` deve retornar:

```json
{"status": "API ONG Amadas funcionando!"}
```

## 2. Frontend na Vercel

Nas configurações do projeto:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Crie a variável de ambiente:

- `VITE_API_URL=https://SUA-URL-DO-RENDER.onrender.com`

Não use barra `/` no final. Depois, faça um novo Redeploy.

## 3. Teste

1. Abra a URL do backend no Render.
2. Abra o site da Vercel em aba anônima.
3. Teste cadastro, login, eventos, inscrições e carrossel.

> Observação: o SQLite no plano gratuito do Render pode perder dados após reconstruções ou reinicializações. Para apresentação acadêmica funciona, mas dados permanentes exigem disco persistente ou PostgreSQL.
