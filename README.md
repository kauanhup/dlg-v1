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
- **Compra de sessões** - brasileiras e estrangeiras em combos ou quantidade personalizada
- **Dashboard pessoal** - visualização de licenças, sessões e histórico
- **Download de arquivos** - bot e sessões compradas
- **Histórico de login** - monitoramento de acessos

#### Para Administradores:
- **Gestão de usuários** - visualização, banimento, alteração de roles
- **Gestão de assinaturas** - criar, editar, cancelar licenças
- **Gestão de sessões** - upload, exclusão, configuração de preços
- **Gestão de combos** - criar pacotes de sessões com preços especiais
- **Configurações do sistema** - modo manutenção, gateways de pagamento
- **Gestão do bot** - upload de novas versões
- **Dashboard analítico** - métricas e estatísticas

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
│       └── utils.ts               # Utilitários (cn, etc)
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
│       └── expire-subscriptions/  # Expiração de assinaturas
│
├── hostinger-proxy/               # Proxy para webhooks
│   ├── .htaccess
│   ├── proxy-pixup.php
│   ├── webhook-evopay.php
│   ├── webhook-handler.php
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
└── README.md
```

### 3.1 Responsabilidade de Cada Diretório

| Diretório | Responsabilidade |
|-----------|------------------|
| `src/components/ui/` | Componentes base reutilizáveis (botões, inputs, modais) |
| `src/components/landing/` | Componentes específicos da landing page |
| `src/components/admin/` | Componentes do painel administrativo |
| `src/hooks/` | Lógica de negócio, estado e integrações |
| `src/pages/` | Páginas/rotas da aplicação |
| `src/integrations/` | Configuração de serviços externos |
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
- **Seções**: Dashboard, Usuários, Assinaturas, Sessões, Configurações
- **Responsabilidades**:
  - Gestão completa de usuários
  - Controle de assinaturas/licenças
  - Upload e gestão de sessões
  - Configurações do sistema

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
- **Banir/Desbanir**: Bloquear acesso
- **Alterar Role**: Promover a admin ou rebaixar
- **Ver Detalhes**: Assinaturas, pedidos, sessões do usuário

#### 5.3.3 Gestão de Assinaturas
- **Criar**: Nova assinatura para usuário
- **Editar**: Alterar plano, datas, status
- **Cancelar**: Encerrar assinatura
- **Visualizar**: Status, datas, histórico

#### 5.3.4 Gestão de Sessões
- **Upload**: Enviar arquivos .session
- **Excluir**: Remover sessões
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

// Validação de senha
const passwordSchema = z.string()
  .min(6, 'Mínimo 6 caracteres');

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
```

#### Compra de Licença
```
1. No dashboard, clica em "Comprar Licença"
2. Seleciona plano desejado
3. Redireccionado para /checkout
4. Escaneia QR Code PIX ou copia código
5. Efetua pagamento
6. Sistema detecta pagamento (webhook)
7. Licença ativada automaticamente
8. Dashboard atualizado
```

#### Compra de Sessões
```
1. No dashboard, vai para aba "Sessions"
2. Clica em "Comprar Sessions"
3. Escolhe tipo (brasileiras/estrangeiras)
4. Seleciona combo ou quantidade personalizada
5. Segue para checkout
6. Após pagamento, sessões aparecem para download
```

#### Download de Bot/Sessões
```
1. Na aba "Licenças", clica em "Baixar Bot"
2. Na aba "Sessions", clica no arquivo para download
3. Arquivos são baixados do storage
```

### 11.2 Jornada do Administrador

#### Gestão Diária
```
1. Faz login (redirecionado para /admin)
2. Visualiza dashboard com métricas
3. Verifica pedidos pendentes
4. Processa ações necessárias
```

#### Upload de Sessões
```
1. Vai para seção "Sessões"
2. Clica em "Importar"
3. Seleciona tipo (BR/Estrangeiras)
4. Seleciona arquivos .session
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
4. Pode: banir, alterar role, ver assinaturas
5. Se necessário, cria assinatura manual
```

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

### 12.2 Storage (Supabase Storage)

| Bucket | Conteúdo |
|--------|----------|
| `sessions` | Arquivos .session |
| `bot` | Versões do bot (.exe/.zip) |

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

---

*Documentação gerada em dezembro/2024*
