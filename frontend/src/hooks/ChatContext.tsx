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
  showChatItem: boolean;
  setShowChatItem: (value: boolean) => void;
  sortChats: (chats: Chat[]) => Chat[];
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
  const [showChatItem, setShowChatItem] = useState<boolean>(false);

  // Fetch chats for the user
  useEffect(() => {
    const getRecentChats = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/chats`);

        // Join chat rooms to receive messages
        response.data.forEach((chat: Chat) => {
          socket.emit("join_room", chat.id);
        });

        // Sort the chats by the last message
        const sortedChats = sortChats(response.data);
        setChats(sortedChats);
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    };
    getRecentChats();

    socket.on("refresh_chats", getRecentChats);
    return () => {
      socket.off("refresh_chats");
    };
  }, [user]);

  // Listen for new messages to update the last message of a chat in the chat list
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

      // Sort the chats by the last message
      const sortedChats = sortChats(updatedChats);
      setChats(sortedChats);
    };
    socket.on("receive_message", receiveMessage);

    return () => {
      socket.off("receive_message", receiveMessage);
    };
  }, [chats, setChats, socket]);

  // Sort the chats by the last message
  // const sortChats = (chats: Chat[]) => {
  //   return [...chats].sort((a, b) => {
  //     if (a.lastMessage && b.lastMessage) {
  //       return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  //     } else if (a.lastMessage) {
  //       return -1;
  //     } else if (b.lastMessage) {
  //       return 1;
  //     } else {
  //       return 0;
  //     }
  //   });
  // };
  const sortChats = (chats: Chat[]) => {
    return [...chats].sort((a, b) => {
      const aDate = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
      const bDate = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        socket,
        showChat,
        setShowChat,
        showChatItem,
        setShowChatItem,
        sortChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
