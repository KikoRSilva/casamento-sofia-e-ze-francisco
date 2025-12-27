
export interface RSVPFormData {
  nome: string;
  email: string;
  presenca: boolean;
  restricoesAlimentares: boolean;
  quaisRestricoes: string;
  honeypot?: string; // Hidden field for bot detection
}

export enum FormStep {
  WELCOME = 'WELCOME',
  DETAILS = 'DETAILS',
  PRESENCE = 'PRESENCE',
  DIET = 'DIET',
  THANK_YOU = 'THANK_YOU'
}
