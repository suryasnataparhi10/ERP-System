import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Table, Badge, Button, Modal, Form, Row, Col, InputGroup, OverlayTrigger, Tooltip  } from "react-bootstrap";
import branchWalletService from "../../../services/branchWalletService";
import branchService from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";
import { Plus, Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import RequestFundModal from "./RequestFundModal";
import { VscPreview } from "react-icons/vsc";
import PreviewModal from "./PreviewModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dropdown } from "react-bootstrap";

const BranchWalletDetails = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [transactions, setTransactions] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [formData, setFormData] = useState({ transaction_type: "credit", amount: "", description: "" });

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [periodType, setPeriodType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (user?.type === "Branch Manager ") {
      fetchAllTransactions();
      setBranchName("All Branches");
    } else {
      fetchTransactions();
      fetchBranchName();
    }
  }, [branchId, user?.type]);
  
useEffect(() => {
  // Default filter for current date
  const today = new Date().toISOString().split("T")[0];
  setPeriodType("daily");
  setFilterValue(today);
}, []);
  const fetchTransactions = async () => {
    try {
      const data = await branchWalletService.getBranchTransactions(branchId);
      setTransactions(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branch transactions:", error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const data = await branchWalletService.getWalletTransactions();
      setTransactions(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch all transactions:", error);
    }
  };

  const fetchBranchName = async () => {
    try {
      const branch = await branchService.getOne(branchId);
      setBranchName(branch?.name || `Branch ${branchId}`);
    } catch (error) {
      console.error("Failed to fetch branch name:", error);
      setBranchName(`Branch ${branchId}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShowModal = (tx = null) => {
    if (tx) {
      setSelectedTx(tx);
      setFormData({
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
      });
    } else {
      setSelectedTx(null);
      setFormData({ transaction_type: "credit", amount: "", description: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData, branch_id: branchId };
      if (selectedTx) {
        await branchWalletService.updateWallet(selectedTx.id, payload);
        toast.success("Transaction updated successfully");
      } else {
        await branchWalletService.createWallet(payload);
        toast.success("Transaction added successfully");
      }
      setShowModal(false);
      if (user?.type === "Branch Manager ") fetchAllTransactions();
      else fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Transaction",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff9900",
      onConfirm: async () => {
        await branchWalletService.deleteWallet(id);
        toast.success("Transaction deleted successfully", { icon: false });
        if (user?.type === "Branch Manager ") fetchAllTransactions();
        else fetchTransactions();
      },
    });
  };
const filteredTransactions = () => {
  return transactions
    .filter((tx) => (statusFilter ? tx.transaction_type === statusFilter : true))
    .filter((tx) => {
      const txDate = new Date(tx.created_at);
      const txIsoDate = txDate.toISOString().split("T")[0];

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      }

      switch (periodType) {
        case "daily":
          return txIsoDate === filterValue;
        case "monthly":
          const txMonth = (txDate.getMonth() + 1).toString().padStart(2, "0");
          return txMonth === filterValue;
        case "fy":
          if (!filterValue) return true;
          const [startYear, endYear] = filterValue.split("-").map(Number);
          const fyStart = new Date(startYear, 3, 1);
          const fyEnd = new Date(endYear, 2, 31);
          return txDate >= fyStart && txDate <= fyEnd;
        default:
          return true;
      }
    });
};


  // const filteredData = filteredTransactions();
  const filteredData = filteredTransactions().filter(tx => tx.transaction_type === "credit");
  const startIndex = (currentPage - 1) * entriesPerPage;
  const pageCount = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const fyOptions = years.slice(0, -1).map((y, i) => {
    const nextYear = years[i + 1];
    return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
  });

  const handleDownloadExcel = () => {
    if (transactions.length === 0) {
      toast.warning("No transactions found.");
      return;
    }

    const sheetData = [];
    sheetData.push([`${branchName} Branch Wallet Report`]);
    sheetData.push([]);

    const filteredTxs = filteredTransactions();
    if (filteredTxs.length === 0) {
      toast.warning("No transactions match the selected filters.");
      return;
    }

    const groupedByMonth = {};
    filteredTxs.forEach((tx) => {
      const date = new Date(tx.created_at);
      const txMonth = (date.getMonth() + 1).toString().padStart(2, "0");
      const monthName = months.find((m) => m.value === txMonth)?.name || txMonth;
      if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
      groupedByMonth[monthName].push(tx);
    });

    const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    let rowIndex = 2;

    Object.keys(groupedByMonth).forEach((monthName) => {
      sheetData.push([monthName]);
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } });
      rowIndex++;
      sheetData.push([]);
      rowIndex++;
      sheetData.push(["Date", "Description", "Credit", "Debit", "Current Balance"]);
      rowIndex++;
      groupedByMonth[monthName].forEach((tx) => {
        const date = new Date(tx.created_at).toISOString().split("T")[0];
        sheetData.push([
          date,
          tx.description,
          tx.transaction_type === "credit" ? tx.amount : "",
          tx.transaction_type === "debit" ? tx.amount : "",
          tx.balance_after,
        ]);
        rowIndex++;
      });
      sheetData.push([]);
      rowIndex++;
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!merges"] = merges;
    ws["!cols"] = [
      { wch: 15 },
      { wch: 45 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Wallet Report");
    const branchLabel = branchName.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `${branchLabel}_Wallet_Report.xlsx`);
  };

const handleDownloadPDF = () => {
  if (transactions.length === 0) {
    toast.warning("No transactions found.");
    return;
  }

  const filteredTxs = filteredTransactions();
  if (filteredTxs.length === 0) {
    toast.warning("No transactions match the selected filters.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const title = `${branchName} Branch Wallet Report`;
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  const tableColumn = ["Date", "Description", "Credit", "Debit", "Current Balance"];
  const tableRows = filteredTxs.map((tx) => [
    new Date(tx.created_at).toISOString().split("T")[0],
    tx.description || "-",
    tx.transaction_type === "credit" ? tx.amount : "",
    tx.transaction_type === "debit" ? tx.amount : "",
    tx.balance_after,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  const branchLabel = branchName.replace(/\s+/g, "_");

  // ✅ Ensure a small delay before saving
  setTimeout(() => {
    doc.save(`${branchLabel}_Wallet_Report.pdf`);
  }, 100);
};



  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>Transaction History – {branchName}</h4>
          <BreadCrumb
            pathname={location?.pathname || ""}
            lastLabel="Branch Transactions"
            dynamicNames={{ [branchId]: branchName }}
          />
        </div>
        <div className="p-4 rounded d-flex justify-content-center flex-wrap gap-2">
          {user?.type === "Branch Manager " ? (
            <OverlayTrigger overlay={<Tooltip>Request Additional Funds</Tooltip>}>
              <Button
                variant="warning"
                className="fw-semibold text-white px-2"
                onClick={() => setShowExtraModal(true)}
              >
                Request Fund
              </Button>
            </OverlayTrigger>
          ) : (
            (user?.type === "Accountant" || user?.type === "company") && (
              <OverlayTrigger overlay={<Tooltip>Add Money to Branch Wallet</Tooltip>}>
                <Button
                  variant="success"
                  className="fw-semibold text-white px-2"
                  onClick={() => handleShowModal()}
                >
                  + Add Money to Wallet
                </Button>
              </OverlayTrigger>
            )
          )}
          <OverlayTrigger overlay={<Tooltip>View All Fund Requests</Tooltip>}>
<Button
  variant="info"
  className="fw-semibold text-white px-2"
  onClick={() => navigate(`/fund-requests?branchId=${branchId}`)}
>
  View Fund Request
</Button>
          </OverlayTrigger>
        </div>
      </div>
<Row className="my-4 g-3 justify-content-center">
  {/* Credited This Month */}
  <Col md={4}>
    <div className="p-5 rounded shadow-sm text-center" style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}>
      <h2 className="fw-bold text-success mb-1">
        ₹
        {transactions
          ?.filter(
            (tx) =>
              tx.transaction_type === "credit" &&
              new Date(tx.created_at).getMonth() === new Date().getMonth() &&
              new Date(tx.created_at).getFullYear() === new Date().getFullYear()
          )
          .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
          .toLocaleString()}
      </h2>
      <small className="text-muted">Credited This Month</small>
    </div>
  </Col>

  {/* Current Branch Wallet Balance */}
  <Col md={4}>
    <div className="p-5 rounded shadow-sm text-center" style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}>
      <h2 className="fw-bold text-success mb-1">
        ₹{transactions?.length > 0 ? Number(transactions[0].balance_after).toLocaleString() : "0.00"}
      </h2>
      <small className="text-muted d-block">Current Wallet Balance</small>
    </div>
  </Col>
</Row>


      {/* Table */}
      <div className="table-responsive table-striped card p-4 shadow-sm">
<Row className="align-items-center justify-content-between mb-3">
  {/* Entries per page (left) */}
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

  {/* Filter section and buttons (right aligned) */}
  <Col className="d-flex justify-content-end flex-wrap g-2">
    {/* Status Filter */}
    <Form.Group className="me-2 mb-2">
      <Form.Label>Status</Form.Label>
      <Form.Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All</option>
        <option value="credit">Credit</option>
        <option value="debit">Debit</option>
      </Form.Select>
    </Form.Group>

    {/* Period Filter */}
    <Form.Group className="me-2 mb-2">
      <Form.Label>Select Period</Form.Label>
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

    {/* Period Value Selector */}
    {periodType && periodType !== "custom" && (
      <Form.Group className="me-2 mb-2">
        <Form.Label>
          {periodType === "daily" && "Select Date"}
          {periodType === "monthly" && "Select Month"}
          {periodType === "fy" && "Select Financial Year"}
        </Form.Label>

        {periodType === "daily" && (
          <Form.Control
            type="date"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        )}
        {periodType === "monthly" && (
          <Form.Select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </Form.Select>
        )}
        {periodType === "fy" && (
          <Form.Select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">Select Year</option>
            {fyOptions.map((fy) => (
              <option key={fy.value} value={fy.value}>
                {fy.label}
              </option>
            ))}
          </Form.Select>
        )}
      </Form.Group>
    )}

    {/* Custom Dates */}
    {periodType === "custom" && (
      <>
        <Form.Group className="me-2 mb-2">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="me-2 mb-2">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>
      </>
    )}

    {/* Buttons */}
    <div className="d-flex align-items-end flex-wrap mb-2">
      <OverlayTrigger overlay={<Tooltip>View Expense Details</Tooltip>}>
        <Button
          size="sm"
          variant="warning"
          className="me-2"
          onClick={() =>
            navigate(`/accounting/expenses/${branchId}/details`)
          }
        >
          <i className="bi bi-eye text-white"></i>
        </Button>
      </OverlayTrigger>

      <OverlayTrigger overlay={<Tooltip>Preview Excel Report</Tooltip>}>
        <Button variant="info" size="sm" className="me-2" onClick={() => setShowPreview(true)}>
          <VscPreview />
        </Button>
      </OverlayTrigger>

<Dropdown>
  <Dropdown.Toggle variant="success" size="sm" id="download-dropdown">
    <Download />
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item onClick={handleDownloadExcel}>Download Excel</Dropdown.Item>
    <Dropdown.Item onClick={handleDownloadPDF}>Download PDF</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
    </div>
  </Col>
</Row>



        <Table hover className="text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Transaction Type</th>
              <th>Amount</th>
              <th>Current Balance</th>
              <th>Description</th>
              <th>Date</th>
              {(user?.type === "company" || user?.type === "Accountant") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((tx, index) => (
                <tr key={tx.id}>
                  <td>{startIndex + index + 1}</td>
                  {/* <td>
                    <Badge bg={tx.transaction_type === "credit" ? "success" : "danger"}>
                      {tx.transaction_type}
                    </Badge>
                  </td> */}
                  <td>
                  <Badge bg={tx.transaction_type === "credit"? user?.type === "Branch Manager "? "success" : "danger" : "danger"}>
                    {tx.transaction_type === "credit"? user?.type === "Branch Manager "? "credit": "debit": "debit"}
                  </Badge>
                  </td>
                  <td>₹{Number(tx.amount).toLocaleString()}</td>
                  <td className="fw-bold text-primary">₹{Number(tx.balance_after).toLocaleString()}</td>
                  <td>{tx.description}</td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
        {(user?.type === "company" || user?.type === "Accountant") && (
          <td>

            <OverlayTrigger overlay={<Tooltip>Edit Transaction</Tooltip>}>
              <Button
                size="sm"
                variant="info"
                className="me-2"
                onClick={() => handleShowModal(tx)}
              >
                <i className="bi bi-pencil text-white"></i>
              </Button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Delete Transaction</Tooltip>}>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(tx.id)}
              >
                <i className="bi bi-trash text-white"></i>
              </Button>
            </OverlayTrigger>
          </td>
        )}


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>&laquo;</button>
              </li>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
                if (pageCount <= 5 || page === 1 || page === pageCount || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                    </li>
                  );
                } else if ((page === 2 && currentPage > 3) || (page === pageCount - 1 && currentPage < pageCount - 2)) {
                  return (
                    <li key={page} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                } else return null;
              })}
              <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>&raquo;</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTx ? "Edit Transaction" : "Add Transaction"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {/* Transaction type hidden for Add */}
            <Col md={12} style={{ display: "none" }}>
              <Form.Group>
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

<RequestFundModal
  show={showExtraModal}
  onClose={() => setShowExtraModal(false)}
  branchId={branchId}
  onSuccess={fetchTransactions} 
/>
<PreviewModal
  show={showPreview}
  onClose={() => setShowPreview(false)}
  transactions={filteredTransactions()}
  months={months}
  handleDownloadExcel = {handleDownloadExcel}
  handleDownloadPDF = {handleDownloadPDF}
/>
    </div>
  );
};

export default BranchWalletDetails;
