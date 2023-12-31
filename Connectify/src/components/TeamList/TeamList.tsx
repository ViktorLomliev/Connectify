import { useEffect, useState } from "react";
import { Box, Button, useDisclosure, useColorModeValue, Text, VStack } from "@chakra-ui/react";
import { useGetUserByIdQuery } from "../../api/databaseApi";
import { getAuth } from "firebase/auth";
import SingleTeam from "../SingleTeam/SingleTeam";
import CreateTeamModal from "../CreateTeamModal/CreateTeamModal";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebaseConfig";
import { DataSnapshot } from "firebase/database";
import { Team } from "../../types/interfaces";

type Props = {
  setSelectedTeam: (team: Team) => void;
  selectedTeam: Team | null;
};

const TeamsList = ({ setSelectedTeam, selectedTeam }: Props) => {
  const currUser = getAuth().currentUser;
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserByIdQuery(currUser?.uid || "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [teamsData, setTeamsData] = useState<Team[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const teamsRef = ref(database, "teams/");

    const handleValueChange = (snapshot: DataSnapshot) => {
      setTeamsData(snapshot.val());
    };

    const unsubscribe = onValue(teamsRef, handleValueChange);

    return () => {
      unsubscribe();
    };
  }, []);

  if (isUserLoading) {
    return <Box>Loading...</Box>;
  }

  if (isUserError) {
    return <Box>Error loading teams</Box>;
  }

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
  };

  return (
    <Box
      bg={bgColor}
      h="82.5vh"
      p={4}
      shadow="md"
      borderRight="1px"
      borderColor={borderColor}
      overflowY="auto"
    >
      {
        user &&
          teamsData &&
          Object.values(teamsData).length > 0 ?
          Object.values(teamsData).map((team: Team) => {
            const isInTeam = user.uid in team.participants;
            return (
              isInTeam &&
              user && (
                <SingleTeam
                  key={team.uid}
                  team={team}
                  onTeamClick={handleTeamClick}
                  isSelected={selectedTeam === team}
                  userId={user.uid}
                />
              )
            );
          }) :
          <VStack spacing={4} align="center">
            <Text>No teams found.</Text>
            <Text>Click on the "+" button to create a new team.</Text>
          </VStack>
      }
      <Button
        size="lg"
        colorScheme="teal"
        onClick={onOpen}
        mt={3}
        w="100%"
        variant="outline"
        _hover={{
          bg: "#4960d9",
          color: "white"
        }}
      >
        +
      </Button>
      <CreateTeamModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default TeamsList;
