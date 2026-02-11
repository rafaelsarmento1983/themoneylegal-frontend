// frontend/src/services/profileService.ts

import api from './api';
import {
  Profile,
  ChooseTypeRequest,
  CompletePessoaFisicaRequest,
  CompletePessoaJuridicaRequest,
  CompleteAddressRequest,
  ViaCepResponse
} from '../types/profile.types';

import { brDateToIso } from '../lib/utils/utils';

/**
 * Escolher tipo de cadastro (PF ou PJ)
 */
export const chooseType = async (data: ChooseTypeRequest): Promise<Profile> => {
  const response = await api.post('/profile/choose-type', data);
  return response.data;
};

/**
 * Completar dados de Pessoa Física
 */

export const completePessoaFisica = async (
  data: CompletePessoaFisicaRequest
): Promise<Profile> => {

  const payload: CompletePessoaFisicaRequest = {
    ...data,
    dataNascimento: brDateToIso(data.dataNascimento)!,
  };

  const response = await api.post('/profile/pessoa-fisica', payload);
  return response.data;
};

/**
 * Completar dados de Pessoa Jurídica
 */



export const completePessoaJuridica = async (data: CompletePessoaJuridicaRequest) => {
  const payload = {
    ...data,
    dataFundacao: brDateToIso(data.dataFundacao),
    porteEmpresaId: data.porteEmpresa,
    naturezaJuridicaId: data.naturezaJuridica,
    atividadeItemId: data.atividadePrincipal,
  };

  // (opcional) remover os campos antigos pra não poluir
  delete (payload as any).porteEmpresa;
  delete (payload as any).naturezaJuridica;
  delete (payload as any).atividadePrincipal;

  const response = await api.post("/profile/pessoa-juridica", payload);
  return response.data;
};

/**
 * Completar endereço (finaliza cadastro)
 */
export const completeAddress = async (
  data: CompleteAddressRequest
): Promise<Profile> => {
  const response = await api.post('/profile/address', data);
  return response.data;
};

/**
 * Buscar perfil do usuário autenticado
 *
 * Observação:
 * - 404 é um estado esperado (perfil ainda não criado) no onboarding
 * - então evitamos "sujar" o console com erro nesse caso
 * - mas continuamos propagando o erro para o caller tratar
 */
export const getMyProfile = async (): Promise<Profile> => {
  try {
    const response = await api.get('/profile/me');
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    // 404 é esperado durante onboarding → não logar como erro
    if (status !== 404) {
      console.error('Erro ao buscar profile (/profile/me):', error);
    }

    throw error;
  }
};

/**
 * Consultar CEP via ViaCEP
 */
export const consultarCep = async (cep: string): Promise<ViaCepResponse> => {
  const response = await api.get(`/profile/cep/${cep}`);
  return response.data;
};

// ========== HELPER FUNCTIONS ==========

export const formatCpf = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCnpj = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

export const formatCep = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};
