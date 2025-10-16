/**
 * Image View Models - Camada de apresentação em português
 */

import { z } from 'zod';
import { ImageType, ImageStatus, ImageFormat } from '../interfaces/image.interface';

// ==============================================
// VERSÕES EM PORTUGUÊS PARA APRESENTAÇÃO
// ==============================================

// Tipos de Imagem em Português
export enum ImageTypePortuguese {
  AVATAR_USUARIO = 'AVATAR_USUARIO',
  IMAGEM_PRODUTO = 'IMAGEM_PRODUTO',
  ANEXO_PRODUTO = 'ANEXO_PRODUTO',
  LOGO_EMPRESA = 'LOGO_EMPRESA',
  LOGO_MARCA = 'LOGO_MARCA',
  IMAGEM_CATEGORIA = 'IMAGEM_CATEGORIA',
  IMAGEM_VEICULO = 'IMAGEM_VEICULO'
}

export enum ImageStatusPortuguese {
  ENVIANDO = 'ENVIANDO',
  PROCESSANDO = 'PROCESSANDO',
  PRONTO = 'PRONTO',
  FALHOU = 'FALHOU',
  EXCLUIDO = 'EXCLUIDO'
}

export enum ImageFormatPortuguese {
  JPEG = 'JPEG',
  PNG = 'PNG',
  WEBP = 'WEBP',
  GIF = 'GIF',
  SVG = 'SVG',
  BMP = 'BMP'
}

// Metadados de Imagem em Português
export const ImageMetadataPortugueseSchema = z.object({
  nomeOriginal: z.string(),
  tipoMime: z.string(),
  tamanho: z.number(), // em bytes
  largura: z.number().optional(),
  altura: z.number().optional(),
  formato: z.nativeEnum(ImageFormatPortuguese),
  qualidade: z.number().optional(),
  compressao: z.number().optional(),
  checksum: z.string(),
  dadosExif: z.record(z.any()).optional(),
});

export type ImageMetadataPortuguese = z.infer<typeof ImageMetadataPortugueseSchema>;

// Variante de Imagem em Português
export const ImageVariantPortugueseSchema = z.object({
  url: z.string().url(),
  largura: z.number(),
  altura: z.number(),
  tamanho: z.number(),
  formato: z.nativeEnum(ImageFormatPortuguese),
  qualidade: z.number(),
});

export type ImageVariantPortuguese = z.infer<typeof ImageVariantPortugueseSchema>;

// Variantes de Imagem em Português
export const ImageVariantsPortugueseSchema = z.object({
  original: ImageVariantPortugueseSchema,
  miniatura: ImageVariantPortugueseSchema.optional(),
  pequena: ImageVariantPortugueseSchema.optional(),
  media: ImageVariantPortugueseSchema.optional(),
  grande: ImageVariantPortugueseSchema.optional(),
  extraGrande: ImageVariantPortugueseSchema.optional(),
});

export type ImageVariantsPortuguese = z.infer<typeof ImageVariantsPortugueseSchema>;

// Informações de Imagem em Português
export const ImageInfoPortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  tipo: z.nativeEnum(ImageTypePortuguese),
  status: z.nativeEnum(ImageStatusPortuguese),
  idEmpresa: z.string().uuid(),
  
  // Relacionamento com entidade
  idEntidade: z.string().uuid(),
  tipoEntidade: z.string(),
  
  // Metadados da imagem
  metadados: ImageMetadataPortugueseSchema,
  variantes: ImageVariantsPortugueseSchema,
  
  // Informações adicionais
  tags: z.array(z.string()),
  publica: z.boolean(),
  enviadoPor: z.string().uuid(),
  
  // Informações de processamento
  idTrabalhoProcessamento: z.string().optional(),
  mensagemErro: z.string().optional(),
  
  // Timestamps
  enviadoEm: z.date(),
  processadoEm: z.date().optional(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});

export type ImageInfoPortuguese = z.infer<typeof ImageInfoPortugueseSchema>;

// Resposta de Upload de Imagem em Português
export const ImageUploadResponsePortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variantes: ImageVariantsPortugueseSchema,
  metadados: ImageMetadataPortugueseSchema,
  status: z.nativeEnum(ImageStatusPortuguese),
  idTrabalhoProcessamento: z.string().optional(),
  enviadoEm: z.date(),
});

export type ImageUploadResponsePortuguese = z.infer<typeof ImageUploadResponsePortugueseSchema>;

// Status de Processamento de Imagem em Português
export const ImageProcessingStatusPortugueseSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ImageStatusPortuguese),
  progresso: z.number().min(0).max(100),
  variantes: z.array(z.string()),
  mensagemErro: z.string().optional(),
  iniciadoEm: z.date().optional(),
  concluidoEm: z.date().optional(),
});

export type ImageProcessingStatusPortuguese = z.infer<typeof ImageProcessingStatusPortugueseSchema>;

// Avatar de Usuário em Português
export const UserAvatarPortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variantes: z.object({
    miniatura: z.string().url().optional(),
    pequena: z.string().url().optional(),
    media: z.string().url().optional(),
  }),
  metadados: z.object({
    largura: z.number().optional(),
    altura: z.number().optional(),
    tamanho: z.number(),
    formato: z.nativeEnum(ImageFormatPortuguese),
  }),
  enviadoEm: z.date(),
});

export type UserAvatarPortuguese = z.infer<typeof UserAvatarPortugueseSchema>;

// Imagem de Produto em Português
export const ProductImagePortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  textoAlternativo: z.string().optional(),
  principal: z.boolean(),
  ordem: z.number(),
  tipo: z.enum(['PRINCIPAL', 'DETALHE', 'MINIATURA', 'GALERIA']),
  variantes: z.object({
    miniatura: z.string().url().optional(),
    pequena: z.string().url().optional(),
    media: z.string().url().optional(),
    grande: z.string().url().optional(),
  }),
  metadados: z.object({
    largura: z.number().optional(),
    altura: z.number().optional(),
    tamanho: z.number(),
    formato: z.string(),
  }),
});

export type ProductImagePortuguese = z.infer<typeof ProductImagePortugueseSchema>;

// Logo de Empresa em Português
export const CompanyLogoPortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variantes: z.object({
    miniatura: z.string().url().optional(),
    pequena: z.string().url().optional(),
    media: z.string().url().optional(),
    grande: z.string().url().optional(),
  }),
  metadados: z.object({
    largura: z.number().optional(),
    altura: z.number().optional(),
    tamanho: z.number(),
    formato: z.nativeEnum(ImageFormatPortuguese),
  }),
  enviadoEm: z.date(),
});

export type CompanyLogoPortuguese = z.infer<typeof CompanyLogoPortugueseSchema>;

// Logo de Marca em Português
export const BrandLogoPortugueseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variantes: z.object({
    miniatura: z.string().url().optional(),
    pequena: z.string().url().optional(),
    media: z.string().url().optional(),
  }),
  metadados: z.object({
    largura: z.number().optional(),
    altura: z.number().optional(),
    tamanho: z.number(),
    formato: z.nativeEnum(ImageFormatPortuguese),
  }),
  enviadoEm: z.date(),
});

export type BrandLogoPortuguese = z.infer<typeof BrandLogoPortugueseSchema>;

// Estatísticas de Imagem em Português
export const ImageStatisticsPortugueseSchema = z.object({
  totalImagens: z.number(),
  porTipo: z.record(z.number()),
  porStatus: z.record(z.number()),
  porFormato: z.record(z.number()),
  tamanhoTotal: z.number(),
  tamanhoMedio: z.number(),
  imagensPublicas: z.number(),
  imagensPrivadas: z.number(),
  trabalhosProcessamento: z.object({
    pendentes: z.number(),
    processando: z.number(),
    concluidos: z.number(),
    falharam: z.number(),
  }),
});

export type ImageStatisticsPortuguese = z.infer<typeof ImageStatisticsPortugueseSchema>;

// Resposta de Busca de Imagem em Português
export const ImageSearchResponsePortugueseSchema = z.object({
  imagens: z.array(ImageInfoPortugueseSchema),
  paginacao: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    totalPaginas: z.number(),
    temProxima: z.boolean(),
    temAnterior: z.boolean(),
  }),
});

export type ImageSearchResponsePortuguese = z.infer<typeof ImageSearchResponsePortugueseSchema>;

// Configuração de Redimensionamento em Português
export const ImageResizeConfigPortugueseSchema = z.object({
  largura: z.number(),
  altura: z.number(),
  qualidade: z.number(),
  formato: z.nativeEnum(ImageFormatPortuguese),
  manterProporcao: z.boolean(),
  cortarParaAjustar: z.boolean(),
  marcaDagua: z.object({
    texto: z.string().optional(),
    imagem: z.string().optional(),
    posicao: z.enum(['SUPERIOR_ESQUERDA', 'SUPERIOR_DIREITA', 'INFERIOR_ESQUERDA', 'INFERIOR_DIREITA', 'CENTRO']),
    opacidade: z.number(),
  }).optional(),
});

export type ImageResizeConfigPortuguese = z.infer<typeof ImageResizeConfigPortugueseSchema>;

// Regras de Validação de Imagem em Português
export const ImageValidationRulesPortugueseSchema = z.object({
  tamanhoMaximoArquivo: z.number(), // em bytes
  formatosPermitidos: z.array(z.nativeEnum(ImageFormatPortuguese)),
  larguraMaxima: z.number().optional(),
  alturaMaxima: z.number().optional(),
  larguraMinima: z.number().optional(),
  alturaMinima: z.number().optional(),
  proporcao: z.object({
    minima: z.number(),
    maxima: z.number(),
  }).optional(),
});

export type ImageValidationRulesPortuguese = z.infer<typeof ImageValidationRulesPortugueseSchema>;





