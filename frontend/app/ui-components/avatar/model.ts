export enum AvatarSize {
  SMALL = 32,
  MEDIUM = 42,
  LARGE = 56,
}

export enum AvatarVariant {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE'
}

export interface AvatarModel {
  size: AvatarSize;
  imageUrl: string;
  variant: AvatarVariant;
  onClick: () => void;
}