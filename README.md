# DLG Connect

Sistema SaaS de automação para crescimento de grupos Telegram com gestão de licenças, sessões e pagamentos.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Arquitetura](#arquitetura)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Banco de Dados](#banco-de-dados)
6. [Edge Functions](#edge-functions)
7. [Fluxos de Pagamento](#fluxos-de-pagamento)
8. [Segurança](#segurança)
9. [Configuração](#configuração)
10. [Deploy](#deploy)

---

## Visão Geral

### O que é o DLG Connect?

Plataforma que permite usuários comprarem:
- **Licenças** (planos mensais) para usar o bot de automação
- **Sessões** (contas Telegram) brasileiras ou estrangeiras

### Funcionalidades para Usuários

| Funcionalidade | Descrição |
|----------------|-----------|
| Autenticação | Login/registro com email, verificação e reCAPTCHA |
| Dashboard | Visualizar licenças, sessões e histórico |
| Compra de Licenças | Planos mensais com upgrade/downgrade |
| Compra de Sessões | Combos ou quantidade personalizada |
| Download | Bot e sessões com retry automático |
| Notificações | Avisos de expiração de licença |

### Funcionalidades para Administradores

| Funcionalidade | Descrição |
|----------------|-----------|
| Gestão de Usuários | Visualizar, banir, alterar roles |
| Gestão de Licenças | Criar, editar, cancelar assinaturas |
| Gestão de Sessões | Upload, exclusão, preços |
| Gestão de Combos | Pacotes com preços especiais |
| Configurações | Modo manutenção, gateways |
| Dashboard | Métricas e estatísticas |
| Painel de Debug | Diagnóstico e testes |

---

## Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS |
| Componentes | shadcn/ui |
| Animações | Framer Motion |
| Roteamento | React Router DOM 6 |
| Estado | TanStack Query 5 |
| Backend | Supabase (Lovable Cloud) |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + TypeScript + Tailwind                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Pages    │  │  Components │  │       Hooks         │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         └────────────────┴───────────────────┬┘              │
│                                              ▼               │
│                    ┌─────────────────────┐                   │
│                    │   Supabase Client   │                   │
│                    └──────────┬──────────┘                   │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD (Supabase)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │   Storage   │  │   Edge Functions    │  │
│  │  + RLS      │  │   (Files)   │  │   (Deno Runtime)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Padrões Utilizados

- **Component-Based**: Componentes pequenos e reutilizáveis
- **Custom Hooks**: Lógica encapsulada em hooks
- **Container/Presentational**: Pages (lógica) vs Components (UI)

---

## Estrutura de Arquivos

```
dlg-connect/
├── src/
│   ├── App.tsx                    # Rotas da aplicação
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Design tokens e estilos globais
│   │
│   ├── assets/                    # Imagens e arquivos estáticos
│   │
│   ├── components/
│   │   ├── ui/                    # Componentes base (shadcn)
│   │   ├── landing/               # Landing page
│   │   └── admin/                 # Painel administrativo
│   │       ├── dashboard/         # Dashboard admin
│   │       ├── debug/             # Painel de debug
│   │       └── sessions/          # Gestão de sessões
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.tsx            # Autenticação
│   │   ├── useUserDashboard.tsx   # Dashboard do usuário
│   │   ├── useAdminSessions.tsx   # Gestão de sessões
│   │   ├── useAdminOrders.tsx     # Gestão de pedidos
│   │   ├── useAdminUsers.tsx      # Gestão de usuários
│   │   ├── useAdminSubscriptions.tsx
│   │   ├── useAdminBot.tsx
│   │   ├── useSystemSettings.tsx
│   │   └── useUpgradeCredit.tsx
│   │
│   ├── pages/
│   │   ├── Index.tsx              # Landing page (/)
│   │   ├── Login.tsx              # Login/Registro
│   │   ├── Dashboard.tsx          # Dashboard usuário
│   │   ├── Admin.tsx              # Painel admin
│   │   ├── Buy.tsx                # Página de compra
│   │   ├── Checkout.tsx           # Pagamento
│   │   └── Pagamentos.tsx         # Status pagamento
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts              # Cliente (auto-gerado)
│   │   └── types.ts               # Tipos (auto-gerado)
│   │
│   └── lib/
│       ├── utils.ts               # Utilitários
│       ├── formatters.ts          # Formatadores
│       └── auditLog.ts            # Helper de auditoria
│
├── supabase/functions/            # Edge Functions (Backend)
│   ├── admin-actions/             # Ações administrativas
│   ├── asaas/                     # Gateway Asaas
│   ├── asaas-webhook/             # Webhook Asaas
│   ├── login/                     # Autenticação
│   ├── register/                  # Registro
│   ├── forgot-password/           # Recuperação de senha
│   ├── send-email/                # Envio de emails
│   ├── cleanup-expired-orders/    # Limpeza de pedidos
│   ├── cleanup-expired-reservations/
│   ├── expire-subscriptions/      # Expiração automática
│   ├── notify-expiring-licenses/  # Notificações
│   ├── reconcile-sessions/        # Reconciliação
│   ├── reconciliation-global/     # Reconciliação global
│   └── sync-sessions-inventory/   # Sync inventário
│
├── hostinger-proxy/               # Proxy para webhooks
│   ├── .htaccess
│   ├── webhook-asaas.php
│   └── README.md
│
├── DLG_CONNECT/                   # Bot Desktop (Python + QML)
│   ├── main.py                    # Entry point do bot
│   ├── main.qml                   # Interface principal
│   ├── Theme.qml                  # Tema do bot
│   ├── components/                # Componentes QML
│   ├── pages/                     # Páginas do bot
│   └── assets/                    # Assets do bot
│
└── public/                        # Arquivos públicos
```

---

## Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (nome, email, whatsapp, avatar) |
| `user_roles` | Roles dos usuários (admin/user) |
| `subscription_plans` | Planos disponíveis |
| `user_subscriptions` | Assinaturas ativas dos usuários |
| `licenses` | Licenças dos usuários |
| `orders` | Pedidos de compra |
| `payments` | Pagamentos (PIX) |
| `session_files` | Arquivos de sessão (estoque) |
| `sessions_inventory` | Inventário consolidado |
| `session_combos` | Combos de sessões |
| `user_sessions` | Sessões compradas pelo usuário |
| `bot_files` | Versões do bot |
| `gateway_settings` | Configurações de gateways |
| `system_settings` | Configurações do sistema |

### Tabelas de Auditoria/Logs

| Tabela | Descrição |
|--------|-----------|
| `audit_logs` | Log de ações administrativas |
| `login_history` | Histórico de logins |
| `gateway_logs` | Logs de gateway |
| `processed_webhooks` | Webhooks processados (idempotência) |
| `reconciliation_runs` | Execuções de reconciliação |

### Tabelas de Saúde (Views)

| View | Descrição |
|------|-----------|
| `health_dashboard_summary` | Resumo de saúde do sistema |
| `health_pending_orders` | Pedidos pendentes |
| `health_orphaned_reservations` | Reservas órfãs |
| `health_payments_without_completion` | Pagamentos não finalizados |

### RLS (Row Level Security)

Todas as tabelas têm RLS ativado com políticas específicas:
- Usuários só veem seus próprios dados
- Admins veem e gerenciam tudo
- Service role para operações de backend

### Funções Importantes

| Função | Descrição |
|--------|-----------|
| `complete_order_atomic()` | Completa pedido atomicamente |
| `reserve_sessions_atomic()` | Reserva sessões com lock |
| `release_session_reservation()` | Libera reservas |
| `has_role()` | Verifica role do usuário |
| `get_user_role()` | Obtém role do usuário |

---

## Edge Functions

### Autenticação

| Função | Método | Descrição |
|--------|--------|-----------|
| `login` | POST | Login com rate limiting |
| `register` | POST | Registro com verificação |
| `forgot-password` | POST | Recuperação de senha |
| `send-email` | POST | Envio de emails |

### Pagamentos

| Função | Método | Descrição |
|--------|--------|-----------|
| `asaas` | POST | Cria cobrança PIX |
| `asaas-webhook` | POST | Processa webhook de pagamento |

### Manutenção

| Função | Método | Descrição |
|--------|--------|-----------|
| `cleanup-expired-orders` | POST | Limpa pedidos expirados |
| `cleanup-expired-reservations` | POST | Limpa reservas antigas |
| `expire-subscriptions` | POST | Expira assinaturas |
| `notify-expiring-licenses` | POST | Notifica licenças expirando |
| `reconcile-sessions` | POST | Reconcilia sessões |
| `reconciliation-global` | POST | Reconciliação completa |
| `sync-sessions-inventory` | POST | Sincroniza inventário |

### Administração

| Função | Método | Descrição |
|--------|--------|-----------|
| `admin-actions` | POST | Ações administrativas variadas |

---

## Fluxos de Pagamento

### Fluxo de Compra

```
1. Usuário seleciona produto (Buy.tsx)
         │
         ▼
2. Cria order (status: pending)
         │
         ▼
3. Reserva sessões (se aplicável)
   └─ reserve_sessions_atomic()
         │
         ▼
4. Gera PIX (Edge Function asaas)
         │
         ▼
5. Exibe QR Code (Checkout.tsx)
         │
         ▼
6. Webhook confirma pagamento
         │
         ▼
7. complete_order_atomic()
   ├─ Marca order como completed
   ├─ Marca payment como paid
   ├─ Cria license (se subscription)
   └─ Atribui sessões (se session)
```

### Sistema de Reserva

```
Checkout iniciado
      │
      ▼
┌─────────────────────┐
│ reserve_sessions    │
│ atomic()            │
│  - FOR UPDATE SKIP  │
│    LOCKED           │
│  - Reserva N        │
│    sessões          │
└─────────────────────┘
      │
      ├─── Pagamento OK ───▶ complete_order_atomic()
      │                      └─ status: sold
      │
      └─── Expira (30min) ──▶ cleanup-expired-reservations
                              └─ status: available
```

### Idempotência de Webhooks

```
Webhook recebido
      │
      ▼
┌─────────────────────┐
│ Verifica            │
│ processed_webhooks  │
└─────────────────────┘
      │
      ├─── Já existe ───▶ Return 200 (skip)
      │
      └─── Não existe ──▶ Processa
                              │
                              ▼
                         Salva em
                         processed_webhooks
```

---

## Segurança

### Autenticação

- **Email/Senha** com verificação de email
- **reCAPTCHA** no login e registro
- **Rate Limiting** por IP (5 tentativas/24h)
- **Histórico de Login** registrado

### Autorização

- **RLS (Row Level Security)** em todas as tabelas
- **Roles**: `admin` e `user`
- **Função `has_role()`** para verificações
- **Service Role** apenas em Edge Functions

### Proteções

| Proteção | Descrição |
|----------|-----------|
| CSRF | Tokens de sessão |
| XSS | Sanitização de inputs |
| SQL Injection | Queries parametrizadas via Supabase |
| Rate Limiting | Tabela `rate_limits` |
| Webhook Idempotência | Tabela `processed_webhooks` |
| Transações Atômicas | Locks e rollbacks |

### Banimento

- Admins podem banir usuários com motivo
- Usuários banidos não conseguem logar
- Ban registrado com timestamp e razão

---

## Configuração

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx
VITE_SUPABASE_PROJECT_ID=xxx
```

### Secrets (Edge Functions)

| Secret | Descrição |
|--------|-----------|
| `SUPABASE_URL` | URL do Supabase |
| `SUPABASE_ANON_KEY` | Chave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço |
| `ASAAS_API_KEY` | Chave do gateway Asaas |
| `PIXUP_PROXY_URL` | URL do proxy |
| `PIXUP_PROXY_SECRET` | Secret do proxy |

### Configurações do Sistema

| Chave | Descrição |
|-------|-----------|
| `maintenance_mode` | Ativa modo manutenção |
| `maintenance_message` | Mensagem de manutenção |

### Gateway Settings

Configurado na tabela `gateway_settings`:
- Credenciais dos gateways (PixUp, EvoPay, Asaas)
- Configurações de email (Resend)
- reCAPTCHA keys
- Pesos de balanceamento

---

## Deploy

### Frontend

1. Build: `npm run build`
2. Deploy automático via Lovable
3. Domínio personalizado em Settings > Domains

### Edge Functions

- Deploy automático ao commitar
- Logs disponíveis no Lovable Cloud

### Cron Jobs

Configurar webhooks externos para chamar:

| Função | Intervalo Sugerido |
|--------|-------------------|
| `cleanup-expired-orders` | A cada 5 minutos |
| `cleanup-expired-reservations` | A cada 5 minutos |
| `expire-subscriptions` | A cada hora |
| `notify-expiring-licenses` | Diariamente |
| `reconciliation-global` | A cada 5 minutos |
| `sync-sessions-inventory` | A cada hora |

---

## Proxy (Hostinger)

Arquivos PHP em `hostinger-proxy/` para receber webhooks:

```
Gateway → Hostinger → webhook-asaas.php → Supabase Edge Function
```

Necessário porque alguns gateways não aceitam URLs de edge functions diretamente.

---

## Bot Desktop (DLG_CONNECT)

Aplicação desktop em Python + QML localizada em `DLG_CONNECT/`:

- `main.py` - Entry point
- `main.qml` - Interface principal
- `Theme.qml` - Tema visual
- `components/` - Componentes reutilizáveis
- `pages/` - Páginas da aplicação

O bot é distribuído como arquivo downloadável após compra de licença.

---

## Contato

Para suporte técnico ou dúvidas, entre em contato através do sistema.

---

*Documentação gerada para o projeto DLG Connect*
