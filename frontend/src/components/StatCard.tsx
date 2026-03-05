import React from "react";
import "./StatCard.css";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  iconType: "temperature" | "heart" | "oxygen" | "pressure";
  trend?: "positive" | "negative" | "neutral";
  trendValue?: string;
  loading?: boolean;
  error?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconType,
  trend,
  trendValue,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="stat-card-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stat-card">
        <div className="stat-card-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <div className="stat-card-title">{title}</div>
        </div>
        <div className={`stat-card-icon ${iconType}`}>{icon}</div>
      </div>

      <div className="stat-card-value">
        {value}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>

      {(trend || trendValue) && (
        <div className="stat-card-footer">
          {trend && trendValue && (
            <span className={`stat-card-trend ${trend}`}>
              {trend === "positive" && "↑"}
              {trend === "negative" && "↓"}
              {trend === "neutral" && "→"}
              {trendValue}
            </span>
          )}
          <span className="stat-card-since">desde último mes</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
