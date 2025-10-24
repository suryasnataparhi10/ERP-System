// src/pages/Accounting/AllBranchTransactions.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Row, Col, Form, InputGroup } from "react-bootstrap";
import branchwalletService from "../../../services/branchwalletService";
import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import { Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Select from "react-select";
import branchService from "../../../services/branchService";

const AllBranchTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [periodType, setPeriodType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const months = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];
  const years = ["2023", "2024", "2025", "2026"];
  const fyOptions = years.slice(0, -1).map((y, i) => {
    const nextYear = years[i + 1];
    return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
  });

  const fetchTransactions = async () => {
    try {
      const data = await branchwalletService.getAllWallets();
      setTransactions(data?.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

useEffect(() => {
  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data?.data || data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  fetchBranches();
  fetchTransactions();
}, []);

const filteredTransactions = () => {
  return transactions
    .filter(tx => (statusFilter ? tx.transaction_type === statusFilter : true))
    .filter(tx => (branchFilter ? tx.branch_id === Number(branchFilter) : true))

    .filter(tx => {
      const txDate = new Date(tx.updated_at);
      switch (periodType) {
        case "monthly":
          if (!filterValue) return true;
          return (txDate.getMonth() + 1).toString().padStart(2, "0") === filterValue;
        case "fy":
          if (!filterValue) return true;
          const [startYear, endYear] = filterValue.split("-").map(Number);
          const fyStart = new Date(startYear, 3, 1);
          const fyEnd = new Date(endYear, 2, 31, 23, 59, 59);
          return txDate >= fyStart && txDate <= fyEnd;
        case "custom":
          if (!startDate || !endDate) return true;
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return txDate >= start && txDate <= end;
        default:
          return true;
      }
    });
};


  const filteredData = filteredTransactions();
  const startIndex = (currentPage - 1) * entriesPerPage;
  const pageCount = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  // Excel download
  const handleDownloadExcel = () => {
    if (!filteredData.length) {
      toast.warning("No transactions to export");
      return;
    }

    const sheetData = [["All Branch Transactions"], [], ["Branch Name", "Transaction Type", "Date", "Amount", "Balance After"]];
    filteredData.forEach(tx => {
      sheetData.push([
        tx.Branch?.name || `Branch ${tx.branch_id}`,
        tx.transaction_type,
        new Date(tx.updated_at).toLocaleDateString(),
        tx.amount,
        tx.balance_after,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `All_Branch_Transactions.xlsx`);
  };
const branchOptions = Array.from(
  new Set(transactions.map(tx => tx.Branch?.name || `Branch ${tx.branch_id}`))
).sort();

  return (
    <div className="container-fluid py-3 my-4">
      {/* Breadcrumb & Title */}
      <div className="mb-3 flex-wrap">
        <h4 className="fw-semibold mb-1">All Transactions</h4>
        <BreadCrumb
          pathname={location?.pathname || ""}
          lastLabel="All Transactions"
        />
      </div>

      <div className="card p-4 shadow-sm mt-3">
        {/* Filters and Entries */}
        <Row className="align-items-center justify-content-between mb-5">
          <Col md={1}>
            <InputGroup>
              <Form.Select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </InputGroup>
          </Col>

          <Col md="auto">
            <Row className="g-2 align-items-end">
                <Col md="auto">
                    <Form.Group>
  <Form.Label>Branch</Form.Label>
  <Select
    name="branchFilter"
    options={branches.map((b) => ({ value: b.id, label: b.name }))}
    value={
      branchFilter
        ? {
            value: branchFilter,
            label: branches.find(b => b.id === Number(branchFilter))?.name || "",
          }
        : null
    }
    onChange={(selected) => setBranchFilter(selected?.value || "")}
    placeholder="Search by branch name..."
    isClearable
    styles={{
      control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
        boxShadow: state.isFocused ? `0 0 0 0.1px var(--bs-success)` : provided.boxShadow,
        "&:hover": {
          borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
        },
      }),
    }}
  />
</Form.Group>

                </Col>
              <Col md="auto">
                <Form.Group>
                  <Form.Label>Period Type</Form.Label>
                  <Form.Select
                    value={periodType}
                    onChange={e => {
                      setPeriodType(e.target.value);
                      setFilterValue("");
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    <option value="all">All</option>
                    <option value="monthly">Monthly</option>
                    <option value="fy">Financial Year</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {periodType === "monthly" && (
                <Col md="auto">
                  <Form.Group>
                    <Form.Label>Select Month</Form.Label>
                    <Form.Select value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                      <option value="">Select Month</option>
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              {periodType === "fy" && (
                <Col md="auto">
                  <Form.Group>
                    <Form.Label>Select Financial Year</Form.Label>
                    <Form.Select value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                      <option value="">Select FY</option>
                      {fyOptions.map(fy => (
                        <option key={fy.value} value={fy.value}>{fy.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              {periodType === "custom" && (
                <>
                  <Col>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs="auto">
                <Button className="mt-2" variant="success" onClick={handleDownloadExcel} title="Download Excel">
                  <Download />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Table */}
        <div className="table-responsive">
          <Table hover striped className="text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Transaction Type</th>
                <th>Transaction Date</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-3">Loading...</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((tx, index) => (
                  <tr key={tx.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{tx.Branch?.name || `Branch ${tx.branch_id}`}</td>
                    <td>{tx.transaction_type}</td>
                    <td>{new Date(tx.updated_at).toLocaleDateString()}</td>
                    <td>₹{Number(tx.amount).toLocaleString()}</td>
                    <td>₹{Number(tx.balance_after).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-3">No transactions found.</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="small text-muted">
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>&laquo;</button>
              </li>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
                if (
                  pageCount <= 5 ||
                  page === 1 ||
                  page === pageCount ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                    </li>
                  );
                } else if ((page === 2 && currentPage > 3) || (page === pageCount - 1 && currentPage < pageCount - 2)) {
                  return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                } else return null;
              })}
              <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>&raquo;</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBranchTransactions;
