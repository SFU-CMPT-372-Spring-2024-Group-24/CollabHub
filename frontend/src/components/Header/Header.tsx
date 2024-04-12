// Icons and Styles
import { IoChatbox } from "react-icons/io5";
import { FaHandshakeSimple } from "react-icons/fa6";
import "./Header.scss";
// Libraries
import { Link } from "react-router-dom";
// Components
import UserModal from "../Modals/UserModal/UserModal";
import SearchBar from "./SearchBar";
// Hooks
import { useChats } from "../../hooks/ChatContext";
// Todo:
// Display search results from backend

interface Props {
  searchPlaceholder: string;
}

const Header = ({ searchPlaceholder }: Props) => {
  const { showChat, setShowChat } = useChats();

  return (
    <header>
      <Link to={"/projects"} className="">
        <h1 className="logo">
          <FaHandshakeSimple />
          CollabHub
        </h1>
      </Link>

      <SearchBar placeholder={searchPlaceholder} />

      <button
        type="button"
        className="btn-text"
        onClick={() => setShowChat(!showChat)}
      >
        <IoChatbox size={20} />
      </button>

      <UserModal />

    </header>
  );
};

export default Header;
