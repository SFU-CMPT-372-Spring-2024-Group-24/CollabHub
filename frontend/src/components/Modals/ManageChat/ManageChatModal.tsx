// Use for creating a new chat room, or adding users to a chat room

// Hooks
import { useEffect, useState } from "react";
import { useUser } from "../../../hooks/UserContext";
import { useApiErrorHandler } from "../../../hooks/useApiErrorHandler";
import useSearchUsers from "../../../hooks/useSearchUsers";
import { useChats } from "../../../hooks/ChatContext";
import { useNavigate } from "react-router-dom";
// Libraries
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
// Models
import { Chat } from "../../../models/Chat";
// API
import { api, AxiosError } from "../../../api";
// Icons and styles
import { IoSearch } from "react-icons/io5";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
// Files
import defaultProfilePicture from "../../../assets/default-profile-picture.png";
import { BiLogOutCircle } from "react-icons/bi";
//Components
import ConfirmationModal from "../../Modals/ConfirmationModal/ConfirmationModal";

interface Props {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  action: string;
  chat?: Chat;
  setChat?: (chat: Chat) => void;
}

const ManageChatModal = ({
  showModal,
  setShowModal,
  action,
  chat,
  setChat,
}: Props) => {
  const { user } = useUser();
  const [chatName, setChatName] = useState<string>("");
  const { socket, chats, setChats, setShowChatItem, sortChats } = useChats();
  const { handleApiError } = useApiErrorHandler();
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const {
    query,
    setQuery,
    results,
    setResults,
    selectedUsers,
    setSelectedUsers,
    searched,
    setSearched,
    handleSearch,
    handleSelect,
  } = useSearchUsers();

  let excludeIds: number[] = [];
  if (chat) {
    excludeIds = chat.Users.map((user) => user.id); // If we're adding members to a chat, exclude the current members
  } else {
    excludeIds = [user!.id]; // If we're creating a chat, exclude the current user
  }

  const closeModal = () => {
    setShowModal(false);
    setQuery("");
    setResults([]);
    setSelectedUsers([]);
    setSearched(false);
  };

  const navigate = useNavigate();
  // if there's only one selected user, make the chat name their name
  useEffect(() => {
    //if we're creating a chat, there is no initial chat
    // if (action == "create-chat") {
    //   if (selectedUsers.length === 1) {
    //     setChatName(selectedUsers[0].name);
    //   } else {
    //     setChatName("");
    //   }
    // }
    //if we're adding member to the chat, there is a chat, so we can use that
    if (action == "add-members") {
      //one situation is where you removed some people in chat and then add more people again
      //the default chat name shouldn't change,, it should still be the same as before
      if (
        selectedUsers.length == 1 &&
        chat!.Users.length + selectedUsers.length == 1
      ) {
        setChatName(selectedUsers[0].name);
      } else {
        setChatName(chat!.name);
      }
    }
  }, [selectedUsers, chat?.Users]);

  const handleDeleteChat = async () => {
    try {
      const response = await api.delete(`/chats/${chat!.id}/delete/`);
      if (response.status === 200) {
        toast("You have deleted the chat.");
      }
      setChats(chats.filter((myChat) => myChat.id !== chat!.id));
    } catch (error) {
      handleApiError(error as AxiosError);
    } finally {
      setShowConfirmationModal(false);
      closeModal();
      setShowChatItem(false);
    }
  };
  const handleLeaveChat = async () => {
    try {
      //call api
      const response = await api.delete(`/chats/${chat!.id}/leave/${user?.id}`);
      if (response.status === 200) {
        toast("You have left the chat.");
        navigate("/projects");
      }
      //find the chat in the list of chats, remove that specifc chat
      setChats(chats.filter((myChat) => myChat.id !== chat!.id));
    } catch (error) {
      handleApiError(error as AxiosError);
    } finally {
      setShowConfirmationModal(false);
      closeModal();
      setShowChatItem(false);
    }
  };
  // Create a new chat room
  const handleCreateChat = async () => {
    if (!selectedUsers.length) {
      return;
    }
    // console.log("Value is: ", chat?.Users.length);
    // if (chatName.trim() === "") {
    //   alert("Please re-enter your group chat name, it is empty.");
    //   return;
    // }
    try {
      //instead of name being empty string here, want to get name specified by a user input
      const response = await api.post("/chats", {
        name: chatName,
        userIds: [user!.id, ...selectedUsers.map((user) => user.id)],
      });

      // Update the state by putting the new chat at the top of the list
      // setChats([...chats, response.data]);
      setChats([response.data, ...chats]);

      // Use socket to broadcast to everyone else to refresh their list of chats
      socket.emit("new_chat");

      // Set chat name back to empty string
      setChatName("");

      // Close the modal
      closeModal();
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  // Add users to an existing chat room
  const handleAddMembers = async () => {
    if (!selectedUsers.length) {
      return;
    }

    try {
      await api.post(`/chats/${chat!.id}/users`, {
        userIds: selectedUsers.map((user) => user.id),
      });

      // Updated chat
      const updatedChat = {
        ...chat!,
        Users: [...chat!.Users, ...selectedUsers],
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
  const handleChatNameSubmit = async () => {
    if (chatName.trim() === "") {
      alert("Please re-enter your group chat name, it is empty.");
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

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === "create-chat" && "Create Chat"}
            {action === "add-members" && "Add Members"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <section className="search-section">
            <div>
              {action === "create-chat" && (
                <>
                  <h5>Select users you want to chat with: </h5>
                  {selectedUsers.length > 1 && (
                    <input
                      type="text"
                      className="insert-chat-name"
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      placeholder="Enter a chat name"
                      required
                    ></input>
                  )}
                </>
              )}

              {action === "add-members" && (
                <>
                  <h5>Select users you want to add to the chat</h5>
                  {chat != undefined &&
                    selectedUsers.length + chat?.Users.length > 1 && (
                      <>
                        <input
                          type="text"
                          className="insert-chat-name"
                          value={chatName}
                          onChange={(e) => setChatName(e.target.value)}
                          placeholder="Input your chat name"
                          required
                        />
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={handleChatNameSubmit}
                        >
                          Change Chat Name
                        </button>
                      </>
                    )}
                </>
              )}
              <form
                className="search-member"
                onSubmit={(e) => handleSearch(e, excludeIds)}
              >
                <div className="search-bar">
                  <IoSearch size={18} className="search-icon" />
                  <input
                    autoFocus
                    name="search"
                    id="search"
                    type="text"
                    placeholder="Search by name, username or email"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                  />
                </div>

                <button className="btn-text">Search</button>
              </form>

              <ul className="members-list">
                {searched && !results.length && (
                  <li className="no-member-found">User not found</li>
                )}

                {results.map((user) => (
                  <li
                    className="member"
                    key={user.id}
                    onClick={() => {
                      handleSelect(user);
                    }}
                  >
                    <img
                      src={user.profilePicture || defaultProfilePicture}
                      alt="User Avatar"
                    />

                    <div className="member-info">
                      <p>{user.name}</p>
                      <p>{user.username}</p>
                    </div>

                    {selectedUsers.some(
                      (selected) => selected.id === user.id
                    ) ? (
                      <FaCheck size={16} color="#8C54FB" className="icon" />
                    ) : (
                      <IoMdAdd size={20} className="icon" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Modal.Body>

        <Modal.Footer>
          <div className="button-group">
            {action === "add-members" && (
              <>
                <button
                  type="button"
                  className="btn-leave-delete-project"
                  onClick={() => {
                    setConfirmMsg("Are you sure you want to delete this chat?");
                    setConfirmText("Yes! Delete my chat permanently.");
                    setShowConfirmationModal(true);
                  }}
                >
                  <IoMdTrash size={18} />
                  Delete this chat
                </button>
                <button
                  type="button"
                  className="btn-leave-delete-project"
                  onClick={() => {
                    setConfirmMsg("Are you sure you want to leave this chat?");
                    setConfirmText("Yes! I want to leave this chat.");
                    setShowConfirmationModal(true);
                  }}
                >
                  <BiLogOutCircle size={18} />
                  Leave this chat
                </button>
              </>
            )}

            <button type="button" className="btn-cancel" onClick={closeModal}>
              Close
            </button>

            {action === "create-chat" && (
              <button
                type="button"
                className="btn-text"
                onClick={handleCreateChat}
              >
                Create chat
              </button>
            )}

            {action === "add-members" && (
              <button
                type="button"
                className="btn-text"
                onClick={handleAddMembers}
              >
                Add members
              </button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
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
    </>
  );
};

export default ManageChatModal;
