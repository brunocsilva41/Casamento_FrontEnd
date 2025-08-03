# Componente de Checkout Mercado Pago - Frontend

Este é um componente completo de checkout integrado com o Mercado Pago, desenvolvido em React com TypeScript, suportando pagamentos via PIX e cartão de crédito. **Projetado para trabalhar com a API backend já implementada.**

## 🚀 Características

- ✅ **Pagamento PIX**: QR Code dinâmico com verificação automática de status
- ✅ **Cartão de Crédito**: Suporte completo com parcelamento e tokenização segura
- ✅ **TypeScript**: Tipagem explícita e verificação em tempo de compilação
- ✅ **Acessibilidade**: ARIA labels, navegação por teclado e foco visível
- ✅ **Responsivo**: Interface adaptável para desktop e mobile
- ✅ **Hooks Customizados**: Lógica isolada e reutilizável
- ✅ **Tratamento de Erros**: Centralizado e user-friendly
- ✅ **Loading States**: Feedback visual para todas as operações
- ✅ **Integração Backend**: Trabalha diretamente com sua API backend

## 📁 Estrutura dos Arquivos

```
components/
├── mercado-pago-checkout.tsx    # Componente principal
├── pix-checkout.tsx            # Componente específico para PIX
├── credit-card-checkout.tsx    # Componente específico para cartão
└── mercado-pago-script.tsx     # Script loader para SDK do MP

hooks/
└── use-mercado-pago.ts        # Hook personalizado para lógica do MP

lib/
├── types.ts                   # Definições de tipos TypeScript
└── mercado-pago-context.tsx   # Context Provider

app/
└── checkout/
    └── page.tsx              # Página de exemplo de uso
```

## 🛠️ Instalação e Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 2. Incluir o SDK do MercadoPago

No seu layout principal (`app/layout.tsx`), adicione o script loader:

```tsx
import { MercadoPagoScript } from '@/components/mercado-pago-script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <MercadoPagoScript 
          publicKey={process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!} 
        />
        {children}
      </body>
    </html>
  );
}
```

## 🎯 Uso Básico

### 1. Configuração Simples

```tsx
import { MercadoPagoCheckout } from '@/components/mercado-pago-checkout';
import { MercadoPagoConfig } from '@/lib/types';

const config: MercadoPagoConfig = {
  publicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
};

const customer = {
  name: 'João Silva',
  email: 'joao@email.com',
  document: '12345678901',
};

const callbacks = {
  onSuccess: (payment) => console.log('Pagamento aprovado:', payment),
  onError: (error) => console.error('Erro:', error),
  onPending: (payment) => console.log('Pagamento pendente:', payment),
};

function MyCheckout() {
  return (
    <MercadoPagoCheckout
      config={config}
      amount={150.00}
      description="Presente de Casamento"
      customer={customer}
      giftId="gift-123" // Opcional
      callbacks={callbacks}
    />
  );
}
```

### 2. Com Context Provider

```tsx
import { MercadoPagoProvider } from '@/lib/mercado-pago-context';

function App() {
  return (
    <MercadoPagoProvider config={config}>
      <MyCheckout />
    </MercadoPagoProvider>
  );
}
```

## 🔧 Props e Configuração

### MercadoPagoCheckout Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `config` | `MercadoPagoConfig` | ✅ | Configuração das APIs e chaves |
| `amount` | `number` | ✅ | Valor do pagamento |
| `description` | `string` | ✅ | Descrição do produto/serviço |
| `customer` | `Customer` | ✅ | Dados do cliente |
| `callbacks` | `CheckoutCallbacks` | ✅ | Funções de callback para eventos |
| `giftId` | `string` | ❌ | ID do presente (opcional) |
| `className` | `string` | ❌ | Classes CSS customizadas |

### MercadoPagoConfig

```typescript
interface MercadoPagoConfig {
  publicKey: string;    // Chave pública do MP
  apiBaseUrl: string;   // URL base da sua API backend
}
```

### Customer

```typescript
interface Customer {
  name: string;      // Nome completo
  email: string;     // Email válido
  document: string;  // CPF (apenas números)
}
```

### CheckoutCallbacks

```typescript
interface CheckoutCallbacks {
  onSuccess: (payment: PaymentResponse) => void;  // Pagamento aprovado
  onError: (error: Error) => void;               // Erro no pagamento
  onPending: (payment: PaymentResponse) => void; // Pagamento pendente
}
```

## 🎨 Customização Visual

### CSS Classes Disponíveis

O componente usa classes Tailwind CSS. Você pode customizar através de:

```tsx
<MercadoPagoCheckout
  className="custom-checkout"
  // ... outras props
/>
```

### Temas

O componente herda automaticamente o tema do sistema (dark/light) através do tema configurado no projeto.

## 🔐 Integração com Backend

O componente foi desenvolvido para trabalhar diretamente com sua API backend já implementada:

### Endpoints Utilizados

- **POST `/api/payments`** - Criar pagamento (PIX/Cartão)
- **GET `/api/payments/:id`** - Consultar status do pagamento

### Estrutura da Requisição

#### PIX
```json
{
  "method": "PIX",
  "amount": 150.00,
  "description": "Presente de Casamento",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678901"
  },
  "giftId": "gift-123"
}
```

#### Cartão de Crédito
```json
{
  "method": "CREDIT_CARD",
  "amount": 150.00,
  "description": "Presente de Casamento",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678901"
  },
  "cardToken": "TOKEN_FROM_MERCADOPAGO_SDK",
  "installments": 3,
  "giftId": "gift-123"
}
```

### Tokenização Segura

O frontend usa o SDK oficial do MercadoPago para tokenizar cartões:

1. **Dados do cartão nunca passam pelo seu backend**
2. **Token é criado diretamente com o MercadoPago**
3. **Apenas o token é enviado para sua API**

```typescript
// Tokenização automática no frontend
const token = await mp.createCardToken({
  cardNumber: '4509953566233704',
  securityCode: '123',
  expirationMonth: '12',
  expirationYear: '2025',
  cardholder: {
    name: 'João Silva',
    identification: {
      type: 'CPF',
      number: '12345678901'
    }
  }
});

// Apenas o token é enviado para o backend
const payment = await fetch('/api/payments', {
  method: 'POST',
  body: JSON.stringify({
    method: 'CREDIT_CARD',
    cardToken: token.id, // ✅ Seguro
    // ... outros dados
  })
});
```

## 🧪 Testes

### Dados de Teste

Para ambiente de teste, use:

```typescript
// Cartões de teste
const testCards = {
  visa: '4509953566233704',
  mastercard: '5031433215406351',
  amex: '373486297239310',
};

// CPFs de teste
const testCPF = '11111111111';
```

### PIX de Teste

O Mercado Pago fornece automaticamente QR codes de teste no ambiente sandbox.

## 🚨 Tratamento de Erros

O componente trata automaticamente:

- ❌ Erros de rede
- ❌ Cartões inválidos
- ❌ Pagamentos rejeitados
- ❌ Timeouts de API
- ❌ Tokens inválidos

Todos os erros são exibidos de forma user-friendly através de alerts.

## ♿ Acessibilidade

- **ARIA Labels**: Todos os elementos interativos possuem labels descritivos
- **Navegação por Teclado**: Suporte completo para Tab e Enter
- **Screen Readers**: Compatível com leitores de tela
- **Contraste**: Cores que atendem às diretrizes WCAG
- **Foco Visível**: Indicadores claros de foco

## 📱 Responsividade

O componente é totalmente responsivo e funciona bem em:

- 📱 Mobile (320px+)
- 📋 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🔄 Estados do Pagamento

| Status | Descrição | Ação |
|--------|-----------|------|
| `pending` | Aguardando pagamento | Polling automático para PIX |
| `approved` | Pagamento aprovado | Callback `onSuccess` |
| `rejected` | Pagamento rejeitado | Callback `onError` |
| `cancelled` | Pagamento cancelado | Callback `onError` |
| `in_process` | Em processamento | Polling automático |

## 🔧 Hooks Disponíveis

### useMercadoPago

Hook principal que gerencia todo o estado do checkout:

```typescript
const {
  isLoading,
  error,
  paymentMethods,
  selectedMethod,
  pixPayment,
  installmentOptions,
  paymentStatus,
  actions
} = useMercadoPago({ config, amount, description, callbacks });
```

### useMercadoPagoContext

Hook para acessar o contexto global:

```typescript
const { config, createPaymentCallbacks } = useMercadoPagoContext();
```

## 📋 TODO / Melhorias Futuras

- [ ] Integração com MercadoPago.js SDK para tokenização mais segura
- [ ] Suporte a mais bandeiras de cartão
- [ ] Validação de CPF/CNPJ mais robusta
- [ ] Testes automatizados
- [ ] Suporte a desconto por pagamento à vista
- [ ] Integração com outros meios de pagamento (boleto, débito)
- [ ] Suporte a múltiplas moedas
- [ ] Analytics e métricas de conversão

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email: suporte@exemplo.com

---

**Desenvolvido com ❤️ para facilitar integrações com Mercado Pago**
