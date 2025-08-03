import { NextApiRequest, NextApiResponse } from 'next';

// Simulação de uma classe MercadoPago para o exemplo
// Na implementação real, use: import { MercadoPago } from 'mercadopago';

interface MercadoPagoPayment {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  token?: string;
  installments?: number;
}

interface PaymentResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_process' | 'cancelled';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
  payment_method_id: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code_base64?: string;
      qr_code?: string;
    };
  };
  date_of_expiration?: string;
}

/**
 * API endpoint para criar pagamento PIX
 * POST /api/mercadopago/pix
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transaction_amount, description } = req.body as MercadoPagoPayment;

    // Validação básica
    if (!transaction_amount || !description) {
      return res.status(400).json({ 
        error: 'transaction_amount e description são obrigatórios' 
      });
    }

    if (transaction_amount <= 0) {
      return res.status(400).json({ 
        error: 'transaction_amount deve ser maior que 0' 
      });
    }

    // Configuração do Mercado Pago
    // const mercadopago = new MercadoPago({
    //   accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    // });

    // Dados do pagamento PIX
    const paymentData: MercadoPagoPayment = {
      transaction_amount,
      description,
      payment_method_id: 'pix',
      payer: {
        email: 'customer@email.com', // Este email deveria vir do frontend
      },
    };

    // Chamada para a API do Mercado Pago
    // const payment = await mercadopago.payment.create({
    //   ...paymentData,
    // });

    // SIMULAÇÃO - Remova isto na implementação real
    const mockPayment: PaymentResponse = {
      id: `pix_${Date.now()}`,
      status: 'pending',
      status_detail: 'pending_waiting_payment',
      transaction_amount,
      date_created: new Date().toISOString(),
      payment_method_id: 'pix',
      point_of_interaction: {
        transaction_data: {
          // QR Code base64 simulado - Na implementação real vem do MP
          qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          // Código PIX simulado - Na implementação real vem do MP  
          qr_code: '00020101021243650016COM.MERCADOLIBRE02013063638f1932-5420-4574-91a0-02735b0c9587520400005303986540510.005802BR5909Test User6009SAO PAULO62090505123456304B2D2',
        },
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    };

    console.log('PIX Payment created:', mockPayment);

    res.status(200).json(mockPayment);
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    
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
 *   description: 'Título do produto',
 *   payment_method_id: 'pix',
 *   payer: {
 *     email: 'test@test.com',
 *   },
 * });
 * 
 * return res.json(payment);
 */
