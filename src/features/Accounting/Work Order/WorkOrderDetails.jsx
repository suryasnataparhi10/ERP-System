import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Row, Col, Button, Spinner, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import workOrderService from "../../../services/workOrderService";
import WorkOrderModal from "./WorkOrderModal";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import InvoiceModal from "./WorkOrderInvoiceModal";
import InvoiceSummary from "./InvoiceSummaryTable";

const WorkOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "In Progress",
    priority: "Medium",
    assigned_to: "",
    issue_date: "",
    expected_date: "",
    expected_days: "",
    start_date: "",
    end_date: "",
    actual_days: "",
    amount: "",
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    payment_amount: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    gst_type: "inclusive",
  });
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch work order by ID
  const fetchWorkOrder = async () => {
    try {
      const res = await workOrderService.getWorkOrderById(id);
      if (res?.success) {
        setWorkOrder(res.data);
      } else {
        toast.error("Failed to fetch work order details");
      }
    } catch (err) {
      toast.error("Error loading work order details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices for this work order
  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await workOrderService.getAllInvoices();
      if (res?.success) {
        const woInvoices = res.data.filter((inv) => inv.wo_number === workOrder.wo_number);
        setInvoices(woInvoices);
      } else {
        setInvoices([]);
        toast.error("Failed to fetch invoices");
      }
    } catch (err) {
      console.error(err);
      setInvoices([]);
      toast.error("Error fetching invoices");
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  useEffect(() => {
    if (workOrder?.wo_number) {
      fetchInvoices();
    }
  }, [workOrder]);

  const formatForDatetimeLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const toISOStringLocal = (localDateStr) => {
    if (!localDateStr || localDateStr.trim() === "") return null;
    const date = new Date(localDateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  const handleShowModal = (wo = null) => {
    if (wo) {
      setSelectedWorkOrder(wo);

      let docs = [];
      try {
        if (typeof wo.document === "string") {
          docs = JSON.parse(wo.document);
        } else if (Array.isArray(wo.document)) {
          docs = wo.document;
        }
      } catch {
        docs = [wo.document].filter(Boolean);
      }

      setFormData({
        wo_number: wo.wo_number || "",
        title: wo.title || "",
        description: wo.description || "",
        status: wo.status || "In Progress",
        priority: wo.priority || "Medium",
        assigned_to: wo.assigned_to || wo.assignedBranch?.id || "",
        wo_type: wo.wo_type || "",
        issue_date: formatForDatetimeLocal(wo.issue_date),
        expected_date: formatForDatetimeLocal(wo.expected_date),
        expected_days: wo.expected_days || "",
        start_date: formatForDatetimeLocal(wo.start_date),
        end_date: formatForDatetimeLocal(wo.end_date),
        actual_days: wo.actual_days || "",
        amount: wo.amount || "",
        documents: docs || [],
      });
    } else {
      setSelectedWorkOrder(null);
      setFormData({
        wo_number: "",
        title: "",
        description: "",
        status: "In Progress",
        priority: "Medium",
        assigned_to: "",
        wo_type: "",
        issue_date: "",
        expected_date: "",
        expected_days: "",
        start_date: "",
        end_date: "",
        actual_days: "",
        amount: "",
        documents: [],
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        issue_date: toISOStringLocal(formData.issue_date),
        expected_date: toISOStringLocal(formData.expected_date),
        start_date: toISOStringLocal(formData.start_date),
        end_date: toISOStringLocal(formData.end_date),
      };

      await workOrderService.updateWorkOrder(selectedWorkOrder.id, payload);
      toast.success("Work Order updated successfully");
      setShowModal(false);
      fetchWorkOrder();
    } catch (error) {
      console.error("Error updating work order:", error);
      toast.error("Failed to update work order");
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceData({
      payment_amount: invoice.payment_amount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      gst_type: invoice.gst_type || "inclusive",
    });
    setEditingInvoiceId(invoice.id);
    setIsEditingInvoice(true);
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.payment_amount) {
      toast.error("Payment amount is required");
      return;
    }

    setCreatingInvoice(true);
    try {
      const payload = {
        wo_number: workOrder.wo_number,
        payment_amount: parseFloat(invoiceData.payment_amount),
        cgst: parseFloat(invoiceData.cgst),
        sgst: parseFloat(invoiceData.sgst),
        igst: parseFloat(invoiceData.igst),
        gst_type: invoiceData.gst_type,
        status: "pending",
      };

      let res;
      if (isEditingInvoice) {
        res = await workOrderService.updateInvoice(editingInvoiceId, payload);
      } else {
        res = await workOrderService.createInvoice(payload);
      }

      if (res?.success) {
        toast.success(isEditingInvoice ? "Invoice updated successfully" : "Invoice created successfully");
        setShowInvoiceModal(false);
        setInvoiceData({ payment_amount: "", cgst: 0, sgst: 0, igst: 0, gst_type: "inclusive" });
        setIsEditingInvoice(false);
        setEditingInvoiceId(null);
        fetchInvoices();
      } else {
        toast.error(isEditingInvoice ? "Failed to update invoice" : "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: "Are you sure you want to delete this invoice? This action cannot be undone.",
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          const res = await workOrderService.deleteInvoice(invoiceId);
          if (res?.success) {
            toast.success("Invoice deleted successfully");
            fetchInvoices();
          } else {
            toast.error("Failed to delete invoice");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error deleting invoice");
        }
      },
    });
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await workOrderService.updateInvoiceStatus(invoiceId, newStatus);
      if (res?.success) {
        toast.success(`Invoice status updated to "${newStatus}"`);
        fetchInvoices();
      } else {
        toast.error("Failed to update invoice status");
      }
    } catch (err) {
      console.error("Error updating invoice status:", err);
      toast.error("Error updating invoice status");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!workOrder) {
    return <div className="text-center my-5 text-muted">No details found.</div>;
  }

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Work Order Details</h4>
          <BreadCrumb pathname={location?.pathname || ""} lastLabel="Work Order Details" />
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger overlay={<Tooltip>Create a new invoice</Tooltip>}>
            <Button
              variant="success"
              size="sm"
              className="text-white"
              onClick={() => setShowInvoiceModal(true)}
            >
              <i className="bi bi-receipt"></i> Create Invoice
            </Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Edit this work order</Tooltip>}>
            <Button
              variant="info"
              size="sm"
              className="text-white"
              onClick={() => handleShowModal(workOrder)}
            >
              <i className="bi bi-pencil"></i> Edit
            </Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Go back to previous page</Tooltip>}>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Work Order Info Cards */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100">
            <h6 className="fw-bold mb-3">Work Order Info</h6>
            <p className="mb-1"><strong>WO Number:</strong> {workOrder.wo_number}</p>
            <p className="mb-1"><strong>Title:</strong> {workOrder.title}</p>
            <p className="mb-1"><strong>Description:</strong> {workOrder.description || "N/A"}</p>
            <p className="mb-1"><strong>Status:</strong> {workOrder.status}</p>
            <p className="mb-0"><strong>Priority:</strong> {workOrder.priority}</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100">
            <h6 className="fw-bold mb-3">Branch Info</h6>
            {workOrder.assignedBranch ? (
              <>
                <p className="mb-1"><strong>Branch Name:</strong> {workOrder.assignedBranch.name}</p>
                <p className="mb-1"><strong>Address:</strong> {workOrder.assignedBranch.branch_address || "-"}</p>
                <p className="mb-0"><strong>Contact:</strong> {workOrder.assignedBranch.contact_number || "-"}</p>
              </>
            ) : (
              <p className="text-muted fst-italic">No branch details available.</p>
            )}
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100">
            <h6 className="fw-bold mb-3">Dates & Duration</h6>
            <p className="mb-1"><strong>Issue Date:</strong> {workOrder.issue_date ? new Date(workOrder.issue_date).toLocaleDateString() : "-"}</p>
            <p className="mb-1"><strong>Expected End:</strong> {workOrder.expected_date ? new Date(workOrder.expected_date).toLocaleDateString() : "-"}</p>
            <p className="mb-1"><strong>Actual Start:</strong> {workOrder.start_date ? new Date(workOrder.start_date).toLocaleDateString() : "-"}</p>
            <p className="mb-0"><strong>Actual End:</strong> {workOrder.end_date ? new Date(workOrder.end_date).toLocaleDateString() : "-"}</p>
          </Card>
        </Col>
      </Row>

      {/* Additional Details */}
      <Card className="p-4 shadow-sm mt-4">
        <h6 className="fw-bold mb-3">Details</h6>
        <Row>
          <Col md={4}>
            <p className="mb-1"><strong>Amount:</strong> {workOrder.amount ? `₹${parseFloat(workOrder.amount).toFixed(2)}` : "-"}</p>
            <p className="mb-1"><strong>Expected Days:</strong> {workOrder.expected_days || "-"}</p>
            <p className="mb-1"><strong>Actual Days:</strong> {workOrder.actual_days || "-"}</p>
          </Col>
        </Row>
      </Card>

      {/* Invoice Table */}
      <InvoiceSummary
        invoices={invoices}
        loadingInvoices={loadingInvoices}
        handleViewInvoice={handleViewInvoice}
        handleEditInvoice={handleEditInvoice}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteInvoice={handleDeleteInvoice}
      />

      {/* Work Order Modal */}
      <WorkOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedWorkOrder={selectedWorkOrder}
        handleSave={handleSave}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => {
          setShowInvoiceModal(false);
          setIsEditingInvoice(false);
          setEditingInvoiceId(null);
        }}
        invoiceData={invoiceData}
        handleInvoiceChange={handleInvoiceChange}
        handleSaveInvoice={handleSaveInvoice}
        creatingInvoice={creatingInvoice}
        isEditingInvoice={isEditingInvoice}
        workOrder={workOrder}
      />

      {/* View Invoice Modal */}
      <Modal show={showViewInvoiceModal} onHide={() => setShowViewInvoiceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div>
              <p><strong>Invoice ID:</strong> {selectedInvoice.id}</p>
              <p><strong>WO Number:</strong> {selectedInvoice.wo_number}</p>
              <p><strong>Payment Amount:</strong> ₹{parseFloat(selectedInvoice.payment_amount).toFixed(2)}</p>
              <p><strong>CGST:</strong> {selectedInvoice.cgst}%</p>
              <p><strong>SGST:</strong> {selectedInvoice.sgst}%</p>
              <p><strong>IGST:</strong> {selectedInvoice.igst}%</p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <OverlayTrigger overlay={<Tooltip>Close this window</Tooltip>}>
            <Button variant="secondary" onClick={() => setShowViewInvoiceModal(false)}>Close</Button>
          </OverlayTrigger>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkOrderDetails;
