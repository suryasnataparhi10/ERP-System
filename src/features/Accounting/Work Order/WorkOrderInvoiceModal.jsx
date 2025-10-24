// InvoiceModal.jsx
import React from "react";
import { Modal, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";

const InvoiceModal = ({
  show,
  onHide,
  invoiceData,
  handleInvoiceChange,
  handleSaveInvoice,
  creatingInvoice,
  isEditingInvoice,
  workOrder,
}) => {
  const paymentAmount = parseFloat(invoiceData.payment_amount) || 0;
  const cgst = parseFloat(invoiceData.cgst) || 0;
  const sgst = parseFloat(invoiceData.sgst) || 0;
  const igst = parseFloat(invoiceData.igst) || 0;
  const gstType = invoiceData.gst_type || "exclusive";
  const woAmount = parseFloat(workOrder?.amount) || 0;

  // Calculate GST amounts
  let baseAmount = 0,
    totalTax = 0,
    totalAmount = 0,
    remainingAmount = 0;

  if (gstType === "exclusive") {
    totalTax = paymentAmount * (cgst + sgst + igst) / 100;
    baseAmount = paymentAmount;
    totalAmount = baseAmount + totalTax;
  } else {
    baseAmount = paymentAmount / (1 + (cgst + sgst + igst) / 100);
    totalTax = paymentAmount - baseAmount;
    totalAmount = paymentAmount;
  }

  remainingAmount = woAmount - baseAmount;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditingInvoice
            ? `Edit Invoice for ${workOrder?.wo_number}`
            : `Create Invoice for ${workOrder?.wo_number}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Payment Amount</Form.Label>
            <Form.Control
              type="number"
              name="payment_amount"
              value={invoiceData.payment_amount}
              onChange={handleInvoiceChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>CGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="cgst"
              value={invoiceData.cgst}
              onChange={handleInvoiceChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>SGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="sgst"
              value={invoiceData.sgst}
              onChange={handleInvoiceChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>IGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="igst"
              value={invoiceData.igst}
              onChange={handleInvoiceChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>GST Type</Form.Label>
            <Form.Select
              name="gst_type"
              value={invoiceData.gst_type || "exclusive"}
              onChange={handleInvoiceChange}
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </Form.Select>
          </Form.Group>

          <hr />

<div className="d-flex flex-column align-items-end justify-content-end">
  <p className="mb-2"><strong>Amount:</strong> ₹{baseAmount.toFixed(2)}</p>
  <p className="mb-2"><strong>Total Tax:</strong> ₹{totalTax.toFixed(2)}</p>
  <p className="mb-2"><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</p>
  <p className="mb-2"><strong>Remaining Amount:</strong> ₹{remainingAmount.toFixed(2)}</p>
</div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <OverlayTrigger overlay={<Tooltip>Cancel invoice creation</Tooltip>}>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          overlay={
            <Tooltip>
              {isEditingInvoice
                ? "Update existing invoice"
                : "Create a new invoice"}
            </Tooltip>
          }
        >
          <Button
            variant="success"
            onClick={handleSaveInvoice}
            disabled={creatingInvoice}
          >
            {creatingInvoice
              ? isEditingInvoice
                ? "Updating..."
                : "Creating..."
              : isEditingInvoice
              ? "Update Invoice"
              : "Create Invoice"}
          </Button>
        </OverlayTrigger>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
