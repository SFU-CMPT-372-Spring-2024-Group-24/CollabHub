// Libraries
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
// Hooks
import { useState } from "react";
import { useTasks } from "../../../hooks/TaskContext";
import { useApiErrorHandler } from "../../../hooks/useApiErrorHandler";
import useUserManagement from "../../../hooks/useSearchUsers";
// Models
import { User } from "../../../models/User";
import { Role, Roles } from "../../../models/ProjectRole";
// API
import { api, AxiosError } from "../../../api";
// Files
import defaultProfilePicture from "../../../assets/default-profile-picture.png";
// Custom hooks
import { useUser } from "../../../hooks/UserContext";
import { useChats } from "../../../hooks/ChatContext";
// Icons and styles
import { IoSearch } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import "./ManageMemberModal.scss";
// Components
import ChangeMemberRoleModal from "../ChangeMemberRole/ChangeMemberRoleModal";
import { Chat } from "../../../models/Chat";

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ManageMemberModal = ({ showModal, setShowModal }: Props) => {
  const {
    projectMembers,
    setProjectMembers,
    userRole,
    project,
    userCanPerform,
  } = useTasks();
  // const [searchQuery, setSearchQuery] = useState<string>("");
  // const [hasSearched, setHasSearched] = useState<boolean>(false);
  // const [searchResults, setSearchResults] = useState<User[]>([]);
  // const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { user } = useUser();
  const { socket, chats, setChats } = useChats();
  const [showChangeRoleModal, setShowChangeRoleModal] =
    useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const { handleApiError } = useApiErrorHandler();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedUsers,
    setSelectedUsers,
    hasSearched,
    setHasSearched,
    handleSearchUsers,
    handleSelectUser,
  } = useUserManagement();
  const excludeIds = projectMembers.map((user) => user.id);

  // Reset search
  const resetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setHasSearched(false);
  };

  // Close modal
  const closeModal = () => {
    resetSearch();
    setShowModal(false);
  };

  // Add members to project, new members will be as role "Viewer"
  const handleAddMembers = async () => {
    try {
      const response = await api.post(`/projects/${project.id}/users`, {
        userIds: selectedUsers.map((user) => user.id),
      });

      if (response.status === 201) {
        console.log("Response:", response);
        const newMembers = selectedUsers.map((user) => {
          return {
            ...user,
            role: Roles.find((role) => role.name === "Viewer") as Role,
          };
        });
        socket.emit("chat_added");
        setProjectMembers([...projectMembers, ...newMembers]);
        //return the chatID from the response, find the certain chatID, add the user to the list
        setChats(
          chats.map((chat: Chat) => {
            if (chat.id === response.data.id) {
              return { ...chat, Users: [...projectMembers, ...newMembers] };
            }
            return chat;
          })
        );

        resetSearch();
      }
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  // Remove user from project
  const handleRemoveUser = async (user: User) => {
    try {
      await api.delete(`/projects/${project.id}/users/${user.id}`);

      setProjectMembers(
        projectMembers.filter((member) => member.id !== user.id)
      );
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  // Open change role modal
  const openChangeRoleModal = (member: User) => {
    if (!userCanPerform("manageMembers")) {
      return;
    }

    setSelectedMember(member);
    setShowChangeRoleModal(true);
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={closeModal}
        dialogClassName="manage-member-modal"
        backdropClassName="manage-member-modal-backdrop"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Your project members</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Add members */}
          {userCanPerform("manageMembers") && (
            <section className="search-section">
              <div>
                <h5>Add members to your project</h5>
                <form
                  className="search-member"
                  onSubmit={(e) => handleSearchUsers(e, excludeIds)}
                >
                  <div className="search-bar">
                    <IoSearch size={18} className="search-icon" />
                    <input
                      autoFocus
                      name="search"
                      id="search"
                      type="text"
                      placeholder="Search by name, username or email"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                    />
                  </div>

                  <button className="btn-text">Search</button>
                </form>

                <ul className="members-list">
                  {hasSearched && !searchResults.length && (
                    <li className="no-member-found">User not found</li>
                  )}

                  {searchResults.map((user) => (
                    <li
                      className="member"
                      key={user.id}
                      onClick={() => {
                        handleSelectUser(user);
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

              <div className="button-group">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-text"
                  onClick={handleAddMembers}
                >
                  Add members
                </button>
              </div>
            </section>
          )}

          {/* Current members */}
          <section>
            <h5>Current members</h5>
            <ul className="members-list current">
              {/* Current logged-in user */}
              <li className="member loggedIn-user">
                <img
                  src={user!.profilePicture || defaultProfilePicture}
                  alt="User Avatar"
                />

                <div className="member-info">
                  <Link
                    to={`/profile/${user!.username}`}
                    // className="profile-link"
                  >
                    <p>{user!.name}</p>
                    <p>{user!.username}</p>
                  </Link>
                </div>

                <div
                  className={`member-role ${
                    userCanPerform("manageMembers") ? "clickable" : ""
                  }`}
                  onClick={() =>
                    openChangeRoleModal({ ...user!, role: userRole } as User)
                  }
                >
                  {userRole.name}
                </div>

                <p className="you">You</p>
              </li>

              {/* Other project members */}
              {projectMembers.map((member) => {
                if (member.id !== user!.id) {
                  return (
                    <li className="member" key={member.id}>
                      <img
                        src={member.profilePicture || defaultProfilePicture}
                        alt="User Avatar"
                      />

                      <div className="member-info">
                        <Link
                          to={`/profile/${member.username}`}
                          // className="profile-link"
                        >
                          <p>{member.name}</p>
                          <p>{member.username}</p>
                        </Link>
                      </div>

                      <div
                        className={`member-role ${
                          userCanPerform("manageMembers") ? "clickable" : ""
                        }`}
                        onClick={() => openChangeRoleModal(member)}
                      >
                        {member.role?.name}
                      </div>

                      {userCanPerform("manageMembers") && (
                        <button
                          className="btn-icon btn-remove-user"
                          onClick={() => handleRemoveUser(member)}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  );
                }
              })}
            </ul>
          </section>
        </Modal.Body>
      </Modal>

      {/* Change member role modal */}
      <ChangeMemberRoleModal
        showModal={showChangeRoleModal}
        setShowModal={setShowChangeRoleModal}
        member={selectedMember!}
      />
    </>
  );
};

export default ManageMemberModal;
