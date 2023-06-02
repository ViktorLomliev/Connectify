import { useState } from "react";
import { Input, Button, HStack, useToast, Icon } from "@chakra-ui/react";
import { useAddMessageToChatMutation, useAddMessageToChannelMutation, User } from "../../api/databaseApi";
import Emojis from "../ChatBox/Emojis/Emojis";
import useVoiceMessages from "../../Hooks/useVoiceMessages";
import { FaMicrophone } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import GiphyDropdown from "../Gifs/Gifs";
import { useHandleSend } from "../../Hooks/useHandleSend";
interface ChatInputProps {
  currUser: object,
  user: User,
  chatUserId: string,
  activeChatUser: User,
  isChat: boolean,
  teamId: string,
  channelId: string,
  isBot: boolean,
}

const ChatInput: React.FC<ChatInputProps> = ({ currUser, user, chatUserId, activeChatUser, isChat, teamId, channelId, isBot }) => {
  const [message, setMessage] = useState<string>("");
  const [emojiPickerState, SetEmojiPickerState] = useState<boolean>(false);
  const [messagesForAI, setMessagesForAI] = useState<Array<{ role: string, content: string }>>([{ "role": "system", "content": "You are Mimir, a wise being from Norse mythology. You're known for your wisdom, knowledge, and eloquence. Speak as such." }]);
  const [addMessageToChat] = useAddMessageToChatMutation();
  const [addMessageToChannel] = useAddMessageToChannelMutation();
  const toast = useToast();


  const { recording, handleStart, handleSendAudio } = useVoiceMessages(
    currUser,
    user,
    chatUserId,
    isChat,
    teamId,
    channelId,
    addMessageToChat,
    addMessageToChannel,
    toast
  );

  const handleGifSelect = (gifUrl) => {
    setMessage(gifUrl);
  };

  const handleSend = useHandleSend({
    currUser, 
    user, 
    chatUserId, 
    activeChatUser, 
    isChat, 
    teamId, 
    channelId, 
    isBot, 
    message,
    messagesForAI,
    setMessagesForAI,
    setMessage,
    addMessageToChat,
    addMessageToChannel
  });


  return (
    <HStack width="100%" spacing={4}>
      {!recording ? (
        <>
          <Emojis
            message={message}
            setMessage={setMessage}
            emojiPickerState={emojiPickerState}
            setEmojiPickerState={SetEmojiPickerState}
          />
          <GiphyDropdown onGifSelect={handleGifSelect} />
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            flexGrow={1}
          />
          <Button
            onClick={handleSend}
            colorScheme="teal"
          >
            <Icon
              as={BsFillSendFill}
              boxSize={6}
              style={{ fontSize: "24px" }}
            />
          </Button>
        </>
      ) : (
        <>
          <Emojis
            message={message}
            setMessage={setMessage}
            emojiPickerState={emojiPickerState}
            setEmojiPickerState={SetEmojiPickerState}
          />
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            flexGrow={1}
          />
          <Button onClick={handleSendAudio} colorScheme="blue">
            Send Recording
          </Button>
        </>
      )}
      <Button onClick={handleStart} colorScheme="teal">
        <Icon as={FaMicrophone} boxSize={6} style={{ fontSize: "24px" }} />
      </Button>
    </HStack>
  );
};

export default ChatInput;
