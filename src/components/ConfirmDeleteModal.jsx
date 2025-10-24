// src/components/ConfirmDeleteModal.jsx
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";

/**
 * Reusable confirm delete modal using react-confirm-alert
 * @param {Function} onConfirm - async function to execute on Yes
 * @param {String} title - modal title
 * @param {String} message - modal message
 * @param {String} iconColor - color of the "!" icon
 */
const ConfirmDeleteModal = ({ onConfirm, title, message, iconColor }) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
        <div style={{ fontSize: "50px", color: iconColor || "#ff9900" }}>!</div>
        <h4 className="fw-bold mt-2">{title || "Are you sure?"}</h4>
        <p>{message || "This action cannot be undone. Do you want to continue?"}</p>
        <div className="d-flex justify-content-center mt-3">
          <button className="btn btn-danger me-2 px-4" onClick={onClose}>
            No
          </button>
          <button
            className="btn btn-success px-4"
            onClick={async () => {
              try {
                await onConfirm();
              } catch (err) {
                console.error("Failed to perform action:", err);
                toast.error("Action failed");
              }
              onClose();
            }}
          >
            Yes
          </button>
        </div>
      </div>
    ),
  });
};

export default ConfirmDeleteModal;
