import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import ChatWindow from "../components/ChatWindow";
import { TextInputBox } from "../components/TextInputBox";
import { AccordSec } from "../components/AccordSec";
import ChainModal from "../components/chainModal";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

const MainPage = () => {
  const [models, setModels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
  const [selectedRole, setSelectedRole] = useState("user");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chains, setChains] = useState({});
  const [selectedChain, setSelectedChain] = useState(null);
  const [newChainName, setNewChainName] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [temperature, setTemperature] = useState(0.0);
  const [Mode, setMode] = useState("Prompt");
  const all_mode = ["Analytical", "Prompt"];
  const chatEndRef = useRef(null);
  const sref = useRef(null);
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    try {
      axios
        .get(`${API_BASE_URL}/get_model`)
        .then((res) => setModels(res?.data?.models))
        .catch(console.error);
      axios
        .get(`${API_BASE_URL}/get_role`)
        .then((res) => setRoles(res?.data?.Roles))
        .catch(console.error);
      axios
        .get(`${API_BASE_URL}/characters`)
        .then((res) => setCharacters(res?.data?.characters))
        .catch(console.error);
    } catch (err) {
      console.error(`Error occur fetch data due to `,err);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    sref.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!selectedModel || !selectedRole) {
      setError("Model and Role are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const chainKeys = Object.keys(chains);
      const historyAsPrompt = chatHistory
        .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
        .join("\n");
      const finalPrompt = ` \n${historyAsPrompt}\nuser: ${prompt}`;

      if (chainKeys.length === 0) {
        if (Mode === "Prompt") {
          const res = await axios.post(
            `${API_BASE_URL}/simple_prompt`,
            { prompt: finalPrompt },
            {
              params: {
                role: selectedRole,
                model: selectedModel,
                character: selectedCharacter || null,
                temperature,
              },
            }
          );

          setResponse(res.data.response);
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

          setResponse(res);
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
              model: selectedModel,
              system: {
                role: selectedRole,
                prompt: finalPrompt,
              },
              chain: [data],
            },
            {
              params: { temperature: temp, character: selectedCharacter },
            }
          )
        );

        const results = await Promise.all(promises);
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
      setLoading(false);
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
      [cname]: { temperature: 0.3, items: [{ prompt: "", role: "system" }] },
    });
    setSelectedChain(cname);
    setError("");
  };

  const updateChainItem = (chainName, index, field, value) => {
    const updatedItems = [...chains[chainName].items];
    updatedItems[index][field] = value;
    setChains({
      ...chains,
      [chainName]: { ...chains[chainName], items: updatedItems },
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
    delete newChains[chainName];
    setChains(newChains);
    if (selectedChain === chainName) setSelectedChain(null);
  };

  return (
    <>
      <div className=" min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white font-sans flex flex-col">
        <div className="max-w-4xl mx-auto px-4 py-6 w-full flex flex-col flex-grow mt-[30px] ">
          <ChatWindow
            Mode={Mode}
            sref={sref}
            chatHistory={chatHistory}
            chatEndRef={chatEndRef}
          />

          <div className="sticky bottom-0  z-10 py-4">
            <div className="bg-gray-800/70 p-4 rounded-2xl space-y-3">
              {/* Message input and Send button (Same row) */}

              <TextInputBox
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                loading={loading}
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
                selectedRole={selectedRole}
                roles={roles}
                temperature={temperature}
                setTemperature={setTemperature}
              />
            </div>

            {error && (
              <div className="alert alert-error shadow-lg mt-2">{error}</div>
            )}
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
