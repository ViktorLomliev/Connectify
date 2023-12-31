import { createApi} from "@reduxjs/toolkit/query/react";
import { get, ref, set, update } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Team, Channel } from "../types/interfaces";
export interface Chat {
  uid: string;
  participants: object;
  messages: object;
}

interface Reaction {
  uid: string;
  emoji: string;
  user: string;
}
export interface Message {
  uid: string;
  user: string;
  content: string;
  type?: "text" | "gif" | "image" | "audio";  
  replies?: { [key: string]: Message };
  reactions?: Reaction[];
  date?: string;
  fileName?: string;
}


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

export const baseApi = createApi({
  baseQuery: async ({ url, method, body }) => {
    switch (method) {
      case "get":
        const response = await get(ref(database, url));
        if (response.exists()) {
          return { data: response.val() };
        } else {
          return { data: {} };
        }
      case "update":
      case "set":
        await (method === "update" ? update : set)(ref(database, url), body);
        return { data: body };
      default:
        throw new Error("Invalid method");
    }
  },
  endpoints: () => ({}),
});

export const chatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<{ [key: string]: Chat }, void>({
      query: () => ({ url: "chats", method: "get" }),
    }),
    getChatById: builder.query<Chat, string>({
      query: (chatId) => ({ url: `chats/${chatId}`, method: "get" }),
    }),
    addMessageToChat: builder.mutation<
      Message,
      { chatId: string; message: Message }
    >({
      query: ({ chatId, message }) => ({
        url: `chats/${chatId}/messages/${message.uid}`,
        method: "update",
        body: message,
      }),
    }),
    addReplyToMessage: builder.mutation<
      void,
      { chatId: string; messageId: string; reply: Message }
    >({
      query: ({ chatId, messageId, reply }) => ({
        url: `chats/${chatId}/messages/${messageId}/replies/${reply.uid}`,
        method: "update",
        body: reply,
      }),
    }),
    addReactionToMessage: builder.mutation<
      void,
      {
        chatId: string;
        messageId: string;
        reaction: { uid: string; emoji: string; user: string };
      }
    >({
      query: ({ chatId, messageId, reaction }) => ({
        url: `chats/${chatId}/messages/${messageId}/reactions/${reaction.uid}`,
        method: "update",
        body: reaction,
      }),
    }),
    addReactionToReply: builder.mutation<
      void,
      {
        chatId: string;
        messageId: string;
        replyId: string;
        reaction: { uid: string; emoji: string; user: string };
      }
    >({
      query: ({ chatId, messageId, replyId, reaction }) => ({
        url: `chats/${chatId}/messages/${messageId}/replies/${replyId}/reactions/${reaction.uid}/user`,
        method: "update",
        body: reaction,
      }),
    }),
    removeReactionFromMessage: builder.mutation<
      void,
      { chatId: string; messageId: string; reactionId: string }
    >({
      query: ({ chatId, messageId, reactionId }) => ({
        url: `chats/${chatId}/messages/${messageId}/reactions/${reactionId}`,
        method: "set",
        body: null,
      }),
    }),
    removeMessageFromChat: builder.mutation<
      void,
      { chatId: string; messageId: string }
    >({
      query: ({ chatId, messageId }) => ({
        url: `chats/${chatId}/messages/${messageId}`,
        method: "set",
        body: null,
      }),
    }),
    updateMessageInChat: builder.mutation<
      Message,
      { chatId: string; messageId: string; newMessageContent: string }
    >({
      query: ({ chatId, messageId, newMessageContent }) => ({
        url: `chats/${chatId}/messages/${messageId}/content`,
        method: "set",
        body: newMessageContent,
      }),
    }),
  }),
})

export const teamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<{ [key: string]: Team }, void>({
      query: () => ({ url: 'teams', method: 'get' }),
    }),
    getTeamById: builder.query<Team, string>({
      query: (teamId) => ({ url: `teams/${teamId}`, method: 'get' }),
    }),
    getChannelById: builder.query<Channel, { teamId: string, channelId: string }>({
      query: ({ teamId, channelId }) => ({ url: `teams/${teamId}/channels/${channelId}`, method: 'get' }),
    }),
    getTeamCallStatus: builder.query<boolean, string>({
      query: (teamId) => ({ url: `teams/${teamId}/callStatus`, method: 'get' }),
    }),
    createTeam: builder.mutation<Team, Partial<Team>>({
      query: (newTeam) => ({
        url: `teams/${newTeam.uid}`,
        method: 'set',
        body: newTeam,
      }),
    }),
    addMessageToChannel: builder.mutation<Message, { teamId: string, channelId: string, message: Message }>({
      query: ({ teamId, channelId, message }) => ({
        url: `teams/${teamId}/channels/${channelId}/messages/${message.uid}`,
        method: 'update',
        body: message,
      }),
    }),
    getChannelMessages: builder.query<{ [key: string]: Message }, { teamId: string, channelId: string }>({
      query: ({ teamId, channelId }) => ({ url: `teams/${teamId}/channels/${channelId}/messages`, method: 'get' }),
    }),
    createChannel: builder.mutation<Channel, { teamId: string, channel: Channel }>({
      query: ({ teamId, channel }) => ({
        url: `teams/${teamId}/channels/${channel.uid}`,
        method: 'set',
        body: channel,
      }),
    }),
    addUserToTeam: builder.mutation<void, { teamId: string, userId: string }>({
      query: ({ teamId, userId }) => ({
        url: `teams/${teamId}/participants`,
        method: 'update',
        body: { [userId]: true },
      }),
    }),
    addReactionToTeamMessage: builder.mutation<void, { teamId: string; channelId: string; messageId: string;     reaction: { uid: string; emoji: string; user: string }; }>({
      query: ({ teamId, channelId, messageId, reaction }) => ({
        url: `teams/${teamId}/channels/${channelId}/messages/${messageId}/reactions/${reaction.uid}`,
        method: 'update',
        body: reaction,
      }),
    }),
    deleteTeamMember: builder.mutation<void, { userUid: string, teamId: string }>({
      query: ({ userUid, teamId }) => ({
        url: `teams/${teamId}/participants/${userUid}`,
        method: "set",
        body: null,
      }),
    }),
    addCallStatusToTeam: builder.mutation<void, { teamId: string; callStatus: boolean }>({
      query: ({ teamId, callStatus }) => ({
        url: `teams/${teamId}/${callStatus}`,
        method: 'set',
        body: callStatus,
      }),
    }),
    deleteTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `teams/${teamId}`,
        method: "set",
        body: null,
      }),
    }),
    deleteChannel: builder.mutation<void, { teamId: string, channelId: string }>({
      query: ({ teamId, channelId }) => ({
        url: `teams/${teamId}/channels/${channelId}`,
        method: "set",
        body: null,
      }),
    }),

  }),
});

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ [key: string]: User }, void>({
      query: () => ({ url: "users", method: "get" }),
    }),
    getUserById: builder.query<User, string>({
      query: (uid) => ({ url: `users/${uid}`, method: "get" }),
    }),
    getLatestChatsById: builder.query<object, string>({
      query: (uid) => ({ url: `users/${uid}/latestChats`, method: "get" }),
    }),
    getNotificationsById: builder.query<object, string>({
      query: (uid) => ({ url: `users/${uid}/notifications`, method: "get" }),
    }),
    getUserSearchByUsername: builder.query<User[], string>({
      query: (username) => ({
        url: "users",
        params: {
          orderBy: "username",
          equalTo: username,
        },
        method: "get",
      }),
    }),
    updateUserStatus: builder.mutation<void, { uid: string; status: string }>({
      query: ({ uid, status }) => ({
        url: `users/${uid}/status`,
        method: "set",
        body: status,
      }),
    }),
    updateUserLatestChats: builder.mutation<void, { userUid: string, chatUid: string, message: object }>({
      query: ({ userUid, chatUid, message }) => ({
        url: `users/${userUid}/latestChats/${chatUid}`,
        method: "set",
        body: message,
      }),
    }),
    updateUserNotifications: builder.mutation<void, { userUid: string, notificationUid: string, notification: object }>({
      query: ({ userUid, notificationUid, notification }) => ({
        url: `users/${userUid}/notifications/${notificationUid}`,
        method: "update",
        body: notification,
      }),
    }),
    updateNotificationSeenStatus: builder.mutation<void, { userUid: string, notificationUid: string, notification: object }>({
      query: ({ userUid, notificationUid, notification }) => ({
        url: `users/${userUid}/notifications/${notificationUid}`,
        method: "update",
        body: notification,
      }),
    }),
    updateNotificationShownStatus: builder.mutation<void, { userUid: string, notificationUid: string, notification: object }>({
      query: ({ userUid, notificationUid, notification }) => ({
        url: `users/${userUid}/notifications/${notificationUid}`,
        method: "update",
        body: notification,
      }),
    }),
    deleteUserNotifications: builder.mutation<void, { userUid: string }>({
      query: ({ userUid }) => ({
        url: `users/${userUid}/notifications`,
        method: "set",
        body: null,
      }),
    }),
  }),
});
export const {
  useAddMessageToChatMutation,
  useAddReplyToMessageMutation,
  useGetChatByIdQuery,
  useAddReactionToMessageMutation,
  useAddReactionToReplyMutation,
  useRemoveReactionFromMessageMutation,
  useRemoveMessageFromChatMutation,
  useUpdateMessageInChatMutation,
} = chatsApi;

export const {
  useGetTeamsQuery, useLazyGetTeamByIdQuery, useLazyGetChannelByIdQuery, useCreateTeamMutation, useAddMessageToChannelMutation, useGetChannelMessagesQuery, useCreateChannelMutation, useGetTeamByIdQuery, useAddUserToTeamMutation, useGetChannelByIdQuery, useAddReactionToTeamMessageMutation, useAddCallStatusToTeamMutation, useGetTeamCallStatusQuery,useLazyGetTeamCallStatusQuery ,useDeleteTeamMemberMutation, useDeleteChannelMutation, useDeleteTeamMutation
} = teamsApi;

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserSearchByUsernameQuery,
  useUpdateUserStatusMutation,
  useUpdateUserLatestChatsMutation,
  useGetLatestChatsByIdQuery,
  useUpdateUserNotificationsMutation,
  useGetNotificationsByIdQuery,
  useUpdateNotificationSeenStatusMutation,
  useDeleteUserNotificationsMutation,
  useUpdateNotificationShownStatusMutation
} = usersApi;