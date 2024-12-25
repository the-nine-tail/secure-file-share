export interface DropdownItem {
  label: string;
  value: string;
  imageUrl?: string;
}

export interface DropdownProps {
  title?: string;
  data: Array<DropdownItem>;
  buttonType?: 'DEFAULT' | 'ICON';
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  hasImage?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export interface DropdownButtonProps {
  isOpen: boolean;
  onClick: (newState: boolean) => void;
  label?: string;
}

export enum dropdownHeight {
  SMALL = '36px',
  MEDIUM = '40px',
  LARGE = '48px',
}