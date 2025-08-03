export interface Gift {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  image: string;
  category: string;
  isPurchased?: boolean;
  purchasedBy?: string;
}

export const gifts: Gift[] = [
  {
    id: '1',
    name: 'Conjunto de Panelas Antiaderente',
    description: 'Set completo com 5 panelas antiaderentes',
    fullDescription: 'Conjunto de 5 panelas antiaderentes de alta qualidade, incluindo panelas de diferentes tamanhos para todas as necessidades culinárias. Material durável e de fácil limpeza, perfeito para começar a vida a dois na cozinha.',
    price: 299.90,
    image: 'https://images.pexels.com/photos/4099237/pexels-photo-4099237.jpeg',
    category: 'Cozinha'
  },
  {
    id: '2',
    name: 'Jogo de Cama Casal Premium',
    description: 'Jogo de cama 100% algodão, 4 peças',
    fullDescription: 'Elegante jogo de cama de casal confeccionado em 100% algodão premium. Inclui lençol de elástico, lençol de cobrir e 2 fronhas. Toque macio e durabilidade excepcional para noites de sono perfeitas.',
    price: 189.90,
    image: 'https://images.pexels.com/photos/1031693/pexels-photo-1031693.jpeg',
    category: 'Quarto'
  },
  {
    id: '3',
    name: 'Cafeteira Elétrica Premium',
    description: 'Cafeteira elétrica com timer programável',
    fullDescription: 'Cafeteira elétrica de alta performance com timer programável, mantém o café quente por até 2 horas. Capacidade para 12 xícaras, filtro permanente e sistema anti-gotejamento. Perfeita para começar o dia com energia.',
    price: 259.90,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg',
    category: 'Cozinha'
  },
  {
    id: '4',
    name: 'Conjunto de Toalhas de Banho',
    description: 'Kit com 4 toalhas 100% algodão',
    fullDescription: 'Conjunto premium de toalhas de banho em 100% algodão egípcio. Kit inclui 2 toalhas de banho grandes e 2 toalhas de rosto. Extremamente absorventes e macias, com durabilidade excepcional.',
    price: 159.90,
    image: 'https://images.pexels.com/photos/6899372/pexels-photo-6899372.jpeg',
    category: 'Banheiro'
  },
  {
    id: '5',
    name: 'Aparelho de Jantar 20 Peças',
    description: 'Conjunto completo de porcelana branca',
    fullDescription: 'Elegante aparelho de jantar em porcelana branca premium. Conjunto com 20 peças incluindo pratos rasos, fundos, sobremesa, xícaras e pires. Design atemporal perfeito para receber amigos e família.',
    price: 399.90,
    image: 'https://images.pexels.com/photos/6489663/pexels-photo-6489663.jpeg',
    category: 'Mesa'
  },
  {
    id: '6',
    name: 'Aspirador de Pó Vertical',
    description: 'Aspirador sem fio com bateria recarregável',
    fullDescription: 'Aspirador de pó vertical sem fio com tecnologia ciclônica. Bateria de longa duração, múltiplos acessórios inclusos e filtro HEPA. Leve e prático para limpeza diária da casa.',
    price: 449.90,
    image: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg',
    category: 'Limpeza'
  },
  {
    id: '7',
    name: 'Conjunto de Facas Profissionais',
    description: 'Kit com 6 facas em aço inoxidável',
    fullDescription: 'Conjunto profissional de facas em aço inoxidável alemão. Inclui 6 facas de diferentes tamanhos com lâminas ultra afiadas e cabos ergonômicos. Essencial para uma cozinha bem equipada.',
    price: 229.90,
    image: 'https://images.pexels.com/photos/4226878/pexels-photo-4226878.jpeg',
    category: 'Cozinha'
  },
  {
    id: '8',
    name: 'Liquidificador de Alta Potência',
    description: 'Liquidificador 1000W com copo de vidro',
    fullDescription: 'Liquidificador de alta potência com motor de 1000W e copo de vidro temperado. 12 velocidades diferentes, função pulsar e lâminas de aço inoxidável. Perfeito para vitaminas, sucos e receitas diversas.',
    price: 189.90,
    image: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg',
    category: 'Cozinha'
  },
  {
    id: '9',
    name: 'Espelho Decorativo para Quarto',
    description: 'Espelho redondo com moldura dourada',
    fullDescription: 'Elegante espelho decorativo redondo com moldura em dourado envelhecido. Diâmetro de 60cm, perfeito para decorar o quarto ou sala. Adiciona sofisticação e amplifica a luminosidade do ambiente.',
    price: 169.90,
    image: 'https://images.pexels.com/photos/6207511/pexels-photo-6207511.jpeg',
    category: 'Decoração'
  }
];

export const categories = ['Todos', 'Cozinha', 'Quarto', 'Banheiro', 'Mesa', 'Limpeza', 'Decoração'];