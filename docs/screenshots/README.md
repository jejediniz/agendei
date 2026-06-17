# Capturas de tela — Agendei

Guia para gerar as imagens referenciadas no README principal.

## Pré-requisitos

```bash
npm install
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e entre com:

| Papel | E-mail | Senha |
|-------|--------|-------|
| Super Admin (demo) | admin@agendei.com | admin123 |

## Telas a capturar

Salve cada captura nesta pasta com o nome indicado:

| Arquivo | Rota | O que mostrar |
|---------|------|---------------|
| `dashboard.png` | `/` | Cards de estatísticas e listas do dia |
| `agenda.png` | `/agenda` | Timeline do dia com agendamentos |
| `agendamentos.png` | `/agendamentos` | Listagem com filtros |
| `clientes.png` | `/clientes` | Tabela de clientes |
| `onboarding.png` | `/onboarding` | Wizard de configuração inicial |

## Dicas

- Use viewport **1280×800** para consistência.
- No Linux, ferramentas como Flameshot ou a captura do navegador (F12 → device toolbar desligado) funcionam bem.
- Após adicionar as imagens, o README principal exibirá as capturas automaticamente.
