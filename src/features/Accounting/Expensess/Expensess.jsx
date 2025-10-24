import React, { useEffect, useState } from "react";
import { Table, Button, Card, Form, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import expenseService from "../../../services/expensessService";
import BreadCrumb from "../../../components/BreadCrumb";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Download, Plus } from "react-bootstrap-icons";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  // Period filter states
const [periodType, setPeriodType] = useState("");
const [filterValue, setFilterValue] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const months = [
  { name: "January", value: "01" }, { name: "February", value: "02" },
  { name: "March", value: "03" }, { name: "April", value: "04" },
  { name: "May", value: "05" }, { name: "June", value: "06" },
  { name: "July", value: "07" }, { name: "August", value: "08" },
  { name: "September", value: "09" }, { name: "October", value: "10" },
  { name: "November", value: "11" }, { name: "December", value: "12" },
];
const years = ["2023", "2024", "2025", "2026"];
const fyOptions = years.slice(0, -1).map((y, i) => {
  const nextYear = years[i + 1];
  return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
});


  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getAllExpenses();
      if (response.success) {
        setExpenses(response.data || []);
      } else {
        toast.error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Error fetching expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Group expenses by branch
const branchesWithExpenses = Object.values(
  expenses.reduce((acc, exp) => {
    if (exp.branch) {
      const branchId = exp.branch.id;
      const branchName = exp.branch.name || `Branch ${branchId}`;
      const total = Number(exp.total_amount) || 0;

      acc[branchId] = {
        branch_id: branchId,
        branch_name: branchName,
        totalExpenses: (acc[branchId]?.totalExpenses || 0) + total,
      };
    }
    return acc;
  }, {})
);

const filteredBranches = branchesWithExpenses.filter(branch => {
  // Search filter
  if (!branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

  // Period filtering logic
  if (!periodType) return true;

  const branchExpenses = expenses.filter(exp => exp.branch?.id === branch.branch_id);
  switch (periodType) {
    case "daily":
      return filterValue
        ? branchExpenses.some(exp => exp.payment_date === filterValue)
        : true;
    case "monthly":
      return filterValue
        ? branchExpenses.some(exp => (new Date(exp.payment_date).getMonth() + 1).toString().padStart(2, "0") === filterValue)
        : true;
    case "fy":
      if (!filterValue) return true;
      const [startYear, endYear] = filterValue.split("-").map(Number);
      const fyStart = new Date(startYear, 3, 1);
      const fyEnd = new Date(endYear, 2, 31);
      return branchExpenses.some(exp => {
        const d = new Date(exp.payment_date);
        return d >= fyStart && d <= fyEnd;
      });
    case "custom":
      if (!startDate || !endDate) return true;
      const s = new Date(startDate);
      const e = new Date(endDate);
      return branchExpenses.some(exp => {
        const d = new Date(exp.payment_date);
        return d >= s && d <= e;
      });
    default:
      return true;
  }
});
const handleDownloadExcel = () => {
  const filteredExpensesList = [];

  filteredBranches.forEach(branch => {
    const branchExpenses = expenses.filter(exp => exp.branch?.id === branch.branch_id);

    // Apply same period filter as above
    const filtered = branchExpenses.filter(exp => {
      if (!periodType) return true;
      const d = new Date(exp.payment_date);
      switch (periodType) {
        case "daily": return filterValue ? exp.payment_date === filterValue : true;
        case "monthly": return filterValue ? (d.getMonth() + 1).toString().padStart(2, "0") === filterValue : true;
        case "fy": 
          if (!filterValue) return true;
          const [startYear, endYear] = filterValue.split("-").map(Number);
          return d >= new Date(startYear, 3, 1) && d <= new Date(endYear, 2, 31);
        case "custom":
          if (!startDate || !endDate) return true;
          return d >= new Date(startDate) && d <= new Date(endDate);
        default: return true;
      }
    });

    filteredExpensesList.push({ branchName: branch.branch_name, expenses: filtered });
  });

  if (filteredExpensesList.length === 0) {
    toast.warning("No expenses found for selected filters.");
    return;
  }

  // Build sheet like ExpenseDetails (month-wise, branch-wise)
  const sheetData = [];
  const merges = [];
  let rowIndex = 0;

  filteredExpensesList.forEach(branchItem => {
    sheetData.push([`Branch: ${branchItem.branchName}`]);
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } });
    rowIndex++;

    // Group by month
    const grouped = {};
    branchItem.expenses.forEach(exp => {
      const month = months[new Date(exp.payment_date).getMonth()].name;
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(exp);
    });

    Object.keys(grouped).forEach(month => {
      const monthData = grouped[month];
      sheetData.push([month]);
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } });
      rowIndex++;

      sheetData.push(["Date", "Description", "Subtotal", "Tax Total", "Total Amount"]);
      rowIndex++;

      let monthlyTaxTotal = 0;
      monthData.forEach(exp => {
        const tax = parseFloat(exp.tax_total) || 0;
        monthlyTaxTotal += tax;
        sheetData.push([
          new Date(exp.payment_date).toISOString().split("T")[0],
          exp.description,
          exp.subtotal,
          exp.tax_total,
          exp.total_amount,
        ]);
        rowIndex++;
      });

      sheetData.push(["", "", "", "Monthly Tax Total", monthlyTaxTotal.toFixed(2)]);
      rowIndex++;
      sheetData.push([]);
      rowIndex++;
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!merges"] = merges;
  ws["!cols"] = [{ wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
  XLSX.writeFile(wb, `Expenses_Report.xlsx`);
};


  // ✅ Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBranches.length / entriesPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container-fluid py-3 my-4">
<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
  <div>
    <h4>Branch Expenses</h4>
    <BreadCrumb pathname="/accounting/expenses" />
  </div>

  {/* ✅ Add "+" button like ExpenseDetails */}
  <Button
    size="sm"
    className="rounded-1"
    variant="success"
    onClick={() => navigate("/accounting/expensess/create")}
  >
    <Plus />
  </Button>
</div>


      <Card className="p-4 shadow-sm mt-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
<Row className="align-items-end mb-5 g-2">
  {/* Left side: Entries per page */}
  <Col md={1}>
    <Form.Group>
      <Form.Label>Show</Form.Label>
      <Form.Select value={entriesPerPage} onChange={handleEntriesChange}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </Form.Select>
    </Form.Group>
  </Col>

  {/* Right side: Search, Period, Period value, Download */}
  <Col className="d-flex align-items-end justify-content-end ms-auto flex-wrap gap-2">
    {/* Search */}
    <Form.Group className="me-2 mb-0">
      <Form.Label>Search</Form.Label>
      <Form.Control
        type="text" className="mb-0"
        placeholder="Search by branch name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Form.Group>

    {/* Period filter */}
    <Form.Group className="me-2 mb-0">
      <Form.Label>Period</Form.Label>
      <Form.Select
        value={periodType}
        onChange={(e) => {
          setPeriodType(e.target.value);
          setFilterValue("");
          setStartDate("");
          setEndDate("");
        }}
      >
        <option value="">All</option>
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="fy">Financial Year</option>
        <option value="custom">Custom</option>
      </Form.Select>
    </Form.Group>

    {/* Period value (conditionally rendered) */}
    {periodType && (
      <Form.Group className="me-2 mb-0">
        {periodType === "daily" && (
          <Form.Control type="date" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
        )}
        {periodType === "monthly" && (
          <Form.Select value={filterValue} onChange={e => setFilterValue(e.target.value)}>
            <option value="">Select Month</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Form.Select>
        )}
        {periodType === "fy" && (
          <Form.Select value={filterValue} onChange={e => setFilterValue(e.target.value)}>
            <option value="">Select Financial Year</option>
            {fyOptions.map(fy => <option key={fy.value} value={fy.value}>{fy.label}</option>)}
          </Form.Select>
        )}
        {periodType === "custom" && (
          <div className="d-flex gap-2">
            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
      </Form.Group>
    )}

    {/* Download button */}
    <Button className="align-self-end" variant="success" onClick={handleDownloadExcel} title="Download Excel">
      <Download />
    </Button>
  </Col>
</Row>
            <div className="table-responsive">
              <Table hover striped className="text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Branch Name</th>
                    <th>Total Expenses (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBranches.length > 0 ? (
                    currentBranches.map((branch, index) => (
                      <tr key={branch.branch_id}>
                        <td>{indexOfFirst + index + 1}</td>
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
    navigate(`/accounting/expenses/${branch.branch_id}/details`, {
      state: { branchName: branch.branch_name },
    })
  }
                        >
                          {branch.branch_name}
                        </td>
                        <td className="fw-bold">
                          ₹{Number(branch.totalExpenses).toLocaleString()}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() =>
    navigate(`/accounting/expenses/${branch.branch_id}/details`, {
      state: { branchName: branch.branch_name },
    })
  }
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        No branches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
{/* Pagination Footer */}
{filteredBranches.length > 0 && (
  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
    <div className="small text-muted">
      Showing {filteredBranches.length === 0 ? 0 : indexOfFirst + 1} to{" "}
      {Math.min(indexOfLast, filteredBranches.length)} of {filteredBranches.length} entries
    </div>

    <ul className="pagination mb-0">
      {/* Previous button */}
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          &laquo;
        </button>
      </li>

      {/* Page numbers with ellipsis */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        if (
          totalPages <= 5 ||
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          );
        } else if (
          (page === 2 && currentPage > 3) ||
          (page === totalPages - 1 && currentPage < totalPages - 2)
        ) {
          return (
            <li key={page} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          );
        } else return null;
      })}

      {/* Next button */}
      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          &raquo;
        </button>
      </li>
    </ul>
  </div>
)}

          </>
        )}
      </Card>
    </div>
  );
};

export default Expenses;
