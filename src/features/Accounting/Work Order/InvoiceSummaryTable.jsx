// src/pages/WorkOrder/components/InvoiceSummary.jsx
import React from "react";
import { Card, Table, Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";

const InvoiceSummary = ({
  invoices,loadingInvoices,handleViewInvoice,
  handleEditInvoice,handleUpdateStatus,handleDeleteInvoice,
}) => {
  if (loadingInvoices) {
    return (
      <div className="text-center"><Spinner animation="border" size="sm" /></div>
    );
  }

  if (!invoices || invoices.length === 0) {return null;}

  return (
    <Card className="p-4 shadow-sm mt-4">
      <h6 className="fw-bold mb-5">Invoice Summary</h6>
      <Table striped bordered hover responsive className="text-center">
        <thead className="table-secondary">
          <tr>
            <th>Invoice</th>
            <th>Issue Date</th>
            <th>Amount</th>
            <th>GST</th>
            <th>Total Amount</th>
            <th>Remaining Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td><Button variant="outline-success" className="px-3 py-2">#{String(inv.id).padStart(6, "0")}</Button></td>
              <td>{new Date(inv.created_at).toLocaleDateString()}</td>
              <td>₹{parseFloat(inv.base_amount || 0).toFixed(2)}</td>
              <td>₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
              <td>₹{parseFloat(inv.total_amount || 0).toFixed(2)}</td>
              <td>₹{parseFloat(inv.remaining_amount || 0).toFixed(2)}</td>
              <td>
                <span
                  className={`badge ${
                    inv.status === "paid"
                      ? "bg-success": inv.status === "pending"
                      ? "bg-warning text-dark": inv.status === "draft"
                      ? "bg-secondary": inv.status === "partial"
                      ? "bg-info text-dark": "bg-light text-dark"
                  }`}
                >
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </td>
              <td>
                <OverlayTrigger overlay={<Tooltip>View invoice details</Tooltip>}>
                  <Button size="sm" variant="warning"
                    className="me-1" onClick={() => handleViewInvoice(inv)}
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip>Edit this invoice</Tooltip>}>
                  <Button size="sm" variant="info"
                    className="me-1" onClick={() => handleEditInvoice(inv)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  overlay={
                    <Tooltip>
                      {inv.status === "paid"? "Mark invoice as Pending": "Mark invoice as Paid"}
                    </Tooltip>
                  }
                >
                  <Button size="sm" variant={inv.status === "paid" ? "success" : "warning"}
                    className="me-1"
                    onClick={() =>handleUpdateStatus(inv.id,inv.status === "paid" ? "pending" : "paid")
                    }
                  >
                    {inv.status === "paid" ? (
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
  );
};

export default InvoiceSummary;
