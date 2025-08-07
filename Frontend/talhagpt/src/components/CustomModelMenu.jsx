import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "./Modal";
import { showCustModelModam, loader, activateModel,LocalModelActive } from "../Redux/dataSlice";
import ModalOpenerCloser from "../Helper/ModalOpenerCloser";
import axios from "axios";
import { toast } from "react-toastify";

let API_EP = import.meta.env.VITE_API_ENDPOINT;

const CustomModelMenu = ({ mid = "cmid" }) => {
  const mos = useSelector((state) => state.dataslice.custom_model_modam);
  const dispatch = useDispatch();

  const [localModelEnabled, setLocalModelEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [activatedModel, setActivatedModel] = useState("");
  let [aiModel, setAiModel] = useState([]);
  const handleClose = () => {
    dispatch(showCustModelModam(false));
  };
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      localStorage.setItem("enableModel", JSON.stringify(localModelEnabled));
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout); // cleanup if value changes quickly
  }, [localModelEnabled]);

useEffect(() => {
  const stored = localStorage.getItem("enableModel");
  if (stored !== null) {
    const parsed = JSON.parse(stored);
    setLocalModelEnabled(parsed);
    dispatch(LocalModelActive(parsed)); // ✅ dispatch correct value
  }
}, []);


  useEffect(() => {
    if (mos) {
      ModalOpenerCloser.open_modal(mid);
    } else {
      ModalOpenerCloser.close_modal(mid);
    }
  }, [mos]);
  useEffect(() => {
    let get_cmodel = async () => {
      let res = await axios.get(`${API_EP}/get_aim`);
      setAiModel(res.data);

      // Use res.data directly to find activated model
      const activatedModel = res.data.find((v) => v.activated);
      if (activatedModel) {
        setSelectedModel(activatedModel.model_name);
      }
    };

    get_cmodel();
  }, []);

  useEffect(() => {
    const selected = aiModel.find((v) => v.model_name === selectedModel);
    if (selected?.activated) {
      setActivatedModel(selected.model_name);
      dispatch(activateModel(selected.model_name));
    } else {
      setActivatedModel("");
      dispatch(activateModel(""));
    }
  }, [selectedModel, aiModel]);

  const handel_submit = async () => {
    if (!selectedModel) {
      toast.warn("Model not selected, please choose one");
      return;
    }

    dispatch(loader(true));
    try {
      const res = await axios.post(`${API_EP}/load_model`, {
        loc_mod: selectedModel,
      });

      if (res.status === 200) {
        toast.success("Model loaded successfully");
        dispatch(showCustModelModam(false));
      } else {
        toast.error(`Unexpected status code: ${res.status}`);
      }
    } catch (err) {
      toast.error(
        `Error loading model: ${err.response?.data?.detail || err.message}`
      );
    } finally {
      dispatch(loader(false)); // ✅ Always hide loader, even on error
    }
  };

  const unload_model = async () => {
    try {
      const res = await axios.delete(`${API_EP}/unload_all_models`);

      if (res.status === 200) {
        toast.success(`Model unloaded successfully:\n\n${res.data}`);
      } else {
        toast.error(`Unexpected response: ${res.status}\n\n${res.data}`);
      }
    } catch (err) {
      toast.error(
        `Error unloading model:\n\n${err.response?.data || err.message}`
      );
    }
  };

  const models = ["Llama-3", "Mistral-7B", "Gemma-2B", "CustomGPT"];

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

        <h2 className="text-lg font-bold mb-4">Custom Model Modal</h2>

        {/* Stylish Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={localModelEnabled}
              onChange={() => setLocalModelEnabled(!localModelEnabled)}
            />

            {/* Outer track */}
            <div
              className={`
      w-14 h-8 p-1 rounded-full border duration-300 ease-in-out
      ${
        localModelEnabled
          ? "bg-green-600 border-green-500"
          : "bg-gray-900/80 border-gray-700"
      }
    `}
            >
              {/* Inner knob */}
              <div
                className={`
        w-6 h-6 rounded-full bg-white shadow-md transform duration-300 ease-in-out
        border-2
        ${
          localModelEnabled
            ? "translate-x-6 border-green-500"
            : "translate-x-0 border-red-500"
        }
      `}
              />
            </div>

            <span className="ml-3 text-base">Enable Local Model</span>
          </label>
        </div>

        {/* Dropdown */}
        <div className={`mt-2  rounded-lg p-3`}>
          <label
            htmlFor="model-select"
            className="block mb-2 text-sm font-medium"
          >
            Select Local Model
          </label>
          <select
            disabled={!localModelEnabled}
            id="model-select"
            className="select select-sm bg-gray-900/80 text-white w-full rounded-lg border-none"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="" disabled={!localModelEnabled}>
              Choose a Local model
            </option>

            {aiModel.map((model) => (
              <option
                key={model.model_name}
                value={model.model_name}
                className={`bg-gray-800/90 ${
                  model.activated ? "text-green-400 font-semibold" : ""
                }`}
              >
                {model.activated ? `${model.model_name} *` : model.model_name}
              </option>
            ))}
          </select>
        </div>

        {/* Enable Button */}
        <div className="mt-4 text-right">
          <button
            className={`btn ${activatedModel ? "btn-error" : "btn-primary"}`}
            disabled={!localModelEnabled || !selectedModel}
            onClick={() => {
              activatedModel ? unload_model() : handel_submit();
            }}
          >
            {activatedModel ? "Unload Model" : "Load Model"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomModelMenu;
