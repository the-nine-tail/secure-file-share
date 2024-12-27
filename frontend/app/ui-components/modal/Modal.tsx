'use client'

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from './types';
import CheckIcon from '~/app/assets/icons/check-icon';
import CrossIcon from '~/app/assets/icons/cross-icon';
import {
  Overlay,
  ModalContainer,
  CloseButton,
  IconContainer,
  Title,
  Description,
  Content,
  LoadingSpinner
} from './style';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type,
  icon
}) => {
  const [mounted, setMounted] = useState(false);

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

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckIcon color="#FFFFFF" />;
      case 'fail':
        return <CrossIcon color="#FFFFFF" />;
      case 'loading':
        return <LoadingSpinner />;
      default:
        return null;
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <Overlay onClick={onClose}>
      <ModalContainer 
        type={type} 
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>✕</CloseButton>
        <Content>
          <IconContainer type={type}>
            {getIcon()}
          </IconContainer>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Content>
      </ModalContainer>
    </Overlay>
  );

  const portalRoot = document.getElementById('portal-root');
  return portalRoot ? createPortal(modalContent, portalRoot) : null;
};

export default Modal; 