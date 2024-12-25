import React, { SVGProps } from "react";

export type Icon = React.FC<
  SVGProps<SVGSVGElement> & {
    color?: string;
    width?: string | number;
    height?: string | number;
    backgroundColor?: string;
    onClick?: () => void;
  }
>;
