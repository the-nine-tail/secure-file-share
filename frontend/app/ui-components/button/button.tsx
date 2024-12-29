import React from "react";
import { ButtonStyle } from "./button.style";
import { ButtonProps } from "./button.model";
import { BodyPrimaryMedium } from "../typing";
import { Theme } from "~/app/theme";

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <ButtonStyle onClick={(e) => props.onButtonClick(e, props.id ?? "")}>
      <BodyPrimaryMedium color={props.textColor ?? Theme.text.white}>
        {props.title}
      </BodyPrimaryMedium>
    </ButtonStyle>
  );
};

export default React.memo(Button);
