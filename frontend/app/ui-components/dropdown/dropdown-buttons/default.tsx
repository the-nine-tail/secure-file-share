import React from "react";
import styled from "styled-components";
import CaretDownIcon from "~/app/assets/icons/caret-down-icon";
import { DropdownButtonProps, dropdownHeight } from "../model";
import { Theme } from "~/app/theme";
import { BodyPrimaryRegular } from "../../typing";

export const DropdownButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  width: 160px;
  height: ${dropdownHeight.MEDIUM};
  padding: 8px 12px;
  background-color: ${Theme.background.primary};
  color: ${Theme.text.tertiary};
  border-radius: 8px;
  border: 1px solid
    ${(props) => (props.isOpen ? Theme.brand : Theme.border.secondary)};
  box-shadow: ${(props) =>
    props.isOpen ? "0 0 0 3px " + Theme.brandLight : "none"};
  cursor: pointer;
`;

const DropdownButtonDefault: React.FC<DropdownButtonProps> = (props) => {
  const { isOpen, onClick, label } = props;
  return (
    <DropdownButton
      aria-label="Toggle dropdown"
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button"
      onClick={() => onClick(!isOpen)}
      isOpen={isOpen}
    >
      <BodyPrimaryRegular
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </BodyPrimaryRegular>
      <CaretDownIcon width={18} height={18} color={Theme.text.tertiary} />
    </DropdownButton>
  );
};

export default DropdownButtonDefault;
