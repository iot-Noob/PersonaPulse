import React from "react";

const Modal = ({ id = "modal", children, className = "" }) => {
  return (
    <dialog id={id} className={`modal ${className}`}>
      <div className="modal-box bg-gray-800 text-white">
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
