import React from "react";

const Drawer = ({ drawerId = "my-drawer", title = "Drawer", children , sdo}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="drawer drawer-end z-50">
      <input id={drawerId} type="checkbox" className="drawer-toggle" ref={sdo}/>

      <div className="drawer-side" >
        <label htmlFor={drawerId} className="drawer-overlay"></label>

        <div className="menu p-4 w-80 min-h-full bg-[#192332] text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b border-[#2c3b4f] pb-2">
            <h2 className="text-lg font-bold">{title}</h2>
            <label htmlFor={drawerId} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-[#2c3b4f]">
              ✕
            </label>
          </div>

          {/* Children + dividers */}
          <div className="overflow-y-auto space-y-4">
            {childrenArray.map((child, index) => (
              <div key={index}>
                {child}
                <hr className="mt-4 border-[#2c3b4f]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
