import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  TrashIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  LinkIcon,
  CommandLineIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/16/solid";
import MessageModal from "./ConfirmModal";
import ConfirmModal from "./ConfirmModal";
import { useDispatch } from "react-redux";
import { exit, enter } from "../Redux/mouseSlice";
import CustomModelMenu from "./CustomModelMenu";
import { showCustModelModam } from "../Redux/dataSlice";
import Modal from "./Modal";
export const AccordSec = ({
  selectedModel,
  setSelectedModel,
  models,
  setChatHistory,
  setChains,
  setMode,
  Mode,
  all_mode,
  selectedCharacter,
  setSelectedCharacter,
  characters,
  selectedRole,
  setSelectedRole,
  roles,
  temperature,
  setTemperature,
}) => {
  let dispatch = useDispatch();
  const checkboxRef = useRef(null);
  const cmr = useRef(null);
  const MouseIn = useSelector((state) => state.mouseenter.value);
  const cmo = useSelector((state) => state.dataslice.custom_model_modam);
  let amod=useSelector((state)=>state.dataslice.activate_model)
  let cml=useSelector((state)=>Boolean(state.dataslice.localModelActive))
  useEffect(() => {
    if (MouseIn && checkboxRef.current) {
      checkboxRef.current.checked = false;
      dispatch(exit());
    }
  }, [MouseIn]);
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");

    const handleScreenResize = (e) => {
      if (e.matches) {
        // screen is now 'sm' or larger → close any open dialogs
        ["smod", "chainModal", "del_chat_modal"].forEach((id) => {
          const modal = document.getElementById(id);
          if (modal instanceof HTMLDialogElement && modal.open) {
            modal.close();
          }
        });
      }
    };

    // Run once on mount
    if (sm.matches) handleScreenResize(sm);

    sm.addEventListener("change", handleScreenResize);
    return () => sm.removeEventListener("change", handleScreenResize);
  }, []);

  return (
    <>
      {/* Accordion for small screens */}
      <div
        className="block sm:hidden w-full h-auto"
        title="Other options like select model, role etc"
      >
        <div className="block sm:hidden w-full">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-square btn-sm btn-primary"
              onClick={() => document.getElementById("smod").showModal()}
              title="Chat Settings"
            >
              <Cog6ToothIcon width={16} height={16} />
            </button>

            <button
              className="btn btn-square btn-sm btn-error"
              onClick={() =>
                document.getElementById("del_chat_modal").showModal()
              }
              title="Delete Chat History"
            >
              <TrashIcon width={16} height={16} />
            </button>
            <button
              className="btn btn-square btn-sm btn-primary"
              onClick={() => dispatch(showCustModelModam(true))}
              title="Enable Local Model"
            >
              <Bars3BottomLeftIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Small Modal Start */}
      <Modal id="smod">
        <div className="relative bg-gray-900/90 p-4 rounded-lg space-y-4">
          {/* Close (X) Button */}
          <button
            onClick={() => document.getElementById("smod").close()}
            className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2 text-white"
            title="Close modal"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model */}
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold text-white mb-1"
                htmlFor="modelSelect"
              >
                Model:
              </label>
              <select
                 disabled={cml && amod===""}
                id="modelSelect"
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                title="Choose the model to use"
              >
                <option disabled value="">
                  Select Model
                </option>
                {models.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode */}
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold text-white mb-1"
                htmlFor="modeSelect"
              >
                Mode:
              </label>
              <select
                disabled={cml && amod===""}
                id="modeSelect"
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={Mode}
                onChange={(e) => {
                  setChatHistory([]);
                  setChains({});
                  setMode(e.target.value);
                }}
                title="Select operating mode"
              >
                <option disabled value="">
                  Select Mode
                </option>
                {all_mode.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Character */}
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold text-white mb-1"
                htmlFor="characterSelect"
              >
                Character:
              </label>
              <select
                id="characterSelect"
                disabled={Mode === "Analytical"}
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={selectedCharacter}
                onChange={(e) => {
                  setSelectedCharacter(e.target.value);
                  setChatHistory([]);
                  setChains({});
                }}
                title="Choose a character persona (if not Analytical)"
              >
                <option value="">No Character</option>
                {characters.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold text-white mb-1"
                htmlFor="roleSelect"
              >
                Role:
              </label>
              <select
                id="roleSelect"
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                title="Select the role to assume"
              >
                <option disabled value="">
                  Select Role
                </option>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold text-white mb-1"
                htmlFor="tempInput"
              >
                Temperature:
              </label>
              <input
                id="tempInput"
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                className="input input-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                placeholder="0.1 – 1.0"
                title="Set temperature for model creativity"
              />
            </div>
          </div>

          {/* Chains Button */}
          <div className="flex gap-2">
            <label
              onClick={() => {
                const el = document.getElementById("chainModal");
                if (el instanceof HTMLDialogElement && !el.open) {
                  el.showModal();
                }
              }}
              className="btn btn-sm btn-accent w-full rounded-lg"
              title="Open chain editor"
            >
              ⚙️ Chains
            </label>
          </div>
        </div>
      </Modal>

      {/* Small Modal end*/}

      {/* Original layout for larger screens */}
      <div className="hidden sm:flex flex-wrap gap-2 w-full">
        <select
          disabled={cml && amod===""}
          className="select select-sm bg-gray-800/80 text-white w-full sm:w-28 rounded-lg"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option disabled value="">
            Model
          </option>
          {models.map((v, i) => (
            <option key={i} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
        disabled={cml && amod===""}
          className="select select-sm bg-gray-800/80 text-white w-full sm:w-28 rounded-lg"
          value={Mode}
          onChange={(e) => {
            setChatHistory([]);
            setChains({});
            setMode(e.target.value);
          }}
        >
          <option disabled value="">
            Mode
          </option>
          {all_mode.map((v, i) => (
            <option key={i} value={v}>
              {v}
            </option>
          ))}
        </select>
          
        <select
          disabled={Mode === "Analytical" || (cml && amod==="")}
          className="select select-sm bg-gray-800/80 text-white w-full sm:w-28 rounded-lg"
          value={selectedCharacter}
          onChange={(e) => {
            setSelectedCharacter(e.target.value);
            setChatHistory([]);
            setChains({});
          }}
        >
          <option value="">Character</option>
          {characters.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="select select-sm bg-gray-800/80 text-white w-full sm:w-28 rounded-lg"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option disabled value="">
            Role
          </option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <input
          type="number"
          step="0.1"
          min="0.1"
          max="1"
          className="input input-sm bg-gray-800/80 text-white w-full sm:w-24 rounded-lg"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          placeholder="Temp"
          title="Set temperature (0.1–1.0)"
        />
        <label
          onClick={() => {
            const el = document.getElementById("chainModal");
            if (el instanceof HTMLDialogElement && !el.open) {
              el.showModal();
            }
          }}
          className="btn btn-sm btn-accent w-full sm:w-28 rounded-lg"
        >
          ⚙️ Chains
        </label>
        <button
          className="btn btn-sm btn-primary shrink-0 "
          onClick={() => {
            document.getElementById("del_chat_modal").showModal();
          }}
        >
          <TrashIcon width={22} height={22} />
        </button>
        <button
          className="btn btn-square btn-sm btn-primary"
          onClick={() => dispatch(showCustModelModam(true))}
          title="Open Local Model"
        >
       <Bars3BottomLeftIcon width={16} height={16} />
        </button>
      </div>
      <ConfirmModal
        id="del_chat_modal"
        message="Are you sure you want to delete all chat history"
        title="Delete Chat History"
        onConfirm={() => {
          setChatHistory([]);
        }}
      />
      <CustomModelMenu mid="cmod" />
      {/* Original layout for larger screens end */}
    </>
  );
};
