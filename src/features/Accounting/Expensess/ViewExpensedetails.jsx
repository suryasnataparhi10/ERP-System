// src/components/ViewExpenseModal.jsx
import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

const ViewExpenseModal = ({ show, onHide, expense, branchName, BASE_URL, getCategoryName }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Expense Details – {branchName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {expense ? (
          <div>
            <p><strong>Payment Date:</strong> {new Date(expense.payment_date).toLocaleDateString()}</p>
            <p><strong>Subtotal:</strong> {expense.subtotal}</p>
            <p><strong>Tax Total:</strong> {expense.tax_total}</p>
            <p><strong>Total Amount:</strong> {expense.total_amount}</p>
            <p><strong>Payment Status:</strong> {expense.payments_status}</p>
            <p><strong>Description:</strong> {expense.description}</p>
            <p><strong>Category:</strong> {getCategoryName(expense.category_id)}</p>
            <p><strong>Created By:</strong> {expense.creator?.name || "-"}</p>

            {expense.items && expense.items.length > 0 && (
              <>
                <hr />
                <h5>Expense Items</h5>
                <Table striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Subtotal</th>
                      <th>Tax Total</th>
                      <th>Total Amount</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expense.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{item.item_name}</td>
                        <td>{item.subtotal}</td>
                        <td>{item.tax_total}</td>
                        <td>{item.total_amount}</td>
                        <td>
                          {item.document ? (
                            <a
                              href={`${BASE_URL}/${item.document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewExpenseModal;
