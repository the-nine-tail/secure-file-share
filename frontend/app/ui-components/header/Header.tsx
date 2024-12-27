import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '~/app/context/AuthContext';
import { 
  HeaderContainer, 
  BrandSection, 
  ActionsSection,
  UploadFileInput,
  UploadFileLabel,
  LogoutButton,
  BrandName
} from './style';

interface HeaderProps {
  brandName: string;
  onFileSelect: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ brandName, onFileSelect }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/authentication/login');
  };

  return (
    <HeaderContainer>
      <BrandSection>
        <BrandName>{brandName}</BrandName>
      </BrandSection>
      <ActionsSection>
        <UploadFileLabel>
          Upload File
          <UploadFileInput
            type="file"
            onChange={handleFileChange}
            accept="*/*"
          />
        </UploadFileLabel>
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </ActionsSection>
    </HeaderContainer>
  );
};

export default Header; 