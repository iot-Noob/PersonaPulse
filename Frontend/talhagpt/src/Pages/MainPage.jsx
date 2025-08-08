import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import { TextInputBox } from "../components/TextInputBox";
import { AccordSec } from "../components/AccordSec";
import ChainModal from "../components/chainModal";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading, exit } from "../Redux/mouseSlice";
import { getAiModels, setSettings, api_data } from "../Redux/dataSlice";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;
// const AI_API = import.meta.env.VITE_API_AI;

const MainPage = () => {
  const dispatch = useDispatch();

  const [models, setModels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
  const [selectedRole, setSelectedRole] = useState("user");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [chains, setChains] = useState({});
  const [selectedChain, setSelectedChain] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [temperature, setTemperature] = useState(0.2);
  const [Mode, setMode] = useState("Prompt");
  const all_mode = ["Analytical", "Prompt"];
  const chatEndRef = useRef(null);
  const sref = useRef(null);
  const loadedRef = useRef(false);
  let amod = useSelector((state) => state.dataslice.activate_model);
  const localModelEnabled = useSelector((state) =>
    Boolean(state.dataslice.localModelActive)
  );

  useEffect(() => {
    if (!loadedRef.current) {
      const saved = localStorage.getItem("chatHistory");
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
      loadedRef.current = true;
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }, 300);

    return () => clearTimeout(timer);
  }, [chatHistory]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/get_model?use_local=${localModelEnabled}`),
          axios.get(`${API_BASE_URL}/get_role`),
          axios.get(`${API_BASE_URL}/characters`),
        ]);

        if (results[0].status === "fulfilled") {
          const sortedModels = (results[0].value?.data?.models || []).sort(
            (a, b) => a.localeCompare(b)
          );
          setModels(sortedModels);
        } else {
          console.error("Error fetching models:", results[0].reason);
          toast.error(
            `Error ${results[0].status}\n\nError fetch model due to ${results[0].reason}`
          );
        }

        if (results[1].status === "fulfilled") {
          const sortedRoles = (results[1].value?.data?.Roles || []).sort(
            (a, b) => a.localeCompare(b)
          );
          setRoles(sortedRoles);
        } else {
          console.error("Error fetching roles:", results[1].reason);
          toast.error(
            `Error ${results[1].status}\n\nError fetch model due to ${results[1].reason}`
          );
        }

        if (results[2].status === "fulfilled") {
          const sortedCharacters = (
            results[2].value?.data?.characters || []
          ).sort((a, b) => a.localeCompare(b));
          setCharacters(sortedCharacters);
        } else {
          console.error("Error fetching characters:", results[2].reason);
          toast.error(
            `Error ${results[2].status}\n\nError fetch model due to ${results[2].reason}`
          );
        }
      } catch (err) {
        console.error("❌ Unexpected error fetching data:", err);
        toast.error(`Error occur ${err}`);
      }
    }, 33);

    return () => clearTimeout(timer);
  }, [localModelEnabled]);

  useEffect(() => {
    if (Mode === "Prompt") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      sref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, Mode]);

  const handleSubmit = async () => {
    if (!selectedModel || !selectedRole) {
      setError("Model and Role are required.");
      return;
    }

    dispatch(startLoading());
    setError("");

    try {
      const chainKeys = Object.keys(chains);
      const historyAsPrompt = chatHistory
        .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
        .join("\n");
      const finalPrompt = ` \n${historyAsPrompt}\nuser: ${prompt}`;

      if (chainKeys.length === 0) {
        if (Mode === "Prompt") {
          const params = {
            role: selectedRole,
            model: selectedModel,
            temperature,
            use_local: localModelEnabled,
          };

          // Only include character if it exists
          if (selectedCharacter) {
            params.character = selectedCharacter;
          }
          const res = await axios.post(
            `${API_BASE_URL}/simple_prompt`,
            {
              cms: {
                local_model: localModelEnabled
                  ? selectedModel === "mistral-7b"
                    ? "mistral-7b"
                    : "Llama-3"
                  : "Llama-3",
              },
              prompt: {
                prompt: finalPrompt,
              },
            },
            {
              params: {
                role: selectedRole,
                model: !localModelEnabled ? selectedModel : "llama3-8b-8192", // must be one of the API's enum list
                temperature,
                use_local: localModelEnabled,
                ...(selectedCharacter && { character: selectedCharacter }),
              },
            }
          );

          if (res.status === 200) {
            setResponse(res.data.response);
          } else {
            toast.error(
              `Error ${res.status}\n\n Cant load message response due to ${res.statusText}`
            );
          }
          setChatHistory((prev) => [
            ...prev,
            { user: prompt, bot: res.data.response },
          ]);
        }
        if (Mode == "Analytical") {
          const res = await axios.post(
            `${API_BASE_URL}/echarts`,
            { prompt: finalPrompt },

            {
              params: {
                model: selectedModel,
                temperature,
              },
            }
          );
          if (res.status === 20) {
            setResponse(res);
          } else {
            toast.error(
              `Error ${res.status}\n\n Cant load message response due to ${res.statusText}`
            );
          }

          setChatHistory((prev) => [
            ...prev,
            {
              user: prompt,
              bot: {
                message: res.data.message, // markdown explanation
                echartsOption: res.data, // actual ECharts config
              },
            },
          ]);
        }
      } else {
        const chainPayloads = chainKeys.map((key) => {
          const chainData = chains[key];
          const chainObj = {};
          chainData.items.forEach((item) => {
            chainObj[key] = {
              role: item.role,
              prompt: item.prompt,
            };
          });
          return { data: chainObj, temp: chainData.temperature };
        });

        const historyPrompt =
          chatHistory
            .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
            .join("\n") + `\nuser: ${prompt}`;
        const finalPrompt = ` ${historyAsPrompt}\nuser: ${prompt}`;

        const promises = chainPayloads.map(({ data, temp }) =>
          axios.post(
            `${API_BASE_URL}/chain_response`,
            {
              cms: {
                local_model: localModelEnabled ? selectedModel : "Llama-3", // or pick one dynamically if needed
              },
              creq: {
                model: !localModelEnabled ? selectedModel : "llama3-8b-8192",
                system: {
                  role: selectedRole,
                  prompt: finalPrompt,
                },
                chain: Array.isArray(data) ? data : [data],
              },
            },
            {
              params: {
                temperature: temp,
                character: selectedCharacter,
                custom_prmopt: localModelEnabled,
              },
            }
          )
        );

        const results = await Promise.all(promises);
        for (let r of results) {
          if (r.status !== 200) {
            toast.error(
              `Error ${r.status}\n\n Cannot get chain result due to ${r.statusText}`
            );
          }
        }
        const combinedResponse = results
          .map((res) => res.data.response)
          .join("\n---\n");

        setResponse(combinedResponse);
        setChatHistory((prev) => [
          ...prev,
          { user: prompt, bot: combinedResponse },
        ]);
      }

      setPrompt("");
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch response");
    } finally {
      dispatch(stopLoading());
    }
  };

  const addNewChain = () => {
    let idx = 1;
    let cname;
    do {
      cname = `step${idx++}`;
    } while (chains[cname]);

    setChains({
      ...chains,
      [cname]: { temperature: 0.3, items: [{ prompt: "", role: "user" }] },
    });
    setSelectedChain(cname);
    setError("");
  };

  const updateChainItem = (chainName, idx, field, value) => {
    setChains((prev) => {
      const updatedItems = [...prev[chainName].items];
      updatedItems[idx] = { ...updatedItems[idx], [field]: value };
      return {
        ...prev,
        [chainName]: {
          ...prev[chainName],
          items: updatedItems,
        },
      };
    });
  };

  const removeChainItem = (chainName, index) => {
    const updatedItems = [...chains[chainName].items];
    updatedItems.splice(index, 1);
    setChains({
      ...chains,
      [chainName]: { ...chains[chainName], items: updatedItems },
    });
  };

  const removeChain = (chainName) => {
    const newChains = { ...chains };
    const copied = { ...newChains[chainName] };
    delete newChains[chainName];
    newChains[newName] = copied;
    setChains(newChains);
    if (selectedChain === chainName) setSelectedChain(null);
  };

  let saveTimer = null;

  const debounce_save = (settings, ti = 500) => {
    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem("app:settings", JSON.stringify(settings));
        dispatch(setSettings(settings));
        console.log("✅ Debounced settings saved");
      } catch (err) {
        console.error("❌ Failed to save settings:", err);
      }
    }, ti);
  };
  useEffect(() => {
    const settings = {
      selectedModel,
      selectedRole,
      selectedCharacter,
      chains,
      Mode,
      temperature,
    };
    debounce_save(settings); // saves after 500ms of no changes
  }, [
    selectedModel,
    selectedRole,
    selectedCharacter,
    chains,
    Mode,
    temperature,
  ]);
  useEffect(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem("app:settings"));
      if (savedSettings) {
        if (savedSettings.selectedModel)
          setSelectedModel(savedSettings.selectedModel);
        if (savedSettings.selectedRole)
          setSelectedRole(savedSettings.selectedRole);
        if (savedSettings.selectedCharacter)
          setSelectedCharacter(savedSettings.selectedCharacter);
        if (savedSettings.chains) setChains(savedSettings.chains);
        if (savedSettings.Mode) setMode(savedSettings.Mode);
        if (savedSettings.temperature)
          setTemperature(savedSettings.temperature);
      }
    } catch (err) {
      console.error("❌ Failed to load saved settings:", err);
    }
  }, []);

  return (
    <>
      <div className=" min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white font-sans flex flex-col overflow-x-hidden">
        <div className="w-full max-w-4xl xl:max-w-6xl 2xl:max-w-[60%] mx-auto px-4 py-6 flex flex-col flex-grow mt-[13px]">
          <ChatWindow
            Mode={Mode}
            sref={sref}
            chatHistory={chatHistory}
            chatEndRef={chatEndRef}
          />

          <div className="sticky bottom-0  z-10 py-0">
            <div className="bg-gray-800/70 p-4 rounded-2xl space-y-3">
              {/* Message input and Send button (Same row) */}

              <TextInputBox
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                prompt={prompt}
              />

              {/* Start other options */}

              <AccordSec
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                setChatHistory={setChatHistory}
                setChains={setChains}
                setMode={setMode}
                Mode={Mode}
                all_mode={all_mode}
                selectedCharacter={selectedCharacter}
                setSelectedCharacter={setSelectedCharacter}
                characters={characters}
                setSelectedRole={setSelectedRole}
                selectedRole={selectedRole}
                roles={roles}
                temperature={temperature}
                setTemperature={setTemperature}
              />
            </div>

            {error && toast.error(error)}
          </div>

          <ChainModal
            addNewChain={addNewChain}
            chains={chains}
            removeChain={removeChain}
            roles={roles}
            setChains={setChains}
            setError={setError}
            updateChainItem={updateChainItem}
          />
        </div>
      </div>
    </>
  );
};

export default MainPage;
