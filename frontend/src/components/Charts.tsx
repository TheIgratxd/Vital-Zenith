import React from "react";
import "./Charts.css";

interface ChartData {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  color?: string;
  loading?: boolean;
  error?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  data,
  color = "#4f46e5",
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-no-data">No hay datos disponibles</div>
      </div>
    );
  }

  // Calculate SVG path
  const width = 600;
  const height = 250;
  const padding = 40;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  const xStep = (width - padding * 2) / (data.length - 1);
  const yRange = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + i * xStep;
    const y =
      height -
      padding -
      ((d.value - minValue) / (maxValue - minValue)) * yRange;
    return { x, y, value: d.value };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <div className="chart-title">{title}</div>
          {subtitle && <div className="chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="line-chart">
        <svg
          className="line-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              className="line-chart-grid"
              x1={padding}
              y1={padding + (i * yRange) / 4}
              x2={width - padding}
              y2={padding + (i * yRange) / 4}
            />
          ))}

          {/* Area */}
          <path className="line-chart-area" d={areaD} fill={color} />

          {/* Line */}
          <path className="line-chart-path" d={pathD} stroke={color} />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
          ))}
        </svg>
      </div>
    </div>
  );
};

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  loading?: boolean;
  error?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            {subtitle && <div className="chart-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="chart-no-data">No hay datos disponibles</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <div className="chart-title">{title}</div>
          {subtitle && <div className="chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-item">
            <div
              className="bar-chart-bar"
              style={{
                height: `${(item.value / maxValue) * 200}px`,
              }}
              title={`${item.label || item.date}: ${item.value}`}
            />
            <div className="bar-chart-label">
              {item.label || item.date.split("-").slice(1).join("/")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface WidgetCardProps {
  title: string;
  value: string;
  icon: string;
  type: "health" | "weather";
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  value,
  icon,
  type,
}) => {
  return (
    <div className="widget-card">
      <div className={`widget-icon ${type}`}>{icon}</div>
      <div className="widget-content">
        <div className="widget-title">{title}</div>
        <div className="widget-value">{value}</div>
      </div>
    </div>
  );
};
