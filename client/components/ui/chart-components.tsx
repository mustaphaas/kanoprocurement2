import React from "react";
import {
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Bar as RechartsBar,
  Area as RechartsArea,
  Pie as RechartsPie,
  Cell as RechartsCell,
} from "recharts";

// Wrapper components with explicit props to prevent defaultProps warnings

export const XAxis = React.forwardRef<any, any>((props, ref) => (
  <RechartsXAxis
    ref={ref}
    tick={{ fontSize: 12 }}
    axisLine={true}
    tickLine={true}
    {...props}
  />
));
XAxis.displayName = "XAxis";

export const YAxis = React.forwardRef<any, any>((props, ref) => (
  <RechartsYAxis
    ref={ref}
    tick={{ fontSize: 12 }}
    axisLine={true}
    tickLine={true}
    {...props}
  />
));
YAxis.displayName = "YAxis";

export const CartesianGrid = React.forwardRef<any, any>((props, ref) => (
  <RechartsCartesianGrid
    ref={ref}
    stroke="#e0e0e0"
    horizontal={true}
    vertical={true}
    {...props}
  />
));
CartesianGrid.displayName = "CartesianGrid";

export const Tooltip = React.forwardRef<any, any>((props, ref) => (
  <RechartsTooltip
    ref={ref}
    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
    contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
    {...props}
  />
));
Tooltip.displayName = "Tooltip";

export const Bar = React.forwardRef<any, any>((props, ref) => (
  <RechartsBar ref={ref} radius={[2, 2, 0, 0]} {...props} />
));
Bar.displayName = "Bar";

export const Area = React.forwardRef<any, any>((props, ref) => (
  <RechartsArea ref={ref} connectNulls={false} dot={false} {...props} />
));
Area.displayName = "Area";

export const Pie = React.forwardRef<any, any>((props, ref) => (
  <RechartsPie ref={ref} innerRadius={0} labelLine={false} {...props} />
));
Pie.displayName = "Pie";

export const Cell = RechartsCell;

// Re-export other components that don't have defaultProps issues
export {
  BarChart,
  PieChart,
  AreaChart,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
