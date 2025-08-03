// Mapeamento de erros para mensagens amigáveis ao usuário
export const ERROR_MESSAGES = {
  // Erros de conectividade
  NETWORK_ERROR: {
    title: 'Problema de Conexão',
    message: 'Não foi possível conectar com o servidor. Verifique sua conexão com a internet e tente novamente.',
    icon: '🌐',
    type: 'network'
  },
  
  SERVER_UNAVAILABLE: {
    title: 'Servidor Indisponível',
    message: 'O sistema de pagamentos está temporariamente indisponível. Tente novamente em alguns minutos.',
    icon: '🔧',
    type: 'server'
  },

  // Erros de PIX
  PIX_GENERATION_FAILED: {
    title: 'Erro ao Gerar PIX',
    message: 'Não foi possível gerar o código PIX para seu presente. Verifique os dados e tente novamente.',
    icon: '💳',
    type: 'pix'
  },

  PIX_EXPIRED: {
    title: 'PIX Expirado',
    message: 'O código PIX expirou. Gere um novo código para continuar com a compra do presente.',
    icon: '⏰',
    type: 'pix'
  },

  // Erros de cartão
  CARD_INVALID: {
    title: 'Dados do Cartão Inválidos',
    message: 'Por favor, verifique o número do cartão, CVV e data de validade. Todos os campos são obrigatórios.',
    icon: '💳',
    type: 'card'
  },

  CARD_REJECTED: {
    title: 'Pagamento Não Autorizado',
    message: 'O pagamento foi rejeitado pelo banco emissor. Tente outro cartão ou entre em contato com seu banco.',
    icon: '❌',
    type: 'card'
  },

  INSUFFICIENT_FUNDS: {
    title: 'Saldo Insuficiente',
    message: 'Não há saldo disponível no cartão para esta compra. Tente outro cartão ou forme de pagamento.',
    icon: '💰',
    type: 'card'
  },

  // Erros de validação
  VALIDATION_ERROR: {
    title: 'Informações Obrigatórias',
    message: 'Por favor, preencha todos os campos obrigatórios para continuar com a compra do presente.',
    icon: '📝',
    type: 'validation'
  },

  CUSTOMER_NAME_REQUIRED: {
    title: 'Nome Obrigatório',
    message: 'Por favor, informe seu nome para que possamos identificar quem está dando o presente.',
    icon: '👤',
    type: 'validation'
  },

  // Erros específicos de presentes
  GIFT_UNAVAILABLE: {
    title: 'Presente Indisponível',
    message: 'Este presente já foi escolhido por outro convidado. Escolha outro presente da lista.',
    icon: '🎁',
    type: 'gift'
  },

  GIFT_NOT_FOUND: {
    title: 'Presente Não Encontrado',
    message: 'O presente selecionado não foi encontrado. Volte à lista e escolha outro presente.',
    icon: '🔍',
    type: 'gift'
  },

  // Erros genéricos
  UNKNOWN_ERROR: {
    title: 'Ops! Algo deu errado',
    message: 'Ocorreu um erro inesperado ao processar sua solicitação. Tente novamente ou entre em contato conosco.',
    icon: '⚠️',
    type: 'generic'
  },

  TIMEOUT_ERROR: {
    title: 'Tempo Esgotado',
    message: 'A operação demorou mais que o esperado. Tente novamente.',
    icon: '⏱️',
    type: 'timeout'
  },

  // Erros específicos do Mercado Pago
  MERCADOPAGO_SDK_ERROR: {
    title: 'Erro no Sistema de Pagamento',
    message: 'Houve um problema ao carregar o sistema de pagamentos. Recarregue a página e tente novamente.',
    icon: '🔒',
    type: 'payment'
  },

  // Erros de autenticação e login
  INVALID_CREDENTIALS: {
    title: 'Credenciais Inválidas',
    message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    icon: '🔑',
    type: 'auth'
  },

  USER_NOT_FOUND: {
    title: 'Usuário Não Encontrado',
    message: 'Não foi possível encontrar uma conta com este email. Verifique o endereço informado.',
    icon: '👤',
    type: 'auth'
  },

  EMAIL_ALREADY_EXISTS: {
    title: 'Email Já Cadastrado',
    message: 'Este email já está em uso. Faça login ou utilize outro endereço de email.',
    icon: '📧',
    type: 'auth'
  },

  SESSION_EXPIRED: {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou por motivos de segurança. Faça login novamente para continuar.',
    icon: '⏰',
    type: 'auth'
  },

  UNAUTHORIZED_ACCESS: {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para acessar esta área. Entre em contato com o administrador.',
    icon: '🚫',
    type: 'auth'
  },

  WEAK_PASSWORD: {
    title: 'Senha Muito Simples',
    message: 'A senha deve ter pelo menos 6 caracteres com letras e números.',
    icon: '🔐',
    type: 'auth'
  },

  REGISTRATION_FAILED: {
    title: 'Erro no Cadastro',
    message: 'Não foi possível completar seu cadastro. Verifique os dados e tente novamente.',
    icon: '📝',
    type: 'auth'
  },

  LOGIN_FAILED: {
    title: 'Falha na Autenticação',
    message: 'Não foi possível fazer login no momento. Tente novamente em alguns instantes.',
    icon: '🔐',
    type: 'auth'
  }
};

// Função para identificar o tipo de erro baseado na mensagem ou código
export const identifyErrorType = (error: any): keyof typeof ERROR_MESSAGES => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';
  const statusCode = error?.status || 0;

  // Erros de autenticação
  if (statusCode === 401 || 
      errorMessage.includes('401') ||
      errorMessage.includes('invalid credentials') ||
      errorMessage.includes('credenciais inválidas') ||
      errorMessage.includes('email ou senha')) {
    return 'INVALID_CREDENTIALS';
  }

  if (errorMessage.includes('user not found') ||
      errorMessage.includes('usuário não encontrado')) {
    return 'USER_NOT_FOUND';
  }

  if (statusCode === 409 ||
      errorMessage.includes('409') ||
      errorMessage.includes('email already') ||
      errorMessage.includes('email já')) {
    return 'EMAIL_ALREADY_EXISTS';
  }

  if (errorMessage.includes('session expired') ||
      errorMessage.includes('sessão expirada') ||
      errorMessage.includes('token expired')) {
    return 'SESSION_EXPIRED';
  }

  if (statusCode === 403 ||
      errorMessage.includes('403') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('acesso negado')) {
    return 'UNAUTHORIZED_ACCESS';
  }

  if (errorMessage.includes('weak password') ||
      errorMessage.includes('senha muito simples')) {
    return 'WEAK_PASSWORD';
  }

  if (errorMessage.includes('registration failed') ||
      errorMessage.includes('erro no cadastro')) {
    return 'REGISTRATION_FAILED';
  }

  // Erros de rede/conectividade
  if (errorMessage.includes('fetch') || 
      errorMessage.includes('network') || 
      errorMessage.includes('conexão') ||
      errorMessage.includes('servidor backend não encontrado')) {
    return 'NETWORK_ERROR';
  }

  // Erros de servidor
  if (statusCode >= 500 || 
      errorMessage.includes('server error') || 
      errorMessage.includes('internal')) {
    return 'SERVER_UNAVAILABLE';
  }

  // Erros de PIX
  if (errorMessage.includes('pix') || 
      errorMessage.includes('qr code') ||
      errorCode === 'PIX_ERROR') {
    return 'PIX_GENERATION_FAILED';
  }

  if (errorMessage.includes('expir') || errorCode === 'PIX_EXPIRED') {
    return 'PIX_EXPIRED';
  }

  // Erros de cartão
  if (errorMessage.includes('cartão') || 
      errorMessage.includes('card') ||
      errorMessage.includes('token')) {
    return 'CARD_INVALID';
  }

  if (statusCode === 402 || 
      errorMessage.includes('rejected') || 
      errorMessage.includes('rejeitado')) {
    return 'CARD_REJECTED';
  }

  if (errorMessage.includes('insufficient') || 
      errorMessage.includes('saldo')) {
    return 'INSUFFICIENT_FUNDS';
  }

  // Erros específicos de validação
  if (errorMessage.includes('nome') && errorMessage.includes('obrigatório')) {
    return 'CUSTOMER_NAME_REQUIRED';
  }

  // Erros específicos de presentes  
  if (errorMessage.includes('presente') && errorMessage.includes('indisponível')) {
    return 'GIFT_UNAVAILABLE';
  }

  if (errorMessage.includes('presente') && errorMessage.includes('não encontrado')) {
    return 'GIFT_NOT_FOUND';
  }

  // Erros do Mercado Pago SDK
  if (errorMessage.includes('mercadopago') || 
      errorMessage.includes('sdk') ||
      errorMessage.includes('script')) {
    return 'MERCADOPAGO_SDK_ERROR';
  }

  // Erros de validação gerais
  if (statusCode === 400 || 
      errorMessage.includes('obrigatório') || 
      errorMessage.includes('required') ||
      errorMessage.includes('validation')) {
    return 'VALIDATION_ERROR';
  }

  // Timeout
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('tempo')) {
    return 'TIMEOUT_ERROR';
  }

  // Erro genérico
  return 'UNKNOWN_ERROR';
};

// Função para obter mensagem amigável de erro
export const getFriendlyErrorMessage = (error: any) => {
  const errorType = identifyErrorType(error);
  return ERROR_MESSAGES[errorType];
};

// Hook para formatação de erros
export const useErrorHandler = () => {
  const formatError = (error: any) => {
    const friendlyError = getFriendlyErrorMessage(error);
    
    return {
      ...friendlyError,
      originalError: error?.message || 'Erro desconhecido',
      timestamp: new Date().toISOString(),
      canRetry: !['CARD_REJECTED', 'INSUFFICIENT_FUNDS'].includes(identifyErrorType(error))
    };
  };

  return { formatError };
};
