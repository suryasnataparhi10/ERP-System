import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";
import {PeopleFill,Truck,Receipt,FileEarmarkText,Cash,Wallet2,Clipboard,CurrencyDollar,} from "react-bootstrap-icons";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import expenseService from "../../../services/expensessService";
import dayjs from "dayjs";
import purchaseService from "../../../services/purchaseService";
import branchService from "../../../services/branchService";
import { getEmployees } from "../../../services/hrmService";
import workOrderService from "../../../services/workOrderService";
import MonthlyExpenseTrend from "./MonthlyExpenseTrend";
import DashboardSummary from "./DashboardTopRow";
import LatestExpense from "./LatestExpense";
import LatestIncome from "./LatestIncome";
import CombinedInvoiceDashboard from "./CombinedInvoiceDashboard";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [expenses, setExpenses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [expenseSummary, setExpenseSummary] = useState({ today: 0, month: 0, total: 0,});
const [monthlyData, setMonthlyData] = useState([]);
const [totalVendors, setTotalVendors] = useState(0);
const [branches, setBranches] = useState({});
const [totalEmployees, setTotalEmployees] = useState(0);
const [invoices, setInvoices] = useState([]);
const [totalInvoices, setTotalInvoices] = useState(0);
const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
const [totalPaidAmount, setTotalPaidAmount] = useState(0);
const [totalDueAmount, setTotalDueAmount] = useState(0);

  useEffect(() => {
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getAllExpenses();
      if (res?.data) {
        const expensesList = res.data;
        setExpenses(expensesList);
        const todayStr = dayjs().format("YYYY-MM-DD");
        const monthStr = dayjs().format("YYYY-MM");

        let todayTotal = 0,
          monthTotal = 0,
          overall = 0;

        expensesList.forEach((exp) => {
          const date = exp.payment_date;
          const amount = parseFloat(exp.total_amount) || 0;
          overall += amount;

          if (date === todayStr) todayTotal += amount;
          if (date.startsWith(monthStr)) monthTotal += amount;
        });

        setExpenseSummary({today: todayTotal,month: monthTotal,total: overall,});

        const monthly = Array.from({ length: 12 }, (_, i) => ({
          month: dayjs().month(i).format("MMM"),
          expense: 0,
        }));

        expensesList.forEach((exp) => {
          const mIndex = dayjs(exp.payment_date).month();
          monthly[mIndex].expense += parseFloat(exp.total_amount) || 0;
        });
        setMonthlyData(monthly);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };
  fetchExpenses();
}, []);

useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const employees = await getEmployees();
      setTotalEmployees(employees.length);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };
  fetchEmployees();
}, []);

useEffect(() => {
  const fetchVendors = async () => {
    try {
      const res = await purchaseService.getAllPurchases();
      if (res?.data) {
        const uniqueVendors = new Set(res.data.map(po => po.vendor_name));
        setTotalVendors(uniqueVendors.size);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };
  fetchVendors();
}, []);

  useEffect(() => {
    const fetchBranches = async () => {
      const branchList = await branchService.getAll();
      const branchMap = {};
      branchList.forEach(b => {
        branchMap[b.id] = b.name;
      });
      setBranches(branchMap);
    };

    fetchBranches();
  }, []);

  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const res = await workOrderService.getAllInvoices();
      if (res?.data) {
        const invoiceList = res.data;
        setInvoices(invoiceList);
        setTotalInvoices(invoiceList.length);

        let paid = 0, due = 0, total = 0;
        invoiceList.forEach(inv => {
          const amount = parseFloat(inv.payment_amount) || 0;
          total += amount;
          if (inv.status === "Paid") paid += amount;
          else due += amount;
        });
        setTotalInvoiceAmount(total);
        setTotalPaidAmount(paid);
        setTotalDueAmount(due);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  fetchInvoices();
}, []);


  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <small className="text-muted">Dashboard </small>
      </div>

      <DashboardSummary
        expenseSummary={expenseSummary}
        totalVendors={totalVendors}
        totalEmployees={totalEmployees}
        totalInvoiceAmount={totalInvoiceAmount}
        branches={branches}
      />
      <MonthlyExpenseTrend loading={loading} monthlyData={monthlyData} />
      <Row>
        <Col md={6}>
           <LatestExpense expenses={expenses} loading={loading} branches={branches} />
        </Col>
        <Col md={6}>
           <LatestIncome />
        </Col>
      </Row>
      
      {/* <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Recent Invoices</h5>
              <div className="col-md-12">
                <div className="card shadow-sm border-0 m-0">
                  <div className="card-body pb-0 w-md-100">
                    <div className="table-responsive">
                      <div style={{ maxHeight: "250px", overflowY: "auto", margin: "0",}}>
                        <table className="table table-striped">
                          <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr>
                              <th>#</th>
                              <th>CUSTOMER</th>
                              <th>ISSUE DATE</th>
                              <th>DUE DATE</th>
                              <th>AMOUNT</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
  {invoices.length === 0 ? (
    <tr><td colSpan="6" className="text-center text-muted">No invoices found</td></tr>
  ) : (
    invoices.slice(-5).reverse().map((inv, idx) => (
      <tr key={inv.id}>
        <td>{idx + 1}</td>
        <td>{inv.customer_name || "N/A"}</td>
        <td>{dayjs(inv.issue_date).format("DD MMM YYYY")}</td>
        <td>{dayjs(inv.due_date).format("DD MMM YYYY")}</td>
        <td>₹ {parseFloat(inv.payment_amount).toFixed(2)}</td>
        <td>{inv.status || "Pending"}</td>
      </tr>
    ))
  )}
</tbody>

                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <CombinedInvoiceDashboard/>
      {/* Storage & Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Storage Limit</h5>
              <div className="progress mb-2" style={{ height: "10px" }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: "0.17%" }}></div>
              </div>
              <h6 className="text-primary">0.17% Used</h6>
              <small className="text-muted">1.7MB / 1024MB</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Invoices Weekly Statistics</h5>
              <i className="bi bi-calendar-week fs-1 text-muted"></i>
              <p className="text-muted mb-0">No weekly data available</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Invoices Monthly Statistics</h5>
              <i className="bi bi-calendar-month fs-1 text-muted"></i>
              <p className="text-muted mb-0">No monthly data available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="bg-secondary text-white p-3 rounded me-3"> <i className="bi bi-file-earmark-text fs-3"></i> </div>
              <div>
                <p className="mb-0 text-muted">Invoice Generated</p>
                <h5>₹0,00</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="bg-success text-white p-3 rounded me-3"> <i className="bi bi-check-circle fs-3"></i> </div>
              <div>
                <p className="mb-0 text-muted">Paid</p>
                <h5>₹0,00</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning text-white p-3 rounded me-3"><i className="bi bi-clock fs-3"></i></div>
              <div>
                <p className="mb-0 text-muted">Due</p>
                <h5>₹ {totalDueAmount.toFixed(2)}</h5> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
