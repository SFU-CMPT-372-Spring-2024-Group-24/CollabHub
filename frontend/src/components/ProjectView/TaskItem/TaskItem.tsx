// Libraries
import moment from "moment";
import { Draggable } from "@hello-pangea/dnd";
// Icons and styles
import { FaRegClock } from "react-icons/fa6";
import "./TaskItem.scss";
// Models
import { Task } from "../../../models/Task";
import { List } from "../../../models/List";
// Components
import TaskModal from "../../Modals/TaskModal/TaskModal";
// Hooks
import { useState } from "react";

interface Props {
  list: List;
  task: Task;
  index: number;
}

const TaskItem = ({ list, task, index }: Props) => {
  // Task Item Modal
  const [showTaskItemModal, setShowTaskItemModal] = useState<boolean>(false);

  // Toggle Task Item Modal visibility
  const toggleTaskItemModal = () => setShowTaskItemModal(!showTaskItemModal);

  return (
    <>
      <Draggable draggableId={task.id.toString()} index={index}>
        {(provided) => (
          <li
            className="task-item"
            onClick={toggleTaskItemModal}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <h3>{task.name}</h3>

            <div className="info">
              <div className="due-date">
                {task.dueDate && (
                  <>
                    <FaRegClock size={12} />
                    {moment(task.dueDate).format("MMM D hh:mma")}
                  </>
                )}
              </div>

              {task.priority && task.priority !== "unset" && (
                <div className={`priority priority-${task.priority}`}>
                  {task.priority}
                </div>
              )}
            </div>
          </li>
        )}
      </Draggable>

      <TaskModal
        isShowing={showTaskItemModal}
        setIsShowing={setShowTaskItemModal}
        task={task}
        list={list}
        index={index}
      />
    </>
  );
};

export default TaskItem;
