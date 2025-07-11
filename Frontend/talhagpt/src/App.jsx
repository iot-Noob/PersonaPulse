import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

function App() {
  const [models, setModels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chains, setChains] = useState({});
  const [selectedChain, setSelectedChain] = useState(null);
  const [newChainName, setNewChainName] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/get_model`)
      .then((res) => setModels(res?.data?.models))
      .catch((err) => console.error("Error getting models", err));

    axios.get(`${API_BASE_URL}/get_role`)
      .then((res) => setRoles(res?.data?.Roles))
      .catch((err) => console.error("Error getting roles", err));

    axios.get(`${API_BASE_URL}/characters`)
      .then((res) => setCharacters(res?.data?.characters))
      .catch((err) => console.error("Error getting characters", err));
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

      if (chainKeys.length === 0) {
        const res = await axios.post(
          `${API_BASE_URL}/simple_prompt`,
          { prompt },
          {
            params: {
              role: selectedRole,
              model: selectedModel,
              character: selectedCharacter || null,
              temperature: 0.3,
            },
          }
        );
        setResponse(res.data.response);
        setChatHistory((prev) => [...prev, { user: prompt, bot: res.data.response }]);
      } else {
        const chainSteps = {};

        chainKeys.forEach((key) => {
          chains[key].forEach((item) => {
            const stepName = key;
            chainSteps[stepName] = {
              role: item.role,
              prompt: item.prompt,
            };
          });
        });

        const payload = {
          model: selectedModel,
          system: {
            role: selectedRole,
            prompt: prompt,
          },
          chain: [chainSteps],
        };

        const res = await axios.post(`${API_BASE_URL}/chain_response`, payload);
        setResponse(res.data.response);
        setChatHistory((prev) => [...prev, { user: prompt, bot: res.data.response }]);
      }

      setPrompt(""); // clear after submit
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch response");
    } finally {
      setLoading(false);
    }
  };

  const addNewChain = () => {
    if (!newChainName.trim()) {
      setError("Chain name cannot be empty.");
      return;
    }
    if (chains[newChainName]) {
      setError("Chain name already exists.");
      return;
    }
    setChains({
      ...chains,
      [newChainName]: [{ prompt: "", role: "" }],
    });
    setSelectedChain(newChainName);
    setNewChainName("");
    setError("");
  };

  const updateChainItem = (chainName, index, field, value) => {
    const updatedChain = [...chains[chainName]];
    updatedChain[index][field] = value;
    setChains({ ...chains, [chainName]: updatedChain });
  };

  const removeChainItem = (chainName, index) => {
    const updatedChain = [...chains[chainName]];
    updatedChain.splice(index, 1);
    setChains({ ...chains, [chainName]: updatedChain });
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
        <input
          type="text"
          placeholder="New chain name"
          className="input input-sm input-bordered text-black"
          value={newChainName}
          onChange={(e) => setNewChainName(e.target.value)}
        />
        <button className="btn btn-sm btn-accent" onClick={addNewChain}>
          ➕ Add Chain
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(chains).map(([chainName, items]) => (
          <div key={chainName} className="flex flex-col bg-slate-800 rounded-xl p-2 max-w-sm text-xs shadow-md">
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
              <button className="text-red-400 hover:text-red-600" onClick={() => removeChain(chainName)}>✕</button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-700 text-white rounded-full px-2 py-1 flex items-center gap-1 hover:bg-gray-600">
                  <select
                    className="select select-xs bg-transparent text-xs text-white border-none"
                    value={item.role}
                    onChange={(e) =>
                      updateChainItem(chainName, idx, "role", e.target.value)
                    }
                  >
                    <option disabled value="">Role</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <input
                    className="bg-transparent border-none outline-none w-28 text-xs"
                    value={item.prompt}
                    onChange={(e) =>
                      updateChainItem(chainName, idx, "prompt", e.target.value)
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
        ))}
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <div className="chat chat-end">
              <div className="chat-bubble bg-base-200 text-black text-sm max-w-xl">
                {chat.user}
              </div>
            </div>
            <div className="chat chat-start">
              <div className="chat-bubble bg-primary text-white text-sm max-w-xl">
                {chat.bot}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4">
        <div className="flex items-end gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="input input-lg input-bordered flex-1 text-black"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="dropdown dropdown-top dropdown-end">
            <label tabIndex={0} className="btn btn-outline">⚙️</label>
            <ul tabIndex={0} className="dropdown-content menu p-4 shadow-lg bg-white text-black rounded-box w-72 space-y-4">
              <li>
                <label className="text-xs font-bold px-2">Model</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option disabled value="">Select Model</option>
                  {Array.isArray(models) &&
                    models.map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                </select>
              </li>
              <li>
                <label className="text-xs font-bold px-2">Character</label>
                <select
                  disabled={Object.keys(chains).length > 0}
                  className="select select-bordered w-full"
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                >
                  <option disabled value="">Select Character</option>
                  {characters.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </li>
              <li>
                <label className="text-xs font-bold px-2">Role</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option disabled value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </li>
            </ul>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
        {error && <div className="alert alert-error mt-4 shadow-lg">{error}</div>}
      </div>
    </div>
  );
}

export default App;
