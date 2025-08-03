import { NextApiRequest, NextApiResponse } from 'next';

interface CreditCardPayment {
  amount: number;
  description: string;
  paymentMethodId: string;
  token: string;
  installments: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

interface PaymentResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_process' | 'cancelled';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
  payment_method_id: string;
}

/**
 * API endpoint para processar pagamento com cartão de crédito
 * POST /api/mercadopago/credit-card
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      amount, 
      description, 
      paymentMethodId, 
      token, 
      installments, 
      payer 
    } = req.body as CreditCardPayment;

    // Validação básica
    if (!amount || !description || !token || !installments || !payer) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'amount deve ser maior que 0' 
      });
    }

    if (installments < 1 || installments > 12) {
      return res.status(400).json({ 
        error: 'installments deve ser entre 1 e 12' 
      });
    }

    // Configuração do Mercado Pago
    // const mercadopago = new MercadoPago({
    //   accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    // });

    // Dados do pagamento com cartão
    const paymentData = {
      transaction_amount: amount,
      token,
      description,
      installments,
      payment_method_id: paymentMethodId,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
    };

    // Chamada para a API do Mercado Pago
    // const payment = await mercadopago.payment.create(paymentData);

    // SIMULAÇÃO - Remova isto na implementação real
    const mockPayment: PaymentResponse = {
      id: `cc_${Date.now()}`,
      status: Math.random() > 0.2 ? 'approved' : 'rejected', // 80% de aprovação simulada
      status_detail: Math.random() > 0.2 ? 'accredited' : 'cc_rejected_insufficient_amount',
      transaction_amount: amount,
      date_created: new Date().toISOString(),
      date_approved: Math.random() > 0.2 ? new Date().toISOString() : undefined,
      payment_method_id: paymentMethodId,
    };

    console.log('Credit Card Payment processed:', mockPayment);

    res.status(200).json(mockPayment);
  } catch (error) {
    console.error('Error processing credit card payment:', error);
    
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}

/**
 * Exemplo de implementação real com MercadoPago SDK:
 * 
 * import { MercadoPago } from 'mercadopago';
 * 
 * const mercadopago = new MercadoPago({
 *   accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
 * });
 * 
 * const payment = await mercadopago.payment.create({
 *   transaction_amount: 100,
 *   token: 'card_token_id',
 *   description: 'Título do produto',
 *   installments: 1,
 *   payment_method_id: 'visa',
 *   payer: {
 *     email: 'test@test.com',
 *     identification: {
 *       type: 'CPF',
 *       number: '19119119100',
 *     },
 *   },
 * });
 * 
 * return res.json(payment);
 */
