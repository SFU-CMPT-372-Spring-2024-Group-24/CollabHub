// Hooks
import { useState, useEffect, useRef } from "react";
import { useTasks } from "../../hooks/TaskContext";
// Models
import { User } from "../../models/User";
import { FileModel as File } from "../../models/FileModel";
import { Task } from "../../models/Task";
// Components
import PreviewFileModal from "../Modals/PreviewFile/PreviewFileModal";
import TaskModal from "../Modals/TaskModal/TaskModal";
// Icons
import { IoSearch } from "react-icons/io5";

interface Props {
  placeholder: string;
}

const SearchBar = ({ placeholder = "Search" }: Props) => {
  // TaskProvider
  const { project, lists, projectMembers, projectFiles, selectedTask, setSelectedTask } = useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ users: User[], files: File[], tasks: Task[]}>({ users: [], files: [], tasks: [] });
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const [isShowingPreviewFileModal, setIsShowingPreviewFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [isShowingTaskModal, setIsShowingTaskModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShowingPreviewFileModal || isShowingTaskModal) return;

      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !(searchInputRef.current as HTMLInputElement).contains(event.target as Node)
      ) {
        setIsResultsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowingPreviewFileModal, isShowingTaskModal]);

  const handleSearchTermChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setSearchTerm(value);
    setIsResultsVisible(true);

    if (value.trim().length === 0) {
      setResults({ users: [], files: [], tasks: [] });
      return;
    } else if (value.trim().length <= 1) {
      return;
    }

    searchInProject();
  };

  const searchInProject = () => {
    try {
      const files = projectFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const tasks = lists.flatMap(list => list.tasks).filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const users = projectMembers.filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setResults({
        users,
        files,
        tasks,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onFileClick = (file: File) => {
    setSelectedFile(file);
    setIsShowingPreviewFileModal(true);
    setIsResultsVisible(false);
    setSearchTerm("");
  };

  const onTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsShowingTaskModal(true);
    setIsResultsVisible(false);
    setSearchTerm("");
  };

  const isResultsEmpty = results.users.length === 0 && results.files.length === 0 && results.tasks.length === 0;

  const content = (
    <div className="search-bar">
      <IoSearch size={20} className="search-icon" />
      <input
        ref={searchInputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchTermChange}
        onFocus={() => setIsResultsVisible(true)}
      />
      {searchTerm.trim().length !== 0 &&
        isResultsVisible && (
          <div className="search-results" ref={searchResultsRef}>
            {results.users.length > 0 && (
              <>
                <div className="search-result-header">
                  <b>Users</b>
                </div>
                {results.users.map(user => (
                  <div
                    key={user.id}
                    className="search-result"
                    onClick={() => open(`/profile/${user.username}`, "_self")}
                  >
                    <b>{user.name}</b>
                    <p>@{user.username}</p>
                  </div>
                ))}
              </>
            )}
            {results.files.length > 0 && (
              <>
                <div className="search-result-header">
                  <b>Files</b>
                </div>
                {results.files.map(file => (
                  <div
                    key={file.id}
                    className="search-result"
                    onClick={() => onFileClick(file)}
                  >
                    <p>{file.name}</p>
                  </div>
                ))}
              </>
            )}
            {results.tasks.length > 0 && (
              <>
                <div className="search-result-header">
                  <b>Tasks</b>
                </div>
                {results.tasks.map(task => (
                  <div
                    key={task.id}
                    className="search-result"
                    onClick={() => onTaskClick(task)}
                  >
                    <p>{task.name}</p>
                  </div>
                ))}
              </>
            )}
            {searchTerm.trim().length <= 1 ? (
              <div className="search-result">
                <p>Type more to search</p>
              </div>
            ) : isResultsEmpty && (
              <div className="search-result">
                <p>No results found</p>
              </div>
            )}
          </div>
        )}

    </div>
  );

  if (project) {
    return (<>
      {project && <>
        {content}
        <PreviewFileModal
          showPreviewFileModal={isShowingPreviewFileModal}
          setShowPreviewFileModal={setIsShowingPreviewFileModal}
          selectedFile={selectedFile}
        />
        {selectedTask && (
          <TaskModal
            isShowing={isShowingTaskModal}
            setIsShowing={setIsShowingTaskModal}
            task={selectedTask}
          />
        )}
      </>}
    </>);
  } else {
    return content;
  }
};

export default SearchBar;