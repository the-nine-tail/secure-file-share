/* eslint-disable @next/next/no-img-element */
import React from "react";
import { AvatarStyle } from "./style";
import { AvatarModel } from "./model";

const Avatar: React.FC<AvatarModel> = (props) => {
  const { size, variant, imageUrl, onClick } = props;
  return (
    <AvatarStyle size={size} variant={variant} onClick={onClick}>
      <img src={imageUrl} alt={"profile"} />
    </AvatarStyle>
  );
};

export default React.memo(Avatar);
