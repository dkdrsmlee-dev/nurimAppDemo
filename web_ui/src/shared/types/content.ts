import type { HomeTab, TermsState } from './app';

export interface OnboardingSlide {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
}

export interface TermItem {
  key: keyof TermsState;
  title: string;
  description: string;
}

export interface ActiveTerm {
  termsId: string;
  termsKey: string;
  termsNm: string;
  content: string;
  termsCategory: TermsCategory;
  requiredType: string;
  sortNo: number;
  status: string;
}

export interface TermAgreement {
  termsId: string;
  agreed: boolean;
}

export type TermsCategory = 'SIGNUP' | 'SECURITY' | 'MARKETING' | 'ETC';

export interface AddressResult {
  id: string;
  zipCode: string;
  road: string;
  jibun: string;
}

export interface EventCard {
  title: string;
  description: string;
}

export interface QuickTabItem {
  key: HomeTab;
  label: string;
}

export type TabDescriptionMap = Record<HomeTab, string>;
