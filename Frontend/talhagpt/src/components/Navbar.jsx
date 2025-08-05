import React from 'react'

const Navbar = () => {
  return (
    <>
      <div className="navbar fixed top-0 left-0 w-full bg-gray-950 text-white shadow-md z-[9999]">
        <div className="flex-1">
          <a href="/"   className="btn btn-ghost bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent normal-case text-xl"
>
            <img
              src="/Persona_full.png"
              alt="Persona logo"
              className="w-44 h-auto sm:w-44"
            />
          </a>
        </div>
        {/* Optional: Navbar content on the right side */}
        {/* <div className="flex-none">
          <button className="btn btn-sm btn-outline text-white">Settings</button>
        </div> */}
      </div>
    </>
  )
}

export default Navbar
