// frontend/src/types/profile.types.ts

export enum TipoCadastro {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA'
}

export interface Profile {
  id: string;
  userId: string;
  tipo: TipoCadastro;
  slug: string;
  avatarUrl?: string;
  isCompleted: boolean;
  pessoaFisica?: PessoaFisica;
  pessoaJuridica?: PessoaJuridica;
  address?: Address;
}

export interface PessoaFisica {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string; // ISO format
  telefone?: string;
}

export interface PessoaJuridica {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  dataFundacao?: string; // ISO format
  porteEmpresa?: string;
  naturezaJuridica?: string;
  atividadePrincipal?: string;
  telefone?: string;
  nomeResponsavel: string;
  emailResponsavel: string;
}

export interface Address {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  erro?: boolean;
}

// ========== REQUEST TYPES ==========

export interface ChooseTypeRequest {
  tipo: TipoCadastro;
}

export interface CompletePessoaFisicaRequest {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string; // yyyy-MM-dd
  telefone?: string;
}

export interface CompletePessoaJuridicaRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  dataFundacao?: string; // yyyy-MM-dd
  porteEmpresa?: string;
  naturezaJuridica?: string;
  atividadePrincipal?: string;
  telefone?: string;
  nomeResponsavel: string;
  emailResponsavel: string;
}

export interface CompleteAddressRequest {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
}
