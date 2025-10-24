import React, { useState, useEffect } from "react";
import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import categoryService from "../../../services/expenseCategory";
import { useOutletContext } from "react-router-dom";

const PaymentHead = () => {
  const { openAddForm, resetOpenAddForm } = useOutletContext();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  // Fetch categories
  const fetchData = async () => {
    try {
      const categories = await categoryService.getAllCategories();
      setData(categories);
    } catch (error) {
      console.error("Error fetching payment heads:", error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (openAddForm) {
      handleAdd();
      resetOpenAddForm();
    }
  }, [openAddForm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert("Payment Head name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await categoryService.updateCategory(editingItem.id, formData.name.trim());
      } else {
        await categoryService.createCategory(formData.name.trim());
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error saving payment head");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      await categoryService.deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete category");
    }
  };

  // Pagination
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-3 bg-white rounded" style={{ boxShadow: "0px 0px 10px 4px rgba(0,0,0,0.1)" }}>
      <div className="d-flex justify-content-between mb-3">
        <Form.Select
          value={entriesPerPage}
          onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          style={{ width: "80px" }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="Search Payment Heads..."
          style={{ maxWidth: "250px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Button variant="success" onClick={handleAdd}>
          <Plus /> Add
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Payment Head Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                    <PencilSquare />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center text-muted">
                No payment heads found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {filteredData.length > entriesPerPage && (
        <Pagination className="justify-content-end">
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit" : "Add"} Payment Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>
                Payment Head Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editingItem ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentHead;
