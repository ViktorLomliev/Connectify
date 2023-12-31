import { Box, Flex, Stack } from "@chakra-ui/react";
import { Header } from "./HeaderMenu/HeaderMenu";
import SearchInput from "./Search/SearchInput";
import { useState } from "react";
import { SearchResults } from "./Search/SearchResults";
import TeamsList from "./TeamList/TeamList";
import ChannelList from "./ChannelList/ChannelList";
import LatestChatsList from "./LatestChatsList/LatestChatsList";
import { useColorModeValue } from "@chakra-ui/react";
import { Team, User } from "../types/interfaces";

export const LeftPanel: React.FC = () => {
  const [view, setView] = useState("chat");
  const [isUserListOpen, setUserListOpen] = useState(true);
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTeamListOpen, setTeamListOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleSearch = (data: User[]) => {
    setSearchResults(data);
    setIsSearching(!!data);
  };

  const handleViewChange = (newView: "default" | "chat" | "teams") => {
    setView(newView);
  };

  const handleChatClick = () => {
    setUserListOpen(true);
    setTeamListOpen(false);
    setSelectedTeam(null);
  };

  const handleTeamsClick = () => {
    setTeamListOpen(true);
    setUserListOpen(false);
    setSelectedTeam(null);
  };

  const colorMode = useColorModeValue("#EDF3F5", "#3C4256");

  return (
    <Flex direction="column" w={["100%", "100%", "30%"]}>
      <Box>
        <Header
          onViewChange={handleViewChange}
          onChatClick={handleChatClick}
          onTeamsClick={handleTeamsClick}
          setUserListOpen={setUserListOpen}
          setTeamListOpen={setTeamListOpen}
        />
        <SearchInput size="sm" onSearch={handleSearch} bg={""} />
      </Box>
      {isSearching ? (
        <SearchResults
          results={searchResults ? searchResults : []}
          searchQuery={""}
        />
      ) : (
          <Stack overflowY="auto" bg={colorMode}>
          {view === "chat" && isUserListOpen && (
            <LatestChatsList />
          )}
          {view === "teams" && isTeamListOpen && (
            <Flex
              direction="row"
              w="100%"
                bg={colorMode}
            >
              <TeamsList
                setSelectedTeam={setSelectedTeam}
                selectedTeam={selectedTeam}
              />
              {selectedTeam && <ChannelList team={selectedTeam} />}
            </Flex>
          )}
        </Stack>
      )}
    </Flex>
  );
};

export default LeftPanel;
