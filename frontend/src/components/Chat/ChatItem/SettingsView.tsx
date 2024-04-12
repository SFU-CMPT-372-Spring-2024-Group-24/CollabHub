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
import { useUser } from "../../../hooks/UserContext";
// Icons
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { RiLogoutCircleRLine } from "react-icons/ri";
// Components
import ManageChatModal from "../../Modals/ManageChat/ManageChatModal";
import ConfirmationModal from "../../Modals/ConfirmationModal/ConfirmationModal";
// Libraries
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEdit2 } from "react-icons/fi";
import Modal from "react-bootstrap/Modal";

interface Props {
  chat: Chat;
  setChat: (chat: Chat) => void;
}

const SettingsView = ({ chat, setChat }: Props) => {
  const { handleApiError } = useApiErrorHandler();
  const [showManageChatModal, setShowManageChatModal] =
    useState<boolean>(false);
  const { socket, chats, setChats, setShowChatItem } = useChats();
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const { user } = useUser();
  const [chatName, setChatName] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  // Remove a user from the chat
  const handleRemoveUser = async (user: User) => {
    try {
      await api.delete(`/chats/${chat.id}/users/${user.id}`);
      setChat({
        ...chat,
        Users: chat.Users.filter((u) => u.id !== user.id),
      });
      setChats(
        chats.map((myChat: Chat) => {
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

  const handleDeleteChat = async () => {
    try {
      const response = await api.delete(`/chats/${chat!.id}/delete/`);
      if (response.status === 200) {
        toast.success("You have deleted the chat.");
      }
      setChats(chats.filter((myChat) => myChat.id !== chat!.id));
    } catch (error) {
      handleApiError(error as AxiosError);
    } finally {
      setShowConfirmationModal(false);
      setShowChatItem(false);
    }
  };

  const handleLeaveChat = async () => {
    try {
      //call api
      const response = await api.delete(`/chats/${chat!.id}/leave/${user?.id}`);
      if (response.status === 200) {
        toast.success("You have left the chat.");
        // navigate("/projects");
      }
      //find the chat in the list of chats, remove that specifc chat
      setChats(chats.filter((myChat) => myChat.id !== chat!.id));
    } catch (error) {
      handleApiError(error as AxiosError);
    } finally {
      setShowConfirmationModal(false);
      setShowChatItem(false);
    }
  };

  const handleChatNameSubmit = async () => {
    if (chatName.trim() === "") {
      toast.error("Chat name cannot be empty.");
      return;
    }
    try {
      //update chat name in database
      await api.post(`/chats/${chat!.id}/chatName`, {
        chatName: chatName,
      });

      // Updated chat
      const updatedChat = {
        ...chat!,
        name: chatName,
      };

      // Update the current chat and also the list of chats to include the new members
      setChat!(updatedChat);
      setChats(chats.map((c) => (c.id === chat!.id ? updatedChat : c)));

      // Use socket to broadcast to everyone else to refresh their list of chats
      socket.emit("chat_added");
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  const closeModal = () => {
    setChatName("");
    setShowModal(false);
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
            Add members
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setShowModal(true)}
          >
            <FiEdit2 size={12}/>
            Change Chat Name
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => {
              setConfirmMsg("Are you sure you want to leave this chat?");
              setConfirmText("Yes! I want to leave this chat.");
              setShowConfirmationModal(true);
            }}
          >
            <RiLogoutCircleRLine size={13} />
            Leave this chat
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => {
              setConfirmMsg("Are you sure you want to delete this chat?");
              setConfirmText("Yes! Delete my chat permanently.");
              setShowConfirmationModal(true);
            }}
          >
            <IoMdTrash size={13} />
            Delete this chat
          </button>
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
        showModal={showManageChatModal}
        setShowModal={setShowManageChatModal}
        action="add-members"
        chat={chat}
        setChat={setChat}
      />

      <ConfirmationModal
        show={showConfirmationModal}
        message={confirmMsg}
        confirmText={confirmText}
        onConfirm={
          confirmText === "Yes! I want to leave this chat."
            ? handleLeaveChat
            : handleDeleteChat
        }
        onCancel={() => setShowConfirmationModal(false)}
      />

      <Modal
        show={showModal}
        onHide={closeModal}
        dialogClassName="change-chat-name-modal"
        backdropClassName="change-chat-name-modal-backdrop"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter new chat name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            id="chatName"
            name="chatName"
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            autoFocus
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-cancel"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-text"
            onClick={handleChatNameSubmit}
          >
            Save changes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SettingsView;
