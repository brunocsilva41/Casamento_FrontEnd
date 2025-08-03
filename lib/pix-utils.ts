export interface PixData {
  recipientName: string;
  pixKey: string;
  amount: number;
  description: string;
  city: string;
}

export function generatePixPayload(data: PixData): string {
  const {
    recipientName,
    pixKey,
    amount,
    description,
    city = 'SAO PAULO'
  } = data;

  // Função para calcular CRC16
  function crc16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  // Função para formatar campo EMV
  function formatField(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  }

  // Construir payload PIX
  let payload = '';
  
  // Payload Format Indicator
  payload += formatField('00', '01');
  
  // Point of Initiation Method
  payload += formatField('01', '12');
  
  // Merchant Account Information
  const merchantAccount = formatField('00', 'BR.GOV.BCB.PIX') + 
                         formatField('01', pixKey);
  payload += formatField('26', merchantAccount);
  
  // Merchant Category Code
  payload += formatField('52', '0000');
  
  // Transaction Currency (BRL)
  payload += formatField('53', '986');
  
  // Transaction Amount
  payload += formatField('54', amount.toFixed(2));
  
  // Country Code
  payload += formatField('58', 'BR');
  
  // Merchant Name
  payload += formatField('59', recipientName);
  
  // Merchant City
  payload += formatField('60', city);
  
  // Additional Data Field Template
  const additionalData = formatField('05', description);
  payload += formatField('62', additionalData);
  
  // CRC16
  payload += '6304';
  const crc = crc16(payload);
  payload += crc;
  
  return payload;
}