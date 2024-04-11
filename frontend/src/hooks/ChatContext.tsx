// Libraries
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
// Models
import { Chat, Message } from "../models/Chat";
// API
import { api, AxiosError } from "../api";
// Libraries
import io from "socket.io-client";
import { Socket } from "socket.io-client";
// Hooks
import { useUser } from "./UserContext";
import { useApiErrorHandler } from "./useApiErrorHandler";

// Socket
export const socket = io("http://localhost:8080", {
  transports: ["websocket"],
});

// Setup for deployment
// export const socket = io();

socket.on("connect", () => {
  // console.log("Connected to socket server");
});

// Chat context
interface ChatContextType {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  socket: Socket;
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  // showChatItem: boolean;
  // setShowChatItem: (value: boolean) => void;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChats = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatProvider");
  }
  return context;
};

// Chat provider
interface Props {
  children: ReactNode;
}
export const ChatProvider = ({ children }: Props) => {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const { handleApiError } = useApiErrorHandler();
  const [showChat, setShowChat] = useState<boolean>(false);
  // const [showChatItem, setShowChatItem] = useState<boolean>(false);
  // Fetch chats for the
  useEffect(() => {
    const getRecentChats = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/chats`);
        setChats(response.data);
        // Join chat rooms to receive messages
        response.data.forEach((chat: Chat) => {
          socket.emit("join_room", chat.id);
        });
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    };
    getRecentChats();

    socket.on("refresh_user_list", getRecentChats);
    return () => {
      socket.off("refresh_user_list");
    };
  }, [user]);

  // Listen for new messages to update the last message of a chat
  useEffect(() => {
    const receiveMessage = (message: Message) => {
      const updatedChats = chats.map((chat) => {
        if (chat.id === message.chatId) {
          return {
            ...chat,
            lastMessage: message,
          };
        }
        return chat;
      });

      setChats(updatedChats);
    };
    socket.on("receive_message", receiveMessage);

    return () => {
      socket.off("receive_message", receiveMessage);
    };
  }, [chats, setChats, socket]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        socket,
        showChat,
        setShowChat,
        // showChatItem,
        // setShowChatItem,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
