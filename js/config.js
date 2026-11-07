/* Configuração do site: o que muda sem mexer no layout fica aqui. */
const SITE = {
  // Número do WhatsApp que recebe os pedidos: só dígitos, com 55 + DDD + número.
  // Exemplo: '5512999999999'. Com o número preenchido, o pedido montado no site
  // já chega escrito na conversa.
  whatsapp: '5512997366371',

  // Link do WhatsApp da bio do Instagram. Usado enquanto o número acima estiver vazio:
  // abre a conversa, e o site copia o pedido para o cliente colar.
  whatsappLink: 'https://wa.me/qr/OY36QUOWLXU2A1',

  // Mensagem dos botões "Chamar no WhatsApp" (sem pedido montado).
  whatsappMensagem: 'Olá! Vim pelo site da Dose de Açaí.',

  // Texto que abre a mensagem do pedido.
  pedidoAbertura: 'Olá! Quero fazer um pedido pelo site:',
  // Linhas finais, para o cliente completar.
  pedidoFechamento: [
    'Meu endereço:',
    'Dia e horário da entrega:',
    'Forma de pagamento (Pix, dinheiro ou cartão):',
  ],

  // Pedido mínimo para entrega, em geladões (somando todos os sabores).
  pedidoMinimo: 3,

  // Zonas de entrega e a taxa de cada uma, em reais. A ordem aqui é a ordem no site.
  // Os textos de taxa da página (balão "Como pedir" e rodapé) saem daqui também.
  zonas: [
    { nome: 'Zona Norte', taxa: 3 },
    { nome: 'Zona Central', taxa: 4 },
    { nome: 'Zona Sul', taxa: 5 },
    { nome: 'Zona Leste', taxa: 5 },
    { nome: 'Zona Oeste', taxa: 5 },
  ],

  // Pasta das fotos (cada sabor com foto usa NOME-720.jpg).
  pastaImagens: 'img/',
};
