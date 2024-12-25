import React from "react";
import {
  InputContainer,
  InputLabel,
  InputWrapper,
  StyledInput,
  ErrorMessage,
} from "./input.style";
import { InputProps, InputType } from "./input.model";
import { Theme } from "~/app/theme";

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = InputType.TEXT,
  value,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  width,
  height,
  maxLength,
  min,
  max,
  accept,
  multiple,
  autoComplete,
  onChange,
  onBlur,
  onFocus,
}) => {
  return (
    <InputContainer width={width} disabled={disabled}>
      {label && (
        <InputLabel htmlFor={id || name}>
          {label}
          {required && <span style={{ color: Theme.text.error }}> *</span>}
        </InputLabel>
      )}
      <InputWrapper hasError={!!error}>
        <StyledInput
          id={id || name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          height={height}
          maxLength={maxLength}
          min={min}
          max={max}
          accept={accept}
          multiple={multiple}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          hasError={!!error}
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default React.memo(Input); 