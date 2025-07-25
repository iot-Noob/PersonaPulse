 import React,{useRef,useEffect} from 'react'
 import { useSelector } from 'react-redux';
 
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
    setTemperature

 }) => {
    const checkboxRef = useRef(null);
 
  const MouseIn=useSelector(state=>state.mouseenter.value)
    useEffect(() => {
    if (MouseIn && checkboxRef.current) {
      checkboxRef.current.checked = false;
    }
  }, [MouseIn]);
   return (
      <>
      
            {/* Accordion for small screens */}

            <div className="block sm:hidden w-full">
              <div  className="collapse collapse-arrow bg-gray-800/90 text-white rounded-lg border border-gray-700">
                <input type="checkbox" ref={checkboxRef}  />
                <div className="collapse-title text-lg font-medium"  >
                  ⚙️ Options
                </div>
                <div className="collapse-content bg-gray-900/90 p-2 rounded-b-lg">
                  <div className="flex flex-wrap gap-2 w-full">
                    <select
                      className="select select-sm bg-gray-800/80 text-white w-full rounded-lg border-none"
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
                      <option disabled value="">
                        Character
                      </option>
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
                      onChange={(e) =>
                        setTemperature(parseFloat(e.target.value))
                      }
                      placeholder="Temp"
                      title="Set temperature (0.1–1.0)"
                    />

                    <label
                      htmlFor="chainModal"
                      className="btn btn-sm btn-accent w-full rounded-lg"
                    >
                      ⚙️ Chains
                    </label>
                  </div>
                </div>
              </div>
            </div>
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
                <option disabled value="">
                  Character
                </option>
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
            </div>

                 {/* Original layout for larger screens end */}
      </>
   )
 }
 