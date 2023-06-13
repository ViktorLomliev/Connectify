export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  photoURL: string;
  status: string;
  latestChats:object;
  events: object;
  notifications: object;
}
export interface SearchInputProps {
  size: "sm" | "md" | "lg";
  onSearch: (data: any) => any;
  bg: string;
}
export interface LandingPageProps {
  welcomeText: string;
  detailsText: string;
}

export interface SignUpData extends User {
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ForgotPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotPass: () => void;
  onSuccess: () => void;
}

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onForgotPass?: () => void;
}

export interface UserListProps {
  setUserListOpen: (isOpen: boolean) => void;
}

export interface Event {
  start: string;
  end: string;
  title: string;
  id: string | null;
  users: string[];
}

export interface LandingHeaderProps {
  welcomeText: string;
}

 export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  formComponent: string;
  setFormComponent: (formComponent: string) => void;
  welcomeText: string;
}

 export interface ActiveUsersProps {
  welcomeText: string;
}
export interface LayoutProps {
  children?: React.ReactNode;
}


export interface RightPanelProps {
  children: React.ReactNode;
}

export interface ModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface HeaderProps {
  onViewChange: (newView: "default" | "chat" | "teams") => void;
  onChatClick: () => void;
  onTeamsClick: () => void;
  setUserListOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTeamListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  setEventTitle: (title: string) => void;
  selectedRange: { start: string; end: string };
  handleSelect?: ({ start, end }: { start: Date; end: Date}) => void;
  user: User
}

export interface EventUserSearchProps {
  results: User[];
  searchQuery: string;
  onSelectUser: (user: User) => void;
}

export interface EventUserDisplayProps {
  selectedUsers: User[];
  handleRemoveUser: (uid: string) => void;
}