import React, { ChangeEvent, memo, useState } from "react";
import {
  MessageInputComponentStyle,
  MessageInputIconWrapper,
  StyledMessageInputInput,
} from "./style";
import { Theme } from "~/app/theme";
import { WorkSansRegular } from "~/app/ui-components/typing/fonts";
import SendIcon from "~/app/assets/icons/send-icon";
import { MessageInputProps } from "./model";

const MessageInputComponent: React.FC<MessageInputProps> = (props) => {
  const { placeholder, onMessageSent } = props;
  const [isActive, setIsActive] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const sendMessage = (message: string) => {
    onMessageSent(message);
    setText("");
  };

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target as HTMLInputElement;
    setText(inputValue.value);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target as HTMLInputElement;
    if (event.key === "Enter") {
      event.preventDefault();
      if (inputValue.value) {
        sendMessage(inputValue.value);
      }
      return;
    }
  };

  return (
    <MessageInputComponentStyle
      isActive={isActive}
      onClick={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <StyledMessageInputInput
        className={WorkSansRegular.className}
        placeholder={placeholder ?? "Message..."}
        onKeyDown={(event) => handleKeyDown(event)}
        onChange={(event) => handleInput(event)}
        value={text}
      />
      <MessageInputIconWrapper onClick={() => text && sendMessage(text)}>
        <SendIcon color={Theme.background.icons} />
      </MessageInputIconWrapper>
    </MessageInputComponentStyle>
  );
};

export default memo(MessageInputComponent);
