export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShareModalFormData) => void;
  title?: string;
}

export interface ShareModalFormData {
  newUserEmail: string;
  removeUserEmail: string;
  permissionType: 'view' | 'download';
  expiryHours: number;
} 