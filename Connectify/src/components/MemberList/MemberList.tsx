import { Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, IconButton, Flex, Spacer } from "@chakra-ui/react";
import { CloseIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef } from 'react';
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useDeleteTeamMemberMutation, useLazyGetTeamByIdQuery } from "../../api/databaseApi";
import SingleUser from "../LeftList/SingleUser";
import { Text } from "@chakra-ui/react";
import { database } from "../../config/firebaseConfig";
import { DataSnapshot } from "firebase/database";

interface MemberListProps {
    teamId: string | undefined;
}

interface Members {
    [key: string]: boolean;
}

function MemberList({ teamId }: MemberListProps) {
    const [members, setMembers] = useState<Members>({});
    const [
        trigger, { data: team, isLoading: isTeamLoading, isError: isError }
    ] = useLazyGetTeamByIdQuery();

    const [deleteTeamMember] = useDeleteTeamMemberMutation();

    const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();
    const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement | null>(null);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    useEffect(() => {
        if (teamId) {
            trigger(teamId);
            const membersRef = ref(database, `teams/${teamId}/participants`);

            const handleValueChange = (snapshot: DataSnapshot) => {
                const membersObject: Members = snapshot.val() || {};
                setMembers(membersObject);
            };

            const unsubscribe = onValue(membersRef, handleValueChange);

            return () => {
                unsubscribe();
            };
        }
    }, [teamId, trigger]);

    const currUserUid = getAuth().currentUser?.uid;
    const isOwner = team?.owner === currUserUid;

    const handleRemoveClick = (userUid: string) => {
        setSelectedMember(userUid);
        onRemoveOpen();
    }

    const handleLeaveClick = () => {
        if (currUserUid) {
            setSelectedMember(currUserUid);
            onLeaveOpen();
        }
    };

    const handleRemoveConfirm = () => {
        if (selectedMember && teamId) {
            deleteTeamMember({ userUid: selectedMember, teamId: teamId });
            onRemoveClose();
        }
    }

    const handleLeaveConfirm = () => {
        if (selectedMember && teamId) {
            deleteTeamMember({ userUid: selectedMember, teamId: teamId });
            onLeaveClose();
        }
    }

    if (isTeamLoading) return <div>Loading...</div>;
    if (isError || !team) return <div>Error loading team</div>;

    return (
        <div>
            <Text mb={5}>{team.name} members:</Text>
            {members &&
                Object.entries(members).map(([userUid, isMember]) => {
                    if (isMember) {
                        return (
                            <Flex align="center">
                                <SingleUser userUid={userUid} />
                                <Spacer />
                                {isOwner && userUid !== currUserUid && <IconButton colorScheme="red" icon={<CloseIcon />} variant="ghost" onClick={() => handleRemoveClick(userUid)} aria-label="Remove member" />}
                                {userUid === currUserUid && <IconButton colorScheme="orange" icon={<ArrowBackIcon />} variant="ghost" onClick={handleLeaveClick} aria-label="Leave team" />}
                            </Flex>
                        );
                    }
                })
            }
            <AlertDialog
                isOpen={isRemoveOpen}
                leastDestructiveRef={cancelRef}
                onClose={onRemoveClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Remove Member
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onRemoveClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleRemoveConfirm} ml={3}>
                                Remove
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isLeaveOpen}
                leastDestructiveRef={cancelRef}
                onClose={onLeaveClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Leave Team
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to leave this team?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onLeaveClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="orange" onClick={handleLeaveConfirm} ml={3}>
                                Leave
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
}

export default MemberList;
