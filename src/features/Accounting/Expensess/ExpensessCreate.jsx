import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import ExpenseForm from "./ExpenseForm";
import AdvanceSalaryForm from "./AdvanceSalaryForm";
import expenseService from "../../../services/expensessService";
import "./ExpenseCreate.css"; // ✅ custom CSS file for styling

const ExpenseCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState("expense");

  const [existingExpense, setExistingExpense] = useState(null);
  const expenseId = location.state?.expenseId;

  useEffect(() => {
    if (expenseId) fetchExpense(expenseId);
  }, [expenseId]);

  const fetchExpense = async (id) => {
    try {
      const res = await expenseService.getExpenseById(id);
      if (res?.success) {
        setExistingExpense(res.data.expense);
      }
    } catch (err) {
      console.error("Failed to fetch expense:", err);
    }
  };

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>
            Create {selectedType === "expense" ? "Expense" : "Advance Salary"}
          </h4>
          <BreadCrumb
            pathname="/accounting/expenses"
            lastLabel={
              selectedType === "expense" ? "Create Expense" : "Advance Salary"
            }
            dynamicNames={{ expenses: "Expenses" }}
          />
        </div>
      </div>

      {/* 🔘 Radio Toggle */}
      <Card className="p-3 mb-3">
        <div className="d-flex gap-4 align-items-center expense-create-radio-group">
          <label className="expense-create-radio">
            <input
              type="radio"
              name="entryType"
              value="expense"
              checked={selectedType === "expense"}
              onChange={() => setSelectedType("expense")}
            />
            <span className="expense-create-radio-circle"></span>
            <span>Expense</span>
          </label>

          <label className="expense-create-radio">
            <input
              type="radio"
              name="entryType"
              value="advance_salary"
              checked={selectedType === "advance_salary"}
              onChange={() => setSelectedType("advance_salary")}
            />
            <span className="expense-create-radio-circle"></span>
            <span>Advance Salary</span>
          </label>
        </div>
      </Card>

      {selectedType === "expense" && (
        <ExpenseForm
          initialBranchId={location.state?.branchId}
          existingExpense={existingExpense}
          onCancel={() => navigate("/accounting/expenses")}
          onSuccess={() => navigate("/accounting/expenses")}
        />
      )}

      {selectedType === "advance_salary" && (
        <AdvanceSalaryForm
          branchId={location.state?.branchId}
          onCancel={() => navigate("/accounting/expenses")}
          onSuccess={() => navigate("/accounting/expenses")}
        />
      )}
    </div>
  );
};

export default ExpenseCreate;
