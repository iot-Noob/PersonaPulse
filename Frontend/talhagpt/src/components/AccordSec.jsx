import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TrashIcon, Cog6ToothIcon } from "@heroicons/react/16/solid";
import MessageModal from "./ConfirmModal";
import ConfirmModal from "./ConfirmModal";
import { useDispatch } from "react-redux";
import { exit, enter } from "../Redux/mouseSlice";
import Drawer from "./Drawer";
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
  let Sdo = useRef(true);
  let dispatch = useDispatch();
  const checkboxRef = useRef(null);
  const cmr = useRef(null);
  const MouseIn = useSelector((state) => state.mouseenter.value);
  useEffect(() => {
    if (MouseIn && checkboxRef.current) {
      checkboxRef.current.checked = false;
      dispatch(exit());
    }
  }, [MouseIn]);

  return (
    <>
      {/* Accordion for small screens */}
      <div
        className="block sm:hidden w-full h-auto"
        title="Other options like select model, role etc"
      >
<div className="block sm:hidden w-full">
  <button
    className="btn btn-square btn-sm btn-primary !m-0 !p-0 w-8 h-8"
    onClick={() => {
      Sdo.current.checked = !Sdo.current.checked;
    }}
    title="Chat Settings"
  >
    <Cog6ToothIcon width={16} height={16} className="inline-block align-middle" />
  </button>
</div>


      </div>

      <Drawer drawerId="drwr" title="Chat Settings" sdo={Sdo}>
        <div className="collapse collapse-arrow bg-gray-800/90 text-white rounded-lg border border-gray-700">
          <input type="checkbox" ref={checkboxRef} />
          <div className="collapse-title text-lg font-medium">⚙️ Options</div>
          <div className="collapse-content bg-gray-900/90 p-2 rounded-b-lg">
            <div className="flex flex-wrap gap-2 w-full">
              <select
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option disabled value="" title="Model name you want to chosoe">
                  Model
                </option>
                {models.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
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
                disabled={Mode === "Analytical"}
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={selectedCharacter}
                onChange={(e) => {
                  setSelectedCharacter(e.target.value);
                  setChatHistory([]);
                  setChains({});
                }}
              >
                <option value="">No Character</option>

                {characters.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
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
                className="input input-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                placeholder="Temp"
                title="Set temperature (0.1–1.0)"
              />

              <label
                htmlFor="chainModal"
                className="btn btn-sm btn-accent w-full rounded-lg"
              >
                ⚙️ Chains
              </label>
              <button
                className="btn btn-sm btn-primary shrink-0 w-full"
                onClick={() =>
                  document.getElementById("del_chat_modal").showModal()
                }
              >
                <TrashIcon width={22} height={22} />
              </button>
            </div>
          </div>
        </div>
      </Drawer>
      {/* Small Accordion end */}

      {/* Original layout for larger screens */}
      <div className="hidden sm:flex flex-wrap gap-2 w-full">
        <select
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
          disabled={Mode === "Analytical"}
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
          htmlFor="chainModal"
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
      </div>
      <ConfirmModal
        id="del_chat_modal"
        message="Are you sure you want to delete all chat history"
        title="Delete Chat History"
        onConfirm={() => {
          setChatHistory([]);
        }}
      />
      {/* Original layout for larger screens end */}
    </>
  );
};
