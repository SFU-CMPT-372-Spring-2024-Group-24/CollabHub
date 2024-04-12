// Hooks
import { useState } from "react";
import { useTasks } from "../../../hooks/TaskContext";
import { useApiErrorHandler } from "../../../hooks/useApiErrorHandler";
// Components
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import TaskName from "./TaskName";
import Priority from "./Priority";
import Description from "./Description";
import DueDate from "./DueDate";
import TaskMembers from "./TaskMembers";
import Attachments from "./Attachments";
import Comments from "./Comments";
import MoveTaskModal from "../../Modals/MoveTask/MoveTaskModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
// Models
import { Task } from "../../../models/Task";
import { List } from "../../../models/List";
// Icons
import { IoMdClose, IoMdTrash } from "react-icons/io";
import { TbArrowsExchange } from "react-icons/tb";
// API
import { api, AxiosError } from "../../../api";

interface Props {
  isShowing: boolean;
  setIsShowing: (show: boolean) => void;
  task: Task;
  list?: List;
  index?: number;
}

const TaskModal = ({ isShowing, setIsShowing, task, list, index }: Props) => {
  if (!task) return null;

  const { handleApiError } = useApiErrorHandler();
  const { project, removeTask, userCanPerform, lists } = useTasks();
  const [isShowingMoveTaskModal, setIsShowingMoveTaskModal] = useState<boolean>(false);
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState<boolean>(false);

  // For the case when the task is opened from the search bar
  const findTaskInLists = (taskId: number) => {
    for (const list of lists) {
      const index = list.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        return { list, index };
      }
    }
    return null;
  };

  if (!list || index === undefined) {
    const taskLocation = findTaskInLists(task.id);
    if (taskLocation) {
      list = taskLocation.list;
      index = taskLocation.index;
    } else {
      return null;
    }
  }

  const handleDeleteTask = async () => {
    try {
      const response = await api.delete(`/tasks/${task.id}`, {
        data: { projectId: project.id },
      });

      if (response.status === 200) {
        removeTask(list.id, task.id);
        setIsShowing(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  return (<>
    <Modal
      show={isShowing}
      onHide={() => setIsShowing(false)}
      dialogClassName="task-item-modal"
    >
      <Modal.Header className="header">
        <TaskName task={task} />

        <div className="sub-header">
          <span
            className={`
                list-name 
                ${task.priority && task.priority !== 'unset' && "hasPriority"}
                ${userCanPerform("manageTasks") && "hasPriority"}
              `}
          >
            {list.name}
          </span>
          <Priority task={task} />
        </div>

        <div className="button-group">
          <button
            className="btn-icon close-btn"
            onClick={() => setIsShowing(false)}
          >
            <IoMdClose size={20} />
          </button>
          {userCanPerform("manageTasks") && (
            <>
              <button
                className="btn-icon move-btn"
                onClick={() => setIsShowingMoveTaskModal(true)}
                // onClick={() => { setIsShowing(true) }}
              >
                <TbArrowsExchange size={20} />
              </button>

              <button
                className="btn-icon delete-btn"
                onClick={() => setIsShowingConfirmationModal(true)}
              >
                <IoMdTrash size={20} />
              </button>
            </>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        <Description task={task} />
        <DueDate task={task} />
        <div className="row">
          <TaskMembers task={task} />
          <Attachments task={task} />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Comments task={task} />
      </Modal.Footer>
    </Modal>

    <MoveTaskModal
      list={list}
      index={index}
      showModal={isShowingMoveTaskModal}
      setShowModal={setIsShowingMoveTaskModal}
      setShowTaskItemModal={setIsShowing}
    />

    <ConfirmationModal
      show={isShowingConfirmationModal}
      message="Are you sure you want to delete this task?"
      secondMessage="All comments will be lost."
      confirmText="Delete"
      onConfirm={handleDeleteTask}
      onCancel={() => setIsShowingConfirmationModal(false)}
    />
  </>);
};

export default TaskModal;