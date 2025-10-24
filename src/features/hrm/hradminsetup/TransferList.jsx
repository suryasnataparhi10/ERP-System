// import React, { useEffect, useState } from "react";
// import {
//   getTransfers,
//   createTransfer,
//   updateTransfer,
//   deleteTransfer,
//   getEmployees,
//   getBranches,
// } from "../../../services/hrmService";

// import departmentService from "../../../services/departmentService";

// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const TransferList = () => {
//   const [transfers, setTransfers] = useState([]);
//   const [filteredTransfers, setFilteredTransfers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTransfer, setEditingTransfer] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});

//   const [formData, setFormData] = useState({
//     employee_id: "",
//     branch_id: "",
//     department_id: "",
//     transfer_date: "",
//     description: "",
//   });

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [employees, setEmployees] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [allDepartments, setAllDepartments] = useState([]);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     filterTransfers();
//   }, [transfers, searchTerm, allDepartments]);

//   // useEffect(() => {
//   //   if (formData.branch_id) {
//   //     departmentService.getByBranch(formData.branch_id).then((data) => {
//   //       setDepartments(data || []);
//   //       setFormData((prev) => ({ ...prev, department_id: "" }));
//   //     });
//   //   } else {
//   //     setDepartments([]);
//   //     setFormData((prev) => ({ ...prev, department_id: "" }));
//   //   }
//   // }, [formData.branch_id]);

//   useEffect(() => {
//     if (formData.branch_id) {
//       departmentService.getByBranch(formData.branch_id).then((data) => {
//         setDepartments(data || []);

//         // ✅ Only clear department when NOT editing
//         setFormData((prev) => ({
//           ...prev,
//           department_id: editingTransfer ? prev.department_id : "",
//         }));
//       });
//     } else {
//       setDepartments([]);
//       setFormData((prev) => ({ ...prev, department_id: "" }));
//     }
//   }, [formData.branch_id, editingTransfer]);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [transferData, employeeData, branchData, allDeptData] =
//         await Promise.all([
//           getTransfers(),
//           getEmployees(),
//           getBranches(),
//           departmentService.getAll(),
//         ]);
//       setTransfers(transferData);
//       setEmployees(employeeData);
//       setBranches(branchData);
//       setAllDepartments(allDeptData || []);
//     } catch (error) {
//       console.error("Error loading initial data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterTransfers = () => {
//     const term = searchTerm.toLowerCase();
//     const filtered = transfers.filter((t) => {
//       const emp = getName(employees, t.employee_id);
//       const branch = getName(branches, t.branch_id);
//       const dept = getName(allDepartments, t.department_id);
//       return (
//         emp.toLowerCase().includes(term) ||
//         branch.toLowerCase().includes(term) ||
//         dept.toLowerCase().includes(term) ||
//         (t.description?.toLowerCase() || "").includes(term)
//       );
//     });
//     setFilteredTransfers(filtered);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCreate = () => {
//     setFormData({
//       employee_id: "",
//       branch_id: "",
//       department_id: "",
//       transfer_date: "",
//       description: "",
//     });
//     setEditingTransfer(null);
//     setShowModal(true);
//   };

//   // const handleEdit = (transfer) => {
//   //   setFormData(transfer);
//   //   setEditingTransfer(transfer);

//   //   departmentService.getByBranch(transfer.branch_id).then((data) => {
//   //     setDepartments(data || []);
//   //   });

//   //   setShowModal(true);
//   // };

//   const handleEdit = (transfer) => {
//     setEditingTransfer(transfer);
//     setFormData(transfer);

//     // Fetch departments for the selected branch
//     departmentService.getByBranch(transfer.branch_id).then((data) => {
//       setDepartments(data || []);

//       // ✅ Ensure the department_id remains selected after departments load
//       setFormData((prev) => ({
//         ...prev,
//         branch_id: transfer.branch_id,
//         department_id: transfer.department_id,
//       }));
//     });

//     setShowModal(true);
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteTransfer(id); // ? transfer deletion
//                   await loadInitialData(); // ? refresh data
//                   toast.success("Transfer deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting transfer:", error);
//                 }
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleSubmit = async () => {
//     const errors = {};
//     if (!formData.branch_id) errors.branch_id = "Branch is required";
//     if (!formData.department_id)
//       errors.department_id = "Department is required";
//     if (!formData.employee_id) errors.employee_id = "Employee is required";
//     if (!formData.transfer_date)
//       errors.transfer_date = "Transfer Date is required";

//     setValidationErrors(errors);
//     if (Object.keys(errors).length > 0) return; // stop if validation fails

//     try {
//       const payload = {};

//       // Only include employee_id if creating OR user really changed it
//       if (!editingTransfer && formData.employee_id) {
//         payload.employee_id = Number(formData.employee_id);
//       }

//       if (formData.branch_id) payload.branch_id = Number(formData.branch_id);
//       if (formData.department_id)
//         payload.department_id = Number(formData.department_id);
//       if (formData.transfer_date)
//         payload.transfer_date = formData.transfer_date;
//       if (formData.description) payload.description = formData.description;

//       console.log("Submitting payload:", payload);

//       if (editingTransfer) {
//         await updateTransfer(editingTransfer.id, payload);
//         toast.success("Transfer successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createTransfer(payload);
//         toast.success("Transfer successfully created.", {
//           icon: false,
//         });
//       }

//       await loadInitialData();
//       setShowModal(false);
//     } catch (error) {
//       console.error("Error saving transfer:", error.response?.data || error);
//       alert(
//         error.response?.data?.message ||
//           "Failed to save transfer. Check console for details."
//       );
//     }
//   };

//   const getName = (list, id) => {
//     const item = list.find(
//       (i) => String(i.employee_id) === String(id) || String(i.id) === String(id)
//     );
//     return item?.user?.name || item?.name || "Unknown";
//   };

//   // ? Closing modal with animation
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 400);
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredTransfers.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredTransfers.length / entriesPerPage);
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   // if (loading)
//   //   return (
//   //     <div
//   //       className="d-flex justify-content-center align-items-center "
//   //       style={{ height: "100vh" }}
//   //     >
//   //       <Spinner animation="border" variant="success" />
//   //     </div>
//   //   );

//   return (
//     <div className="container mt-4">
//       {/* ? Modal Animation Styles */}
//       <style>{`
//         @keyframes slideInUp {
//           from { transform: translateY(100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes slideOutUp {
//           from { transform: translateY(0); opacity: 1; }
//           to { transform: translateY(-100%); opacity: 0; }
//         }
//         .custom-slide-modal.open .modal-dialog {
//           animation: slideInUp 0.7s ease forwards;
//         }
//         .custom-slide-modal.closing .modal-dialog {
//           animation: slideOutUp 0.7s ease forwards;
//         }
//       `}</style>
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4>Manage Transfer</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button variant="success" onClick={handleCreate}>
//             <i className="bi bi-plus-lg "></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       <div
//         className="card border-0 shadow-sm rounded-4 p-3"
//         style={{ height: "100%" }}
//       >
//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               style={{ width: "80px", height: "40px" }}
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//             >
//               {[10, 25, 50, 100].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <input
//               type="text"
//               className="form-control form-control-sm "
//               style={{ maxWidth: "250px" }}
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div className="text-center py-5">
//             <Spinner animation="border" variant="success" />
//           </div>
//         ) : (
//           <div className="flex-grow-1">
//             <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
//               <thead className="bg-light ">
//                 <tr>
//                   <th>Employee Name</th>
//                   <th>Site</th>
//                   <th>Department</th>
//                   <th>Transfer Date</th>
//                   <th>Description</th>
//                   <th className="text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((t) => (
//                     <tr key={t.id} className="align-middle">
//                       <td>{getName(employees, t.employee_id)}</td>

//                       <td>{getName(branches, t.branch_id)}</td>
//                       <td>{getName(allDepartments, t.department_id)}</td>
//                       <td>
//                         {new Date(t.transfer_date).toLocaleDateString("en-US", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         })}
//                       </td>
//                       <td>{t.description}</td>
//                       <td className="text-center">
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-info me-1"
//                             onClick={() => handleEdit(t)}
//                           >
//                             <i className="bi bi-pencil-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-danger"
//                             onClick={() => handleDelete(t.id)}
//                           >
//                             <i className="bi bi-trash-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="text-center">
//                       No transfers found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Pagination Footer */}
//         {/* <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//           <div className="small text-muted">
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, filteredTransfers.length)} of{" "}
//             {filteredTransfers.length} entries
//           </div>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {pageNumbers.map((num) => (
//                 <li
//                   key={num}
//                   className={`page-item ${currentPage === num ? "active" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(num)}
//                   >
//                     {num}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div> */}

//         <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//           <div className="small text-muted">
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, filteredTransfers.length)} of{" "}
//             {filteredTransfers.length} entries
//           </div>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {/* Left Arrow */}
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 >
//                   «
//                 </button>
//               </li>

//               {/* Page Numbers */}
//               {pageNumbers.map((num) => (
//                 <li
//                   key={num}
//                   className={`page-item ${currentPage === num ? "active" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(num)}
//                   >
//                     {num}
//                   </button>
//                 </li>
//               ))}

//               {/* Right Arrow */}
//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(p + 1, totalPages))
//                   }
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Modal */}
//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={closeModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingTransfer ? "Edit Transfer" : "Create New Transfer"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Site <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="branch_id"
//                 value={formData.branch_id}
//                 onChange={handleChange}
//                 isInvalid={!!validationErrors.branch_id}
//                 disabled={!!editingTransfer} // ❌ Disable in edit mode
//               >
//                 <option value="">Select Site</option>
//                 {branches.map((b) => (
//                   <option key={b.id} value={b.id}>
//                     {b.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.branch_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Department <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="department_id"
//                 value={formData.department_id}
//                 onChange={handleChange}
//                 disabled={!departments.length || editingTransfer}
//                 isInvalid={!!validationErrors.department_id}
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.department_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Employee <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleChange}
//                 isInvalid={!!validationErrors.employee_id}
//                 disabled={!!editingTransfer} // ❌ Disable in edit mode
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((e) => (
//                   <option key={e.employee_id} value={e.employee_id}>
//                     {e.user?.name || e.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.employee_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Transfer Date <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="transfer_date"
//                 value={formData.transfer_date}
//                 onChange={handleChange}
//                 isInvalid={!!validationErrors.transfer_date}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.transfer_date}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editingTransfer ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default TransferList;

import React, { useEffect, useState } from "react";
import {
  getTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  getEmployees,
  getBranches,
} from "../../../services/hrmService";

import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService"; // Add designation service

import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const TransferList = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee_id: "",
    branch_id: "",
    department_id: "",
    designation_id: "", // Added designation field
    transfer_date: "",
    description: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]); // Added designations state
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]); // Added all designations

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, searchTerm, allDepartments, allDesignations]);

  // Load departments when branch changes
  useEffect(() => {
    if (formData.branch_id) {
      departmentService.getByBranch(formData.branch_id).then((data) => {
        setDepartments(data || []);
      });
    } else {
      setDepartments([]);
    }
  }, [formData.branch_id]);

  // Load designations when department changes
  useEffect(() => {
    if (formData.department_id) {
      designationService
        .getByDepartment(formData.department_id)
        .then((data) => {
          setDesignations(data || []);
        });
    } else {
      setDesignations([]);
    }
  }, [formData.department_id]);

  // Reset dependent fields when parent fields change
  useEffect(() => {
    if (departments.length && formData.department_id) {
      const exists = departments.some((d) => d.id === formData.department_id);
      if (!exists) {
        setFormData((prev) => ({
          ...prev,
          department_id: "",
          designation_id: "",
        }));
      }
    }
  }, [departments]);

  useEffect(() => {
    if (designations.length && formData.designation_id) {
      const exists = designations.some((d) => d.id === formData.designation_id);
      if (!exists) {
        setFormData((prev) => ({ ...prev, designation_id: "" }));
      }
    }
  }, [designations]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [
        transferData,
        employeeData,
        branchData,
        allDeptData,
        allDesigData,
      ] = await Promise.all([
        getTransfers(),
        getEmployees(),
        getBranches(),
        departmentService.getAll(),
        designationService.getAll(), // Load all designations
      ]);

      // Handle the new response structure from backend
      const formattedTransfers = transferData.data || transferData;
      setTransfers(formattedTransfers);
      setEmployees(employeeData);
      setBranches(branchData);
      setAllDepartments(allDeptData || []);
      setAllDesignations(allDesigData || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filterTransfers = () => {
    const term = searchTerm.toLowerCase();
    const filtered = transfers.filter((t) => {
      const emp = getName(employees, t.employee_id);
      const branch = t.branch?.name || getName(branches, t.branch_id);
      const dept =
        t.department?.name || getName(allDepartments, t.department_id);
      const desig =
        t.designation?.name || getName(allDesignations, t.designation_id);

      return (
        emp.toLowerCase().includes(term) ||
        branch.toLowerCase().includes(term) ||
        dept.toLowerCase().includes(term) ||
        desig.toLowerCase().includes(term) ||
        (t.description?.toLowerCase() || "").includes(term)
      );
    });
    setFilteredTransfers(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      branch_id: "",
      department_id: "",
      designation_id: "",
      transfer_date: "",
      description: "",
    });
    setEditingTransfer(null);
    setDepartments([]);
    setDesignations([]);
    setShowModal(true);
  };

  const handleEdit = (transfer) => {
    setFormData({
      employee_id: transfer.employee_id,
      branch_id: transfer.branch_id || "",
      department_id: transfer.department_id || "",
      designation_id: transfer.designation_id || "",
      transfer_date: transfer.transfer_date,
      description: transfer.description || "",
    });
    setEditingTransfer(transfer);

    // Load departments and designations for the transfer's branch and department
    if (transfer.branch_id) {
      departmentService.getByBranch(transfer.branch_id).then((data) => {
        setDepartments(data || []);

        if (transfer.department_id) {
          designationService
            .getByDepartment(transfer.department_id)
            .then((desigData) => {
              setDesignations(desigData || []);
            });
        }
      });
    }

    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
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
                  await deleteTransfer(id);
                  await loadInitialData();
                  toast.success("Transfer deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting transfer:", error);
                  toast.error("Failed to delete transfer");
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

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.branch_id) errors.branch_id = "Branch is required";
    if (!formData.department_id)
      errors.department_id = "Department is required";
    if (!formData.designation_id)
      errors.designation_id = "Designation is required";
    if (!formData.employee_id) errors.employee_id = "Employee is required";
    if (!formData.transfer_date)
      errors.transfer_date = "Transfer Date is required";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        branch_id: Number(formData.branch_id),
        department_id: Number(formData.department_id),
        designation_id: Number(formData.designation_id),
        employee_id: String(formData.employee_id),
        transfer_date: formData.transfer_date,
        description: formData.description || "",
      };

      console.log("Submitting payload:", payload);

      if (editingTransfer) {
        await updateTransfer(editingTransfer.id, payload);
        toast.success("Transfer successfully updated.", {
          icon: false,
        });
      } else {
        await createTransfer(payload);
        toast.success("Transfer successfully created.", {
          icon: false,
        });
      }

      await loadInitialData();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving transfer:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "Failed to save transfer.";
      toast.error(errorMessage);
    }
  };

  const getName = (list, id) => {
    if (!id) return "Unknown";
    const item = list.find(
      (i) => String(i.employee_id) === String(id) || String(i.id) === String(id)
    );
    return item?.user?.name || item?.name || "Unknown";
  };

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setValidationErrors({});
    }, 400);
  };

  // Pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredTransfers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransfers.length / entriesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="container mt-4">
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Transfer</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button variant="success" onClick={handleCreate}>
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 p-3"
        style={{ height: "100%" }}
      >
        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
          <div className="d-flex align-items-center mb-2">
            <select
              className="form-select me-2"
              style={{ width: "80px", height: "40px" }}
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: "250px" }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow-1">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Employee Name</th>
                  <th>Branch</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Transfer Date</th>
                  <th>Description</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((t) => (
                    <tr key={t.id} className="align-middle">
                      <td>
                        {t.employee?.name || getName(employees, t.employee_id)}
                      </td>
                      <td>
                        {t.branch?.name || getName(branches, t.branch_id)}
                      </td>
                      <td>
                        {t.department?.name ||
                          getName(allDepartments, t.department_id)}
                      </td>
                      <td>
                        {t.designation?.name ||
                          getName(allDesignations, t.designation_id)}
                      </td>
                      <td>
                        {new Date(t.transfer_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          width: "250px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                      >
                        {t.description}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => handleEdit(t)}
                          >
                            <i className="bi bi-pencil-fill text-white"></i>
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(t.id)}
                          >
                            <i className="bi bi-trash-fill text-white"></i>
                          </button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="small text-muted">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredTransfers.length)} of{" "}
            {filteredTransfers.length} entries
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  «
                </button>
              </li>

              {pageNumbers.map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTransfer ? "Edit Transfer" : "Create New Transfer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Branch <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                isInvalid={!!validationErrors.branch_id}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.branch_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Department <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                disabled={!departments.length}
                isInvalid={!!validationErrors.department_id}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.department_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Designation <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="designation_id"
                value={formData.designation_id}
                onChange={handleChange}
                disabled={!designations.length}
                isInvalid={!!validationErrors.designation_id}
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.designation_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                isInvalid={!!validationErrors.employee_id}
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.user?.name || e.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.employee_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Transfer Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleChange}
                isInvalid={!!validationErrors.transfer_date}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.transfer_date}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editingTransfer ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferList;
