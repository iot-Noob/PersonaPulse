import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
import MarkdownMessage from "./components/MarkdownMessage";
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
  const systemPrompt = `You are a helpful assistant. Format all your responses using Markdown. Use code blocks for code, headers where appropriate, lists for steps, and preserve line breaks in poems. When asked to show a chart, respond with ECharts-compatible JSON option configuration, and clearly label it as ECharts`;

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
      const historyAsPrompt = chatHistory
        .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
        .join("\n");
      const finalPrompt = `system: ${systemPrompt}\n${historyAsPrompt}\nuser: ${prompt}`;

      if (chainKeys.length === 0) {
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
        const finalPrompt = `system: ${systemPrompt}\n${historyAsPrompt}\nuser: ${prompt}`;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white font-sans flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-6 w-full flex flex-col flex-grow">
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
                  {/* <TypeAnimation sequence={[chat.bot]} speed={99} wrapper="span" cursor={false} /> */}
                  <MarkdownMessage content={chat.bot} key={index} />
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="sticky bottom-0  z-10 py-4">
          <div className="bg-gray-800/50 p-4 rounded-2xl space-y-3">
            {/* Message input and Send button (Same row) */}
            <div className="flex gap-2">
              <textarea
                placeholder="Type your message..."
                rows={1}
                className="flex-1 p-3 rounded-xl text-white bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-40 overflow-y-auto"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
              <button
                className="btn btn-sm btn-primary shrink-0"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  "Send"
                )}
              </button>
            </div>

            {/* Options section below */}
            <div className="flex flex-wrap gap-2">
              <select
                className="select select-sm bg-gray-800/80 text-white w-28"
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
                className="select select-sm bg-gray-800/80 text-white w-28"
                value={selectedCharacter}
                onChange={(e) => {
                  setSelectedCharacter(e.target.value);
                  setChatHistory([]);
                }}
              >
                <option disabled value="">
                  Character
                </option>
                {characters.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                className="select select-sm bg-gray-800/80 text-white w-24"
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
                className="input input-sm w-20 bg-gray-800/80 text-white"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                placeholder="Temp"
                title="Set temperature (0.1–1.0)"
              />
              <div className="mb-3 flex gap-2 items-center">
                <label htmlFor="chainModal" className="btn btn-sm btn-accent">
                  ⚙️ Chains
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg mt-2">{error}</div>
          )}
        </div>

        <input type="checkbox" id="chainModal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box w-11/12 max-w-4xl bg-gray-900 text-white overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Chain Configuration</h3>
              <label
                htmlFor="chainModal"
                className="btn btn-sm btn-circle btn-error"
              >
                ✕
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(chains).map(([chainName, chainData]) => {
  const items = chainData.items;
  const temp = chainData.temperature;
  return (
    <div
      key={chainName}
      className="bg-gray-800 rounded-xl p-4 w-full sm:w-[45%] text-xs shadow-md flex flex-col gap-3"
    >
      {/* Chain Header: Name + Delete */}
      <div className="flex justify-between items-center">
        <input
          className="bg-transparent font-semibold truncate outline-none text-white text-sm flex-1"
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
          className="text-red-400 hover:text-red-600 ml-2"
          onClick={() => removeChain(chainName)}
        >
          ✕
        </button>
      </div>

      {/* Each item: Role + Prompt + Remove (Temp on same line) */}
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-gray-700 rounded-lg px-2 py-1 hover:bg-gray-600"
          >
            <select
              className="select select-xs bg-gray-800/80 text-white border-none w-24"
              value={item.role}
              onChange={(e) =>
                updateChainItem(chainName, idx, "role", e.target.value)
              }
            >
              <option disabled value="">
                Role
              </option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
  {idx === 0 && (
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
                className="input input-xs bg-gray-800 text-white w-16"
                title="Temperature"
              />
            )}
            <input
              className="flex-1 bg-transparent border-none outline-none text-white text-xs"
              value={item.prompt}
              onChange={(e) =>
                updateChainItem(chainName, idx, "prompt", e.target.value)
              }
              placeholder="Prompt"
            />

          
 
          </div>
        ))}
      </div>
    </div>
  );
})}

            </div>
            <div className="mt-4">
              <button onClick={addNewChain} className="btn btn-sm btn-accent">
                ➕ Add Chain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
