import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { MonthlyStats, OverviewStats } from '../../types';
import { fmt } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const TOOLTIP = {
  backgroundColor: '#1a1e28',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  bodyColor: '#e8eaf0',
  titleColor: '#6b7280',
  padding: 10,
};

const AXIS = {
  grid: { color: 'rgba(255,255,255,0.04)' },
  ticks: { color: '#6b7280', font: { size: 10, family: 'DM Sans' } },
};

// ── Revenue vs Profit Bar Chart ──────────────────────────────
export function RevenueBarChart({ data }: { data: MonthlyStats[] }) {
  return (
    <Bar
      data={{
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Revenue', data: data.map(d => d.revenue), backgroundColor: 'rgba(0,200,150,0.15)', borderColor: '#00c896', borderWidth: 1.5, borderRadius: 4 },
          { label: 'Profit',  data: data.map(d => d.profit),  backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3b82f6', borderWidth: 1.5, borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        interaction: { mode: 'index' },
        plugins: {
          legend: { display: true, labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 8, padding: 12 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw as number)}` } },
        },
        scales: {
          x: AXIS,
          y: { ...AXIS, ticks: { ...AXIS.ticks, callback: (v) => '$' + (Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'K' : v) } },
        },
      }}
    />
  );
}

// ── Loads per Month Line Chart ───────────────────────────────
export function LoadsLineChart({ data }: { data: MonthlyStats[] }) {
  return (
    <Line
      data={{
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Loads', data: data.map(d => d.loads),
          borderColor: '#00c896', backgroundColor: 'rgba(0,200,150,0.08)',
          tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#00c896',
        }],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` Loads: ${ctx.raw}` } } },
        scales: { x: AXIS, y: { ...AXIS, ticks: { ...AXIS.ticks, callback: v => v } } },
      }}
    />
  );
}

// ── Fuel Cost vs Miles Line Chart ────────────────────────────
export function FuelLineChart({ data }: { data: MonthlyStats[] }) {
  return (
    <Line
      data={{
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Fuel Cost', data: data.map(d => d.fuel),  borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', tension: 0.4, pointRadius: 3, yAxisID: 'y' },
          { label: 'Miles',     data: data.map(d => d.miles), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.4, pointRadius: 3, yAxisID: 'y1' },
        ],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        interaction: { mode: 'index' },
        plugins: {
          legend: { display: true, labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 8, padding: 12 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ctx.datasetIndex === 0 ? ` Fuel: ${fmt(ctx.raw as number)}` : ` Miles: ${(ctx.raw as number).toLocaleString()}` } },
        },
        scales: {
          x: AXIS,
          y:  { ...AXIS, ticks: { ...AXIS.ticks, callback: v => fmt(Number(v)) } },
          y1: { position: 'right', grid: { display: false }, ticks: { color: '#3b82f6', font: { size: 10 }, callback: v => (Number(v) / 1000).toFixed(0) + 'K mi' } },
        },
      }}
    />
  );
}

// ── Load Status Donut ────────────────────────────────────────
export function StatusDonut({ stats }: { stats: OverviewStats }) {
  return (
    <Doughnut
      data={{
        datasets: [{
          data: [stats.delivered, stats.in_transit, stats.booked, stats.cancelled],
          backgroundColor: ['#00c896', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 0, hoverOffset: 4,
        }],
      }}
      options={{
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw?.toLocaleString()}` } },
        },
      }}
    />
  );
}

// ── Drivers Revenue Bar ──────────────────────────────────────
export function DriversBarChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{ data: values, backgroundColor: 'rgba(0,200,150,0.2)', borderColor: '#00c896', borderWidth: 1.5, borderRadius: 4 }],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` Revenue: ${fmt(ctx.raw as number)}` } } },
        scales: { x: AXIS, y: { ...AXIS, ticks: { ...AXIS.ticks, callback: v => fmt(Number(v)) } } },
      }}
    />
  );
}

// ── Dispatchers Revenue/Profit Grouped Bar ───────────────────
export function DispatchersBarChart({ labels, revenues, profits }: { labels: string[]; revenues: number[]; profits: number[] }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          { label: 'Revenue', data: revenues, backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3b82f6', borderWidth: 1.5, borderRadius: 4 },
          { label: 'Profit',  data: profits,  backgroundColor: 'rgba(0,200,150,0.2)',  borderColor: '#00c896', borderWidth: 1.5, borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        interaction: { mode: 'index' },
        plugins: {
          legend: { display: true, labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 8, padding: 12 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw as number)}` } },
        },
        scales: { x: AXIS, y: { ...AXIS, ticks: { ...AXIS.ticks, callback: v => fmt(Number(v)) } } },
      }}
    />
  );
}

// ── Customer Donut ───────────────────────────────────────────
export function CustomerDonut({ labels, values }: { labels: string[]; values: number[] }) {
  const colors = ['#00c896', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return (
    <Doughnut
      data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] }}
      options={{
        cutout: '60%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: '#6b7280', font: { size: 10, family: 'DM Sans' }, boxWidth: 8, padding: 10 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw} loads` } },
        },
      }}
    />
  );
}

// ── Cost Stacked Bar ─────────────────────────────────────────
export function CostStackedBar({ data }: { data: MonthlyStats[] }) {
  return (
    <Bar
      data={{
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Profit',     data: data.map(d => d.profit),     backgroundColor: 'rgba(0,200,150,0.3)',  borderColor: '#00c896', borderWidth: 1.5, borderRadius: 4, stack: 'a' },
          { label: 'Driver Pay', data: data.map(d => d.driver_pay), backgroundColor: 'rgba(59,130,246,0.3)', borderColor: '#3b82f6', borderWidth: 1.5, stack: 'a' },
          { label: 'Fuel',       data: data.map(d => d.fuel),       backgroundColor: 'rgba(245,158,11,0.3)', borderColor: '#f59e0b', borderWidth: 1.5, stack: 'a' },
        ],
      }}
      options={{
        responsive: true, maintainAspectRatio: true,
        interaction: { mode: 'index' },
        plugins: {
          legend: { display: true, labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 8, padding: 12 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw as number)}` } },
        },
        scales: { x: AXIS, y: { ...AXIS, stacked: true, ticks: { ...AXIS.ticks, callback: v => fmt(Number(v)) } } },
      }}
    />
  );
}

// ── Expense Donut ────────────────────────────────────────────
export function ExpenseDonut({ profit, driverPay, fuel }: { profit: number; driverPay: number; fuel: number }) {
  return (
    <Doughnut
      width={160} height={160}
      data={{
        datasets: [{ data: [profit, driverPay, fuel], backgroundColor: ['#00c896', '#3b82f6', '#f59e0b'], borderWidth: 0, hoverOffset: 4 }],
      }}
      options={{
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw}%` } },
        },
      }}
    />
  );
}
