import styled from "styled-components";
import { TabsVariantEnum } from "./model";
import { Theme } from "~/app/theme";

const getHeight = (variant: string) => {
  switch (variant) {
    case TabsVariantEnum.SMALL:
      return TabsVariantEnum.SMALL;
    case TabsVariantEnum.MEDIUM:
      return TabsVariantEnum.MEDIUM;
    case TabsVariantEnum.LARGE:
      return TabsVariantEnum.LARGE;
  }
};

export const TabsComponentStyle = styled.div<{
  variant: string;
  width?: string;
  alignment?: string;
}>`
  display: flex;
  height: ${(props) => getHeight(props.variant)};
  width: ${(props) => props.width ?? "100%"};
  background: ${Theme.background.primary};
  border-radius: 12px;
  border: 1.5px solid ${Theme.border.secondary};
  align-self: ${(props) => props.alignment ?? "flex-start"};
  cursor: pointer;
  padding: 4px;
`;

export const TabList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  gap: 4px;
`;

export const TabItem = styled.div<{ isActive: boolean }>`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: ${(props) =>
    props.isActive ? Theme.brand : Theme.background.primary};
  box-shadow: ${(props) =>
    props.isActive ? "0px 2px 0px rgba(18, 76, 203, 0.8)" : "none"};
  padding: 4px;
`;
