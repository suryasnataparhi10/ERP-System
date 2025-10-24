// import React, { useEffect, useState } from "react";
// import { Card, Button, Table, Spinner, Modal, Form } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import {
//   getOvertimesByEmployee,
//   createOvertime,
//   updateOvertime,
//   deleteOvertime,
// } from "../../../../services/overtimeService";

// const OvertimeCard = ({ employee }) => {
//   const [overtimes, setOvertimes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingOvertime, setEditingOvertime] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     number_of_days: "",
//     hours: "",
//     rate: "",
//   });

//   useEffect(() => {
//     if (employee?.id) {
//       fetchOvertimes();
//     } else {
//       console.warn("No employee ID found. Overtime not loaded.");
//       setLoading(false);
//     }
//   }, [employee]);

//   const fetchOvertimes = async () => {
//     setLoading(true);
//     try {
//       const res = await getOvertimesByEmployee(employee.id);
//       console.log("Fetched Overtimes:", res);

//       // Adjust this if API data is nested like res.data.data
//       const overtimeList = res?.data?.data || res?.data || [];
//       setOvertimes(overtimeList);
//     } catch (err) {
//       console.error("Error fetching overtimes:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdd = () => {
//     setEditingOvertime(null);
//     setFormData({
//       title: "",
//       number_of_days: "",
//       hours: "",
//       rate: "",
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (ot) => {
//     setEditingOvertime(ot);
//     setFormData({
//       title: ot.title,
//       number_of_days: ot.number_of_days,
//       hours: ot.hours,
//       rate: ot.rate,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (
//       window.confirm("Are you sure you want to delete this overtime record?")
//     ) {
//       try {
//         await deleteOvertime(id);
//         fetchOvertimes();
//       } catch (err) {
//         console.error("Error deleting overtime:", err);
//         alert("Failed to delete record.");
//       }
//     }
//   };

//   const handleModalSubmit = async () => {
//     const data = {
//       ...formData,
//       employee_id: employee.id,
//       created_by: 1, // Replace with actual user ID
//     };

//     try {
//       if (editingOvertime) {
//         await updateOvertime(editingOvertime.id, data);
//       } else {
//         await createOvertime(data);
//       }
//       setShowModal(false);
//       fetchOvertimes();
//     } catch (err) {
//       console.error("Error saving overtime:", err);
//       alert("Failed to save overtime.");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <>
//       <Card style={{ height: "340px" }}>
//         <Card.Header className="d-flex justify-content-between align-items-center">
//           <strong>Overtime</strong>
//           <Button variant="success" size="sm" onClick={handleAdd}>
//             <Plus size={16} />
//           </Button>
//         </Card.Header>
//         <Card.Body>
//           {loading ? (
//             <div className="text-center py-4">
//               <Spinner animation="border" />
//             </div>
//           ) : overtimes.length === 0 ? (
//             <p className="text-muted text-center">No Overtime Data Found</p>
//           ) : (
//             <Table striped bordered hover responsive>
//               <thead>
//                 <tr>
//                   <th>EMPLOYEE NAME</th>
//                   <th>OVERTIME TITLE</th>
//                   <th>NUMBER OF DAYS</th>
//                   <th>HOURS</th>
//                   <th>RATE</th>
//                   <th>ACTION</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {overtimes.map((ot) => (
//                   <tr key={ot.id}>
//                     <td>{employee.name || "--"}</td>
//                     <td>{ot.title}</td>
//                     <td>{ot.number_of_days}</td>
//                     <td>{ot.hours}</td>
//                     <td>$ {Number(ot.rate).toLocaleString()}</td>
//                     <td>
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEdit(ot)}
//                       >
//                         <PencilSquare />
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDelete(ot.id)}
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

//       {/* Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingOvertime ? "Edit Overtime" : "Add Overtime"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Number of Days</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="number_of_days"
//                 value={formData.number_of_days}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Hours</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="hours"
//                 value={formData.hours}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Rate</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="rate"
//                 value={formData.rate}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleModalSubmit}>
//             {editingOvertime ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default OvertimeCard;

// // src/components/OvertimeCard.jsx
// import React, { useEffect, useState } from "react";
// import { Table, Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import overtimeService from "../../../../services/overtimeService"; // <-- make sure this exists

// const OvertimeCard = ({ employeeId, employeeName }) => {
//   const [overtimes, setOvertimes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editingOvertime, setEditingOvertime] = useState(null);
//   const [newOvertime, setNewOvertime] = useState({
//     title: "",
//     days: "",
//     hours: "",
//     rate: "",
//   });

//   // ✅ Fetch overtimes for this employee
//   const fetchOvertimes = async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     try {
//       const data = await overtimeService.getOvertimesByEmployee(employeeId);
//       setOvertimes(data || []);
//     } catch (err) {
//       console.error("Failed to fetch overtimes:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOvertimes();
//   }, [employeeId]);

//   // ✅ Open modal for add
//   const handleAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingOvertime(null);
//     setNewOvertime({ title: "", days: "", hours: "", rate: "" });
//     setShowModal(true);
//   };

//   // ✅ Open modal for edit
//   const handleEdit = (ot) => {
//     setEditingOvertime(ot);
//     setNewOvertime({
//       title: ot.title,
//       days: ot.days,
//       hours: ot.hours,
//       rate: ot.rate,
//     });
//     setShowModal(true);
//   };

//   // ✅ Delete overtime
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this record?")) return;
//     try {
//       await overtimeService.deleteOvertime(id);
//       setOvertimes((prev) => prev.filter((ot) => ot._id !== id));
//     } catch (err) {
//       console.error("Failed to delete overtime:", err);
//       alert("Failed to delete overtime");
//     }
//   };

//   // ✅ Handle modal submit (Create/Update)
//   const handleModalSubmit = async () => {
//     if (
//       !newOvertime.title ||
//       !newOvertime.days ||
//       !newOvertime.hours ||
//       !newOvertime.rate
//     ) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editingOvertime) {
//         await overtimeService.updateOvertime(editingOvertime._id, {
//           title: newOvertime.title,
//           days: Number(newOvertime.days),
//           hours: Number(newOvertime.hours),
//           rate: Number(newOvertime.rate),
//         });
//       } else {
//         await overtimeService.createOvertime({
//           employee_id: employeeId,
//           title: newOvertime.title,
//           days: Number(newOvertime.days),
//           hours: Number(newOvertime.hours),
//           rate: Number(newOvertime.rate),
//         });
//       }
//       setShowModal(false);
//       await fetchOvertimes();
//     } catch (err) {
//       console.error("Error saving overtime:", err);
//       alert("Failed to save overtime");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="card p-3 shadow-sm rounded-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <h5 className="mb-0">
//           Overtime {employeeName ? `for ${employeeName}` : ""}
//         </h5>
//         <Button variant="success" size="sm" onClick={handleAdd}>
//           <Plus size={20} />
//         </Button>
//       </div>

//       {loading ? (
//         <div className="text-center my-3">
//           <Spinner animation="border" />
//         </div>
//       ) : (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>EMPLOYEE NAME</th>
//               <th>OVERTIME TITLE</th>
//               <th>NUMBER OF DAYS</th>
//               <th>HOURS</th>
//               <th>RATE</th>
//               <th>ACTIONS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {overtimes.length > 0 ? (
//               overtimes.map((ot) => (
//                 <tr key={ot._id}>
//                   <td>{employeeName}</td>
//                   <td>{ot.title}</td>
//                   <td>{ot.days}</td>
//                   <td>{ot.hours}</td>
//                   <td>${ot.rate}</td>
//                   <td>
//                     <Button
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(ot)}
//                     >
//                       <PencilSquare />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleDelete(ot._id)}
//                     >
//                       <Trash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={6} className="text-center text-muted">
//                   No overtime records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       )}

//       {/* ✅ Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingOvertime ? "Edit Overtime" : "Add Overtime"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row>
//               <Col md={12} className="mb-2">
//                 <Form.Label>Overtime Title</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={newOvertime.title}
//                   onChange={(e) =>
//                     setNewOvertime({ ...newOvertime, title: e.target.value })
//                   }
//                 />
//               </Col>
//               <Col md={6} className="mb-2">
//                 <Form.Label>Number of Days</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={newOvertime.days}
//                   onChange={(e) =>
//                     setNewOvertime({ ...newOvertime, days: e.target.value })
//                   }
//                 />
//               </Col>
//               <Col md={6} className="mb-2">
//                 <Form.Label>Hours</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={newOvertime.hours}
//                   onChange={(e) =>
//                     setNewOvertime({ ...newOvertime, hours: e.target.value })
//                   }
//                 />
//               </Col>
//               <Col md={12} className="mb-2">
//                 <Form.Label>Rate</Form.Label>
//                 <Form.Control
//                   type="number"
//                   value={newOvertime.rate}
//                   onChange={(e) =>
//                     setNewOvertime({ ...newOvertime, rate: e.target.value })
//                   }
//                 />
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleModalSubmit}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default OvertimeCard;

// // src/components/OvertimeCard.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { Table, Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import overtimeService from "../../../../services/overtimeService";

// const emptyForm = {
//   title: "",
//   number_of_days: "",
//   hours: "",
//   rate: "",
//   type: "Regular",
// };

// const OvertimeCard = ({ employeeId, employeeName }) => {
//   const [overtimes, setOvertimes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editingOvertime, setEditingOvertime] = useState(null);
//   const [form, setForm] = useState(emptyForm);

//   const currency = useMemo(
//     () =>
//       new Intl.NumberFormat(undefined, {
//         style: "currency",
//         currency: "INR",
//         maximumFractionDigits: 0,
//       }),
//     []
//   );

//   const fetchOvertimes = async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     try {
//       const data = await overtimeService.getOvertimesByEmployee(employeeId);
//       setOvertimes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch overtimes:", err);
//       setOvertimes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOvertimes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [employeeId]);

//   const openAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingOvertime(null);
//     setForm(emptyForm);
//     setShowModal(true);
//   };

//   const openEdit = (ot) => {
//     setEditingOvertime(ot);
//     setForm({
//       title: ot.title || "",
//       number_of_days: ot.number_of_days ?? "",
//       hours: ot.hours ?? "",
//       rate: ot.rate ?? "",
//       type: ot.type || "Regular",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this record?")) return;
//     try {
//       const ok = await overtimeService.deleteOvertime(id);
//       if (ok) {
//         setOvertimes((prev) => prev.filter((ot) => ot.id !== id));
//       } else {
//         alert("Delete failed");
//       }
//     } catch (err) {
//       console.error("Failed to delete overtime:", err);
//       alert("Failed to delete overtime");
//     }
//   };

//   const handleSave = async () => {
//     const { title, number_of_days, hours, rate, type } = form;
//     if (!title || !number_of_days || !hours || !rate) {
//       alert("Please fill all required fields");
//       return;
//     }

//     const payload = {
//       title: String(title).trim(),
//       number_of_days: Number(number_of_days),
//       hours: Number(hours),
//       rate: Number(rate),
//       type: type || "Regular",
//     };

//     setSaving(true);
//     try {
//       if (editingOvertime) {
//         await overtimeService.updateOvertime(editingOvertime.id, payload);
//       } else {
//         await overtimeService.createOvertime({
//           employee_id: Number(employeeId), // required by backend for company users
//           ...payload,
//         });
//       }
//       setShowModal(false);
//       await fetchOvertimes();
//     } catch (err) {
//       console.error("Error saving overtime:", err);
//       const msg = err?.response?.data?.message || "Failed to save overtime";
//       alert(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onChange = (key) => (e) => {
//     const v = e.target.value;
//     setForm((f) => ({ ...f, [key]: v }));
//   };

//   return (
//     <div className="card p-3 shadow-sm rounded-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <h5 className="mb-0">
//           Overtime {employeeName ? `— ${employeeName}` : ""}
//         </h5>
//         <Button
//           variant="success"
//           size="sm"
//           onClick={openAdd}
//           disabled={!employeeId}
//         >
//           <Plus size={18} />
//         </Button>
//       </div>

//       {loading ? (
//         <div className="text-center my-3">
//           <Spinner animation="border" />
//         </div>
//       ) : (
//         <Table bordered hover responsive className="align-middle mb-0">
//           <thead className="table-light text-uppercase small">
//             <tr className="text-center">
//               <th style={{ width: 220 }}>Employee</th>
//               <th>Overtime Title</th>
//               <th style={{ width: 140 }}>No. of Days</th>
//               <th style={{ width: 120 }}>Hours</th>
//               <th style={{ width: 140 }}>Rate</th>
//               <th style={{ width: 140 }}>Type</th>
//               <th style={{ width: 120 }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {overtimes.length > 0 ? (
//               overtimes.map((ot) => (
//                 <tr key={ot.id}>
//                   <td className="text-truncate">
//                     {employeeName || ot?.employee?.name || "—"}
//                   </td>
//                   <td>{ot.title}</td>
//                   <td className="text-center">{ot.number_of_days}</td>
//                   <td className="text-center">{ot.hours}</td>
//                   <td className="text-end">
//                     {currency.format(Number(ot.rate || 0))}
//                   </td>
//                   <td className="text-center">{ot.type || "—"}</td>
//                   <td className="text-center">
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => openEdit(ot)}
//                     >
//                       <PencilSquare />
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleDelete(ot.id)}
//                     >
//                       <Trash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={7} className="text-center text-muted py-4">
//                   No overtime records found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       )}

//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title className="h6 mb-0">
//             {editingOvertime ? "Edit Overtime" : "Add Overtime"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row>
//               <Col md={12} className="mb-3">
//                 <Form.Label>Overtime Title</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={form.title}
//                   onChange={onChange("title")}
//                   placeholder="e.g., Project Deadline"
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>No. of Days</Form.Label>
//                 <Form.Control
//                   type="number"
//                   min="1"
//                   value={form.number_of_days}
//                   onChange={onChange("number_of_days")}
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Hours</Form.Label>
//                 <Form.Control
//                   type="number"
//                   min="1"
//                   value={form.hours}
//                   onChange={onChange("hours")}
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Rate</Form.Label>
//                 <Form.Control
//                   type="number"
//                   min="0"
//                   value={form.rate}
//                   onChange={onChange("rate")}
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Type</Form.Label>
//                 <Form.Select value={form.type} onChange={onChange("type")}>
//                   <option value="Regular">Regular</option>
//                   <option value="Weekend">Weekend</option>
//                   <option value="Holiday">Holiday</option>
//                 </Form.Select>
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : "Save"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default OvertimeCard;













// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Spinner,
//   Card,
// } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import overtimeService from "../../../../services/overtimeService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";

// const emptyForm = {
//   title: "",
//   number_of_days: "",
//   hours: "",
//   rate: "",
//   type: "Regular",
// };

// const OvertimeCard = ({ employeeId, employeeName }) => {
//   const [overtimes, setOvertimes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editingOvertime, setEditingOvertime] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [isClosingModal, setIsClosingModal] = useState(false); // ✅ animation state

//   const currency = useMemo(
//     () =>
//       new Intl.NumberFormat(undefined, {
//         style: "currency",
//         currency: "INR",
//         maximumFractionDigits: 0,
//       }),
//     []
//   );

//   const fetchOvertimes = async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     try {
//       const data = await overtimeService.getOvertimesByEmployee(employeeId);
//       setOvertimes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch overtimes:", err);
//       setOvertimes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOvertimes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [employeeId]);

//   const openAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingOvertime(null);
//     setForm(emptyForm);
//     setShowModal(true);
//   };

//   const openEdit = (ot) => {
//     setEditingOvertime(ot);
//     setForm({
//       title: ot.title || "",
//       number_of_days: ot.number_of_days ?? "",
//       hours: ot.hours ?? "",
//       rate: ot.rate ?? "",
//       type: ot.type || "Regular",
//     });
//     setShowModal(true);
//   };

//   // const handleDelete = async (id) => {
//   //   if (!window.confirm("Are you sure you want to delete this record?")) return;
//   //   try {
//   //     const ok = await overtimeService.deleteOvertime(id);
//   //     if (ok) {
//   //       setOvertimes((prev) => prev.filter((ot) => ot.id !== id));
//   //     } else {
//   //       alert("Delete failed");
//   //     }
//   //   } catch (err) {
//   //     console.error("Failed to delete overtime:", err);
//   //     alert("Failed to delete overtime");
//   //   }
//   // };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>

//           <div className="d-flex justify-content-center mt-3">
//             {/* Cancel Button */}
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>

//             {/* Confirm Button */}
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   const ok = await overtimeService.deleteOvertime(id); // ✅ API call
//                   if (ok) {
//                     setOvertimes((prev) => prev.filter((ot) => ot.id !== id)); // ✅ update state
//                   } else {
//                     alert("Delete failed");
//                   }
//                 } catch (err) {
//                   console.error("Failed to delete overtime:", err);
//                   alert("Failed to delete overtime");
//                 }
//                 onClose(); // close modal
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleModalClose = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setEditingOvertime(null);
//       setForm(emptyForm);
//     }, 700);
//   };
//   const handleSave = async () => {
//     const { title, number_of_days, hours, rate, type } = form;
//     if (!title || !number_of_days || !hours || !rate) {
//       alert("Please fill all required fields");
//       return;
//     }

//     const payload = {
//       title: String(title).trim(),
//       number_of_days: Number(number_of_days),
//       hours: Number(hours),
//       rate: Number(rate),
//       type: type || "Regular",
//     };

//     setSaving(true);
//     try {
//       if (editingOvertime) {
//         await overtimeService.updateOvertime(editingOvertime.id, payload);
//       } else {
//         await overtimeService.createOvertime({
//           employee_id: Number(employeeId),
//           ...payload,
//         });
//       }
//       handleModalClose();

//       await fetchOvertimes();
//     } catch (err) {
//       console.error("Error saving overtime:", err);
//       const msg = err?.response?.data?.message || "Failed to save overtime";
//       alert(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onChange = (key) => (e) => {
//     const v = e.target.value;
//     setForm((f) => ({ ...f, [key]: v }));
//   };

//   return (
//     <>
//       <style>{`
//   @keyframes slideInUp {
//     from { transform: translateY(100%); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
//   @keyframes slideOutUp {
//     from { transform: translateY(0); opacity: 1; }
//     to { transform: translateY(-100%); opacity: 0; }
//   }
//   .custom-slide-modal.open .modal-dialog {
//     animation: slideInUp 0.7s ease forwards;
//   }
//   .custom-slide-modal.closing .modal-dialog {
//     animation: slideOutUp 0.7s ease forwards;
//   }
// `}</style>
//       <Card
//         className="card p-3 pt-2 shadow-sm rounded-3"
//         style={{
//           overflowY: "scroll",
//           overflowX: "hidden",
//           height: "385px",
//           scrollbarWidth: "none", // Firefox
//           msOverflowStyle: "none",
//         }}
//       >
//         {/* <div className="d-flex justify-content-between align-items-center mb-3"> */}
//         <div
//           className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
//           style={{ position: "sticky", top: 0, zIndex: 10 }}
//         >
//           <h5 className="mb-0">Overtime</h5>
//           {/* <Button
//           variant="success"
//           onClick={openAdd}
//           disabled={!employeeId}
//           className="d-flex align-items-center"
//         >
//           <Plus />
//         </Button> */}
//           <OverlayTrigger
//             placement="top"
//             overlay={<Tooltip>Add Overtime</Tooltip>}
//           >
//             <Button
//               variant="success"
//               onClick={openAdd}
//               disabled={!employeeId}
//               className="d-flex align-items-center"
//             >
//               <Plus />
//             </Button>
//           </OverlayTrigger>
//         </div>

//         {loading ? (
//           <div className="text-center my-3">
//             <Spinner animation="border" />
//           </div>
//         ) : (
//           <div className="card-body mt-2">
//             <div
//               className="table-responsive  "
//               style={{ maxHeight: "250px", overflowY: "auto" }}
//             >
//               <Table striped hover className="mb-0 ">
//                 <thead>
//                   <tr>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Employee
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       OVERTIME TITLE
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       NO. OF DAYS
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       HOURS
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       RATE
//                     </th>
//                     {/* <th>TYPE</th> */}
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       ACTIONS
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {overtimes.length > 0 ? (
//                     overtimes.map((ot) => (
//                       <tr key={ot.id}>
//                         <td> {employeeName || ot?.employee?.name || "—"}</td>
//                         <td>{ot.title}</td>
//                         <td>{ot.number_of_days}</td>
//                         <td>{ot.hours}</td>
//                         <td>₹{ot.rate}</td>
//                         {/* <td>{ot.type || "Regular"}</td> */}
//                         <td>
//                           {/* <Button
//                             variant="info"
//                             size="sm"
//                             className="me-1"
//                             onClick={() => openEdit(ot)}
//                           >
//                             <PencilSquare size={14} />
//                           </Button> */}
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Edit</Tooltip>}
//                           >
//                             <Button
//                               variant="info"
//                               size="sm"
//                               className="me-1"
//                               onClick={() => openEdit(ot)}
//                             >
//                               <PencilSquare size={14} />
//                             </Button>
//                           </OverlayTrigger>
//                           {/* <Button
//                             variant="danger"
//                             size="sm"
//                             onClick={() => handleDelete(ot.id)}
//                           >
//                             <Trash size={14} />
//                           </Button> */}
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Delete</Tooltip>}
//                           >
//                             <Button
//                               variant="danger"
//                               size="sm"
//                               onClick={() => handleDelete(ot.id)}
//                             >
//                               <Trash size={14} />
//                             </Button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={6} className="text-center text-muted py-3">
//                         No overtime records found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </div>
//         )}

//         <Modal show={showModal} onHide={() => setShowModal(false)} centered className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}>
//           <Modal.Header closeButton>
//             <Modal.Title className="h6 mb-0">
//               {editingOvertime ? "Edit Overtime" : "Add Overtime"}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Row>
//                 <Col md={12} className="mb-3">
//                   <Form.Label>Overtime Title <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={form.title}
//                     onChange={onChange("title")}
//                     placeholder="e.g., Project Deadline"
//                   />
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <Form.Label>No. of  <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="number"
//                     min="1"
//                     value={form.number_of_days}
//                     onChange={onChange("number_of_days")}
//                   />
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <Form.Label>Hours <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="number"
//                     min="1"
//                     value={form.hours}
//                     onChange={onChange("hours")}
//                   />
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <Form.Label>Rate <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="number"
//                     min="0"
//                     value={form.rate}
//                     onChange={onChange("rate")}
//                   />
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <Form.Label>Type</Form.Label>
//                   <Form.Select value={form.type} onChange={onChange("type")}>
//                     <option value="Regular">Regular</option>
//                     <option value="Weekend">Weekend</option>
//                     <option value="Holiday">Holiday</option>
//                   </Form.Select>
//                 </Col>
//               </Row>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleModalClose}>
//               Cancel
//             </Button>
//             <Button variant="success" onClick={handleSave} disabled={saving}>
//               {saving ? "Saving..." : editingOvertime ? "Update" : "Create"}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Card>
//     </>
//   );
// };

// export default OvertimeCard;













import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Card,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import overtimeService from "../../../../services/overtimeService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const emptyForm = {
  title: "",
  number_of_days: "",
  hours: "",
  rate: "",
  type: "Regular",
};

const OvertimeCard = ({ employeeId, employeeName }) => {
  const [overtimes, setOvertimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // ✅ new state

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const fetchOvertimes = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await overtimeService.getOvertimesByEmployee(employeeId);
      setOvertimes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch overtimes:", err);
      setOvertimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimes();
  }, [employeeId]);

  const openAdd = () => {
    if (!employeeId) {
      alert("Please select an employee first");
      return;
    }
    setEditingOvertime(null);
    setForm(emptyForm);
    setValidationErrors({});
    setShowModal(true);
  };

  const openEdit = (ot) => {
    setEditingOvertime(ot);
    setForm({
      title: ot.title || "",
      number_of_days: ot.number_of_days ?? "",
      hours: ot.hours ?? "",
      rate: ot.rate ?? "",
      type: ot.type || "Regular",
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>

          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>

            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  const ok = await overtimeService.deleteOvertime(id);
                  if (ok) {
                    setOvertimes((prev) => prev.filter((ot) => ot.id !== id));
                     toast.success("Overtime successfully deleted.", {
                    icon: false,
                  });
                  } else {
                    alert("Delete failed");
                  }
                } catch (err) {
                  console.error("Failed to delete overtime:", err);
                  alert("Failed to delete overtime");
                }
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleModalClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingOvertime(null);
      setForm(emptyForm);
      setValidationErrors({});
    }, 700);
  };

  // ✅ Enhanced Validation
  const handleSave = async () => {
    const { title, number_of_days, hours, rate, type } = form;
    const errors = {};

    if (!title.trim()) errors.title = "Overtime title is required";
    if (!number_of_days || Number(number_of_days) <= 0)
      errors.number_of_days = "Enter valid number of days";
    if (!hours || Number(hours) <= 0)
      errors.hours = "Enter valid number of hours";
    if (!rate || Number(rate) <= 0) errors.rate = "Enter valid rate";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      title: String(title).trim(),
      number_of_days: Number(number_of_days),
      hours: Number(hours),
      rate: Number(rate),
      type: type || "Regular",
    };

    setSaving(true);
    try {
      if (editingOvertime) {
        await overtimeService.updateOvertime(editingOvertime.id, payload);
        toast.success("Overtime successfully updated.", {
          icon: false,
        });
      } else {
        await overtimeService.createOvertime({
          employee_id: Number(employeeId),
          ...payload,
        });
         toast.success("Overtime successfully created.", {
          icon: false,
        });
      }
      handleModalClose();
      await fetchOvertimes();
    } catch (err) {
      console.error("Error saving overtime:", err);
      const msg = err?.response?.data?.message || "Failed to save overtime";
      setValidationErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  };

  const onChange = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    setValidationErrors((prev) => ({ ...prev, [key]: "" })); // clear inline error
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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0, zIndex: 10 }}
        >
          <h5 className="mb-0">Overtime</h5>
          {/* <OverlayTrigger placement="top" overlay={<Tooltip>Add Overtime</Tooltip>}>
            <Button
              variant="success"
              onClick={openAdd}
              disabled={!employeeId}
              className="d-flex align-items-center"
            >
              <Plus />
            </Button>
          </OverlayTrigger> */}
        </div>

        {loading ? (
          <div className="text-center my-3">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="card-body mt-2">
            <div className="table-responsive" style={{ maxHeight: "250px", overflowY: "auto" }}>
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Overtime Title</th>
                    <th>No. of Days</th>
                    <th>Hours</th>
                    <th>Rate</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {overtimes.length > 0 ? (
                    overtimes.map((ot) => (
                      <tr key={ot.id}>
                        <td>{employeeName || ot?.employee?.name || "—"}</td>
                        <td>{ot.title}</td>
                        <td>{ot.number_of_days}</td>
                        <td>{ot.hours}</td>
                        <td>₹{ot.rate}</td>
                        {/* <td>
                          <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-1"
                              onClick={() => openEdit(ot)}
                            >
                              <PencilSquare size={14} />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(ot.id)}
                            >
                              <Trash size={14} />
                            </Button>
                          </OverlayTrigger>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-3">
                        No overtime records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* ✅ Modal with inline validation */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="h6 mb-0">
              {editingOvertime ? "Edit Overtime" : "Add Overtime"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Label>
                    Overtime Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={form.title}
                    onChange={onChange("title")}
                    placeholder="e.g., Project Deadline"
                    isInvalid={!!validationErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.title}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    No. of Days <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.number_of_days}
                    onChange={onChange("number_of_days")}
                    isInvalid={!!validationErrors.number_of_days}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.number_of_days}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    Hours <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.hours}
                    onChange={onChange("hours")}
                    isInvalid={!!validationErrors.hours}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.hours}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    Rate <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.rate}
                    onChange={onChange("rate")}
                    isInvalid={!!validationErrors.rate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.rate}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={form.type} onChange={onChange("type")}>
                    <option value="Regular">Regular</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Holiday">Holiday</option>
                  </Form.Select>
                </Col>

                {validationErrors.general && (
                  <div className="text-danger small mt-1 ps-2">
                    {validationErrors.general}
                  </div>
                )}
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingOvertime ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};

export default OvertimeCard;
