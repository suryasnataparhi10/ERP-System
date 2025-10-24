// src/components/Accounting/CreditPurchaseModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import creditPurchaseService from "../../../services/expensessService";

const CreditPurchaseModal = ({
  show,
  handleClose,
  branches = [],
  categories = [],
  supplyTypes = ["Service", "Supply"],
  editingPurchase = null,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    branch_id: "",
    category_id: "",
    description: "",
    vendor_name: "",
    type_of_supply_or_service: "",
    items: [{ item_name: "", subtotal: "", is_taxable: false, tax_rate: 0, tax_type: "exclusive", document: null }],
    status: "pending",
  });

  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        branch_id: editingPurchase.branch_id,
        category_id: editingPurchase.category_id,
        description: editingPurchase.description,
        vendor_name: editingPurchase.vendor_name,
        type_of_supply_or_service: editingPurchase.type_of_supply_or_service,
        items: editingPurchase.items.map((item) => ({
          item_name: item.item_name,
          subtotal: item.subtotal,
          is_taxable: item.is_taxable,
          tax_rate: item.tax_rate,
          tax_type: item.tax_type || "exclusive",
          document: null, // leave empty, user can upload new
        })),
        status: editingPurchase.status || "pending",
      });
    } else {
      setFormData({
        branch_id: "",
        category_id: "",
        description: "",
        vendor_name: "",
        type_of_supply_or_service: "",
        items: [{ item_name: "", subtotal: "", is_taxable: false, tax_rate: 0, tax_type: "exclusive", document: null }],
        status: "pending",
      });
    }
  }, [editingPurchase]);

  const handleChange = (e, index, field) => {
    if (field === "items") {
      const updatedItems = [...formData.items];
      updatedItems[index][e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (index, file) => {
    const updatedItems = [...formData.items];
    updatedItems[index].document = file;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", subtotal: "", is_taxable: false, tax_rate: 0, tax_type: "exclusive", document: null }],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async () => {
    try {
      const submitData = new FormData();
      submitData.append("branch_id", formData.branch_id);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.description);
      submitData.append("vendor_name", formData.vendor_name);
      submitData.append("type_of_supply_or_service", formData.type_of_supply_or_service);
      submitData.append("status", formData.status);

      formData.items.forEach((item, i) => {
        submitData.append(`items[${i}][item_name]`, item.item_name);
        submitData.append(`items[${i}][subtotal]`, item.subtotal);
        submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
        submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
        submitData.append(`items[${i}][tax_type]`, item.tax_type);
        if (item.document) submitData.append(`item_document_${i}`, item.document);
      });

      if (editingPurchase) {
        await creditPurchaseService.payCreditPurchase(editingPurchase.id, submitData);
        toast.success("Credit purchase updated successfully");
      } else {
        await creditPurchaseService.createCreditPurchase(submitData);
        toast.success("Credit purchase created successfully");
      }
      handleClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editingPurchase ? "Edit / Pay Credit Purchase" : "Create Credit Purchase"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Branch</Form.Label>
                <Form.Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" name="description" value={formData.description} onChange={handleChange}/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vendor Name</Form.Label>
            <Form.Control type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange}/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type of Supply / Service</Form.Label>
            <Select
              value={formData.type_of_supply_or_service ? { value: formData.type_of_supply_or_service, label: formData.type_of_supply_or_service } : null}
              onChange={(selected) => setFormData(prev => ({ ...prev, type_of_supply_or_service: selected ? selected.value : "" }))}
              options={supplyTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select supply type..."
              isClearable
            />
          </Form.Group>

          {editingPurchase && (
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </Form.Select>
            </Form.Group>
          )}

          <hr/>
          <h5>Items</h5>
          {formData.items.map((item, idx) => (
            <div key={idx} style={{ position: "relative", borderTop: "1px solid #ddd", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
              <Button 
                variant="danger" 
                size="sm" 
                style={{ position: "absolute", top: "5px", right: "5px", padding: "0 6px", lineHeight: 1 }}
                onClick={() => handleRemoveItem(idx)}
              >
                &times;
              </Button>
              <Row className="align-items-center">
                <Col>
                  <Form.Control
                    placeholder="Item Name"
                    name="item_name"
                    value={item.item_name}
                    onChange={(e) => handleChange(e, idx, "items")}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Subtotal"
                    type="number"
                    name="subtotal"
                    value={item.subtotal}
                    onChange={(e) => handleChange(e, idx, "items")}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="checkbox"
                    label="Taxable"
                    name="is_taxable"
                    checked={item.is_taxable}
                    onChange={(e) => handleChange(e, idx, "items")}
                  />
                </Col>

                {item.is_taxable && (
                  <>
                    <Col>
                      <Form.Control
                        placeholder="Tax Rate"
                        type="number"
                        name="tax_rate"
                        value={item.tax_rate}
                        onChange={(e) => handleChange(e, idx, "items")}
                      />
                    </Col>
                    <Col>
                      <Form.Select
                        name="tax_type"
                        value={item.tax_type}
                        onChange={(e) => handleChange(e, idx, "items")}
                      >
                        <option value="exclusive">Exclusive</option>
                        <option value="inclusive">Inclusive</option>
                      </Form.Select>
                    </Col>
                  </>
                )}

                <Col>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleFileChange(idx, e.target.files[0])}
                  />
                </Col>
              </Row>
            </div>
          ))}
          <Button variant="secondary" onClick={handleAddItem}>Add Item</Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="success">{editingPurchase ? "Pay / Update" : "Create"}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreditPurchaseModal;
