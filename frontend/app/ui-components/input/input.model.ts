export enum InputSize {
  SMALL = '36px',
  MEDIUM = '40px',
  LARGE = '48px',
}

export enum InputType {
  TEXT = 'text',
  PASSWORD = 'password',
  EMAIL = 'email',
  NUMBER = 'number',
  FILE = 'file',
  DATE = 'date',
  TEL = 'tel',
  URL = 'url',
  SEARCH = 'search',
}

export interface InputProps {
  id?: string;
  name: string;
  type?: InputType;
  value?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  width?: string;
  height?: InputSize;
  maxLength?: number;
  min?: number;
  max?: number;
  accept?: string; // for file input
  multiple?: boolean; // for file input
  autoComplete?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
} 