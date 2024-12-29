export enum ButtonHeight {
  SMALL = '36px',
  MEDIUM = '40px',
  LARGE = '48px',
}

export interface ButtonProps {
  title: string;
  onButtonClick: (e: React.FormEvent, id: string) => void;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  width?: string;
  height?: ButtonHeight;
  backgroundColor?: string;
  textColor?: string;
}