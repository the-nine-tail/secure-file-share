import { Icon } from "./iconsProps";

const CaretDownIcon: Icon = (props) => {
  const { height, width, color } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "32px"}
      height={height || "32px"}
      fill={color || "#000000"}
      viewBox="0 0 256 256"
    >
      <rect width="256" height="256" fill="none" />
      <polyline
        points="208 96 128 176 48 96"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
  );
};

export default CaretDownIcon;
