// src/components/Dashboard/MonthlyExpenseTrend.jsx
import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import incomeService from "../../../services/incomeService";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === "income")?.value || 0;
    const expense = payload.find((p) => p.dataKey === "expense")?.value || 0;
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <p className="fw-bold mb-1">{label}</p>
        <p className="text-danger mb-1">expense : {expense}</p>
        <p className="text-primary mb-0">income : {income}</p>
      </div>
    );
  }
  return null;
};


const MonthlyExpenseTrend = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await incomeService.getAllIncome();
        if (res?.success && res.data) {
          const data = res.data;

          // Initialize monthly totals
          const monthlyTotals = months.map((m) => ({
            month: m,
            income: 0,
            expense: 0,
          }));

          // Process Work Order Incomes
          data.work_order_invoices?.forEach((inv) => {
            const monthIdx = new Date(inv.created_at).getMonth();
            monthlyTotals[monthIdx].income += Number(inv.total_amount || 0);
          });

          // Process Purchase Order Incomes (can be considered additional income)
          data.purchase_order_invoices?.forEach((inv) => {
            const monthIdx = new Date(inv.created_at).getMonth();
            monthlyTotals[monthIdx].income += Number(inv.total_amount || 0);
          });

          // Process Wallet Expenses
          data.wallet_expenses?.forEach((exp) => {
            const monthIdx = new Date().getMonth(); // assuming all in current month
            monthlyTotals[monthIdx].expense += Number(exp.amount || 0);
          });

          setMonthlyData(monthlyTotals);
        }
      } catch (err) {
        console.error("Failed to load income/expense data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="shadow-sm border-0 mb-4 mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-primary">Income & Expense</h5>
          <h6 className="text-muted mb-0">Current Year - {new Date().getFullYear()}</h6>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" /> Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#00b4d8" barSize={30} />
              <Bar dataKey="expense" fill="#ff5c8a" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default MonthlyExpenseTrend;
