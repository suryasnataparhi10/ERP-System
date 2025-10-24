// WorkOrderModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, ListGroup } from "react-bootstrap";
import { getBranches } from "../../../services/branchService";
import { useNavigate } from "react-router-dom";

const WorkOrderModal = ({ show, onHide, formData, setFormData, handleSave, selectedWorkOrder }) => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEditMode = !!selectedWorkOrder;

  useEffect(() => {
    if (show) fetchBranches();
  }, [show]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    const branchList = await getBranches();
    setBranches(branchList);
    setLoadingBranches(false);
  };

  // Auto-calculate Actual Days whenever start_date or end_date changes
useEffect(() => {
  if (isEditMode && formData.start_date && formData.end_date) {
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 0); 
      setFormData((prev) => ({ ...prev, actual_days: diffDays }));
    }
  }
}, [formData.start_date, formData.end_date, isEditMode]);


const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "documents") {
    setFormData((prev) => {
      const existingFiles = prev.documents || []; // keep existing strings or File objects
      const newFiles = files ? Array.from(files) : [];

      return {
        ...prev,
        documents: [...existingFiles, ...newFiles],
      };
    });
  } else {
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  }
};


const handleSubmit = async () => {
  setSaving(true);
  try {
    const payload = new FormData();

    // Handle conditional dates based on status
    const isDraft = formData.status === "Draft";

    for (let key in formData) {
      if (key === "documents") continue;

      // Skip irrelevant date fields based on status
      if (isDraft && (key === "start_date" || key === "end_date" || key === "actual_days")) {
        continue;
      }
      if (!isDraft && (key === "issue_date" || key === "expected_date")) {
        continue;
      }

      // Skip empty numeric fields
      if (
        (key === "expected_days" || key === "actual_days" || key === "amount") &&
        (formData[key] === "" || formData[key] === null)
      ) {
        continue;
      }

      // Append valid field
      payload.append(key, formData[key]);
    }

    // Append only File objects
    if (formData.documents && formData.documents.length > 0) {
      formData.documents.forEach((file) => {
        if (file instanceof File) {
          payload.append("documents", file);
        }
      });
    }

    await handleSave(payload);
    onHide();
  } catch (err) {
    console.error("Error saving work order:", err);
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? "Edit Work Order" : "Create Work Order"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* WO Number */}
          <Form.Group className="mb-3">
            <Form.Label>WO Number</Form.Label>
            <Form.Control
              name="wo_number"
              value={formData.wo_number || ""}
              onChange={handleChange}
              placeholder="Enter Work Order Number"
            />
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Enter work order title"
            />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter work order description"
            />
          </Form.Group>

          {/* WO Type & Priority */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Work Order Type</Form.Label>
                <Form.Select name="wo_type" value={formData.wo_type || ""} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Installation">Installation</option>
                  <option value="Inspection">Inspection</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select name="priority" value={formData.priority || ""} onChange={handleChange}>
                  <option value="">Select Priority</option>
                  {/* <option value="Emergency">Emergency</option> */}
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          {/* Status & Branch */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status || "Open"} onChange={handleChange}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  {/* <option value="Hold">Hold</option> */}
                  {/* <option value="Invoiced">Invoiced</option> */}
                  {/* <option value="Cancelled">Cancelled</option> */}
                  {/* <option value="Partially Paid">Partially Paid</option> */}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Assigned Branch</Form.Label>
                {loadingBranches ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" /> Loading branches...
                  </div>
                ) : (
                  <>
                    <Form.Select name="assigned_to" value={formData.assigned_to || ""} onChange={handleChange}>
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="mt-2">
                      <small>
                        Don’t see your branch?{" "}
                        <span
                          className="text-success"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/hrmsystemsetup/branch")}
                        >
                          Create Branch
                        </span>
                      </small>
                    </div>
                  </>
                )}
              </Form.Group>
            </div>
          </div>

{/* Issue & Expected Dates / Start-End Dates */}
<div className="row">
  {isEditMode ? (
    formData.status === "Draft" ? (
      <>
        {/* 🔸 Draft: Show Issue Date & Expected Date */}
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Issue Date</Form.Label>
            <Form.Control
              type="date"
              name="issue_date"
              value={formData.issue_date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Expected Delivery Date</Form.Label>
            <Form.Control
              type="date"
              name="expected_date"
              value={formData.expected_date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
      </>
    ) : (
      <>
        {/* 🔸 Non-Draft: Show Actual Start/End Dates */}
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Actual Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Actual End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Actual Days</Form.Label>
            <Form.Control
              type="number"
              name="actual_days"
              value={formData.actual_days || ""}
              onChange={handleChange}
              placeholder="Enter actual days"
            />
          </Form.Group>
        </div>
      </>
    )
  ) : (
    <>
      {/* 🔸 Create Mode: Keep Original Fields */}
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Issue Date</Form.Label>
          <Form.Control
            type="date"
            name="issue_date"
            value={formData.issue_date?.split("T")[0] || ""}
            onChange={handleChange}
          />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Expected Completion Date</Form.Label>
          <Form.Control
            type="date"
            name="expected_date"
            value={formData.expected_date?.split("T")[0] || ""}
            onChange={handleChange}
          />
        </Form.Group>
      </div>
    </>
  )}
</div>


          {/* Estimated Amount */}
          <Form.Group className="mb-3">
            <Form.Label>Estimated Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount || ""}
              onChange={handleChange}
              placeholder="Enter estimated amount"
            />
          </Form.Group>

          {/* Multiple Documents Upload */}
          <Form.Group className="mb-3">
            <Form.Label>Documents <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="file"
              name="documents"
              multiple
              onChange={handleChange}
              required={!isEditMode || !formData.documents?.length}
            />

            {formData.documents && formData.documents.length > 0 && (
  <ListGroup className="mt-2">
    {formData.documents.map((file, idx) => (
      <ListGroup.Item key={idx}>
        {typeof file === "string" ? file.split("/").pop() : file.name}
      </ListGroup.Item>
    ))}
  </ListGroup>
)}

            {isEditMode && formData.documents && typeof formData.documents === "string" && (
              <small className="text-muted">Existing: {formData.documents.split("/").pop()}</small>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

<Modal.Footer>
  <Button variant="secondary" onClick={onHide}>Cancel</Button>

  {!isEditMode && (
    <Button
      variant="warning"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        try {
          const payload = new FormData();
          for (let key in formData) {
            if (key !== "documents") payload.append(key, formData[key]);
          }
          if (formData.documents && formData.documents.length > 0) {
            formData.documents.forEach((file) => {
              if (file instanceof File) payload.append("documents", file);
            });
          }
          payload.append("status", "Draft"); // 🔸 force status Draft
          await handleSave(payload);
          onHide();
        } catch (err) {
          console.error("Error saving draft:", err);
        } finally {
          setSaving(false);
        }
      }}
    >
      {saving ? (
        <>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
        </>
      ) : (
        "Save as Draft"
      )}
    </Button>
  )}

  <Button variant="success" onClick={handleSubmit} disabled={saving}>
    {saving ? (
      <>
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
        {isEditMode ? "Updating..." : "Creating..."}
      </>
    ) : (
      isEditMode ? "Update" : "Create"
    )}
  </Button>
</Modal.Footer>

    </Modal>
  );
};

export default WorkOrderModal;
