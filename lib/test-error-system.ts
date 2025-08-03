// Teste do sistema de tratamento de erros
import { getFriendlyErrorMessage, identifyErrorType } from './error-handler';

export const testErrorSystem = () => {
  console.log('🧪 Testando sistema de tratamento de erros...\n');

  const testCases = [
    { error: new Error('Nome do cliente é obrigatório'), expected: 'CUSTOMER_NAME_REQUIRED' },
    { error: { message: 'fetch failed', status: 0 }, expected: 'NETWORK_ERROR' },
    { error: { message: 'Erro ao gerar PIX', code: 'PIX_ERROR' }, expected: 'PIX_GENERATION_FAILED' },
    { error: { message: 'Pagamento rejeitado', status: 402 }, expected: 'CARD_REJECTED' },
    { error: { message: 'SDK do Mercado Pago não foi carregado' }, expected: 'MERCADOPAGO_SDK_ERROR' },
    { error: { message: 'Erro desconhecido' }, expected: 'UNKNOWN_ERROR' }
  ];

  testCases.forEach((testCase, index) => {
    const errorType = identifyErrorType(testCase.error);
    const friendlyError = getFriendlyErrorMessage(testCase.error);
    
    console.log(`✅ Teste ${index + 1}:`);
    console.log(`   Erro: ${testCase.error.message || JSON.stringify(testCase.error)}`);
    console.log(`   Tipo identificado: ${errorType}`);
    console.log(`   Esperado: ${testCase.expected}`);
    console.log(`   ✓ ${errorType === testCase.expected ? 'PASSOU' : 'FALHOU'}`);
    console.log(`   Mensagem amigável: "${friendlyError.title}: ${friendlyError.message}"`);
    console.log(`   Ícone: ${friendlyError.icon}\n`);
  });

  console.log('🎯 Teste concluído!');
};

// Para executar no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testErrorSystem = testErrorSystem;
}
