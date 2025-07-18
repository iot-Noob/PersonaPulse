// components/EChartsRenderer.jsx
import React from "react";
import ReactECharts from "echarts-for-react";

const EChartsRenderer = ({ option }) => {
  return (
    <div className="my-4 border border-base-300 rounded p-2 bg-base-100">
      <ReactECharts option={option} style={{ height: "400px", width: "500%" }} />
    </div>
  );
};

export default EChartsRenderer;
