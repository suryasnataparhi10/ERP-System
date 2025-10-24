// src/components/PreviewModal.jsx
import React from "react";
import { Modal, Table, Badge, Button } from "react-bootstrap";

const PreviewModal = ({ show, onClose, transactions, months, handleDownloadPDF, handleDownloadExcel }) => {
  if (!transactions) return null;

  // Group by month for display
  const groupedByMonth = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.created_at);
    const txMonth = (date.getMonth() + 1).toString().padStart(2, "0");
    const monthName = months.find((m) => m.value === txMonth)?.name || txMonth;
    if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
    groupedByMonth[monthName].push(tx);
  });

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Preview Excel Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.keys(groupedByMonth).map((monthName) => (
          <div key={monthName} className="mb-4">
            <h5>{monthName}</h5>
            <Table bordered hover size="sm" className="text-center">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {groupedByMonth[monthName].map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td>{tx.transaction_type === "credit" ? `₹${tx.amount}` : ""}</td>
                    <td>{tx.transaction_type === "debit" ? `₹${tx.amount}` : ""}</td>
                    <td>₹{tx.balance_after}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onclose}>
          Close
        </Button>
        <Button variant="success" onClick={handleDownloadExcel}>
          Download Excel
        </Button>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
