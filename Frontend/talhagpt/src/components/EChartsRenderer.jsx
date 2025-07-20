// components/EChartsRenderer.jsx
import React from "react";
import ReactECharts from "echarts-for-react";

const EChartsRenderer = ({ option }) => {
  return (
    <div className="my-4 border border-base-300 rounded p-2 bg-base-100 w-full overflow-x-auto">
      <ReactECharts
        option={option}
        style={{ width: "300%", height: "40vh" }} // Auto scales to 40% of viewport height
        opts={{ renderer: "canvas" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default EChartsRenderer;
