// src/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // troca caracteres inválidos por -
    .replace(/^-+|-+$/g, '') // remove traços do início/fim
    .substring(0, 80); // limita tamanho (bom para SEO)
}
