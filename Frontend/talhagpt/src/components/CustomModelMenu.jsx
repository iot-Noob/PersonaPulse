import React, { useEffect } from 'react';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import { showCustModelModam } from '../Redux/dataSlice';
import ModalOpenerCloser from '../Helper/ModalOpenerCloser';

const CustomModelMenu = ({ mid = "cmid" }) => {
  const mos = useSelector((state) => state.dataslice.custom_model_modam);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(showCustModelModam(false));
  };

  // Fix: react to `mos` change
  useEffect(() => {
    if (mos) {
      ModalOpenerCloser.open_modal(mid);
    } else {
      ModalOpenerCloser.close_modal(mid);
    }
  }, [mos]);

  return (
    <Modal id={mid}>
      <div className="relative p-4">
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal content */}
        <h2 className="text-lg font-bold">Custom Model Modal</h2>
        <p className="mt-2">This is your custom model modal content.</p>
      </div>
    </Modal>
  );
};

export default CustomModelMenu;
