# DLG Connect - Documentação Técnica Completa

Sistema de automação profissional para crescimento de grupos Telegram com gestão de licenças, sessões e pagamentos.

---

## 1. VISÃO GERAL

### 1.1 Propósito e Objetivo
O DLG Connect é uma plataforma SaaS que oferece automação para crescimento de grupos no Telegram. O sistema permite que usuários comprem licenças de software (bot) e sessões (contas) para executar automações em seus grupos.

### 1.2 Principais Funcionalidades

#### Para Usuários:
- **Autenticação segura** com verificação de email e reCAPTCHA
- **Gestão de licenças** - compra e renovação de planos mensais
- **Sistema de upgrade/downgrade** - mudança de planos com crédito proporcional
- **Compra de sessões** - brasileiras e estrangeiras em combos ou quantidade personalizada
- **Dashboard pessoal** - visualização de licenças, sessões e histórico
- **Histórico de faturas** - todas as transações e recibos
- **Download de arquivos** - bot e sessões compradas com retry automático
- **Histórico de login** - monitoramento de acessos
- **Notificações em tempo real** - atualizações instantâneas de pedidos
- **Avisos de expiração** - lembretes proativos de renovação de licença
- **Tutorial de primeiro uso** - onboarding interativo para novos usuários

#### Para Administradores:
- **Gestão de usuários** - visualização, banimento com motivo, alteração de roles
- **Gestão de assinaturas** - criar, editar, cancelar, upgrade/downgrade de licenças
- **Gestão de sessões** - upload com validação, exclusão, configuração de preços
- **Gestão de combos** - criar pacotes de sessões com preços especiais
- **Configurações do sistema** - modo manutenção, gateways de pagamento
- **Gestão do bot** - upload de novas versões
- **Dashboard analítico** - métricas, gráficos e estatísticas detalhadas
- **Painel de debug** - ferramentas de diagnóstico e testes do sistema
- **Logs de auditoria** - rastreamento completo de todas as ações administrativas
- **Sincronização de inventário** - ferramenta para corrigir inconsistências

### 1.3 Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Frontend | React | 18.3.1 |
| Build Tool | Vite | latest |
| Linguagem | TypeScript | latest |
| Estilização | Tailwind CSS | latest |
| Componentes UI | shadcn/ui | latest |
| Animações | Framer Motion | 12.23.26 |
| Roteamento | React Router DOM | 6.30.1 |
| Estado Servidor | TanStack Query | 5.83.0 |
| Backend | Supabase (Lovable Cloud) | 2.87.1 |
| Ícones | Lucide React | 0.462.0 |
| Formulários | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| Gráficos | Recharts | 2.15.4 |
| QR Code | qrcode.react | 4.2.0 |

---

## 2. ARQUITETURA

### 2.1 Estrutura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Pages    │  │  Components │  │       Hooks         │  │
│  │  (Rotas)    │──│  (UI/Logic) │──│  (Estado/Lógica)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         └────────────────┼────────────────────┘              │
│                          ▼                                   │
│              ┌─────────────────────┐                        │
│              │   Supabase Client   │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD (Supabase)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Database   │  │   Storage   │  │   Edge Functions    │  │
│  │ (PostgreSQL)│  │   (Files)   │  │   (Deno Runtime)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴──────────┐  │
│  │                    RLS Policies                        │  │
│  │              (Row Level Security)                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Padrões de Design

1. **Component-Based Architecture**
   - Componentes pequenos e reutilizáveis
   - Separação clara entre UI e lógica

2. **Custom Hooks Pattern**
   - Lógica de negócio encapsulada em hooks
   - Reutilização de estado e efeitos

3. **Container/Presentational Pattern**
   - Pages como containers (lógica)
   - Components como presentational (UI)

4. **Atomic Design (parcial)**
   - UI components (atoms): Button, Input, Switch
   - Composite components (molecules): StatCard, FilesList
   - Sections (organisms): SessionsSection, DashboardSection

### 2.3 Fluxo de Dados

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│    Hook      │────▶│   Supabase   │
│   Action     │     │  (useQuery)  │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                    │                     │
       │                    ▼                     │
       │             ┌──────────────┐             │
       └─────────────│   Component  │◀────────────┘
                     │    State     │
                     └──────────────┘
```

### 2.4 Sistemas de Proteção

#### Real-time Synchronization
```
┌─────────────────────────────────────────────────────────────┐
│                  REAL-TIME LISTENERS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │session_files │  │    orders    │  │  inventory   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ▼                                │
│                  ┌──────────────────┐                       │
│                  │  Auto Invalidate │                       │
│                  │  React Query     │                       │
│                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

#### Session Reservation System
```
CHECKOUT PROCESS:
1. User inicia checkout
2. Sistema RESERVA sessões (status: 'reserved')
   ├─ reserved_for_order: order_id
   └─ reserved_at: timestamp
3. Se pagamento confirma → status: 'sold'
4. Se expira (30min) → cleanup libera (status: 'available')
```

#### Webhook Idempotency
```
WEBHOOK FLOW:
Gateway → Webhook Handler
              │
              ├─ Check: transaction_id exists?
              │   ├─ YES → Return 200 (already processed)
              │   └─ NO → Continue
              │
              ├─ Process payment
              │
              └─ Save to processed_webhooks
```

#### Gateway Fallback
```
PRIMARY GATEWAY FAILS
         │
         ▼
┌─────────────────┐
│ Automatic       │
│ Fallback to     │
│ Secondary       │
└─────────────────┘
         │
         ▼
  System Resilient
```

---

## 3. ESTRUTURA DE ARQUIVOS

```
dlg-connect/
├── src/
│   ├── App.tsx                    # Componente raiz com rotas
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Estilos globais e design tokens
│   ├── vite-env.d.ts              # Tipos do Vite
│   │
│   ├── assets/                    # Arquivos estáticos
│   │   └── logo.png               # Logo do sistema
│   │
│   ├── components/                # Componentes reutilizáveis
│   │   ├── ui/                    # Componentes base (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── avatar-picker.tsx
│   │   │   ├── animated-shader-background.tsx
│   │   │   ├── animated-shiny-text.tsx
│   │   │   ├── anime-navbar.tsx
│   │   │   ├── download-bot-button.tsx
│   │   │   ├── menu.tsx
│   │   │   └── morphing-square.tsx
│   │   │
│   │   ├── landing/               # Componentes da landing page
│   │   │   ├── Header.tsx         # Navegação principal
│   │   │   ├── Hero.tsx           # Seção hero
│   │   │   ├── Features.tsx       # Recursos/funcionalidades
│   │   │   ├── Pricing.tsx        # Tabela de preços
│   │   │   ├── FAQ.tsx            # Perguntas frequentes
│   │   │   ├── CTA.tsx            # Call to action
│   │   │   ├── Footer.tsx         # Rodapé
│   │   │   └── index.ts           # Barrel export
│   │   │
│   │   ├── admin/                 # Componentes do painel admin
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboardSection.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── debug/
│   │   │   │   ├── SystemDebugPanel.tsx    # Painel de debug e testes
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── sessions/
│   │   │       ├── SessionsSection.tsx
│   │   │       ├── SessionStatsCards.tsx
│   │   │       ├── SessionFilesList.tsx
│   │   │       ├── SessionCombosSection.tsx
│   │   │       ├── SessionCostSection.tsx
│   │   │       ├── SessionOrdersSection.tsx
│   │   │       ├── SessionCustomQuantitySection.tsx
│   │   │       ├── SessionTypeSelectorModal.tsx
│   │   │       ├── SessionUploadModal.tsx
│   │   │       ├── SessionSalesHistory.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── CookieConsent.tsx      # Banner de cookies
│   │   ├── PendingPaymentBanner.tsx # Banner de pagamento pendente
│   │   └── SEO.tsx                # Componente de SEO
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.tsx            # Autenticação e perfil
│   │   ├── useUserDashboard.tsx   # Dados do dashboard do usuário
│   │   ├── useAdminSessions.tsx   # Gestão de sessões (admin)
│   │   ├── useAdminOrders.tsx     # Gestão de pedidos (admin)
│   │   ├── useAdminUsers.tsx      # Gestão de usuários (admin)
│   │   ├── useAdminSubscriptions.tsx # Gestão de assinaturas (admin)
│   │   ├── useAdminBot.tsx        # Gestão do bot (admin)
│   │   ├── useSystemSettings.tsx  # Configurações do sistema
│   │   ├── useUpgradeCredit.tsx   # Cálculo de crédito de upgrade
│   │   └── use-alert-toast.tsx    # Toast de alertas
│   │
│   ├── pages/                     # Páginas/rotas
│   │   ├── Index.tsx              # Landing page (/)
│   │   ├── Login.tsx              # Login/Registro (/login)
│   │   ├── Dashboard.tsx          # Dashboard do usuário (/dashboard)
│   │   ├── Admin.tsx              # Painel administrativo (/admin)
│   │   ├── Buy.tsx                # Página de compra (/comprar)
│   │   ├── Checkout.tsx           # Checkout/Pagamento (/checkout)
│   │   ├── Pagamentos.tsx         # Status de pagamento (/pagamentos)
│   │   ├── RecuperarSenha.tsx     # Recuperação de senha
│   │   ├── PoliticaPrivacidade.tsx # Política de privacidade
│   │   └── NotFound.tsx           # Página 404
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Cliente Supabase (auto-gerado)
│   │       └── types.ts           # Tipos do banco (auto-gerado)
│   │
│   └── lib/
│       ├── utils.ts               # Utilitários (cn, etc)
│       ├── downloadWithRetry.ts   # Download com retry automático
│       └── auditLog.ts            # Helper de auditoria
│
├── supabase/
│   ├── config.toml                # Configuração Supabase
│   │
│   └── functions/                 # Edge Functions
│       ├── admin-actions/         # Ações administrativas
│       ├── login/                 # Autenticação
│       ├── register/              # Registro de usuários
│       ├── forgot-password/       # Recuperação de senha
│       ├── send-email/            # Envio de emails
│       ├── pixup/                 # Gateway PixUp
│       ├── pixup-webhook/         # Webhook PixUp
│       ├── evopay/                # Gateway EvoPay
│       ├── evopay-webhook/        # Webhook EvoPay
│       ├── cleanup-expired-orders/ # Limpeza de pedidos
│       ├── cleanup-expired-reservations/ # Limpeza de reservas antigas
│       ├── sync-sessions-inventory/ # Sincronização de inventário
│       └── expire-subscriptions/  # Expiração de assinaturas
│
├── hostinger-proxy/               # Proxy para webhooks
│   ├── .htaccess
│   ├── proxy-pixup.php
│   ├── webhook-evopay.php
│   ├── webhook-pixup.php
│   └── README.md
│
├── public/
│   ├── favicon.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── eslint.config.js
├── DEBUG_GUIDE.md                 # Guia de debug
└── README.md
```

### 3.1 Responsabilidade de Cada Diretório

| Diretório | Responsabilidade |
|-----------|------------------|
| `src/components/ui/` | Componentes base reutilizáveis (botões, inputs, modais) |
| `src/components/landing/` | Componentes específicos da landing page |
| `src/components/admin/` | Componentes do painel administrativo |
| `src/components/admin/debug/` | Ferramentas de diagnóstico e testes |
| `src/hooks/` | Lógica de negócio, estado e integrações |
| `src/pages/` | Páginas/rotas da aplicação |
| `src/integrations/` | Configuração de serviços externos |
| `src/lib/` | Utilitários e helpers |
| `supabase/functions/` | Funções serverless (backend) |
| `hostinger-proxy/` | Proxy PHP para webhooks |

---

## 4. COMPONENTES PRINCIPAIS

### 4.1 Componentes de Página

#### `src/pages/Dashboard.tsx`
- **Propósito**: Dashboard principal do usuário autenticado
- **Estado Interno**: `activeTab`, `showAvatarPicker`, `showMaintenanceModal`
- **Hooks Utilizados**: `useAuth`, `useUserDashboard`, `useSystemSettings`
- **Tabs**: Licenças, Sessions, Pedidos, Segurança
- **Responsabilidades**:
  - Exibir licença ativa e status
  - Listar sessões compradas
  - Mostrar histórico de pedidos
  - Exibir histórico de login

#### `src/pages/Admin.tsx`
- **Propósito**: Painel administrativo completo
- **Estado Interno**: `activeSection`, modais diversos
- **Hooks Utilizados**: `useAuth`, `useAdminUsers`, `useAdminSubscriptions`, `useAdminSessions`, `useAdminBot`
- **Seções**: Dashboard, Usuários, Assinaturas, Sessões, Configurações, Debug
- **Responsabilidades**:
  - Gestão completa de usuários
  - Controle de assinaturas/licenças
  - Upload e gestão de sessões
  - Configurações do sistema
  - Ferramentas de debug

#### `src/pages/Login.tsx`
- **Propósito**: Autenticação e registro
- **Estado Interno**: `isLogin`, `showVerification`, formulários
- **Componentes**: Formulário de login, formulário de registro, verificação de email
- **Integrações**: reCAPTCHA, Edge Functions (login, register)

#### `src/pages/Checkout.tsx`
- **Propósito**: Processo de pagamento
- **Estado Interno**: `paymentData`, `isProcessing`, `copied`
- **Integrações**: PixUp, EvoPay (gateways PIX)
- **Funcionalidades**:
  - Geração de QR Code PIX
  - Código copia e cola
  - Polling de status de pagamento
  - Reserva atômica de sessões

### 4.2 Componentes Admin

#### `SessionsSection.tsx`
- **Propósito**: Gestão completa de sessões
- **Props**: Nenhuma (usa hooks internamente)
- **Estado**: tabs, modais, formulários de edição
- **Sub-componentes**:
  - `SessionStatsCards` - Cards de estatísticas
  - `SessionFilesList` - Lista de arquivos
  - `SessionCombosSection` - Gestão de combos
  - `SessionCostSection` - Configuração de custos
  - `SessionOrdersSection` - Pedidos de sessões

#### `AdminDashboardSection.tsx`
- **Propósito**: Dashboard analítico do admin
- **Props**: `stats`, `isLoading`, `onNavigate`
- **Componentes**: StatCards (Total Usuários, Assinaturas, Pedidos, Sessions)

#### `SystemDebugPanel.tsx`
- **Propósito**: Ferramentas de diagnóstico e testes
- **Funcionalidades**: Setup, health check, cleanup, sync inventário

### 4.3 Componentes UI

#### `Button` (`src/components/ui/button.tsx`)
- **Variantes**: default, destructive, outline, secondary, ghost, link
- **Tamanhos**: default, sm, lg, icon
- **Uso**: Ações em toda aplicação

#### `Switch` (`src/components/ui/switch.tsx`)
- **Propósito**: Toggle on/off
- **Uso**: Configurações, ativação de features

#### `Spinner` (`src/components/ui/spinner.tsx`)
- **Propósito**: Indicador de carregamento
- **Variantes**: Tamanhos diferentes

---

## 5. PAINEL ADMINISTRATIVO

### 5.1 Como Acessar

1. Acesse `/login`
2. Faça login com uma conta que possui role `admin`
3. O sistema redirecionará automaticamente para `/admin`

**Nota**: Usuários com role `admin` são redirecionados automaticamente ao fazer login.

### 5.2 Autenticação e Autorização

```typescript
// Verificação de admin no useAuth.tsx
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

const isAdmin = roleData?.role === 'admin';
```

**Tabela `user_roles`**:
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | Referência ao usuário |
| role | ENUM | 'admin' ou 'user' |
| created_at | TIMESTAMP | Data de criação |

### 5.3 Funcionalidades do Admin

#### 5.3.1 Dashboard
- Total de usuários cadastrados
- Assinaturas ativas
- Pedidos pendentes
- Sessions em estoque

#### 5.3.2 Gestão de Usuários
- **Visualizar**: Lista completa de usuários
- **Buscar**: Por nome, email ou whatsapp
- **Banir/Desbanir**: Bloquear acesso com motivo obrigatório
- **Alterar Role**: Promover a admin ou rebaixar
- **Ver Detalhes**: Assinaturas, pedidos, sessões do usuário

#### 5.3.3 Gestão de Assinaturas
- **Criar**: Nova assinatura para usuário
- **Editar**: Alterar plano, datas, status
- **Cancelar**: Encerrar assinatura
- **Upgrade/Downgrade**: Mudança de plano com crédito proporcional
- **Visualizar**: Status, datas, histórico

#### 5.3.4 Gestão de Sessões
- **Upload**: Enviar arquivos .session com validação
- **Excluir**: Remover sessões com confirmação dupla
- **Configurar Preços**: Custo e venda por tipo
- **Sincronizar**: Atualizar inventário com storage

#### 5.3.5 Gestão de Combos
- **Criar**: Novo combo (quantidade + preço)
- **Editar**: Alterar valores
- **Ativar/Desativar**: Disponibilidade
- **Popular**: Marcar como destaque

#### 5.3.6 Gestão do Bot
- **Upload**: Nova versão do bot
- **Ativar**: Definir versão atual
- **Histórico**: Versões anteriores

#### 5.3.7 Configurações do Sistema
- **Modo Manutenção**: Bloquear acesso de usuários
- **Gateways de Pagamento**: PixUp e EvoPay
- **Verificação de Email**: Ativar/desativar
- **reCAPTCHA**: Configurar proteção

### 5.4 Diferenças Admin vs Usuário

| Funcionalidade | Usuário | Admin |
|----------------|---------|-------|
| Ver próprio dashboard | ✅ | ✅ |
| Comprar licenças/sessões | ✅ | ✅ |
| Ver todos usuários | ❌ | ✅ |
| Criar assinaturas | ❌ | ✅ |
| Upload de sessões | ❌ | ✅ |
| Configurar sistema | ❌ | ✅ |
| Acessar `/admin` | ❌ | ✅ |
| Banir usuários | ❌ | ✅ |
| Painel de debug | ❌ | ✅ |

### 5.5 Proteções de Segurança

1. **RLS Policies**: Apenas admins podem executar ações administrativas
2. **Verificação de Role**: Checagem no frontend e backend
3. **Edge Functions**: Validação de permissões antes de executar
4. **Proteção de Rotas**: Redirecionamento se não autorizado

```sql
-- Exemplo de policy RLS
CREATE POLICY "Admins can manage all users"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 5.6 Painel de Debug e Testes

#### Acesso
Menu Admin → "Debug & Testes"

#### Funcionalidades

**1. Setup Completo**
- Cria colunas e índices no banco
- Ativa real-time em todas as tabelas
- Configura cron jobs automáticos
- Valida estrutura do sistema

**2. Verificar Saúde**
Monitora:
- ✅ Status do real-time (ativo/inativo por tabela)
- ✅ Sincronização de inventário (files vs inventory)
- ⚠️ Sessões reservadas há mais de 30min
- ⚠️ Pedidos pendentes antigos
- ⚠️ Gateway logs e falhas

**3. Forçar Limpeza**
- Libera sessões reservadas expiradas
- Marca pedidos antigos como expirados
- Atualiza inventário

**4. Testar Real-time**
- Monitora eventos do banco por 10 segundos
- Valida que subscriptions estão funcionando
- Detecta problemas de sincronização

**5. Sincronizar Inventário**
- Conta arquivos reais no storage
- Atualiza tabela sessions_inventory
- Corrige inconsistências

#### Comandos SQL Úteis
O painel fornece comandos SQL prontos para:
- Ver sessões reservadas antigas
- Verificar pedidos pendentes por usuário
- Liberar manualmente recursos
- Diagnosticar problemas

### 5.7 Logs de Auditoria

#### O que é Registrado
Todas as ações administrativas são registradas com:
- Admin que executou
- Data e hora
- Ação realizada (ban_user, cancel_subscription, delete_sessions, etc)
- Usuário afetado (se aplicável)
- Valores antigos e novos (JSON)
- Motivo da ação
- IP do admin

#### Visualização
Menu Admin → "Logs de Auditoria"
- Tabela com todas as ações
- Filtros por admin, ação, data
- Detalhes expandíveis em JSON
- Exportação para análise

#### Exemplos de Logs
```json
{
  "action": "ban_user",
  "target_user": "user@example.com",
  "old_value": { "banned": false },
  "new_value": { "banned": true, "reason": "Violação dos termos" },
  "admin": "admin@dlgconnect.com",
  "timestamp": "2024-12-23T10:30:00Z",
  "ip": "192.168.1.1"
}
```

---

## 6. FLUXO DE DADOS

### 6.1 Gerenciamento de Estado

#### TanStack Query (React Query)
Usado para estado do servidor (dados do Supabase):

```typescript
// Exemplo em useAdminSessions.tsx
const { data: inventory } = useQuery({
  queryKey: ['sessions-inventory'],
  queryFn: async () => {
    const { data } = await supabase
      .from('sessions_inventory')
      .select('*');
    return data;
  }
});
```

#### Estado Local (useState)
Usado para UI e formulários:

```typescript
const [activeTab, setActiveTab] = useState("licencas");
const [isProcessing, setIsProcessing] = useState(false);
```

### 6.2 Fluxo de Autenticação

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  Login   │───▶│ Edge Function│───▶│   Supabase   │
│   Form   │    │   /login     │    │    Auth      │
└──────────┘    └──────────────┘    └──────────────┘
      │                                     │
      │                                     ▼
      │                            ┌──────────────┐
      │                            │   Session    │
      │                            │   Created    │
      │                            └──────────────┘
      │                                     │
      ▼                                     ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ useAuth  │◀───│   Listener   │◀───│ Auth State   │
│   Hook   │    │  onAuthState │    │   Change     │
└──────────┘    └──────────────┘    └──────────────┘
```

### 6.3 Fluxo de Pagamento

```
┌───────────┐    ┌──────────────┐    ┌──────────────┐
│  Checkout │───▶│ Edge Function│───▶│   Gateway    │
│   Page    │    │ /pixup|evopay│    │   (PIX)      │
└───────────┘    └──────────────┘    └──────────────┘
      │                                     │
      │                                     ▼
      │                            ┌──────────────┐
      │◀───────────────────────────│  QR Code +   │
      │         Polling            │  Pix Code    │
      ▼                            └──────────────┘
┌───────────┐                              │
│  Payment  │                              │
│  Status   │                              ▼
└───────────┘    ┌──────────────┐    ┌──────────────┐
      ▲          │   Webhook    │◀───│   Payment    │
      │          │   Handler    │    │  Confirmed   │
      │          └──────────────┘    └──────────────┘
      │                 │
      │                 ▼
      │          ┌──────────────┐
      └──────────│ Order Status │
                 │   Updated    │
                 └──────────────┘
```

### 6.4 Como Configurações Admin Afetam o Sistema

```typescript
// useSystemSettings.tsx busca configurações
const { data: settings } = useQuery({
  queryKey: ['system-settings'],
  queryFn: async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('*');
    return data;
  }
});

// Dashboard.tsx verifica modo manutenção
useEffect(() => {
  if (settings?.maintenance_mode && !isAdmin) {
    setShowMaintenanceModal(true);
  }
}, [settings, isAdmin]);
```

---

## 7. ROTAS E NAVEGAÇÃO

### 7.1 Rotas Públicas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Index.tsx | Landing page |
| `/login` | Login.tsx | Autenticação |
| `/recuperar-senha` | RecuperarSenha.tsx | Reset de senha |
| `/politica-privacidade` | PoliticaPrivacidade.tsx | Termos legais |

### 7.2 Rotas Protegidas (Usuário)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/dashboard` | Dashboard.tsx | Dashboard pessoal |
| `/comprar` | Buy.tsx | Seleção de produtos |
| `/checkout` | Checkout.tsx | Pagamento |
| `/pagamentos` | Pagamentos.tsx | Status de pagamento |

### 7.3 Rotas Administrativas

| Rota | Componente | Acesso |
|------|------------|--------|
| `/admin` | Admin.tsx | Apenas admins |

### 7.4 Proteção de Rotas

```typescript
// Em App.tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <Admin />
    </ProtectedRoute>
  } 
/>

// Componente ProtectedRoute
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

---

## 8. LÓGICA DE NEGÓCIO

### 8.1 Regras de Licença

```typescript
// Cálculo de dias restantes
const daysLeft = Math.max(0, Math.ceil(
  (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
));

// Status da licença
const isActive = license.status === 'active' && daysLeft > 0;
```

### 8.2 Regras de Sessões

1. **Tipos**: `brasileiras` e `estrangeiras`
2. **Status**: `available`, `sold`, `reserved`
3. **Combos**: Quantidade fixa com preço especial
4. **Personalizado**: Quantidade mínima com preço por unidade

### 8.3 Regras de Pagamento

1. **Gateways**: PixUp e EvoPay (balanceamento por peso)
2. **Expiração**: 30 minutos para pagamento
3. **Status**: `pending`, `completed`, `cancelled`, `expired`

### 8.4 Validações

```typescript
// Validação de email
const emailSchema = z.string().email('Email inválido');

// Validação de senha forte
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Pelo menos 1 maiúscula')
  .regex(/[a-z]/, 'Pelo menos 1 minúscula')
  .regex(/[0-9]/, 'Pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Pelo menos 1 caractere especial');

// Validação de WhatsApp
const whatsappSchema = z.string()
  .regex(/^\d{10,11}$/, 'WhatsApp inválido');
```

### 8.5 Cálculo de Upgrade

```typescript
// useUpgradeCredit.tsx
const calculateCredit = (subscription) => {
  const daysRemaining = getDaysRemaining(subscription.next_billing_date);
  const totalDays = plan.period;
  const dailyValue = plan.price / totalDays;
  return dailyValue * daysRemaining;
};
```

### 8.6 Sistema de Reserva de Sessões

#### Problema Resolvido
Evita race conditions onde:
- User inicia checkout
- Admin deleta sessões
- Checkout tenta processar sessões inexistentes

#### Fluxo de Reserva

```typescript
// 1. No momento do checkout
const reserveSessions = async (type, quantity, orderId) => {
  // Buscar sessões disponíveis
  const { data: sessions } = await supabase
    .from('session_files')
    .select('id')
    .eq('type', type)
    .eq('status', 'available')
    .limit(quantity);
  
  // Validar quantidade
  if (sessions.length < quantity) {
    throw new Error('Sessões insuficientes');
  }
  
  // Marcar como reservadas
  await supabase
    .from('session_files')
    .update({ 
      status: 'reserved',
      reserved_for_order: orderId,
      reserved_at: new Date().toISOString()
    })
    .in('id', sessions.map(s => s.id));
};

// 2. Se pagamento confirma
// status: 'reserved' → 'sold'

// 3. Se expira (30min)
// Cron job: status: 'reserved' → 'available'
```

#### Estados de Sessão
- `available` - Disponível para compra
- `reserved` - Reservada para pedido pendente
- `sold` - Vendida e entregue

#### Limpeza Automática
Edge function `cleanup-expired-reservations` roda a cada 10 minutos:
- Busca sessões reservadas há mais de 30min
- Libera para status `available`
- Registra em logs

### 8.7 Webhook Idempotency (Anti-Duplicação)

#### Problema Resolvido
Gateway pode enviar webhook duplicado, causando:
- Pedido processado 2x
- User recebe sessões em duplicata
- Inventário negativo

#### Solução Implementada

**Tabela: processed_webhooks**
```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY,
  transaction_id TEXT UNIQUE,  -- ID único do gateway
  gateway TEXT,
  order_id UUID,
  processed_at TIMESTAMPTZ,
  webhook_payload JSONB
);
```

**Validação no Webhook Handler**
```typescript
// 1. Extrair transaction_id
const txId = webhookData.transaction_id || webhookData.id;

// 2. Verificar se já foi processado
const { data: existing } = await supabase
  .from('processed_webhooks')
  .select('id')
  .eq('transaction_id', txId)
  .single();

if (existing) {
  return Response.json({ status: 'already_processed' }, { status: 200 });
}

// 3. Processar pedido...

// 4. Registrar que foi processado
await supabase
  .from('processed_webhooks')
  .insert({ transaction_id: txId, gateway, order_id });
```

#### Benefícios
- ✅ Webhooks duplicados são ignorados
- ✅ Histórico completo de webhooks recebidos
- ✅ Debug facilitado (payload salvo)
- ✅ Garantia de processamento único

### 8.8 Gateway Fallback (Resiliência)

#### Problema Resolvido
Se PixUp ou EvoPay ficam offline, sistema continua funcionando.

#### Implementação

```typescript
export async function callGatewayWithFallback(
  primaryGateway: 'pixup' | 'evopay',
  orderData: any
) {
  const gateways = primaryGateway === 'pixup' 
    ? ['pixup', 'evopay'] 
    : ['evopay', 'pixup'];
  
  for (const gateway of gateways) {
    try {
      console.log(`Tentando gateway: ${gateway}`);
      const response = await callGateway(gateway, orderData);
      
      // Log de sucesso
      await logGatewayAttempt(gateway, 'success', orderData.order_id);
      
      return { gateway, ...response };
      
    } catch (error) {
      console.error(`Gateway ${gateway} falhou`);
      
      // Log de falha
      await logGatewayAttempt(gateway, 'failed', orderData.order_id, error);
      
      // Tentar próximo gateway
      continue;
    }
  }
  
  throw new Error('Todos os gateways falharam');
}
```

#### Logs de Gateway
```sql
CREATE TABLE gateway_logs (
  id UUID PRIMARY KEY,
  gateway TEXT,
  order_id UUID,
  status TEXT,      -- 'success' ou 'failed'
  error TEXT,
  attempt INTEGER,
  created_at TIMESTAMPTZ
);
```

#### Monitoramento
Admin pode ver no dashboard:
- Taxa de sucesso por gateway
- Tempo médio de resposta
- Falhas recentes
- Uso de fallback

### 8.9 Cálculo Inteligente de Preços

#### Problema Resolvido
User comprando quantidade personalizada sempre paga o melhor preço possível, mesmo se existir combo mais vantajoso.

#### Algoritmo

```typescript
function calculateBestPrice(quantity, combos, unitPrice) {
  // 1. Encontrar combo com melhor preço unitário
  const bestCombo = combos
    .filter(c => c.quantity <= quantity)
    .sort((a, b) => (a.price/a.quantity) - (b.price/b.quantity))[0];
  
  if (!bestCombo) {
    return quantity * unitPrice;
  }
  
  // 2. Aplicar preço do combo para tudo
  const pricePerUnit = bestCombo.price / bestCombo.quantity;
  const numCombos = Math.floor(quantity / bestCombo.quantity);
  const remaining = quantity % bestCombo.quantity;
  
  return (numCombos * bestCombo.price) + (remaining * pricePerUnit);
}
```

#### Exemplo
```
Configuração:
- Combo 10 sessões: R$ 80 (R$ 8/unidade)
- Preço avulso: R$ 10/unidade

User compra 15 sessões:
- Sistema calcula: 1 combo (R$ 80) + 5 avulso a R$ 8 = R$ 120
- Sem otimização seria: 10 combo + 5 × R$ 10 = R$ 130
- Economia: R$ 10
```

#### UI
Mostra para o user:
- Preço total otimizado
- Breakdown detalhado
- Economia em relação ao preço normal

---

## 9. INTEGRAÇÕES

### 9.1 Gateways de Pagamento

#### PixUp
```typescript
// supabase/functions/pixup/index.ts
const response = await fetch('https://api.pixup.com.br/v2/pix', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PIXUP_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: order.amount,
    description: order.product_name,
    webhook_url: WEBHOOK_URL
  })
});
```

#### EvoPay
```typescript
// supabase/functions/evopay/index.ts
const response = await fetch('https://api.evopay.com.br/pix/create', {
  method: 'POST',
  headers: {
    'X-Api-Key': EVOPAY_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    value: order.amount,
    description: order.product_name
  })
});
```

### 9.2 Serviço de Email

```typescript
// supabase/functions/send-email/index.ts
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

await resend.emails.send({
  from: settings.resend_from_email,
  to: userEmail,
  subject: 'Código de Verificação',
  html: emailTemplate
});
```

### 9.3 reCAPTCHA

```typescript
// Login.tsx
import ReCAPTCHA from 'react-google-recaptcha';

const handleSubmit = async () => {
  if (recaptchaEnabled) {
    const token = await recaptchaRef.current?.executeAsync();
    // Validar token no backend
  }
};
```

### 9.4 Sistema de Email Aprimorado

#### Templates HTML
Emails agora usam templates profissionais em HTML com:
- Design responsivo
- Branding consistente
- CTAs claros
- Informações detalhadas

#### Tipos de Email

**1. Pagamento Confirmado**
```typescript
getPaymentConfirmedEmail({
  userName: string,
  productName: string,
  amount: number,
  orderDate: string,
  dashboardUrl: string,
  downloadUrl?: string
})
```
Contém:
- Detalhes da compra
- Próximos passos numerados
- Link direto para dashboard
- Link de download (se aplicável)

**2. Lembrete de Renovação**
Enviado automaticamente em:
- 7 dias antes da expiração
- 3 dias antes
- 1 dia antes

**3. Notificação de Banimento**
```typescript
getBanNotificationEmail({
  userName: string,
  reason: string,
  supportEmail: string
})
```
Inclui motivo detalhado e contato para suporte.

#### Automação
- Cron job diário às 9h para lembretes
- Webhook trigger para confirmações
- Real-time para notificações urgentes

---

## 10. DEPENDÊNCIAS

### 10.1 Core

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| react | 18.3.1 | Biblioteca UI |
| react-dom | 18.3.1 | Renderização DOM |
| react-router-dom | 6.30.1 | Roteamento SPA |
| typescript | latest | Tipagem estática |

### 10.2 UI/Estilização

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| tailwindcss | latest | Utilitários CSS |
| framer-motion | 12.23.26 | Animações |
| lucide-react | 0.462.0 | Ícones |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| tailwind-merge | 2.6.0 | Merge de classes |

### 10.3 Formulários/Validação

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| react-hook-form | 7.61.1 | Gestão de formulários |
| zod | 3.25.76 | Validação de schemas |
| @hookform/resolvers | 3.10.0 | Integração RHF + Zod |

### 10.4 Estado/Dados

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| @tanstack/react-query | 5.83.0 | Cache e estado servidor |
| @supabase/supabase-js | 2.87.1 | Cliente Supabase |

### 10.5 Componentes Radix (shadcn)

Todos os pacotes `@radix-ui/*` fornecem componentes acessíveis:
- accordion, alert-dialog, avatar, checkbox
- dialog, dropdown-menu, label, popover
- progress, select, switch, tabs, toast, tooltip

### 10.6 Utilitários

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| date-fns | 3.6.0 | Manipulação de datas |
| qrcode.react | 4.2.0 | Geração de QR codes |
| sonner | 1.7.4 | Notificações toast |
| recharts | 2.15.4 | Gráficos |

---

## 11. FLUXO DO USUÁRIO

### 11.1 Jornada do Usuário Comum

#### Primeiro Acesso
```
1. Acessa landing page (/)
2. Clica em "Começar Agora"
3. Preenche formulário de registro
4. Recebe código de verificação por email
5. Confirma código
6. Redireccionado para /dashboard
7. Tutorial de onboarding aparece
```

#### Compra de Licença
```
1. No dashboard, clica em "Comprar Licença"
2. Seleciona plano desejado
3. Redireccionado para /checkout
4. Sistema reserva recursos (se sessões)
5. Escaneia QR Code PIX ou copia código
6. Efetua pagamento
7. Sistema detecta pagamento (webhook idempotente)
8. Licença ativada automaticamente
9. Dashboard atualizado em real-time
```

#### Compra de Sessões
```
1. No dashboard, vai para aba "Sessions"
2. Clica em "Comprar Sessions"
3. Escolhe tipo (brasileiras/estrangeiras)
4. Seleciona combo ou quantidade personalizada
5. Sistema calcula melhor preço
6. Segue para checkout
7. Após pagamento, sessões aparecem para download
```

#### Download de Bot/Sessões
```
1. Na aba "Licenças", clica em "Baixar Bot"
2. Na aba "Sessions", clica no arquivo para download
3. Sistema faz download com retry automático
4. Arquivos são baixados do storage
```

### 11.2 Jornada do Administrador

#### Gestão Diária
```
1. Faz login (redirecionado para /admin)
2. Visualiza dashboard com métricas
3. Verifica pedidos pendentes
4. Processa ações necessárias
5. Todas as ações são auditadas
```

#### Upload de Sessões
```
1. Vai para seção "Sessões"
2. Clica em "Importar"
3. Seleciona tipo (BR/Estrangeiras)
4. Seleciona arquivos .session (validados)
5. Confirma upload
6. Sessões aparecem no inventário
```

#### Configuração de Combos
```
1. Na seção "Sessões", aba "Combos"
2. Clica em "Adicionar Combo"
3. Define quantidade e preço
4. Marca como ativo/popular
5. Salva alterações
```

#### Gestão de Usuário
```
1. Vai para seção "Usuários"
2. Busca usuário por email/nome
3. Visualiza detalhes
4. Pode: banir (com motivo), alterar role, ver assinaturas
5. Se necessário, cria assinatura manual
6. Todas as ações são registradas em audit_logs
```

### 11.3 Tutorial de Primeiro Uso

#### Quando Aparece
- Primeiro login após criar conta
- Primeira licença adquirida
- Não mostrar se já foi completado

#### Steps do Tutorial

**Step 1: Boas-vindas**
```
🎉 Bem-vindo ao DLG Connect!
Vamos te ajudar a começar em 3 passos simples.
```

**Step 2: Download do Bot**
```
1️⃣ Baixe o Bot
Clique no botão para fazer o download do software.
[CTA: Ir para Downloads]
```

**Step 3: Comprar Sessões**
```
2️⃣ Compre Sessões
Você precisa de sessões (contas) para o bot funcionar.
[CTA: Comprar Sessões]
```

**Step 4: Configuração**
```
3️⃣ Configure e Use
Assista nosso tutorial em vídeo.
[CTA: Assistir Tutorial]
```

**Step 5: Conclusão**
```
✅ Tudo Pronto!
Agora você está pronto para começar.
```

#### Persistência
```typescript
// Salvo no localStorage
localStorage.setItem('onboarding_completed', 'true');

// Pode ser resetado pelo admin se necessário
```

#### Opção de Pular
User pode clicar em "Pular Tutorial" a qualquer momento.

---

## 12. PERSISTÊNCIA DE DADOS

### 12.1 Banco de Dados (PostgreSQL via Supabase)

#### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do perfil do usuário |
| `user_roles` | Roles (admin/user) |
| `licenses` | Licenças de software |
| `user_subscriptions` | Assinaturas ativas |
| `subscription_plans` | Planos disponíveis |
| `orders` | Pedidos realizados |
| `payments` | Pagamentos processados |
| `session_files` | Arquivos de sessão |
| `sessions_inventory` | Inventário de sessões |
| `session_combos` | Combos configurados |
| `user_sessions` | Sessões do usuário |
| `bot_files` | Versões do bot |
| `gateway_settings` | Configurações de gateways |
| `system_settings` | Configurações gerais |
| `login_history` | Histórico de logins |
| `audit_logs` | Logs de auditoria |
| `verification_codes` | Códigos de verificação |
| `processed_webhooks` | Webhooks processados (idempotência) |
| `gateway_logs` | Logs de tentativas de gateway |

### 12.2 Storage (Supabase Storage)

| Bucket | Conteúdo |
|--------|----------|
| `sessions` | Arquivos .session |
| `bot-files` | Versões do bot (.exe/.zip) |

### 12.3 Dados Configuráveis pelo Admin

```typescript
// gateway_settings
{
  pixup_weight: number,      // Peso do gateway PixUp
  evopay_weight: number,     // Peso do gateway EvoPay
  email_enabled: boolean,    // Email ativado
  recaptcha_enabled: boolean // reCAPTCHA ativado
}

// system_settings
{
  maintenance_mode: 'true'|'false',
  // outras configurações
}

// sessions_inventory
{
  type: 'brasileiras'|'estrangeiras',
  quantity: number,
  cost_per_session: number,
  sale_price_per_session: number,
  custom_quantity_enabled: boolean,
  custom_quantity_min: number,
  custom_price_per_unit: number
}
```

### 12.4 Diagrama ER Simplificado

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   profiles  │────▶│  user_subscriptions │────▶│subscription_plans│
│  (user_id)  │     │     (user_id)       │     │      (id)       │
└─────────────┘     └─────────────────────┘     └─────────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐     ┌─────────────────────┐
│ user_roles  │     │      licenses       │
│  (user_id)  │     │     (user_id)       │
└─────────────┘     └─────────────────────┘

┌─────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   orders    │────▶│      payments       │     │  session_files  │
│  (user_id)  │     │    (order_id)       │     │   (order_id)    │
└─────────────┘     └─────────────────────┘     └─────────────────┘
       │
       ▼
┌─────────────────────┐
│    user_sessions    │
│     (order_id)      │
└─────────────────────┘
```

### 12.5 Tabelas de Controle e Auditoria

#### processed_webhooks
Previne processamento duplicado de webhooks.
```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  webhook_payload JSONB
);
```

#### gateway_logs
Rastreia tentativas e falhas de gateways.
```sql
CREATE TABLE gateway_logs (
  id UUID PRIMARY KEY,
  gateway TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT NOT NULL,
  error TEXT,
  attempt INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### audit_logs
Registra todas as ações administrativas.
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Colunas Adicionadas

**session_files**
```sql
ALTER TABLE session_files ADD COLUMN
  reserved_for_order UUID REFERENCES orders(id),
  reserved_at TIMESTAMPTZ;
```

**orders**
```sql
ALTER TABLE orders ADD COLUMN
  upgrade_from_subscription_id UUID REFERENCES user_subscriptions(id),
  upgrade_credit_amount DECIMAL(10,2);
```

**profiles**
```sql
ALTER TABLE profiles ADD COLUMN
  ban_reason TEXT,
  banned_at TIMESTAMPTZ;
```

---

## 13. COMANDOS

### Desenvolvimento
```bash
npm install    # Instalar dependências
npm run dev    # Servidor de desenvolvimento
npm run build  # Build de produção
npm run preview # Preview do build
```

### Estrutura de Build
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

---

## 14. VARIÁVEIS DE AMBIENTE

```env
# Auto-geradas pelo Lovable Cloud
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=xxx

# Configuradas via secrets (admin)
RESEND_API_KEY=re_xxx
PIXUP_API_KEY=xxx
EVOPAY_API_KEY=xxx
RECAPTCHA_SECRET_KEY=xxx
```

---

## 15. SEGURANÇA

### 15.1 Autenticação
- Supabase Auth com JWT
- Verificação de email obrigatória
- reCAPTCHA opcional
- Rate limiting por IP

### 15.2 Autorização
- RLS policies em todas as tabelas
- Verificação de role no frontend e backend
- Edge functions validam permissões

### 15.3 Proteções Implementadas
- XSS: React escapa automaticamente
- CSRF: Tokens Supabase
- SQL Injection: Supabase SDK com prepared statements
- Rate Limiting: Tabela `rate_limits`

### 15.4 Validações Implementadas

#### Arquivos de Sessão
- Extensão `.session` obrigatória
- Tamanho mínimo: 100 bytes
- Tamanho máximo: 10MB
- Validação antes do upload

#### Senhas
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial
- Indicador visual de força (5 níveis)

#### Rate Limiting
- Login: 5 tentativas por hora
- Registro: 3 por dia por IP
- Checkout: 10 por hora por usuário
- Recuperação de senha: 3 por hora

#### Confirmações Obrigatórias
- Deletar sessões: digitar "CONFIRMAR"
- Banir usuário: motivo obrigatório (mín 10 caracteres)
- Alterar role: confirmar se não é último admin
- Sair do checkout: aviso de pedido pendente

### 15.5 Auditoria

Todas as ações sensíveis são registradas:
- Quem executou
- O que foi alterado (antes/depois)
- Quando ocorreu
- IP de origem
- Motivo (quando aplicável)

Ações auditadas:
- `ban_user`, `unban_user`
- `change_role`
- `cancel_subscription`, `create_subscription`
- `delete_sessions`
- `update_gateway_settings`
- `toggle_maintenance_mode`

### 15.6 Proteção contra Banimento

**User banido:**
- Desconectado em até 60 segundos
- Real-time listener detecta mudança
- Modal com motivo do banimento
- Redirecionado para login
- Não pode fazer novo login

**Admin protegido:**
- Não pode banir a si mesmo
- Não pode alterar próprio role
- Não pode remover último admin do sistema

---

## 16. TESTES E QUALIDADE

### 16.1 Painel de Debug

Ferramentas administrativas para diagnóstico e testes em tempo real.

**Localização:** `/admin` → Menu "Debug & Testes"

**Funcionalidades:**
- Setup automático do sistema
- Verificação de saúde (real-time, inventário, reservas)
- Limpeza manual de recursos
- Teste de real-time subscriptions
- Comandos SQL úteis

### 16.2 Monitoramento

**Métricas do Admin Dashboard:**
- Taxa de conversão de checkout
- Tempo médio de confirmação PIX
- Vendas por dia/semana/mês
- Distribuição de planos
- Taxa de sucesso de gateways

**Logs Disponíveis:**
- Auditoria (todas as ações admin)
- Gateways (sucesso/falha por tentativa)
- Webhooks processados
- Rate limiting

### 16.3 Rate Limiting

Proteção implementada por ação:

| Ação | Limite | Janela |
|------|--------|--------|
| Login | 5 tentativas | 1 hora |
| Registro | 3 cadastros | 1 dia |
| Checkout | 10 pedidos | 1 hora |
| Recuperar senha | 3 pedidos | 1 hora |

### 16.4 Validações de Segurança

**Senhas Fortes:**
- Mínimo 8 caracteres
- 1 maiúscula, 1 minúscula
- 1 número, 1 caractere especial
- Indicador visual de força

**Proteções Admin:**
- Admin não pode alterar próprio role
- Sistema deve ter pelo menos 1 admin
- Banimento requer motivo obrigatório
- Deleção de sessões requer confirmação dupla

**Ban Detection:**
- Usuário banido é desconectado em até 1 minuto
- Real-time listener detecta mudanças
- Modal com motivo do banimento

---

## 17. GUIA DE TROUBLESHOOTING

### 17.1 Problemas Comuns

#### Dashboard não atualiza após compra
**Causa:** Cache do React Query não invalidado
**Solução:**
1. Ir para Debug Panel
2. Clicar em "Verificar Saúde"
3. Verificar se real-time está ativo
4. Se não, clicar em "Setup Completo"

#### Sessões insuficientes no checkout
**Causa:** Inventário dessincronizado
**Solução:**
1. Admin → Debug & Testes
2. Clicar em "Sincronizar Inventário"
3. Verificar contagem atualizada

#### Pedido não confirmou após pagamento
**Verificar:**
1. Webhook foi recebido? (processed_webhooks)
2. Gateway respondeu? (gateway_logs)
3. Pedido está em polling? (orders.status)

**Ação:**
```sql
-- Forçar confirmação manual (CUIDADO!)
UPDATE orders 
SET status = 'completed'
WHERE id = 'ORDER_ID' AND status = 'pending';
```

#### Real-time parou de funcionar
**Diagnóstico:**
```sql
-- Verificar se tabelas têm replication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Correção:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE session_files;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
-- Repetir para todas as tabelas necessárias
```

### 17.2 Comandos SQL Úteis

**Ver sessões travadas:**
```sql
SELECT * FROM session_files 
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';
```

**Liberar sessões manualmente:**
```sql
UPDATE session_files
SET status = 'available', reserved_for_order = NULL, reserved_at = NULL
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';
```

**Ver pedidos pendentes por usuário:**
```sql
SELECT user_id, COUNT(*) as pending_count
FROM orders
WHERE status = 'pending'
AND created_at > NOW() - INTERVAL '30 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

**Ver últimos webhooks processados:**
```sql
SELECT * FROM processed_webhooks 
ORDER BY processed_at DESC 
LIMIT 10;
```

### 17.3 Logs de Debug

**Ativar logs detalhados:**
```typescript
// No navegador console
localStorage.setItem('debug', 'true');

// Ver logs de real-time
localStorage.setItem('debug:realtime', 'true');
```

### 17.4 Contato de Suporte

Se problemas persistirem:
1. Capturar screenshot do erro
2. Copiar logs do console (F12)
3. Anotar passos para reproduzir
4. Enviar para: suporte@dlgconnect.com

---

## RESUMO DAS ATUALIZAÇÕES

### Novas Funcionalidades
- ✅ Sistema de upgrade/downgrade de planos com crédito proporcional
- ✅ Painel de debug completo para diagnóstico
- ✅ Tutorial de onboarding para novos usuários
- ✅ Histórico de faturas detalhado
- ✅ Dashboard de métricas analíticas
- ✅ Notificações em tempo real

### Correções de Bugs
- ✅ Webhook idempotente (anti-duplicação)
- ✅ Reserva atômica de sessões (anti race condition)
- ✅ Gateway fallback automático
- ✅ Download com retry automático
- ✅ Sincronização de inventário

### Melhorias de Segurança
- ✅ Rate limiting rigoroso
- ✅ Validação de senhas fortes
- ✅ Auditoria completa de ações
- ✅ Validação de arquivos .session

### Sistemas de Proteção
- ✅ Real-time sync
- ✅ Idempotência de webhooks
- ✅ Fallback automático de gateways
- ✅ Limpeza automática de recursos

---

*Documentação atualizada em dezembro/2024*
