// Teste rápido da API - pode ser removido depois
export const testPixAPI = async () => {
  const testPayload = {
    method: 'PIX',
    amount: 100,
    description: 'Teste PIX',
    customer: {
      name: 'Teste Usuario',
      email: 'teste@teste.com',
      document: '12345678901'
    }
  };

  try {
    console.log('Testando API com payload:', testPayload);
    
    const response = await fetch('http://localhost:3001/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Resposta completa:', responseText);

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Dados JSON:', jsonData);
        return jsonData;
      } catch (e) {
        console.log('Resposta não é JSON válido');
        return responseText;
      }
    } else {
      console.error('Erro na API:', responseText);
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }
  } catch (error) {
    console.error('Erro de rede:', error);
    throw error;
  }
};

// Adicione isto ao console do navegador para testar:
// window.testPixAPI = testPixAPI;
