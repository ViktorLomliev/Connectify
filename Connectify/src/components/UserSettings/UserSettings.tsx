import { useState, useEffect } from "react";
import {
  sendEmailVerification,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Flex,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { useLazyGetUserByIdQuery } from "../../api/databaseApi";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { database } from "../../config/firebaseConfig";

export const UserSetting: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] =
    useState<string>("");
  const [currentPasswordForPassword, setCurrentPasswordForPassword] =
    useState<string>("");

  const [photoURL, setPhotoURL] = useState<string>("");
  const auth = getAuth();

  const currUser = auth.currentUser;

  const [getUserById, { data: user }] = useLazyGetUserByIdQuery();

  const [newPassword, setNewPassword] = useState<string>("");
  const [updatingEmail, setUpdatingEmail] = useState<boolean>(false);
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (currUser?.uid) {
      getUserById(currUser.uid);
      const userRef = ref(database, `users/${currUser.uid}`);
      const unsubscribeDb = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setEmail(userData.email);
        }
      });
      return () => {
        unsubscribeDb();
      };
    }
  }, [currUser, getUserById]);

  useEffect(() => {
    const photoURLRef = ref(database, `users/${currUser?.uid}/photoURL`);
    const unsubscribe = onValue(photoURLRef, (snapshot) => {
      const newPhotoURL = snapshot.val();
      setPhotoURL(newPhotoURL);
    });

    return () => {
      unsubscribe();
    };
  }, [currUser]);

  const handleUpdateEmail = () => {
    const credential = EmailAuthProvider.credential(
      email,
      currentPasswordForEmail
    );

    setUpdatingEmail(true);

    if (currUser) {
      reauthenticateWithCredential(currUser, credential)
        .then(() => {
          updateEmail(currUser, newEmail)
            .then(() => {
              console.log("Email updated!");
              setEmail(newEmail);
              setNewEmail("");
              sendEmailVerification(currUser)
                .then(() => {
                  console.log("Email verification sent!");
                })
                .catch((error) => {
                  console.error(error);
                });
              setUpdatingEmail(false);
            })
            .catch((error) => {
              console.error(error);
              setUpdatingEmail(false);
            });
        })
        .catch((error) => {
          console.error(error);
          setUpdatingEmail(false);
        });
    }
  };

  const handleUpdatePassword = () => {
    setUpdatingPassword(true);
    if (currUser) {
      updatePassword(currUser, newPassword)
        .then(() => {
          console.log("Password updated!");
          setNewPassword("");
          setUpdatingPassword(false);
        })
        .catch((error) => {
          console.error(error);
          setUpdatingPassword(false);
        });
    }
  };
  const handleResetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Password reset email sent!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  };

  const textColor = useColorModeValue("#41525d", "black");
  const textColorInput = useColorModeValue("gray.500", "gray.500");
  return (
    <>
      {user ? (
        <Accordion allowToggle>
          <Flex direction="column" align="center" mt={8} mb={8}>
            <Avatar
              size="xl"
              name={`${user?.firstName} ${user?.lastName}`}
              src={photoURL}
            />
          </Flex>
          <AccordionItem>
            <VStack mt={10} mb={50} spacing={2} alignItems="flex-start">
              <Text fontSize="md" fontWeight="bold">
                Welcome,{user?.firstName} {user?.lastName}
              </Text>
              <Text fontSize={"sm"}> {user?.email}</Text>
            </VStack>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Update Email
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              <VStack spacing={4}>
                <FormControl id="newEmail">
                  <FormLabel>New Email</FormLabel>
                  <Input
                    color={textColorInput}
                    type="text"
                    placeholder="New email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl id="currentPasswordForEmail">
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    color={textColorInput}
                    type="password"
                    placeholder="Current password"
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  />
                </FormControl>
                <Button
                  isLoading={updatingEmail}
                  loadingText="Updating..."
                  variant="ghost"
                  onClick={handleUpdateEmail}
                >
                  Update Email
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Update Password
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              <VStack spacing={4}>
                <FormControl id="newPassword">
                  <FormLabel>New Password</FormLabel>
                  <Input
                    color={textColorInput}
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </FormControl>
                <FormControl id="currentPasswordForPassword">
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    color={textColorInput}
                    type="password"
                    placeholder="Current password"
                    value={currentPasswordForPassword}
                    onChange={(e) =>
                      setCurrentPasswordForPassword(e.target.value)
                    }
                  />
                </FormControl>
                <Button
                  isLoading={updatingPassword}
                  loadingText="Updating..."
                  onClick={handleUpdatePassword}
                  variant="ghost"
                >
                  Update Password
                </Button>
                <Button variant="ghost" onClick={handleResetPassword}>
                  Reset Password
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ) : (
        <Heading>Please sign in.</Heading>
      )}
    </>
  );
};
