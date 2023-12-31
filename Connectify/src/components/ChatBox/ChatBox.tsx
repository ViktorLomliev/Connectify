import {
  Box,
  VStack,
  useColorModeValue,
  Flex,
  Divider,
  HStack,
  Button,
  Spacer,
  Text,
  Avatar,
  AvatarBadge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { RootState } from "../../store";
import { getAuth } from "firebase/auth";
import {
  useGetUserByIdQuery,
  useAddCallStatusToTeamMutation,
  useLazyGetTeamCallStatusQuery,
  useGetChannelByIdQuery
} from "../../api/databaseApi";
import { useSubscription } from "../../Hooks/useSubscribtion";
import ChatMessages from "../ChatMessages/ChatMessages";
import ChatInput from "../ChatInput/ChatInput";
import CreateRoom from "../Video Call/CreateRoom";
import { FaUsers } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import MemberList from "../MemberList/MemberList";
import { ref, onValue } from "@firebase/database";
import { database } from "../../config/firebaseConfig";

import { FaVideo } from "react-icons/fa";

type ChatBoxProps = {
  chatType: "individual" | "team";
};

const ChatBox: React.FC<ChatBoxProps> = ({ chatType }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [activeChatUserStatus, setActiveChatUserStatus] = useState("");
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const auth = getAuth();
  const currUser = auth.currentUser;

  if (!currUser) {
    throw new Error("Current user is null");
  }
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserByIdQuery(currUser && currUser.uid);
  let activeChatUser = useSelector((state: RootState) => state.activeUser.user);
  const { teamId = "", channelId = "", chatUserId } = useParams();
  const { data: channel = {} as any } = useGetChannelByIdQuery({teamId: teamId, channelId: channelId});
  const [executeGetTeamCallStatusQuery, { data: isMeetingActive }] =
    useLazyGetTeamCallStatusQuery();
  const bg = useColorModeValue("gray.200", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addCallStatusToTeam] = useAddCallStatusToTeamMutation();
  const isChat = chatType === "individual" ? true : false;
  const isBot = chatUserId === "mimir" ? true : false;

  useEffect(() => {
    if (teamId) {
      executeGetTeamCallStatusQuery(teamId);
    }
  }, [teamId, executeGetTeamCallStatusQuery]);

  useEffect(() => {
    if (chatType === "individual" && showMembers) {
      setShowMembers(false);
    }
  }, [chatType, showMembers]);

  if (isChat === false) {
    activeChatUser = null;
  }

  useEffect(() => {
    if (activeChatUser?.uid) {
      const userStatusRef = ref(database, `users/${activeChatUser.uid}/status`);
      const unsubscribe = onValue(userStatusRef, (snapshot) => {
        const status = snapshot.val();
        if (status) {
          setActiveChatUserStatus(status);
          setIsStatusLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeChatUser?.uid]);

  const { chatData, activeChatId } = useSubscription({
    user,
    teamId,
    channelId,
    chatUserId,
    isChat,
  });

  if (isUserLoading) return <div>Loading...</div>;
  if (isUserError || !user) return <div>Error loading user</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "green.400";
      case "Offline":
        return "gray.500";
      case "Away":
        return "yellow.400";
      case "In a meeting":
        return "purple.300";
      case "Busy":
        return "red.600";
      default:
        return "blue.500";
    }
  };

  const handleVideoChatClick = () => {
    onOpen();
    if (isMeetingActive) {
      return;
    }

    if (teamId) {
      addCallStatusToTeam({ teamId, callStatus: true });
    }
  };

  return (
    <Flex height="100%" width="100%" borderWidth={1} bg={bg} boxShadow="xl">
      <VStack flex="1" padding={5}>
        <Flex width="100%">
          <Box fontSize="xl">
            <Box fontSize="xl" mr={3}>
              {isChat && activeChatUser && (
                <HStack>
                  <Avatar
                    size="sm"
                    name={`${activeChatUser.firstName} ${activeChatUser.lastName}`}
                    src={activeChatUser.photoURL}
                    marginRight="0.5rem"
                  >
                    {!isStatusLoading && (
                      <AvatarBadge
                        boxSize="1.25em"
                        bg={getStatusColor(activeChatUserStatus)}
                        border="2px"
                        borderColor="white"
                      />
                    )}
                  </Avatar>
                  <Text>
                    {activeChatUser.firstName + " " + activeChatUser.lastName}
                  </Text>
                </HStack>
              )}
            </Box>
          </Box>
          {isChat && !isBot && (
            <Flex direction="row" justify="flex-end">
              <Button leftIcon={<FaVideo />} onClick={handleVideoChatClick} />
              <Modal isOpen={isOpen} onClose={onClose} size="5xl">
                <ModalOverlay />
                <ModalContent>
                  {/* <ModalCloseButton /> */}
                  <ModalBody>
                    <CreateRoom onClose={onClose} />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Flex>
          )}
          {isChat || (
            <>
            <Text fontSize="2xl">#{channel?.name || 'Unknown Channel'}</Text>
              <Spacer />
              <Flex direction="row" alignItems="center">
                <Button leftIcon={<FaVideo />} onClick={handleVideoChatClick} />
                <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Create Room</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <CreateRoom onClose={onClose} />
                    </ModalBody>
                  </ModalContent>
                </Modal>
                <Button
                  onClick={() => setShowMembers(!showMembers)}
                  style={{ fontSize: "24px", marginLeft: "8px" }}
                >
                  <FaUsers />
                </Button>
              </Flex>
            </>
          )}
        </Flex>

        <Divider orientation="horizontal" color="black" />
        <ChatMessages
          chatData={chatData}
          userId={user.uid}
          activeChatUser={activeChatUser ? activeChatUser.uid : ""}
          activeChatId={activeChatId}
          activeChatUserStatus={activeChatUserStatus}
          getStatusColor={getStatusColor}
          isChat={isChat}
          teamId={teamId}
          channelId={channelId}
        />
        <ChatInput
          currUser={currUser ? currUser : null}
          user={user}
          chatUserId={chatUserId}
          activeChatUser={activeChatUser}
          isChat={isChat}
          teamId={teamId}
          channelId={channelId}
          isBot={isBot}
        />
      </VStack>
      {showMembers && (
        <VStack
          width="250px"
          padding={5}
          bg={bg}
          boxShadow="xl"
          borderLeftWidth={1}
        >
          <MemberList teamId={teamId} />
        </VStack>
      )}
    </Flex>
  );
};

export default ChatBox;
