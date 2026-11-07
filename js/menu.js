/*
  Sabores e preços. Para trocar o cardápio, edite só este arquivo.
  (É .js e não .json de propósito: assim o site funciona até aberto direto do computador.)

  Campos de cada sabor:
    id      (obrigatório) sem espaço nem acento, único. Ex.: 'leite-ninho'
    nome    (obrigatório) como aparece no site e na mensagem do pedido
    preco   (obrigatório) número, com ponto nos centavos. Ex.: 6 ou 6.5
    arte    (opcional) desenho do card enquanto não houver foto:
            'mesclado' (roxo com branco), 'creme' (creme com roxo),
            'confete' (roxo com confeitos), 'chocolate' (marrom)
    imagem  (opcional) nome-base da foto em img/ (sem -720.jpg). Com foto, o desenho sai.
    alt     (obrigatório quando houver imagem) descrição da foto

  Quatro sabores formam uma linha completa no computador e duas linhas de dois no celular.
*/
const SABORES = [
  { id: 'leite-condensado', nome: 'Leite Condensado', preco: 6, arte: 'mesclado' },
  { id: 'leite-ninho', nome: 'Leite Ninho', preco: 6, arte: 'creme' },
  { id: 'confete', nome: 'Confete', preco: 6, arte: 'confete' },
  { id: 'nutella', nome: 'Nutella', preco: 7, arte: 'chocolate' },
];
