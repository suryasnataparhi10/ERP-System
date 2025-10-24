// src/pages/Accounting/CreditPurchase.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Row, Col, Card, Form, Modal, Badge, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Plus, Download } from "react-bootstrap-icons";
import creditPurchaseService from "../../../services/expensessService";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import CreditPurchaseModal from "./CreditPurchaseModal";
import ViewCredDocumentsModal from "./ViewCredDocumentsModal";
import BreadCrumb from "../../../components/BreadCrumb";

const CreditPurchase = () => {
  const [creditPurchases, setCreditPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [selectedIds, setSelectedIds] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDocsModal, setShowDocsModal] = useState(false);
const [currentDocuments, setCurrentDocuments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Filters
  const [taxableFilter, setTaxableFilter] = useState("all");

  const fetchCreditPurchases = async () => {
    setLoading(true);
    try {
      const res = await creditPurchaseService.getAllCreditPurchases();
      setCreditPurchases(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to fetch credit purchases");
    }
    setLoading(false);
  };
  const fetchDropdownData = async () => {
    try {
      const [branchList, categoryList] = await Promise.all([
        branchService.getAll(),
        categoryService.getAllCategories(),
      ]);
      setBranches(branchList);
      setCategories(categoryList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCreditPurchases();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchCreditPurchases();
  }, []);

  const openCreateModal = () => {
    setEditingPurchase(null);
    setShowModal(true);
  };

  const openEditModal = (purchase) => {
    setEditingPurchase(purchase);
    setShowModal(true);
  };

  // Filters
  const filteredPurchases = creditPurchases.filter((cp) => {
    if (taxableFilter === "taxable") {
      return cp.items.some((i) => i.is_taxable);
    } else if (taxableFilter === "non-taxable") {
      return cp.items.every((i) => !i.is_taxable);
    }
    return true;
  });

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPurchases.length / entriesPerPage) || 1;


  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>          
          <h4>Credit Purchases</h4>
          <BreadCrumb pathname={location?.pathname || ""} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Add New Credit Purchase</Tooltip>}>
          <Button size="sm" variant="success" onClick={openCreateModal}>
            <Plus />
          </Button>
        </OverlayTrigger>
      </div>

      <Card className="p-4 shadow-sm">
        <Row className="align-items-center justify-content-between mb-5">
          <Col md={1}>
            <Form.Select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Group>
              {/* <Form.Label>Taxable Filter</Form.Label> */}
              <Form.Select value={taxableFilter} onChange={(e) => setTaxableFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="taxable">Taxable</option>
                <option value="non-taxable">Non-Taxable</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table hover striped className="text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Supply Type</th>
                <th>Total Amount</th>
                <th>Tax</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center">Loading...</td></tr>
              ) : currentPurchases.length > 0 ? (
                currentPurchases.map((cp, idx) => (
                  <tr key={cp.id}>
                    <td>{idx + 1}</td>
                    <td>{cp.description}</td>
                    <td>{cp.vendor_name}</td>
                    <td>{cp.type_of_supply_or_service}</td>
                    <td>₹{cp.total_amount}</td>
                    <td>₹{cp.tax_total}</td>
                    <td>
                      <Badge bg={cp.payment_status?.toLowerCase() === "paid" ? "success" : "warning"}>{cp.payment_status}</Badge>
                    </td>
                    <td>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit Documents</Tooltip>}>
                      <Button size="sm" variant="info" className="me-2" onClick={() => openEditModal(cp)}><i className="bi bi-pencil text-white"></i></Button>
                      </OverlayTrigger>
                      {/* <Button size="sm" variant="danger" onClick={() => handleDelete(cp.id)}>Delete</Button> */}
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Documents</Tooltip>}>
  <Button
    size="sm"
    variant="secondary"
    className="me-2"
onClick={() => {
  const allDocs = cp.items
    ?.filter(item => item.document) // Only include items with a document
    ?.map(item => item.document) || [];

  setCurrentDocuments(allDocs);
  setShowDocsModal(true);
}}
  >
    <i className="bi bi-file-earmark-richtext"></i>
  </Button>
</OverlayTrigger>

                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center">No credit purchases found.</td></tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="small text-muted">
              Showing {filteredPurchases.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredPurchases.length)} of {filteredPurchases.length} entries
            </div>
            <div>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&laquo;</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>&raquo;</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <CreditPurchaseModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        branches={branches}
        categories={categories}
        editingPurchase={editingPurchase}
        onSuccess={fetchCreditPurchases}
      />
      <ViewCredDocumentsModal
  show={showDocsModal}
  onHide={() => setShowDocsModal(false)}
  documents={currentDocuments}
/>

    </div>
  );
};

export default CreditPurchase;
