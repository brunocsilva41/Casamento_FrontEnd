// Test connectivity to backend API
const testApiConnection = async () => {
  const baseUrls = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:5000'
  ];

  console.log('🔍 Testando conectividade com o backend...');

  for (const baseUrl of baseUrls) {
    try {
      console.log(`📡 Testando: ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/api/payments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log(`✅ Conectado com sucesso: ${baseUrl}`);
        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Dados:', data);
        return baseUrl;
      } else {
        console.log(`⚠️  Resposta não-ok: ${baseUrl} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${baseUrl}`, error.message);
    }
  }

  console.log('❌ Nenhum servidor backend encontrado');
  return null;
};

// Test PIX payment creation
const testPixPayment = async (baseUrl) => {
  console.log('\n💳 Testando criação de pagamento PIX...');
  
  const testPayload = {
    method: 'PIX',
    amount: 150.00,
    description: 'Teste de pagamento PIX',
    customer: {
      name: 'João Teste',
      email: 'joao.teste@email.com',
      document: '12345678901'
    },
    giftId: 'test-gift-123'
  };

  try {
    const response = await fetch(`${baseUrl}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    console.log(`📡 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ PIX criado com sucesso:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Erro ao criar PIX:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message);
  }
};

// Run tests
(async () => {
  const baseUrl = await testApiConnection();
  if (baseUrl) {
    await testPixPayment(baseUrl);
  }
})();

export { testApiConnection, testPixPayment };

