import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col,OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import branchwalletService from "../../../services/branchwalletService";
import branchService from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import { Plus } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import Select from "react-select";
import expenseService from "../../../services/expensessService";

const BranchWallet = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [searchBranch, setSearchBranch] = useState("");
  const [totalCredit, setTotalCredit] = useState(0); 
  const [formData, setFormData] = useState({
    branch_id: "",
    transaction_type: "credit",
    amount: "",
    description: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [branchExpenses, setBranchExpenses] = useState([]);
const [periodType, setPeriodType] = useState(""); // daily, monthly, fy, custom
const [filterValue, setFilterValue] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");


  // ✅ Fetch branch wallets
  const fetchWallets = async () => {
    try {
      const data = await branchwalletService.getAllWallets();
      const allWallets = data?.data || [];

      // Get latest transaction per branch
      const latestPerBranch = Object.values(
        allWallets.reduce((acc, tx) => {
          if (
            !acc[tx.branch_id] ||
            new Date(tx.updated_at) > new Date(acc[tx.branch_id].updated_at)
          ) {
            acc[tx.branch_id] = tx;
          }
          return acc;
        }, {})
      );

      // ✅ Sort by updated_at descending (newest first)
      latestPerBranch.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      setWallets(latestPerBranch);
      setFilteredWallets(latestPerBranch);

      // ✅ Calculate Total Credit (Sum of all branch balances)
      const total = latestPerBranch.reduce(
        (sum, w) => sum + Number(w.balance_after || 0),
        0
      );
      setTotalCredit(total);

    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  // ✅ Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data?.data || data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  const fetchBranchExpenses = async () => {
  try {
    const res = await expenseService.getAllExpenses(); // calls your API
    setBranchExpenses(res?.data || []); // save all expenses in state
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
};
  useEffect(() => {
    fetchWallets();
    fetchBranches();
    fetchBranchExpenses();
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateBranchExpenses = (branchId) => {
  const expenses = branchExpenses.filter(exp => exp.branch?.id === branchId);

  // Apply period filter
  const filtered = expenses.filter(exp => {
    if (!periodType) return true;
    const d = new Date(exp.payment_date);
    switch (periodType) {
      case "daily": 
        return filterValue ? exp.payment_date === filterValue : true;
      case "monthly":
        return filterValue ? (d.getMonth() + 1).toString().padStart(2, "0") === filterValue : true;
      case "fy":
        if (!filterValue) return true;
        const [startYear, endYear] = filterValue.split("-").map(Number);
        const fyStart = new Date(startYear, 3, 1);
        const fyEnd = new Date(endYear, 2, 31);
        return d >= fyStart && d <= fyEnd;
      case "custom":
        if (!startDate || !endDate) return true;
        return d >= new Date(startDate) && d <= new Date(endDate);
      default:
        return true;
    }
  });

  return filtered.reduce((sum, exp) => sum + Number(exp.total_amount || 0), 0);
};

  // ✅ Handle save wallet
  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      await branchwalletService.createWallet(payload);
      setShowModal(false);
      fetchWallets();
      toast.success("Wallet created successfully.", { icon: false });

      setFormData({
        branch_id: "",
        transaction_type: "",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet.");
    }
  };

  // ✅ Search logic (live filter)
  useEffect(() => {
    if (!searchBranch) {
      setFilteredWallets(wallets);
    } else {
      const filtered = wallets.filter((w) =>
  !searchBranch ? true : w.branch_id === Number(searchBranch)
);
      setFilteredWallets(filtered);
    }
    setCurrentPage(1);
  }, [searchBranch, wallets]);

  // ✅ Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentWallets = filteredWallets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredWallets.length / entriesPerPage);

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="fw-semibold mb-1">Branch Wallets</h4>
          <BreadCrumb pathname="/accounting/branch-wallets" lastLabel="Branch Wallets" />
        </div>
        <div>
          <OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-add-wallet">Add new branch wallet</Tooltip>}
>
  <Button
    size="sm"
    className="fw-semibold text-white px-2"
    variant="success"
    onClick={() => setShowModal(true)}
  >
    + Add Wallet
    {/* <i class="bi bi-plus me-1"></i> */}
  </Button>
</OverlayTrigger>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-fund-requests">View all fund requests</Tooltip>}
>
  <Button
    variant="info"
    size="sm"
    className="fw-semibold text-white px-2"
    onClick={() => navigate("/fund-requests")}
  >
    View Fund Requests
    {/* <i class="bi bi-cash-stack"></i> */}
  </Button>
</OverlayTrigger>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-transfers">View all transfer history</Tooltip>}
>
  <Button
    variant="danger"
    size="sm"
    className="fw-semibold text-white px-2"
    onClick={() => navigate("/accounting/branch-wallets/transactions")}
  >
    View All Transfers
    {/* <i className="bi bi-receipt"></i> */}
  </Button>
</OverlayTrigger>
        </div>
      </div>

      {/* ✅ TOTAL CREDIT SECTION */}
      <div
        className="d-flex justify-content-between align-items-center p-4 rounded shadow-sm my-4"
        style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}
      >
        <div>
          <h3 className="fw-bold text-success mb-1">
            ₹{totalCredit.toLocaleString()}
          </h3>
          <small className="text-muted">Total Expenses (All Branches)</small>
        </div>
      </div>

      {/* Wallets Table with Pagination */}
      <div className="card p-4 shadow-sm mt-3">
        {/* Search + Entries */}
        <Row className="align-items-center justify-content-between g-3 mb-5">
          <Col md={1} className="text-end">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Col>
<Col md={2}>
  <Select
    name="searchBranch"
    options={branches.map((b) => ({ value: b.id, label: b.name }))}
    value={
      searchBranch
        ? { value: searchBranch, label: branches.find(b => b.id === Number(searchBranch))?.name }
        : null
    }
    onChange={(selected) => setSearchBranch(selected?.value || "")}
    placeholder="Search branch..."
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
</Col>

        </Row>

        <div className="table-responsive">
          <Table hover striped className="text-center">
            {/* <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Current Balance</th>
                <th>Total Expenses (₹)</th>
                <th>Actions</th>
              </tr>
            </thead> */}
            <thead className="table-light">
  <tr>
    <th>#</th>
    <th>Branch Name</th>
    <th>Current Balance (₹)</th>
    <th>Total Expenses (₹)</th>  {/* New column */}
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {currentWallets.length > 0 ? (
    currentWallets.map((wallet, index) => (
      <tr key={wallet.id}>
        <td>{indexOfFirst + index + 1}</td>
        <td style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/accounting/branch-wallets/${wallet.branch_id}/transactions`)
          }
        >
          {wallet.Branch?.name || `Branch ${wallet.branch_id}`}
        </td>
        <td className="fw-bold">{Number(wallet.balance_after).toLocaleString()}</td>
        <td className="fw-bold">
          ₹{calculateBranchExpenses(wallet.branch_id).toLocaleString()}
        </td>
        <td>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id={`tooltip-view-${wallet.branch_id}`}>View branch transactions</Tooltip>}
>
  <Button
    size="sm"
    variant="warning"
    onClick={() =>
      navigate(`/accounting/branch-wallets/${wallet.branch_id}/transactions`)
    }
  >
    <i className="bi bi-eye"></i>
  </Button>
</OverlayTrigger>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center text-muted py-3">
        No branch wallets found.
      </td>
    </tr>
  )}
</tbody>

          </Table>
        </div>
<div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
  <p className="mb-0 small text-muted">
    Showing {filteredWallets.length ? indexOfFirst + 1 : 0} to{" "}
    {Math.min(indexOfLast, filteredWallets.length)} of {filteredWallets.length} entries
  </p>

  <ul className="pagination pagination-sm mb-0">
    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
        &laquo;
      </button>
    </li>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
        <button className="page-link" onClick={() => setCurrentPage(page)}>
          {page}
        </button>
      </li>
    ))}
    <li
      className={`page-item ${
        currentPage === totalPages || totalPages === 0 ? "disabled" : ""
      }`}
    >
      <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
        &raquo;
      </button>
    </li>
  </ul>
</div>

      </div>

      {/* Modal for creating wallet */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="branch_id" className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Select
                name="branch_id"
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={
                  formData.branch_id
                    ? { value: formData.branch_id, label: branches.find(b => b.id === Number(formData.branch_id))?.name }
                    : null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, branch_id: selected?.value || "" }))
                }
                placeholder="Select or type branch name..."
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
              <div className="mt-2">
                        <small>
                          Don’t see your branch?{" "}
                          <span
                            className="text-success"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/hrmsystemsetup/branch")}
                          >
                            Create Branch
                          </span>
                        </small>
                      </div>
            </Form.Group>

            <Form.Group controlId="amount" className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-cancel">Cancel and close</Tooltip>}
>
  <Button variant="secondary" onClick={() => setShowModal(false)}>
    Cancel
  </Button>
</OverlayTrigger>

<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-save">Save wallet details</Tooltip>}
>
  <Button variant="success" onClick={handleSave}>
    Add to Wallet
  </Button>
</OverlayTrigger>

        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BranchWallet;
