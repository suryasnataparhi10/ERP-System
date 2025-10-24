import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { getBranches } from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import expenseService from "../../../services/expensessService";
import { useNavigate } from "react-router-dom";

const ExpenseForm = ({ initialBranchId, existingExpense, onCancel, onSuccess }) => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Main form data
  const [formData, setFormData] = useState({
    branch_id: initialBranchId || "",
    category_id: "",
    description: "",
  });

  // Dynamic items array with document
  const [items, setItems] = useState([
    { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null },
  ]);

  useEffect(() => {
    fetchBranches();
    fetchCategories();

    if (existingExpense) {
      setFormData({
        branch_id: existingExpense.branch_id,
        category_id: existingExpense.category_id,
        description: existingExpense.description || "",
      });

      const prefillItems = existingExpense.items.map((item) => ({
        item_name: item.item_name,
        subtotal: parseFloat(item.subtotal),
        is_taxable: item.is_taxable,
        tax_rate: parseFloat(item.tax_rate),
        tax_type: item.tax_type,
        document: null, // leave empty, user can upload new
      }));
      setItems(prefillItems);
    }
  }, [existingExpense]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const branchesData = await getBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
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
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("branch_id", formData.branch_id);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.description);

      // Append dynamic items with document
      items.forEach((item, i) => {
        submitData.append(`items[${i}][item_name]`, item.item_name);
        submitData.append(`items[${i}][subtotal]`, item.subtotal);
        submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
        submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
        submitData.append(`items[${i}][tax_type]`, item.tax_type);
        if (item.document) submitData.append(`item_document_${i}`, item.document);
      });

      const response = await expenseService.createExpense(submitData);

      if (response?.success === false) {
        toast.error(response.message || "Failed to create expense.");
        return;
      }

      toast.success("Expense saved successfully!");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save expense");
    }
  };
const subtotal = items.reduce((sum, item) => {
  const itemSubtotal = parseFloat(item.subtotal) || 0;
  if (item.is_taxable && item.tax_type === "inclusive" && item.tax_rate) {
    // For inclusive tax, remove tax from subtotal
    return sum + (itemSubtotal / (1 + item.tax_rate / 100));
  }
  return sum + itemSubtotal;
}, 0);

const totalTax = items.reduce((sum, item) => {
  const itemSubtotal = parseFloat(item.subtotal) || 0;
  if (item.is_taxable && item.tax_rate) {
    if (item.tax_type === "inclusive") {
      // Tax part of inclusive subtotal
      return sum + (itemSubtotal - itemSubtotal / (1 + item.tax_rate / 100));
    } else {
      // Exclusive tax
      return sum + (itemSubtotal * item.tax_rate) / 100;
    }
  }
  return sum;
}, 0);

const totalAmount = subtotal + totalTax;
  return (
    <Card className="p-4">
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label><strong>Branch</strong></Form.Label>
            <Form.Select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
              disabled={!!initialBranchId}
            >
              <option value="">{loadingBranches ? "Loading branches..." : "Select Branch"}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label><strong>Category</strong></Form.Label>
            <Form.Select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              <option value="">{loadingCategories ? "Loading categories..." : "Select Category"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label><strong>Description</strong></Form.Label>
            <Form.Control
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </Col>
        </Row>

        <div className="mb-3 text-end">
          <Button variant="info" onClick={addItem}>Add Item</Button>
        </div>

        {/* Dynamic Items */}
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
        <div className="text-end mb-3">
  <Row className="justify-content-end">
    <Col md={4}>
      <div className="d-flex justify-content-between">
        <strong>Sub Total (₹)</strong>
        <span>{subtotal.toFixed(2)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <strong>Tax (₹)</strong>
        <span>{totalTax.toFixed(2)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <strong>Total Amount (₹)</strong>
        <span>{totalAmount.toFixed(2)}</span>
      </div>
    </Col>
  </Row>
</div>

        <div className="text-end mt-4">
          <Button variant="secondary" className="me-2" onClick={onCancel}>Cancel</Button>
          <Button variant="success" type="submit">Create Expense</Button>
        </div>
      </Form>
    </Card>
  );
};

export default ExpenseForm;
