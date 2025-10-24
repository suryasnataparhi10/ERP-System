import React, { useEffect, useState } from "react";
import { Modal, Form, Button, OverlayTrigger, Tooltip, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";

const InvoiceModal = ({
  show,
  onHide,
  purchase,
  invoices,
  setInvoices,
  selectedInvoice,
  setSelectedInvoice,
  isEditingInvoice,
  setIsEditingInvoice,
}) => {
  const [invoiceForm, setInvoiceForm] = useState({
    po_number: purchase?.po_number || "",
    payment_amount: "",
    cgst: "",
    sgst: "",
    igst: "",
    gst_type: "exclusive",
    base_amount: "",
    gst_amount: "",
  });

  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    if (purchase) {
      setInvoiceForm((prev) => ({
        ...prev,
        po_number: purchase.po_number || "",
      }));
    }
    if (isEditingInvoice && selectedInvoice) {
      setInvoiceForm({
        po_number: selectedInvoice.po_number,
        payment_amount: selectedInvoice.payment_amount || "",
        cgst: selectedInvoice.cgst || 0,
        sgst: selectedInvoice.sgst || 0,
        igst: selectedInvoice.igst || 0,
        gst_type: selectedInvoice.gst_type || "exclusive",
        base_amount: selectedInvoice.base_amount || "",
        gst_amount: selectedInvoice.gst_amount || "",
      });
    } else {
      setInvoiceForm({
        po_number: purchase?.po_number || "",
        payment_amount: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        gst_type: "exclusive",
        base_amount: "",
        gst_amount: "",
      });
    }
  }, [purchase, selectedInvoice, isEditingInvoice]);

  // ✅ Auto-calculate GST, base, and total
  useEffect(() => {
    const base = parseFloat(invoiceForm.payment_amount) || 0;
    const cgst = parseFloat(invoiceForm.cgst) || 0;
    const sgst = parseFloat(invoiceForm.sgst) || 0;
    const igst = parseFloat(invoiceForm.igst) || 0;

    const gstPercent = cgst + sgst + igst;
    let total = base;
    let gstAmount = 0;
    let baseAmount = base;

    if (gstPercent > 0) {
      if (invoiceForm.gst_type === "exclusive") {
        // ✅ GST is added on top
        gstAmount = (base * gstPercent) / 100;
        total = base + gstAmount;
      } else {
        // ✅ Inclusive — amount already includes GST
        baseAmount = base / (1 + gstPercent / 100);
        gstAmount = base - baseAmount;
        total = base; // total stays same
      }
    }

    setFinalAmount(total.toFixed(2));
    setInvoiceForm((prev) => ({
      ...prev,
      gst_amount: gstAmount.toFixed(2),
      base_amount: baseAmount.toFixed(2),
    }));
  }, [
    invoiceForm.payment_amount,
    invoiceForm.cgst,
    invoiceForm.sgst,
    invoiceForm.igst,
    invoiceForm.gst_type,
  ]);

  const handleInvoiceChange = (field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchInvoices = async () => {
    try {
      const res = await purchaseService.getPurchaseOrderInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filteredInvoices = res.data.filter(
          (inv) => inv.po_number === purchase.po_number
        );
        setInvoices(filteredInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices for this PO");
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const payload = {
        ...invoiceForm,
        po_number: purchase.po_number,
        total_amount: finalAmount,
      };

      if (isEditingInvoice && selectedInvoice) {
        await purchaseService.updatePurchaseOrderInvoice(selectedInvoice.id, payload);
        toast.success(`Invoice #${selectedInvoice.id} updated successfully`);
      } else {
        await purchaseService.createPurchaseOrderInvoice(payload);
        toast.success("Invoice created successfully");
      }

      onHide();
      setIsEditingInvoice(false);
      setSelectedInvoice(null);
      setInvoiceForm({
        po_number: purchase.po_number || "",
        payment_amount: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        gst_type: "exclusive",
        base_amount: "",
        gst_amount: "",
      });
      fetchInvoices();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditingInvoice ? "Edit Invoice" : "Create Invoice"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Payment Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.payment_amount}
                  onChange={(e) => handleInvoiceChange("payment_amount", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>GST Type</Form.Label>
                <Form.Select
                  value={invoiceForm.gst_type}
                  onChange={(e) => handleInvoiceChange("gst_type", e.target.value)}
                >
                  <option value="exclusive">Exclusive</option>
                  <option value="inclusive">Inclusive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>CGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.cgst}
                  onChange={(e) => handleInvoiceChange("cgst", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>SGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.sgst}
                  onChange={(e) => handleInvoiceChange("sgst", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>IGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.igst}
                  onChange={(e) => handleInvoiceChange("igst", e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ✅ Show calculated values */}
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label><strong>Total Amount (After GST)</strong></Form.Label>
                <Form.Control type="text" value={finalAmount} readOnly />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Create/Update Invoice</Tooltip>}>
          <Button variant="success" onClick={handleSaveInvoice}>
            {isEditingInvoice ? "Update Invoice" : "Create"}
          </Button>
        </OverlayTrigger>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
