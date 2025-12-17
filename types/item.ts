// src/types/item.ts
export type CategoriaItem = 'produto' | 'servico' | 'experiencia';

export type Item = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: CategoriaItem;
};
