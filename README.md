# Do Carmo Backend (Render)

API Node/Express pronta para deploy no Render (free).

## Como rodar local
1) Copie `.env.example` para `.env` e preencha.
2) Instale deps:
```bash
npm install
```
3) Rode:
```bash
npm run dev
```

## Deploy no Render
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Adicione as ENV vars no painel (mesmas do `.env.example`).

## Endpoints
- GET `/health`
- POST `/auth/login`
- CRUD:
  - `/categories`
  - `/subcategories`
  - `/products`
  - `/orders`
- Mercado Pago:
  - POST `/mercadopago/preference`
  - POST `/webhooks/mercadopago`

> Observação: este template já tem estrutura, validação e auth JWT.
> Você só precisa ligar as queries no MySQL (arquivos em `src/db/` e `src/repositories/`).
