// Libraries
import Modal from "react-bootstrap/Modal";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
// Models
import { Task, PriorityTypes } from "../../../models/Task";
// API
import { api, AxiosError } from "../../../api";
// Hooks
import { useTasks } from "../../../hooks/TaskContext";
import { useApiErrorHandler } from "../../../hooks/useApiErrorHandler";
import { useEffect, useRef, useState } from "react";

interface Props {
  task: Task;
}

const Priority = ({ task }: Props) => {
  // Setting Priority Modal
  const [showPriorityModal, setShowPriorityModal] = useState<boolean>(false);
  // Priority Ref for positioning the modal
  const priorityRef = useRef<HTMLDivElement>(null);
  // Priority Value
  const [priorityValue, setPriorityValue] = useState<PriorityTypes>(
    task.priority || ""
  );
  // Task Context
  const { setTask, project, userCanPerform } = useTasks();
  // Error handling
  const { handleApiError } = useApiErrorHandler();
  // Priority values
  const prioritiesValues: { value: PriorityTypes }[] = [
    { value: "unset" },
    { value: "planning" },
    { value: "low" },
    { value: "medium" },
    { value: "high" },
    { value: "urgent" },
  ];

  // For toggling the modal
  const togglePriorityModal = () => setShowPriorityModal(!showPriorityModal);

  // For positioning the modal
  useEffect(() => {
    if (showPriorityModal && priorityRef.current) {
      const priorityRect = priorityRef.current.getBoundingClientRect();
      const modal = document.querySelector(".priority-modal");

      if (modal instanceof HTMLElement) {
        modal.style.top = `${priorityRect.bottom}px`;
        modal.style.left = `${priorityRect.left}px`;
      }
    }
  }, [showPriorityModal]);

  // For updating the priority
  const handlePriorityChange = async (priority: PriorityTypes) => {
    try {
      const response = await api.put(`/tasks/${task.id}`, {
        priority,
        projectId: project.id,
      });

      // ???
      // task.priority = response.data.priority;

      setTask({ ...task, priority: response.data.priority });
      setPriorityValue(response.data.priority);
      togglePriorityModal();
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  return (
    <>
      <div ref={priorityRef} className="priority">
        {task.priority && task.priority !== "unset" && (
          <span
            className={`
              task-priority 
              ${userCanPerform("manageTasks") ? "editable" : ""}
              priority-${task.priority}
            `}
            onClick={() => {
              if (userCanPerform("manageTasks")) {
                togglePriorityModal();
              }
            }}
          >
            {task.priority}
          </span>
        )}

        {(!task.priority || task.priority === 'unset') && userCanPerform("manageTasks") && (
          <button className="set-priority" onClick={togglePriorityModal}>
            Set priority
          </button>
        )}
      </div>

      <Modal
        show={showPriorityModal}
        onHide={togglePriorityModal}
        dialogClassName="priority-modal"
        backdropClassName="task-subModal-backdrop"
      >
        <Modal.Header closeButton>
          <h4>Priority</h4>
        </Modal.Header>

        <Modal.Body>
          <ButtonGroup>
            {prioritiesValues.map((priority, idx) => (
              <ToggleButton
                key={idx}
                id={`priority-${idx}`}
                type="radio"
                name="priority"
                value={priority.value}
                checked={priorityValue === priority.value}
                onChange={(e) => {
                  handlePriorityChange(e.currentTarget.value as PriorityTypes);
                }}
                className={`${
                  priorityValue === priority.value
                    ? "priority-" + `${priority.value}`
                    : ""
                }`}
                style={{ borderRadius: "10px" }}
              >
                {priority.value}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Priority;
