
export interface RSVPFormData {
  nome: string;
  email: string;
  presenca: boolean;
  restricoesAlimentares: boolean;
  quaisRestricoes: string;
}

export enum FormStep {
  WELCOME = 'WELCOME',
  DETAILS = 'DETAILS',
  PRESENCE = 'PRESENCE',
  DIET = 'DIET',
  THANK_YOU = 'THANK_YOU'
}
