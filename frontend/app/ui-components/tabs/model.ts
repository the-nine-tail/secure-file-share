export enum TabsVariantEnum {
  SMALL = '36px',
  MEDIUM = '40px',
  LARGE = '48px',
}

export interface TabItemModel {
  id: string;
  label: string;
}

export interface TabsProps {
  tabList: Array<TabItemModel>;
  onTabClick: (tab: TabItemModel) => void;
  variant: TabsVariantEnum;
  initialTabId?: string;
  width?: string;
  alignment?: 'left' | 'right' | 'center';
}
