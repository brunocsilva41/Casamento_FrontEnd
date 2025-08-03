import { NextApiRequest, NextApiResponse } from 'next';

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
 * API endpoint para consultar status de pagamento
 * GET /api/mercadopago/payment/[id]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Payment ID é obrigatório' });
    }

    // Configuração do Mercado Pago
    // const mercadopago = new MercadoPago({
    //   accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    // });

    // Consulta o pagamento no Mercado Pago
    // const payment = await mercadopago.payment.findById(id);

    // SIMULAÇÃO - Remova isto na implementação real
    const mockPayment: PaymentResponse = {
      id,
      // Simula diferentes status baseado no tempo
      status: Date.now() % 3 === 0 ? 'approved' : 'pending',
      status_detail: Date.now() % 3 === 0 ? 'accredited' : 'pending_waiting_payment',
      transaction_amount: 150.00,
      date_created: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min atrás
      date_approved: Date.now() % 3 === 0 ? new Date().toISOString() : undefined,
      payment_method_id: id.startsWith('pix_') ? 'pix' : 'visa',
    };

    console.log('Payment status checked:', mockPayment);

    res.status(200).json(mockPayment);
  } catch (error) {
    console.error('Error checking payment status:', error);
    
    // Se o pagamento não for encontrado
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
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
 * const payment = await mercadopago.payment.findById(id);
 * 
 * return res.json(payment);
 */
