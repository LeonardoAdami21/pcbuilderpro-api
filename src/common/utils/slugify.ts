/**
 * Converte uma string em slug URL-friendly.
 * Ex: "Placa de Vídeo RTX 4090" → "placa-de-video-rtx-4090"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // espaços → hífens
    .replace(/-+/g, '-') // múltiplos hífens → um
    .replace(/^-|-$/g, ''); // remove hífens no início/fim
}
