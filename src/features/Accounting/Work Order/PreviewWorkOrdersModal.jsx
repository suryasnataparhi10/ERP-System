import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

const PreviewWorkOrdersModal = ({ show, onHide, data, handleDownloadExcel, handleDownloadPDF }) => (
  <Modal size="lg" show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Work Orders Preview</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>WO Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned To</th>
            <th>Issue Date</th>
            <th>Expected Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((wo, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{wo.wo_number}</td>
              <td>{wo.title}</td>
              <td>{wo.status}</td>
              <td>{wo.priority}</td>
              <td>{wo.assigned_to}</td>
              <td>{wo.issue_date}</td>
              <td>{wo.expected_date}</td>
              <td>{wo.amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
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

export default PreviewWorkOrdersModal;
