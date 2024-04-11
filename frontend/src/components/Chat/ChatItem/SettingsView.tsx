// Models
import { Chat } from "../../../models/Chat";
import { User } from "../../../models/User";
// Files
import defaultProfilePicture from "../../../assets/default-profile-picture.png";
// API
import { api, AxiosError } from "../../../api";
// Hooks
import { useApiErrorHandler } from "../../../hooks/useApiErrorHandler";
import { useState } from "react";
import { useChats } from "../../../hooks/ChatContext";
// Icons
import { IoMdAdd } from "react-icons/io";
// import { RiLogoutCircleRLine } from "react-icons/ri";
// Components
import ManageChatModal from "../../Modals/ManageChat/ManageChatModal";
import { Link } from "react-router-dom";

interface Props {
  chat: Chat;
  setChat: (chat: Chat) => void;
  setShowChatItem: (value: boolean) => void;
}

const SettingsView = ({ setShowChatItem, chat, setChat }: Props) => {
  const { handleApiError } = useApiErrorHandler();
  const [showManageChatModal, setShowManageChatModal] =
    useState<boolean>(false);
  const { socket, chats: globalChats, setChats: setGlobalChats } = useChats();

  // Remove a user from the chat
  const handleRemoveUser = async (user: User) => {
    try {
      await api.delete(`/chats/${chat.id}/users/${user.id}`);
      setChat({
        ...chat,
        Users: chat.Users.filter((u) => u.id !== user.id),
      });
      setGlobalChats(
        globalChats.map((myChat: Chat) => {
          if (myChat.id == chat.id) {
            return {
              ...chat,
              Users: chat.Users.filter((u) => u.id !== user.id),
            };
          }
          return myChat;
        })
      );
      socket.emit("chat_added");
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  return (
    <>
      <section className="settings-view">
        <div className="button-group">
          <button
            type="button"
            onClick={() => setShowManageChatModal(true)}
            className="btn-icon"
          >
            <IoMdAdd size={15} />
            Manage Chat
          </button>
          {/* <button type="button" className="btn-icon" onClick={() => {}}>
            <RiLogoutCircleRLine size={15} />
            Leave Chat
          </button>
          <button
            type="button"
            className="btn-icon btn-danger"
            onClick={() => {}}
          >
            <IoMdTrash size={15} />
            Delete Chat
          </button> */}
        </div>

        <div className="members">
          <h3>Members</h3>

          <ul className="member-list">
            {chat.Users.map((user, index) => (
              <li key={index} className="member-list-item">
                <div className="member-info">
                  <Link
                    to={`/profile/${user.username}`}
                    className="profile-link"
                  >
                    <img
                      src={user.profilePicture || defaultProfilePicture}
                      alt="User Avatar"
                    />
                    <p>{user.name}</p>
                  </Link>
                </div>

                <button
                  className="btn-remove-user"
                  type="button"
                  onClick={() => handleRemoveUser(user)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ManageChatModal
        setShowChatItem={setShowChatItem}
        showModal={showManageChatModal}
        setShowModal={setShowManageChatModal}
        action="add-members"
        chat={chat}
        setChat={setChat}
      />
    </>
  );
};

export default SettingsView;
