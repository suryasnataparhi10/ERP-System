import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { getBranches } from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import expensesService from "../../../services/expensessService";

const EditExpenseModal = ({ show, onHide, expense, onUpdated }) => {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: "",
    category_id: "",
    description: "",
    amount: "",
    tax_rate: "",
    is_taxable: false,
    payment_status: "Pending",
  });

  const [items, setItems] = useState([
    { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null },
  ]);

  // Fetch branches & categories
  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Error fetching branches", err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Prefill modal when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        branch_id: expense.branch_id || "",
        category_id: expense.category_id || "",
        description: expense.description || "",
        amount: parseFloat(expense.total_amount) || "",
        tax_rate:
          expense.tax_total && expense.subtotal
            ? ((parseFloat(expense.tax_total) / parseFloat(expense.subtotal)) * 100).toFixed(2)
            : "",
        is_taxable: !!expense.is_taxable,
        payment_status:
          expense.payments_status?.toLowerCase() === "paid" ? "Paid" : "Pending",
      });

      const prefillItems = expense.items?.map((item) => ({
        item_name: item.item_name,
        subtotal: parseFloat(item.subtotal),
        is_taxable: item.is_taxable,
        tax_rate: parseFloat(item.tax_rate),
        tax_type: item.tax_type,
        document: null, // user can upload new document
      })) || [
        { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null },
      ];

      setItems(prefillItems);
    }
  }, [expense]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleItemFileChange = (index, file) => {
    const updatedItems = [...items];
    updatedItems[index].document = file;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null }]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      data.append("branch_id", formData.branch_id);
      data.append("category_id", formData.category_id);
      data.append("description", formData.description);
      data.append("total_amount", formData.amount);
      data.append("tax_rate", formData.tax_rate);
      data.append("is_taxable", formData.is_taxable);
      data.append("payments_status", formData.payment_status.toLowerCase());

      // Append dynamic items
      items.forEach((item, i) => {
        data.append(`items[${i}][item_name]`, item.item_name);
        data.append(`items[${i}][subtotal]`, item.subtotal);
        data.append(`items[${i}][is_taxable]`, item.is_taxable);
        data.append(`items[${i}][tax_rate]`, item.tax_rate);
        data.append(`items[${i}][tax_type]`, item.tax_type);
        if (item.document) data.append(`item_document_${i}`, item.document);
      });

      await expensesService.updateExpense(expense.id, data);
      toast.success("Expense updated successfully");
      onHide();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update expense");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Expense</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label><strong>Branch</strong></Form.Label>
                <Form.Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{loadingBranches ? "Loading..." : "Select Branch"}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label><strong>Category</strong></Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{loadingCategories ? "Loading..." : "Select Category"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label><strong>Description</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            {/* Amount, Tax, Payment Status */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Label>Tax Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4} className="d-flex align-items-center mt-4">
                <Form.Check
                  type="checkbox"
                  name="is_taxable"
                  label="Is Taxable?"
                  checked={formData.is_taxable}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="mb-3 text-end">
              <Button variant="info" onClick={addItem}>Add Item</Button>
            </div>

            {items.map((item, index) => (
              <Row key={index} className="mb-3 align-items-center">
                <Col md={2}>
                  <Form.Label><strong>Item Name</strong></Form.Label>
                  <Form.Control
                    type="text"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                    required
                  />
                </Col>

                <Col md={2}>
                  <Form.Label><strong>Subtotal</strong></Form.Label>
                  <Form.Control
                    type="number"
                    value={item.subtotal}
                    onChange={(e) => handleItemChange(index, "subtotal", parseFloat(e.target.value))}
                    required
                  />
                </Col>

                <Col md={2} className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="Is Taxable"
                    checked={item.is_taxable}
                    onChange={(e) => handleItemChange(index, "is_taxable", e.target.checked)}
                  />
                </Col>

                {item.is_taxable && (
                  <>
                    <Col md={2}>
                      <Form.Label><strong>Tax Rate (%)</strong></Form.Label>
                      <Form.Control
                        type="number"
                        value={item.tax_rate}
                        onChange={(e) => handleItemChange(index, "tax_rate", parseFloat(e.target.value))}
                        required
                      />
                    </Col>

                    <Col md={2}>
                      <Form.Label><strong>Tax Type</strong></Form.Label>
                      <Form.Select
                        value={item.tax_type}
                        onChange={(e) => handleItemChange(index, "tax_type", e.target.value)}
                        required
                      >
                        <option value="">Select Tax Type</option>
                        <option value="inclusive">Inclusive</option>
                        <option value="exclusive">Exclusive</option>
                      </Form.Select>
                    </Col>
                  </>
                )}

                <Col md={2}>
                  <Form.Label><strong>Upload Document</strong></Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleItemFileChange(index, e.target.files[0])}
                  />
                </Col>
              </Row>
            ))}

            <div className="text-end mt-4">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Update Expense
              </Button>
            </div>
          </Form>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default EditExpenseModal;
