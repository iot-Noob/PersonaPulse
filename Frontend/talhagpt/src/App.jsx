import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000/api";

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

  useEffect(() => {
    axios.get(`${API_BASE_URL}/get_model`).then((res) => setModels(res.data));
    axios.get(`${API_BASE_URL}/get_role`).then((res) => setRoles(res.data));
    axios.get(`${API_BASE_URL}/characters`).then((res) => setCharacters(res.data));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/simple_prompt`, {
        prompt,
        role: selectedRole,
        character: selectedCharacter,
        model: selectedModel,
      });
      setResponse(res.data.response);
    } catch (err) {
      setError("Failed to fetch response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="navbar bg-base-100 mb-4">
        <a className="btn btn-ghost text-xl">Groq Prompt UI</a>
        <select
          className="select select-bordered ml-auto"
          onChange={(e) => setSelectedModel(e.target.value)}
          value={selectedModel}
        >
          <option disabled value="">Select Model</option>
          {models.map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          className="select select-bordered"
          onChange={(e) => setSelectedRole(e.target.value)}
          value={selectedRole}
        >
          <option disabled value="">Select Role</option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>

        <select
          className="select select-bordered"
          onChange={(e) => setSelectedCharacter(e.target.value)}
          value={selectedCharacter}
        >
          <option disabled value="">Select Character</option>
          {characters.map((char) => (
            <option key={char}>{char}</option>
          ))}
        </select>

        <input
          type="text"
          className="input input-bordered"
          placeholder="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button className="btn btn-primary w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? <span className="loading loading-spinner"></span> : "Submit Prompt"}
      </button>

      {error && <div className="alert alert-error mt-4">{error}</div>}

      {response && (
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h2 className="card-title">AI Response</h2>
            <p>{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
