import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Table, Button, OverlayTrigger, Tooltip, Spinner, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";
import PurchaseOrderModal from "./PurchaseOrderModal";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import BreadCrumb from "../../../components/BreadCrumb";
import InvoiceModal from "./POInvoiceModal";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Purchase edit modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    po_number: "",
    vendor_name: "",
    po_date: "",
    delivery_date: "",
    status: "Draft",
    branch_id: "",
    line_items: [{ item_name: "", quantity: "", unit_price: "" }],
  });

  const fetchPurchase = async () => {
    try {
      const res = await purchaseService.getPurchaseById(id);
      if (res?.success) {
        setPurchase(res.data);
        fetchInvoices(res.data.po_number);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast.error("Failed to fetch purchase order details");
    }
  };

  const fetchInvoices = async (poNumber) => {
    try {
      setLoadingInvoices(true);
      const res = await purchaseService.getPurchaseOrderInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filteredInvoices = res.data.filter(
          (inv) => inv.po_number === poNumber
        );
        setInvoices(filteredInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices for this PO");
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  if (!purchase) return <div className="text-center py-5">Loading...</div>;

  const subTotal = purchase.line_items.reduce(
    (sum, item) => sum + Number(item.line_total),
    0
  );

  const handleEdit = () => {
    setFormData({
      po_number: purchase.po_number || "",
      vendor_name: purchase.vendor_name || "",
      po_date: purchase.po_date?.split("T")[0] || "",
      delivery_date: purchase.delivery_date?.split("T")[0] || "",
      status: purchase.status || "Draft",
      branch_id: purchase.branch_id || "",
      line_items:
        purchase.line_items?.map((li) => ({
          item_name: li.item_name,
          quantity: li.quantity,
          unit_price: li.unit_price,
        })) || [{ item_name: "", quantity: "", unit_price: "" }],
    });
    setShowModal(true);
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.line_items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { item_name: "", quantity: "", unit_price: "" }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      await purchaseService.updatePurchaseOrder(purchase.id, formData);
      toast.success("Purchase Order updated successfully");
      setShowModal(false);
      fetchPurchase();
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast.error("Failed to update purchase order");
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: `Are you sure you want to permanently delete invoice #${invoiceId}?`,
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          await purchaseService.deletePurchaseOrderInvoice(invoiceId);
          toast.success(`Invoice #${invoiceId} deleted successfully`);
          fetchInvoices(purchase.po_number);
        } catch (error) {
          console.error("Error deleting invoice:", error);
          toast.error("Failed to delete invoice");
        }
      },
    });
  };

  const handleToggleInvoiceStatus = async (invoice) => {
    try {
      const newStatus =
        invoice.status?.toLowerCase() === "paid" ? "Pending" : "Paid";

      await purchaseService.updatePurchaseOrderInvoiceStatus(invoice.id, newStatus);
      toast.success(`Invoice #${invoice.id} marked as ${newStatus}`);
      fetchInvoices(purchase.po_number);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleInvoiceEdit = (invoice) => {
    setIsEditingInvoice(true);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Purchase Order Details</h4>
          <div className="w-100 mt-2">
            <BreadCrumb 
              pathname={window.location.pathname} 
              lastLabel={`PO #${purchase.po_number}`} 
              dynamicNames={{ 
                "purchase-orders": "Purchase Order",
                [id]: `PO #${purchase.po_number}` 
              }} 
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Create Invoice</Tooltip>}
          >
            <Button size="sm" variant="success" onClick={() => setShowInvoiceModal(true)}>
              <i className="bi bi-plus me-1"></i>Create Invoice
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip>Edit Purchase Order</Tooltip>}>
            <Button variant="info" size="sm" onClick={handleEdit}>
              <i className="bi bi-pencil text-white"></i>
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip>Go Back</Tooltip>}>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Top Info Section */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100">
            <h6 className="fw-bold mb-3">Purchase Order Info</h6>
            <p><strong>PO Number:</strong> {purchase.po_number}</p>
            <p><strong>Vendor:</strong> {purchase.vendor_name}</p>
            <p><strong>Status:</strong> {purchase.status}</p>
            <p><strong>PO Date:</strong> {new Date(purchase.po_date).toLocaleDateString()}</p>
          </Card>
        </Col>
<Col md={4}>
  <Card className="p-4 shadow-sm h-100">
    <h6 className="fw-bold mb-3">Delivery Info</h6>
    <p><strong>Delivery Date:</strong> {new Date(purchase.delivery_date).toLocaleDateString()}</p>
    {purchase.branch ? (
      <>
        <p><strong>Branch Name:</strong> {purchase.branch.name}</p>
        <p><strong>Address:</strong> {purchase.branch.branch_address || "-"}</p>
        <p><strong>Contact:</strong> {purchase.branch.contact_number || "-"}</p>
      </>
    ) : (
      <p className="text-muted fst-italic">No branch details available.</p>
    )}
  </Card>
</Col>

        <Col md={4}>
          <Card className="p-4 shadow-sm h-100">
            <h6 className="fw-bold mb-3">Financial Summary</h6>
            <p><strong>Total Line Items:</strong> {purchase.line_items.length}</p>
            <p><strong>Sub Total:</strong> ₹{subTotal.toLocaleString()}</p>
          </Card>
        </Col>
      </Row>

      {/* Line Items */}
      <Card className="p-4 shadow-sm">
        <h6 className="fw-bold mb-5">Line Items</h6>
        {purchase.line_items.length > 0 ? (
          <Table size="sm" bordered hover responsive className="mb-0 text-center">
            <thead className="table-secondary">
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.line_items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.item_name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.unit_price).toLocaleString()}</td>
                  <td>₹{Number(item.line_total).toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-end fw-bold">Sub Total</td>
                <td className="fw-bold text-primary">₹{subTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </Table>
        ) : <div className="text-muted fst-italic">No line items found.</div>}
      </Card>

{/* Invoice Table */}
{loadingInvoices ? (
  <div className="text-center"><Spinner animation="border" size="sm" /></div>
) : invoices.length > 0 && (
  <Card className="p-4 shadow-sm mt-4">
    <h6 className="fw-bold mb-3">Invoice Summary</h6>
    <Table striped bordered hover responsive className="text-center mt-3">
      <thead className="table-secondary">
        <tr>
          <th>Invoice</th>
          <th>Invoice Date</th>
          <th>Amount</th>
          <th>Gst</th>
          <th>Total Amount</th>
          <th>Remaining Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id}>
            <td>
              <Button variant="outline-success" className="px-3 py-2" size="sm">
                #{String(inv.id).padStart(6, "0")}
              </Button>
            </td>
            <td>{new Date(inv.created_at).toLocaleDateString()}</td>
            <td>₹{parseFloat(inv.base_amount || 0).toFixed(2)}</td>
            <td>₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
            <td>₹{parseFloat(inv.total_amount || 0).toFixed(2)}</td>
            <td>₹{parseFloat(inv.remaining_amount || 0).toFixed(2)}</td>
            <td>
              <span
                className={`badge ${
                  inv.status?.toLowerCase() === "paid"
                    ? "bg-success"
                    : inv.status?.toLowerCase() === "pending"
                    ? "bg-warning text-dark"
                    : inv.status?.toLowerCase() === "draft"
                    ? "bg-secondary"
                    : inv.status?.toLowerCase() === "partial"
                    ? "bg-info text-dark"
                    : "bg-light text-dark"
                }`}
              >
                {inv.status || "N/A"}
              </span>
            </td>
            <td>
              <OverlayTrigger overlay={<Tooltip>View invoice details</Tooltip>}>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-1"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  <i className="bi bi-eye"></i>
                </Button>
              </OverlayTrigger>

              <OverlayTrigger placement="top" overlay={<Tooltip>Edit Invoice</Tooltip>}>
                <Button variant="info" size="sm" onClick={() => handleInvoiceEdit(inv)}>
                  <i className="bi bi-pencil text-white"></i>
                </Button>
              </OverlayTrigger>

              <OverlayTrigger
                overlay={<Tooltip>{inv.status?.toLowerCase() === "paid" ? "Mark invoice as Pending" : "Mark invoice as Paid"}</Tooltip>}
              >
                <Button
                  size="sm"
                  variant={inv.status?.toLowerCase() === "paid" ? "success" : "warning"}
                  className="me-1"
                  onClick={() => handleToggleInvoiceStatus(inv)}
                >
                  {inv.status?.toLowerCase() === "paid" ? (
                    <i className="bi bi-hourglass-bottom"></i>
                  ) : (
                    <i className="bi bi-hourglass-top"></i>
                  )}
                </Button>
              </OverlayTrigger>

              <OverlayTrigger overlay={<Tooltip>Delete this invoice</Tooltip>}>
                <Button size="sm" variant="danger" onClick={() => handleDeleteInvoice(inv.id)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </OverlayTrigger>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
)}


      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => {
          setShowInvoiceModal(false);
          setIsEditingInvoice(false);
          setSelectedInvoice(null);
        }}
        purchase={purchase}
        invoices={invoices}
        setInvoices={setInvoices}
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
        isEditingInvoice={isEditingInvoice}
        setIsEditingInvoice={setIsEditingInvoice}
      />

      {/* Purchase Edit Modal */}
      <PurchaseOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedPurchase={purchase}
        handleSave={handleSave}
        addLineItem={addLineItem}
        removeLineItem={removeLineItem}
        handleLineItemChange={handleLineItemChange}
      />
    </div>
  );
};

export default PurchaseOrderDetails;
