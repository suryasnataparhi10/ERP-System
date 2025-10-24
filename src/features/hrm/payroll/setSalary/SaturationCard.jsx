// import React, { useEffect, useState } from "react";
// import { Card, Table, Button, Modal, Form } from "react-bootstrap";
// import { PencilSquare, Trash, Plus } from "react-bootstrap-icons";
// import {
//   getSaturationsByEmployee,
//   createSaturation,
//   updateSaturation,
//   deleteSaturation,
// } from "../../../../services/saturationService";
// import deductionService from "../../../../services/deductionService";

// const SaturationCard = ({ employee }) => {
//   const [saturations, setSaturations] = useState([]);
//   const [deductionOptions, setDeductionOptions] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [formData, setFormData] = useState({
//     deduction_option: "",
//     type: "fixed",
//     amount: "",
//     title: "",
//   });

//   const fetchData = async () => {
//     try {
//       const res = await getSaturationsByEmployee(employee.id);
//       setSaturations(res.data || []);
//     } catch (err) {
//       console.error("Error fetching saturations:", err);
//     }
//   };

//   const fetchDeductionOptions = async () => {
//     try {
//       const options = await deductionService.getAll();
//       setDeductionOptions(options);
//     } catch (err) {
//       console.error("Error loading deduction options", err);
//     }
//   };

//   useEffect(() => {
//     if (employee?.id) {
//       fetchData();
//       fetchDeductionOptions();
//     }
//   }, [employee]);

//   const handleAdd = () => {
//     setEditing(null);
//     setFormData({
//       deduction_option: "",
//       type: "fixed",
//       amount: "",
//       title: "",
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (item) => {
//     setEditing(item);
//     setFormData({
//       deduction_option: item.deduction_option || "",
//       type: item.type || "fixed",
//       amount: item.amount || "",
//       title: item.title || "",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this deduction?")) {
//       try {
//         await deleteSaturation(id);
//         fetchData();
//       } catch (err) {
//         console.error("Delete failed", err);
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     const payload = {
//       employee_id: employee.id,
//       ...formData,
//     };

//     try {
//       if (editing) {
//         await updateSaturation(editing.id, payload);
//       } else {
//         await createSaturation(payload);
//       }
//       setShowModal(false);
//       fetchData();
//     } catch (err) {
//       console.error("Save failed", err);
//     }
//   };

//   const getOptionName = (id) => {
//     const option = deductionOptions.find((opt) => opt.id === id);
//     return option ? option.name : "-";
//   };

//   const formatAmount = (item) => {
//     if (!item?.type || item.amount == null) return "—";
//     if (item.type.toLowerCase() === "fixed") {
//       return `₹ ${Number(item.amount).toLocaleString()}`;
//     } else {
//       return `${Number(item.amount).toFixed(2)}%`;
//     }
//   };

//   return (
//     <>
//       <Card style={{ height: "360px" }}>
//         <Card.Header className="d-flex justify-content-between align-items-center">
//           <strong>Saturation Deduction</strong>
//           <Button variant="success" size="sm" onClick={handleAdd}>
//             <Plus size={16} />
//           </Button>
//         </Card.Header>
//         <Card.Body>
//           {saturations.length === 0 ? (
//             <p className="text-muted text-center">No deductions found.</p>
//           ) : (
//             <Table bordered hover responsive className="text-center">
//               <thead className="table-light">
//                 <tr>
//                   <th>EMPLOYEE</th>
//                   <th>OPTION</th>
//                   <th>TITLE</th>
//                   <th>TYPE</th>
//                   <th>AMOUNT</th>
//                   <th>ACTION</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {saturations.map((item) => (
//                   <tr key={item.id}>
//                     <td>{employee?.name || "—"}</td>
//                     <td>{getOptionName(item.deduction_option)}</td>
//                     <td>{item.title}</td>
//                     <td>{item.type || "—"}</td>
//                     <td>{formatAmount(item)}</td>
//                     <td>
//                       <Button
//                         size="sm"
//                         variant="info"
//                         className="me-2"
//                         onClick={() => handleEdit(item)}
//                       >
//                         <PencilSquare />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="danger"
//                         onClick={() => handleDelete(item.id)}
//                       >
//                         <Trash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Card.Body>
//       </Card>

//       {/* MODAL */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editing ? "Edit" : "Create"} Saturation Deduction
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Deduction Option</Form.Label>
//               <Form.Select
//                 value={formData.deduction_option}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     deduction_option: parseInt(e.target.value) || "",
//                   })
//                 }
//               >
//                 <option value="">-- Select --</option>
//                 {deductionOptions.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 value={formData.type}
//                 onChange={(e) =>
//                   setFormData({ ...formData, type: e.target.value })
//                 }
//               >
//                 <option value="fixed">Fixed</option>
//                 <option value="percentage">Percentage</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Amount</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={formData.amount}
//                 onChange={(e) =>
//                   setFormData({ ...formData, amount: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editing ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default SaturationCard;

// // src/components/SaturationDeductionCard.jsx
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Button,
//   Table,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Spinner,
// } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";

// import saturationService from "../../../../services/saturationService";
// import deductionService from "../../../../services/deductionService";

// const SaturationDeductionCard = ({ employeeId }) => {
//   const [deductions, setDeductions] = useState([]);
//   const [deductionOptions, setDeductionOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     id: null,
//     employee_id: employeeId || "",
//     deduction_option: "",
//     title: "",
//     amount: "",
//     type: "fixed",
//   });
//   const [saving, setSaving] = useState(false);

//   // Fetch deductions & options
//   useEffect(() => {
//     fetchDeductions();
//     fetchDeductionOptions();
//   }, [employeeId]);

//   const fetchDeductions = async () => {
//     setLoading(true);
//     try {
//       let data;
//       if (employeeId) {
//         data =
//           await saturationService.getSaturationsByEmployee(
//             employeeId
//           );
//       } else {
//         data = await saturationService.getAllSaturations();
//       }
//       setDeductions(data);
//     } catch (err) {
//       console.error("Error fetching deductions", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDeductionOptions = async () => {
//     try {
//       const data = await deductionService.getDeductions();
//       setDeductionOptions(data);
//     } catch (err) {
//       console.error("Error fetching deduction options", err);
//     }
//   };

//   const handleShowModal = (deduction = null) => {
//     if (deduction) {
//       setFormData({
//         id: deduction.id,
//         employee_id: deduction.employee_id,
//         deduction_option: deduction.deduction_option,
//         title: deduction.title,
//         amount: deduction.amount,
//         type: deduction.type,
//       });
//     } else {
//       setFormData({
//         id: null,
//         employee_id: employeeId || "",
//         deduction_option: "",
//         title: "",
//         amount: "",
//         type: "fixed",
//       });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => setShowModal(false);

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       if (formData.id) {
//         await saturationDeductionService.updateSaturationDeduction(
//           formData.id,
//           formData
//         );
//       } else {
//         await saturationDeductionService.createSaturationDeduction(formData);
//       }
//       handleCloseModal();
//       fetchDeductions();
//     } catch (err) {
//       console.error("Error saving deduction", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this deduction?"))
//       return;
//     try {
//       await saturationDeductionService.deleteSaturationDeduction(id);
//       fetchDeductions();
//     } catch (err) {
//       console.error("Error deleting deduction", err);
//     }
//   };

//   return (
//     <Card className="shadow-sm p-3 mb-3 rounded-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <h5 className="mb-0">Saturation Deductions</h5>
//         <Button variant="primary" onClick={() => handleShowModal()}>
//           <Plus className="me-1" /> Add Deduction
//         </Button>
//       </div>

//       {loading ? (
//         <div className="text-center py-3">
//           <Spinner animation="border" />
//         </div>
//       ) : deductions.length === 0 ? (
//         <p className="text-muted text-center mb-0">No deductions found.</p>
//       ) : (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Employee</th>
//               <th>Deduction Option</th>
//               <th>Title</th>
//               <th>Amount</th>
//               <th>Type</th>
//               <th style={{ width: "100px" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {deductions.map((ded) => (
//               <tr key={ded.id}>
//                 <td>{ded.employee?.name || "-"}</td>
//                 <td>{ded.deduction_option}</td>
//                 <td>{ded.title}</td>
//                 <td>{ded.amount}</td>
//                 <td>{ded.type}</td>
//                 <td className="text-center">
//                   <Button
//                     size="sm"
//                     variant="outline-primary"
//                     className="me-1"
//                     onClick={() => handleShowModal(ded)}
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline-danger"
//                     onClick={() => handleDelete(ded.id)}
//                   >
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       )}

//       {/* Modal for Create / Edit */}
//       <Modal show={showModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>{formData.id ? "Edit" : "Add"} Deduction</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               {!employeeId && (
//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Employee ID</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="employee_id"
//                       value={formData.employee_id}
//                       onChange={handleChange}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>
//               )}

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Deduction Option</Form.Label>
//                   <Form.Select
//                     name="deduction_option"
//                     value={formData.deduction_option}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Option</option>
//                     {deductionOptions.map((opt) => (
//                       <option key={opt.id} value={opt.id}>
//                         {opt.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Amount</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Type</Form.Label>
//                   <Form.Select
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="fixed">Fixed</option>
//                     <option value="percentage">Percentage</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" disabled={saving}>
//               {saving ? "Saving..." : "Save"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Card>
//   );
// };

// export default SaturationDeductionCard;

// // src/components/SaturationCard.jsx
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Button,
//   Table,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Spinner,
// } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";

// import saturationService from "../../../../services/saturationService";
// import deductionService from "../../../../services/deductionService";

// const SaturationCard = ({ employeeId }) => {
//   const [deductions, setDeductions] = useState([]);
//   const [deductionOptions, setDeductionOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     id: null,
//     employee_id: employeeId || "",
//     deduction_option: "",
//     title: "",
//     amount: "",
//     type: "fixed",
//   });
//   const [saving, setSaving] = useState(false);

//   // Fetch deductions & deduction options
//   useEffect(() => {
//     fetchDeductions();
//     fetchDeductionOptions();
//   }, [employeeId]);

//   const fetchDeductions = async () => {
//     setLoading(true);
//     try {
//       const data = employeeId
//         ? await saturationService.getSaturationsByEmployee(employeeId)
//         : await saturationService.getAllSaturations();
//       setDeductions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching deductions", err);
//       setDeductions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDeductionOptions = async () => {
//     try {
//       const data = await deductionService.getAllDeductions();
//       setDeductionOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching deduction options", err);
//     }
//   };

//   const handleShowModal = (deduction = null) => {
//     setFormData(
//       deduction
//         ? {
//             id: deduction.id,
//             employee_id: deduction.employee_id,
//             deduction_option: deduction.deduction_option,
//             title: deduction.title,
//             amount: deduction.amount,
//             type: deduction.type,
//           }
//         : {
//             id: null,
//             employee_id: employeeId || "",
//             deduction_option: "",
//             title: "",
//             amount: "",
//             type: "fixed",
//           }
//     );
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setFormData({
//       id: null,
//       employee_id: employeeId || "",
//       deduction_option: "",
//       title: "",
//       amount: "",
//       type: "fixed",
//     });
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       if (formData.id) {
//         await saturationService.updateSaturation(formData.id, formData);
//       } else {
//         await saturationService.createSaturation(formData);
//       }
//       handleCloseModal();
//       fetchDeductions();
//     } catch (err) {
//       console.error("Error saving deduction", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this deduction?"))
//       return;
//     try {
//       await saturationService.deleteSaturation(id);
//       fetchDeductions();
//     } catch (err) {
//       console.error("Error deleting deduction", err);
//     }
//   };

//   return (
//     <Card className="shadow-sm p-3 mb-3 rounded-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <h5 className="mb-0">Saturation Deductions</h5>
//         <Button variant="primary" onClick={() => handleShowModal()}>
//           <Plus className="me-1" /> Add Deduction
//         </Button>
//       </div>

//       {loading ? (
//         <div className="text-center py-3">
//           <Spinner animation="border" />
//         </div>
//       ) : deductions.length === 0 ? (
//         <p className="text-muted text-center mb-0">No deductions found.</p>
//       ) : (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Employee</th>
//               <th>Deduction Option</th>
//               <th>Title</th>
//               <th>Amount</th>
//               <th>Type</th>
//               <th style={{ width: "100px" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {deductions.map((ded) => (
//               <tr key={ded.id}>
//                 <td>{ded.employee?.name || "-"}</td>
//                 <td>{ded.deduction_option?.name || ded.deduction_option}</td>
//                 <td>{ded.title}</td>
//                 <td>{ded.amount}</td>
//                 <td>{ded.type}</td>
//                 <td className="text-center">
//                   <Button
//                     size="sm"
//                     variant="outline-primary"
//                     className="me-1"
//                     onClick={() => handleShowModal(ded)}
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline-danger"
//                     onClick={() => handleDelete(ded.id)}
//                   >
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       )}

//       {/* Modal */}
//       <Modal show={showModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>{formData.id ? "Edit" : "Add"} Deduction</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               {!employeeId && (
//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Employee ID</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="employee_id"
//                       value={formData.employee_id}
//                       onChange={handleChange}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>
//               )}

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Deduction Option</Form.Label>
//                   <Form.Select
//                     name="deduction_option"
//                     value={formData.deduction_option}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Option</option>
//                     {deductionOptions.map((opt) => (
//                       <option key={opt.id} value={opt.id}>
//                         {opt.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Amount</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Type</Form.Label>
//                   <Form.Select
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="fixed">Fixed</option>
//                     <option value="percentage">Percentage</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" disabled={saving}>
//               {saving ? "Saving..." : "Save"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Card>
//   );
// };

// export default SaturationCard;

// src/components/SaturationCard.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";

import saturationService from "../../../../services/saturationService";
import deductionService from "../../../../services/deductionService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const SaturationCard = ({ employeeId }) => {
  const [deductions, setDeductions] = useState([]);
  const [deductionOptions, setDeductionOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    employee_id: employeeId || "",
    deduction_option: "",
    title: "",
    amount: "",
    type: "fixed",
  });
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Fetch deductions & deduction options
  useEffect(() => {
    fetchDeductions();
    fetchDeductionOptions();
  }, [employeeId]);

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      const data = employeeId
        ? await saturationService.getSaturationsByEmployee(employeeId)
        : await saturationService.getAllSaturations();
      setDeductions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching deductions", err);
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeductionOptions = async () => {
    try {
      const data = await deductionService.getAllDeductions();
      setDeductionOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching deduction options", err);
    }
  };

  const handleShowModal = (deduction = null) => {
    setFormData(
      deduction
        ? {
            id: deduction.id,
            employee_id: deduction.employee_id,
            deduction_option: deduction.deduction_option,
            title: deduction.title,
            amount: deduction.amount,
            type: deduction.type,
          }
        : {
            id: null,
            employee_id: employeeId || "",
            deduction_option: "",
            title: "",
            amount: "",
            type: "fixed",
          }
    );
    setShowModal(true);
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  //   setFormData({
  //     id: null,
  //     employee_id: employeeId || "",
  //     deduction_option: "",
  //     title: "",
  //     amount: "",
  //     type: "fixed",
  //   });
  // };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setFormData({
        id: null,
        employee_id: employeeId || "",
        deduction_option: "",
        title: "",
        amount: "",
        type: "fixed",
      });
    }, 700);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.id) {
        await saturationService.updateSaturation(formData.id, formData);
        toast.success("Saturation successfully updated.", {
          icon: false,
        });
      } else {
        await saturationService.createSaturation(formData);
        toast.success("Saturation successfully created.", {
          icon: false,
        });
      }
      handleCloseModal();
      fetchDeductions();
    } catch (err) {
      console.error("Error saving deduction", err);
    } finally {
      setSaving(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this deduction?"))
  //     return;
  //   try {
  //     await saturationService.deleteSaturation(id);
  //     fetchDeductions();
  //   } catch (err) {
  //     console.error("Error deleting deduction", err);
  //   }
  // };
  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>

          <div className="d-flex justify-content-center mt-3">
            {/* Cancel Button */}
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>

            {/* Confirm Button */}
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await saturationService.deleteSaturation(id); // ✅ delete deduction
                  await fetchDeductions(); // ✅ refresh deductions
                  toast.success("Saturation successfully deleted.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Error deleting deduction", err);
                }
                onClose(); // ✅ close modal
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const getDeductionOptionName = (optionId) => {
    const option = deductionOptions.find((opt) => opt.id === optionId);
    return option ? option.name : "-";
  };

  return (
    <>
      <style>{`
  @keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOutUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
  }
  .custom-slide-modal.open .modal-dialog {
    animation: slideInUp 0.7s ease forwards;
  }
  .custom-slide-modal.closing .modal-dialog {
    animation: slideOutUp 0.7s ease forwards;
  }
`}</style>
      <Card
        className="card p-3 pt-2 shadow-sm rounded-3"
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          height: "385px",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none",
        }}
      >
        {/* <div className="d-flex justify-content-between align-items-center mb-2 card-header"> */}
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0, }}
        >
          <h5 className="mb-0">Saturation Deductions</h5>
          {/* <Button variant="success" onClick={() => handleShowModal()}>
            <Plus />
          </Button> */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Add Saturation Deduction</Tooltip>}
          >
            <Button variant="success" onClick={() => handleShowModal()}>
              <Plus />
            </Button>
          </OverlayTrigger>
        </div>

        {/* {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" />
          </div>
        ) : deductions.length === 0 ? (
          <p className="text-muted text-center mb-0">No deductions found.</p>
        ) : ( */}
          <div className="card-body mt-2">
            <div
              className="table-responsive"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              <Table striped hover>
                <thead>
                  <tr>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Employee
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Deduction Option
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Title
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Amount
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Type
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        width: "100px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.length > 0 ? (
                      deductions.map((ded) => (
                        <tr key={ded.id}>
                          <td>{ded.employee?.name || "-"}</td>
                          {/* ✅ FIX: Show name instead of ID */}
                          <td>{getDeductionOptionName(ded.deduction_option)}</td>
                          <td>{ded.title}</td>
                          <td>{ded.amount}</td>
                          <td>{ded.type}</td>
                          <td className="text-center">
                            {/* <Button
                              size="sm"
                              variant="info"
                              className="me-1"
                              onClick={() => handleShowModal(ded)}
                            >
                              <PencilSquare />
                            </Button> */}
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Edit</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="info"
                                className="me-1"
                                onClick={() => handleShowModal(ded)}
                              >
                                {/* <PencilSquare /> */}
                                <i className="bi bi-pencil text-white"></i>

                              </Button>
                            </OverlayTrigger>
                            {/* <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(ded.id)}
                            >
                              <Trash />
                            </Button> */}
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(ded.id)}
                              >
                                <Trash />
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      ))
                    ):(
                       <tr>
                      <td colSpan="10" className="text-center">
                        No Satusation found for this employee.
                      </td>
                    </tr>
                    )}
                </tbody>
              </Table>
            </div>
          </div>

        {/* Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          className={`custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>{formData.id ? "Edit" : "Add"} Deduction</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                {!employeeId && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control
                        type="number"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Deduction Option <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="deduction_option"
                      value={formData.deduction_option}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Option</option>
                      {deductionOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Amount <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type </Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? "Saving..." : formData.id ? "Update" : "Create"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card>
    </>
  );
};

export default SaturationCard;
