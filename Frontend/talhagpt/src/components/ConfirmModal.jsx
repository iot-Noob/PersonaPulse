import React from "react";
import { TrashIcon } from "@heroicons/react/16/solid";
const ConfirmModal = ({ id = "confirm_modal", onConfirm, onCancel, message = "Are you sure?" ,title="Title"}) => {
  return (
<>
    <dialog id={id} className="modal">
      <div className="modal-box bg-gray-800 text-white">
        <h3 className="font-bold text-lg"> {title}</h3>
        <p className="py-4">{message}</p>

        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm  btn-error"
              onClick={() => {
                onConfirm?.();
                document.getElementById(id)?.close();
              }}
            >
              <TrashIcon width={22} color="white"/>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost border  border-gray-600 btn-success"
              onClick={() => {
                onCancel?.();
                document.getElementById(id)?.close();
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </dialog>
 
</>
  );
};

export default ConfirmModal;
