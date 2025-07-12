import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

function App() {
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
  const [temperature, setTemperature] = useState(0.3);

  const chatEndRef = useRef(null);

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
      console.error(`Error occur fetch data due to `.err);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      // Build prompt from chat history
      const historyAsPrompt =
        chatHistory
          .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
          .join("\n") + `\nuser: ${prompt}`;

      if (chainKeys.length === 0) {
        const res = await axios.post(
          `${API_BASE_URL}/simple_prompt`,
          { prompt: historyAsPrompt },
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

        const promises = chainPayloads.map(({ data, temp }) =>
          axios.post(
            `${API_BASE_URL}/chain_response`,
            {
              model: selectedModel,
              system: {
                role: selectedRole,
                prompt: historyPrompt, // ✅ history injected
              },
              chain: [data],
            },
            {
              params: { temperature: temp },
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
    // Automatically generate a new unique chain name like "step1", "step2", etc.
    let idx = 1;
    let cname;
    do {
      cname = `step${idx++}`;
    } while (chains[cname]);

    // No need to use setNewChainName here unless you need it somewhere else
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-4 font-sans">
      <div className="mb-3 flex gap-2 items-center">
        {/* <input
          type="text"
          placeholder="New chain name"
          className="input input-sm input-bordered text-black"
          value={newChainName}
          onChange={(e) => setNewChainName(e.target.value)}
        /> */}
        <button className="btn btn-sm btn-accent" onClick={addNewChain}>
          ➕ Add Chain
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(chains).map(([chainName, chainData]) => {
          const items = chainData.items;
          const temp = chainData.temperature;
          return (
            <div
              key={chainName}
              className="flex flex-col bg-slate-800 rounded-xl p-2 max-w-sm text-xs shadow-md"
            >
              <div className="flex justify-between items-center">
                <input
                  className="bg-transparent font-semibold truncate max-w-[200px] outline-none text-white text-sm"
                  value={chainName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    if (chains[newName] && newName !== chainName) {
                      setError("Chain name already exists.");
                      return;
                    }
                    const newChains = { ...chains };
                    newChains[newName] = newChains[chainName];
                    delete newChains[chainName];
                    setChains(newChains);
                  }}
                />
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => removeChain(chainName)}
                >
                  ✕
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                value={temp}
                onChange={(e) =>
                  setChains({
                    ...chains,
                    [chainName]: {
                      ...chainData,
                      temperature: parseFloat(e.target.value),
                    },
                  })
                }
                className="input input-xs mt-1 bg-gray-800 text-white w-24"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 text-white rounded-full px-2 py-1 flex items-center gap-1 hover:bg-gray-600"
                  >
                    <select
                      className="select select-xs bg-gray-800/80 text-xs text-white border-none"
                      value={item.role}
                      onChange={(e) =>
                        updateChainItem(chainName, idx, "role", e.target.value)
                      }
                    >
                      <option disabled value="">
                        Role
                      </option>
                      {roles.map((r) => (
                        <option key={r} value={r} className="bg-gray-800">
                          {r}
                        </option>
                      ))}
                    </select>
                    <input
                      className="bg-transparent border-none outline-none w-28 text-xs"
                      value={item.prompt}
                      onChange={(e) =>
                        updateChainItem(
                          chainName,
                          idx,
                          "prompt",
                          e.target.value
                        )
                      }
                      placeholder="Prompt"
                    />
                    <button
                      className="ml-1 text-red-300 hover:text-red-500"
                      onClick={() => removeChainItem(chainName, idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <div className="chat chat-end">
              <div className="chat-bubble bg-base-200 text-black text-sm max-w-xl">
                {chat.user}
              </div>
            </div>
            {/* <div className="chat chat-start">
              <div className="chat-bubble bg-primary text-white text-sm max-w-xl">
                {chat.bot}
              </div>
            </div> */}
            <div className="chat chat-start">
              <div className="chat-bubble bg-primary text-white text-sm max-w-xl">
                <TypeAnimation
                  sequence={[chat.bot]}
                  speed={99}
                  wrapper="span"
                  cursor={false}
                />
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2 bg-gray-800/50 p-4 rounded-2xl items-end">
          <textarea
            placeholder="Type your message..."
            className="input input-lg input-bordered flex-1 bg-gray-800/80 text-white resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <select
            className="select select-bordered bg-gray-800/80 text-white"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option disabled value="">
              Model
            </option>
            {models.map((v, i) => (
              <option key={i} value={v} className="bg-gray-800">
                {v}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered bg-gray-800/80 text-white"
            value={selectedCharacter}
            disabled={Object.keys(chains).length > 0}
            onChange={(e) => {
              setSelectedCharacter(e.target.value);
              setChatHistory([]);
            }}
          >
            <option disabled value="">
              Character
            </option>
            {characters.map((c) => (
              <option key={c} className="bg-gray-800">
                {c}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered bg-gray-800/80 text-white"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
            }}
          >
            <option disabled value="">
              Role
            </option>
            {roles.map((r) => (
              <option key={r} className="bg-gray-800">
                {r}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="1"
            className="input input-bordered w-28 bg-gray-800/80 text-white"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            placeholder="Temp (0.1-1)"
            title="Set temperature (0.1–1.0)"
          />
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
        {error && (
          <div className="alert alert-error shadow-lg mt-2">{error}</div>
        )}
      </div>
    </div>
  );
}

export default App;
