import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import { TextInputBox } from "../components/TextInputBox";
import { AccordSec } from "../components/AccordSec";
import ChainModal from "../components/chainModal";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "../Redux/mouseSlice";
import { getAiModels, setSettings } from "../Redux/dataSlice";
import { toast } from "react-toastify";

const AI_API = import.meta.env.VITE_API_AI;

const CustomModelPage = () => {
  const dispatch = useDispatch();

  const [models, setModels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedModel, setSelectedModel] = useState("Llama-3");
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

  useEffect(() => {
    if (!loadedRef.current) {
      const saved = localStorage.getItem("chatHistory2");
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("chatHistory2", JSON.stringify(chatHistory));
    }, 300);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes] = await Promise.all([
          axios.get(`${AI_API}/models`)
        ]);

        const sortedModels = (modelsRes?.data || []).sort((a, b) =>
          a.file_name.localeCompare(b.file_name)
        );
        setModels(sortedModels.map(m => m.file_name));
        dispatch(getAiModels(sortedModels));
      } catch (err) {
        console.error("❌ Error fetching AI models:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Mode === "Prompt") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      sref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, Mode]);

  const handleSubmit = async () => {
    if (!selectedModel || !prompt) {
      setError("Model and prompt are required.");
      return;
    }

    dispatch(startLoading());
    setError("");

    try {
      const historyAsPrompt = chatHistory
        .map(({ user, bot }) => `user: ${user}\nassistant: ${bot}`)
        .join("\n");
      const finalPrompt = `${historyAsPrompt}\nuser: ${prompt}`;

      const res = await axios.post(
        `${AI_API}/chat?model=${selectedModel}&stream=false`,
        {
          info: {
            max_tokens: 256,
            temperature,
            top_p: 0.9,
            top_k: 50,
          },
          chat: {
            prompt: finalPrompt,
          },
        }
      );

      setResponse(res.data.response);
      setChatHistory((prev) => [
        ...prev,
        { user: prompt, bot: res.data.response },
      ]);
      setPrompt("");
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch response");
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white font-sans flex flex-col overflow-x-hidden">
      <div className="w-full max-w-4xl xl:max-w-6xl 2xl:max-w-[60%] mx-auto px-4 py-6 flex flex-col flex-grow mt-[13px]">
        <ChatWindow Mode={Mode} sref={sref} chatHistory={chatHistory} chatEndRef={chatEndRef} />

        <div className="sticky bottom-0 z-10 py-0">
          <div className="bg-gray-800/70 p-4 rounded-2xl space-y-3">
            <TextInputBox setPrompt={setPrompt} handleSubmit={handleSubmit} prompt={prompt} />
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
      </div>
    </div>
  );
};

export default CustomModelPage;
