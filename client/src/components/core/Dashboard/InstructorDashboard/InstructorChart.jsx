import { useMemo, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Pie } from "react-chartjs-2";

Chart.register(...registerables);

const CHART_COLORS = [
  "rgb(147, 51, 234)",
  "rgb(219, 39, 119)",
  "rgb(239, 68, 68)",
  "rgb(34, 211, 238)",
  "rgb(180, 83, 9)",
  "rgb(251, 146, 60)",
  "rgb(74, 222, 128)",
  "rgb(96, 165, 250)",
  "rgb(244, 114, 182)",
  "rgb(250, 204, 21)",
];

const percentageLabelPlugin = {
  id: "percentageLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    if (!dataset?.data?.length) return;

    const meta = chart.getDatasetMeta(0);
    const total = dataset.data.reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
    if (!total) return;

    meta.data.forEach((element, index) => {
      const value = Number(dataset.data[index]) || 0;
      const percentage = (value / total) * 100;
      if (percentage < 5) return;

      const { x, y } = element.tooltipPosition();
      ctx.save();
      ctx.fillStyle = "#F1F2FF";
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 4;
      ctx.fillText(`${percentage.toFixed(1)}%`, x, y);
      ctx.restore();
    });
  },
};

Chart.register(percentageLabelPlugin);

const buildChartOptions = (totalLabel) => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  layout: {
    padding: 8,
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#AFB2BF",
        boxWidth: 12,
        padding: 10,
        font: { size: 11 },
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce(
            (sum, val) => sum + (Number(val) || 0),
            0
          );
          const value = Number(context.parsed) || 0;
          const pct = total ? ((value / total) * 100).toFixed(1) : 0;
          return `${context.label}: ${value} ${totalLabel} (${pct}%)`;
        },
      },
    },
  },
});

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students");

  const colors = useMemo(
    () =>
      courses?.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]) ?? [],
    [courses]
  );

  const chartDataStudents = useMemo(
    () => ({
      labels: courses?.map((course) => course?.courseName),
      datasets: [
        {
          data: courses?.map((course) => course?.totalStudentsEnrolled ?? 0),
          backgroundColor: colors,
          borderColor: "#1B1F2D",
          borderWidth: 2,
        },
      ],
    }),
    [courses, colors]
  );

  const chartDataIncome = useMemo(
    () => ({
      labels: courses?.map((course) => course?.courseName),
      datasets: [
        {
          data: courses?.map((course) => course?.totalAmountGenerated ?? 0),
          backgroundColor: colors,
          borderColor: "#1B1F2D",
          borderWidth: 2,
        },
      ],
    }),
    [courses, colors]
  );

  const chartOptions = useMemo(
    () =>
      buildChartOptions(
        currChart === "students" ? "students" : "Rs."
      ),
    [currChart]
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md bg-richblack-800 p-6">
      <p className="shrink-0 text-lg font-bold text-richblack-5">Visualize</p>
      <div className="mt-2 shrink-0 space-x-4 font-semibold">
        <button
          type="button"
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>
        <button
          type="button"
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Income
        </button>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="h-[260px] w-full max-w-[280px]">
          <Pie
            data={
              currChart === "students" ? chartDataStudents : chartDataIncome
            }
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
}
