import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { getBranches } from "../../../services/branchService";
import { fetchUnits , createUnit } from "../../../services/AccountingSetup";
import CreatableSelect from "react-select/creatable";

const PurchaseOrderModal = ({
  show,
  onHide,
  formData,
  setFormData,
  selectedPurchase,
  handleSave,
  addLineItem,
  removeLineItem,
  handleLineItemChange,
}) => {
  const [branches, setBranches] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch branches and units when modal opens
  useEffect(() => {
    const loadData = async () => {
      setLoadingBranches(true);
      const branchesData = await getBranches();
      setBranches(branchesData);
      setLoadingBranches(false);

      setLoadingUnits(true);
      const unitsData = await fetchUnits();
      setUnits(unitsData);
      setLoadingUnits(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => {
      const existingFiles = prev.documents || [];
      const combinedFiles = [...existingFiles, ...newFiles];
      const uniqueFiles = combinedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );
      return { ...prev, documents: uniqueFiles };
    });
    e.target.value = null;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedPurchase ? "Edit Purchase Order" : "Add Purchase Order"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* === Purchase Order Header Fields === */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>PO Number</Form.Label>
                <Form.Control
                  type="text"
                  name="po_number"
                  value={formData.po_number || ""}
                  onChange={handleChange}
                  placeholder="Enter PO number"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Vendor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name || ""}
                  onChange={handleChange}
                  placeholder="Enter vendor name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>PO Date</Form.Label>
                <Form.Control
                  type="date"
                  name="po_date"
                  value={formData.po_date || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Delivery Date</Form.Label>
                <Form.Control
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Branch</Form.Label>
                {loadingBranches ? (
                  <div className="text-muted small">Loading branches...</div>
                ) : (
                  <Form.Select
                    name="branch_id"
                    value={formData.branch_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status || "Draft"}
                  onChange={handleChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Received">Received</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* === Document Upload === */}
          <Form.Group className="mb-3">
            <Form.Label>Documents</Form.Label>
            {formData.documents?.length > 0 && (
              <div className="mt-2 d-flex flex-wrap gap-2">
                {formData.documents.map((file, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 d-flex align-items-center"
                    style={{ background: "#f8f9fa", position: "relative" }}
                  >
                    <span className="me-2" style={{ fontSize: "0.85rem" }}>
                      {file.name.length > 15
                        ? file.name.slice(0, 12) + "..."
                        : file.name}
                    </span>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      style={{
                        padding: "0 5px",
                        fontSize: "0.7rem",
                        lineHeight: "1",
                      }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          documents: prev.documents.filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>

          <hr />
          <h6 className="fw-bold">Line Items</h6>

          {/* === Line Items Section === */}
          {formData.line_items.map((item, index) => (
            <div key={index} className="border rounded p-3 mb-3 bg-light">
              <Row className="mb-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Item Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={item.item_name}
                      onChange={(e) =>
                        handleLineItemChange(index, "item_name", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, "quantity", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

<Col md={3}>
  <Form.Group>
    <Form.Label>Unit</Form.Label>
    {loadingUnits ? (
      <div className="text-muted small">Loading units...</div>
    ) : (
      <CreatableSelect
        value={
          item.unit_id
            ? { value: item.unit_id, label: units.find(u => u.id === item.unit_id)?.name }
            : null
        }
        onChange={async (selected) => {
          if (selected.__isNew__) {
            // Create new unit via service
            const newUnit = await createUnit({ name: selected.value });
            if (newUnit?.id) {
              // Add to units list
              setUnits((prev) => [...prev, newUnit]);
              // Set the newly created unit in the line item
              handleLineItemChange(index, "unit_id", newUnit.id);
            }
          } else {
            handleLineItemChange(index, "unit_id", selected.value);
          }
        }}
        options={units.map((u) => ({ value: u.id, label: u.name }))}
        placeholder="Select or type unit..."
        isClearable
      />
    )}
  </Form.Group>
</Col>


                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Unit Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleLineItemChange(index, "unit_price", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={1} className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                  >
                    ×
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Button size="sm" variant="secondary" onClick={addLineItem}>
            + Add Item
          </Button>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
<Button
  variant="success"
  onClick={async () => {
    setSaving(true);
    try {
      await handleSave();
      onHide();
    } catch (err) {
      console.error("Error saving purchase order:", err);
    } finally {
      setSaving(false);
    }
  }}
  disabled={saving}
>
  {saving ? (
    <>
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />{" "}
      {selectedPurchase ? "Updating..." : "Saving..."}
    </>
  ) : (
    selectedPurchase ? "Update" : "Save"
  )}
</Button>

      </Modal.Footer>
    </Modal>
  );
};

export default PurchaseOrderModal;
