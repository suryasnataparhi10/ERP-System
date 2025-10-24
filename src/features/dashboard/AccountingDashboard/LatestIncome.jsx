// src/pages/Dashboard/LatestIncome.jsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import incomeService from "../../../services/incomeService";

const LatestIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const res = await incomeService.getAllIncome();

        if (res?.data) {
          const woIncomes = (res.data.work_order_invoices || []).map(inv => ({
            id: inv.id,
            payment_amount: inv.payment_amount,
            created_at: inv.created_at,
            type: "Work Order",
          }));

          const poIncomes = (res.data.purchase_order_invoices || []).map(inv => ({
            id: inv.id,
            payment_amount: inv.payment_amount,
            created_at: inv.created_at,
            type: "Purchase Order",
          }));

          setIncomes([...woIncomes, ...poIncomes]);
        }
      } catch (err) {
        console.error("Error fetching income:", err);
        setError("Failed to load income data");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title">Latest Income</h5>
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="table text-center">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>DATE</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No income data
                  </td>
                </tr>
              ) : (
                incomes
                  .slice(-5)
                  .reverse()
                  .map((inc) => (
                    <tr key={inc.id}>
                      <td>{dayjs(inc.created_at).format("DD MMM YYYY")}</td>
                      <td>{inc.type}</td>
                      <td>₹ {parseFloat(inc.payment_amount).toFixed(2)}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          {error && <p className="text-danger mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LatestIncome;
