// File, Icons and Styles
import "./ChatList.scss";
import { IoMdClose } from "react-icons/io";
import { TbMessagePlus } from "react-icons/tb";
import defaultProfilePicture from "../../../assets/default-profile-picture.png";
// Components
import ChatItem from "../ChatItem/ChatItem";
import ManageChatModal from "../../Modals/ManageChat/ManageChatModal";
// Hooks
import { useUser } from "../../../hooks/UserContext";
import { useState } from "react";
import { useChats } from "../../../hooks/ChatContext";
// Models
import { Chat } from "../../../models/Chat";

const ChatList = () => {
  const { user } = useUser();
  const { showChat, setShowChat, chats } = useChats();
  const [showChatItem, setShowChatItem] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showManageChatModal, setShowManageChatModal] =
    useState<boolean>(false);

  if (!user) return null;

  // Handle viewing a chat
  const handleViewChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatItem(true);
  };

  return (
    <>
      {showChat && (
        <div className="chats">
          <div className="chat-header">
            <h2>Chats</h2>

            <div className="button-group">
              <button
                className="btn-icon"
                onClick={() => setShowManageChatModal(true)}
              >
                <TbMessagePlus size={20} />
              </button>

              <button className="btn-icon" onClick={() => setShowChat(false)}>
                <IoMdClose size={20} />
              </button>
            </div>
          </div>

          {!showChatItem ? (
            <>
              <ul className="chat-list">
                {chats.map((chat, index) => (
                  <li
                    className="chat-item"
                    key={index}
                    onClick={() => handleViewChat(chat)}
                  >
                    <div className="picture">
                      {/* If it's a group chat, show the first 2 users profile picture */}
                      {chat.Users.length > 2 && (
                        <div className="group">
                          {chat.Users.slice(0, 2).map((user, index) => (
                            <img
                              key={index}
                              src={user.profilePicture || defaultProfilePicture}
                              alt="User Avatar"
                            />
                          ))}
                        </div>
                      )}

                      {/* If it's a direct chat, show the other user's profile picture */}
                      {chat.Users.length == 2 && (
                        <img
                          src={
                            chat.Users[0].id === user.id
                              ? chat.Users[1].profilePicture ||
                                defaultProfilePicture
                              : chat.Users[0].profilePicture ||
                                defaultProfilePicture
                          }
                          alt="User Avatar"
                        />
                      )}
                      {/* If there's only yourself in chat */}
                      {chat.Users.length < 2 && (
                        <img
                          src={
                            chat.Users[0].profilePicture ||
                            defaultProfilePicture
                          }
                          alt="User Avatar"
                        />
                      )}
                    </div>

                    <div className="chat">
                      <h3>
                        {/*If the chat is a group chat or just has one person, use the chat name.*/}
                        {chat.Users.length > 2 || chat.Users.length == 1
                          ? chat.name
                          : null}
                        {/* If it's a direct chat, show the other user's name as chat name. Otherwise, leave as it is */}
                        {/* If there's two users in a chat and it is not a project, display the other person's name */}
                        {/* Otherwise, display the chat name */}
                        {chat.Users.length == 2
                          ? chat.Projects.length == 0
                            ? chat.Users[0].id === user.id
                              ? chat.Users[1].name
                              : chat.Users[0].name
                            : chat.name
                          : null}
                      </h3>

                      {chat.lastMessage && chat.Users.length > 2 && (
                        <p>
                          {chat.lastMessage.User.id === user.id
                            ? "You"
                            : chat.lastMessage.User.name}
                          : {chat.lastMessage.message}
                        </p>
                      )}
                      {chat.lastMessage && chat.Users.length <= 2 && (
                        <p>
                          {chat.lastMessage.User.id === user.id ? "You: " : ``}
                          {chat.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ChatItem
              setShowChatItem={setShowChatItem}
              chat={selectedChat}
              setChat={setSelectedChat}
            />
          )}
        </div>
      )}

      <ManageChatModal
        showModal={showManageChatModal}
        setShowModal={() => setShowManageChatModal(false)}
        action="create-chat"
      />
    </>
  );
};

export default ChatList;
