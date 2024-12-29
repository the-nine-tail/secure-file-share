export type ModalType = 'fail' | 'success' | 'loading';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: ModalType;
  icon?: React.ReactNode;
} 