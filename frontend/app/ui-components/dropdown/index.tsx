import React, { useEffect, useRef, useState } from "react";
import useOutsideClick from "~/app/hooks/useOutsideClick";
import {
  DropdownContainerStyle,
  DropdownImageStyle,
  DropdownItemStyle,
  DropdownListStyle,
  DropdownMenuStyle,
} from "./style";
import DropdownButtonDefault from "./dropdown-buttons/default";
import { DropdownItem, DropdownProps } from "./model";
import { BodyPrimaryRegular } from "../typing";
import DropdownButtonIcon from "./dropdown-buttons/dropdownIconButton";

const Dropdown = ({
  title = "Select",
  data,
  buttonType = "DEFAULT",
  position = "bottom-left",
  hasImage,
  selectedId,
  onSelect,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(
    selectedId ? data?.find((item) => item.value === selectedId) : undefined
  );

  const handleChange = (item: DropdownItem) => {
    setSelectedItem(item);
    onSelect && onSelect(item.value);
    setIsOpen(false);
  };

  useEffect(() => {
    if (selectedId && data) {
      const newSelectedItem = data.find((item) => item.value === selectedId);
      newSelectedItem && setSelectedItem(newSelectedItem);
    } else {
      setSelectedItem(undefined);
    }
  }, [selectedId, data]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  return (
    <DropdownContainerStyle ref={dropdownRef}>
      {buttonType === "DEFAULT" && (
        <DropdownButtonDefault
          isOpen={isOpen}
          onClick={(newState: boolean) => setIsOpen(newState)}
          label={selectedItem?.label || title}
        />
      )}
      {buttonType === "ICON" && (
        <DropdownButtonIcon
          isOpen={isOpen}
          onClick={(newState: boolean) => setIsOpen(newState)}
        />
      )}
      {isOpen && (
        <DropdownMenuStyle position={position}>
          <DropdownListStyle role="menu" aria-orientation="vertical">
            {data?.map((item) => (
              <DropdownItemStyle
                key={item.value}
                onClick={() => handleChange(item)}
                selected={selectedItem?.value === item.value}
              >
                {hasImage && (
                  <DropdownImageStyle
                    src={item.imageUrl}
                    alt="image"
                    loading="lazy"
                  />
                )}
                <BodyPrimaryRegular>{item.label}</BodyPrimaryRegular>
              </DropdownItemStyle>
            ))}
          </DropdownListStyle>
        </DropdownMenuStyle>
      )}
    </DropdownContainerStyle>
  );
};

export default React.memo(Dropdown);
