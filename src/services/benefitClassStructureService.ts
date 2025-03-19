import { get, post, put, del } from './api';
import { BenefitClassStructure } from '../types/benefitClassStructure';

const BASE_URL = '/benefit-class-structures';

export const benefitClassStructureService = {
  getAll: () => get<BenefitClassStructure[]>(BASE_URL),

  getById: (id: string) => get<BenefitClassStructure>(`${BASE_URL}/${id}`),

  create: (data: Partial<BenefitClassStructure>) => post<BenefitClassStructure>(BASE_URL, data),

  update: (id: string, data: Partial<BenefitClassStructure>) =>
    put<BenefitClassStructure>(`${BASE_URL}/${id}`, data),

  delete: (id: string) => del<void>(`${BASE_URL}/${id}`),

  configure: (id: string, classConfig: any) =>
    put<BenefitClassStructure>(`${BASE_URL}/${id}/configure`, classConfig),
};
