'use client'

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShareModalProps, ShareModalFormData } from './types';
import {
  Overlay,
  ModalContainer,
  CloseButton,
  Title,
  Form,
  FormGroup,
  Label,
  Input,
  RadioGroup,
  RadioLabel,
  RadioInput,
  ButtonGroup,
  Button
} from './style';

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Share File"
}) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<ShareModalFormData>({
    newUserEmail: '',
    removeUserEmail: '',
    permissionType: 'view',
    expiryHours: 24
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      const portalRoot = document.getElementById('portal-root');
      if (isOpen) {
        portalRoot?.classList.add('active');
        portalRoot?.classList.remove('inactive');
        document.body.style.overflow = 'hidden';
      } else {
        portalRoot?.classList.add('inactive');
        portalRoot?.classList.remove('active');
        document.body.style.overflow = 'unset';
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mounted]);

  if (!isOpen) return null;

  const modalContent = (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <Title>{title}</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="newUserEmail">Add User Email</Label>
            <Input
              id="newUserEmail"
              name="newUserEmail"
              type="email"
              placeholder="Enter email to share with"
              value={formData.newUserEmail}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="removeUserEmail">Remove User Email</Label>
            <Input
              id="removeUserEmail"
              name="removeUserEmail"
              type="email"
              placeholder="Enter email to remove access"
              value={formData.removeUserEmail}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Permission Type</Label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="permissionType"
                  value="view"
                  checked={formData.permissionType === 'view'}
                  onChange={handleChange}
                />
                View Only
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="permissionType"
                  value="download"
                  checked={formData.permissionType === 'download'}
                  onChange={handleChange}
                />
                Download
              </RadioLabel>
            </RadioGroup>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="expiryHours">Expiry Time (hours)</Label>
            <Input
              id="expiryHours"
              name="expiryHours"
              type="number"
              min="1"
              max="720"
              value={formData.expiryHours}
              onChange={handleChange}
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Share
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </Overlay>
  );

  const portalRoot = document.getElementById('portal-root');
  return portalRoot ? createPortal(modalContent, portalRoot) : null;
};

export default ShareModal; 