import React from "react";
import { LinkIcon, TrashIcon } from "@heroicons/react/16/solid";
import ConfirmModal from "./ConfirmModal";
 
const ChainModal = ({
  chains,
  setError,
  setChains,
  removeChain,
  updateChainItem,
  roles,
  addNewChain,
}) => {
  return (
    <>
      <input type="checkbox" id="chainModal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-full sm:w-11/12 max-w-4xl px-3 sm:px-6 py-4 bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Chain Configuration</h3>
            <label
              htmlFor="chainModal"
              className="btn btn-sm btn-circle btn-error"
            >
              ✕
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {Object.entries(chains).map(([chainName, chainData]) => {
              const items = chainData.items;
              const temp = chainData.temperature;
              return (
                <div
                  key={chainName}
                  className="flex flex-col sm:flex-row sm:flex-wrap gap-4"
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
                        title="role you want to send prompt as user system assistant"
                          className="select select-xs bg-gray-800/80 text-white border-none w-24"
                          value={item.role}
                          onChange={(e) =>
                            updateChainItem(
                              chainName,
                              idx,
                              "role",
                              e.target.value
                            )
                          }
                        >
                          <option disabled value="" title="role" >
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
                        title="enter your chain prompt"
                          className="input input-sm bg-gray-800 text-white placeholder-gray-400 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-primary"
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
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <button onClick={addNewChain} className="btn btn-sm btn-accent" title="Add Chain"> 
              <LinkIcon width={20}/>
          
            </button>
              <button  className="btn btn-sm btn-error ml-2" onClick={()=>document.getElementById("dcm").showModal()} title="remove all chains">
              <TrashIcon width={20}/>
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal message="Do you want to delete all chains" id="dcm" title="Delete Chains" onConfirm={()=>{
              setChains({});
      
      }}/>
    </>
  );
};

export default ChainModal;
