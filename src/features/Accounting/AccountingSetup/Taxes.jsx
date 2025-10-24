import React, { useState, useEffect } from "react";
import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import { fetchTaxes, saveTax, deleteTax } from "../../../services/AccountingSetup";
import { useOutletContext } from "react-router-dom";

const Taxes = () => {
  const { openAddForm, resetOpenAddForm  } = useOutletContext();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const result = await fetchTaxes();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);
useEffect(() => {
  if (openAddForm) {
    handleAdd();       // open modal
    resetOpenAddForm(); // reset parent flag
  }
}, [openAddForm]);


  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    setSaving(true);
    const response = await saveTax(formData, editingItem);
    if (response.success) {
      fetchData();
      setShowModal(false);
    } else {
      alert(response.message || "Error saving tax");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    const response = await deleteTax(id);
    if (response?.success) fetchData();
    else alert(response?.message || "Delete failed");
  };

  // Pagination
  const filteredData = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-3 bg-white rounded" style={{  boxShadow: "0px 0px 10px 4px rgba(0, 0, 0, 0.1)"}}>
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
          placeholder="Search Taxes..."
          style={{ maxWidth: "250px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Tax Name</th>
            <th>Rate %</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.rate}</td>
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
              <td colSpan="3" className="text-center text-muted">
                No Taxes found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {filteredData.length > entriesPerPage && (
        <Pagination className="justify-content-end">
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit" : "Add"} Tax</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>
                Tax Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Rate % <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={formData.rate || ""}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
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

export default Taxes;
