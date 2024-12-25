import React, { memo, useState } from "react";
import {
  SearchComponentStyle,
  SearchIconWrapper,
  StyledSearchInput,
} from "./style";
import ExploreIcon from "~/app/assets/icons/explore-icon.svg";
import { Theme } from "~/app/theme";
import { WorkSansRegular } from "~/app/ui-components/typing/fonts";

const SearchComponent: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const iconElement = (
    <SearchIconWrapper>
      <img
        src={ExploreIcon.src}
        color={Theme.background.icons}
        width={24}
        height={24}
      />
    </SearchIconWrapper>
  );
  return (
    <SearchComponentStyle
      isActive={isActive}
      onClick={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      {iconElement}
      <StyledSearchInput className={WorkSansRegular.className} />
    </SearchComponentStyle>
  );
};

export default memo(SearchComponent);
