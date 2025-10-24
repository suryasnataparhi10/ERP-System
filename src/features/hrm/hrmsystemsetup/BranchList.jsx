// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Row, Col, InputGroup ,Spinner } from "react-bootstrap";
// import branchService from "../../../services/branchService";
// import {
//   FaEdit,
//   FaTrash,
//   FaMapMarkerAlt,
//   FaPhone,
//   FaLocationArrow,
// } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const BranchList = () => {
//   const [branches, setBranches] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newBranch, setNewBranch] = useState({
//     name: "",
//     branch_address: "",
//     contact_number: "",
//     co_ordinates: "",
//   });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false);
//     const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     try {
//       const res = await branchService.getAll();
//       let data = res.data || res;
//       data = data.sort((a, b) => b.id - a.id);
//       setBranches(data);
//     } catch (error) {
//       console.error("Failed to fetch branches:", error);
//     }
//     finally{
//       setLoading(false)
//     }
//   };

//   // NEW: handleSubmit -> uses native browser constraint validation.
//   // The submit event will only fire when the form is valid, so we can safely proceed.
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // runs only when browser validation passed
//     try {
//       const payload = {
//         name: newBranch.name.trim(),
//         branch_address: newBranch.branch_address.trim() || null,
//         contact_number: newBranch.contact_number.trim() || null,
//         co_ordinates: newBranch.co_ordinates.trim() || null,
//       };

//       if (editId) {
//         await branchService.update(editId, payload);
//         toast.success("Site successfully updated.", { icon: false });
//       } else {
//         await branchService.create(payload);
//         toast.success("Site successfully created.", { icon: false });
//       }

//       resetForm();
//       handleCloseModal();
//       fetchBranches();
//     } catch (error) {
//       console.error("Error saving Site:", error);
//       toast.error("Failed to save Site", { icon: false });
//     }
//   };

//   const resetForm = () => {
//     setNewBranch({
//       name: "",
//       branch_address: "",
//       contact_number: "",
//       co_ordinates: "",
//     });
//     setEditId(null);
//   };

//   const handleEdit = (branch) => {
//     setEditId(branch.id);
//     setNewBranch({
//       name: branch.name || "",
//       branch_address: branch.branch_address || "",
//       contact_number: branch.contact_number || "",
//       co_ordinates: branch.co_ordinates || "",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action can not be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 try {
//                   await branchService.remove(id);
//                   fetchBranches();
//                   onClose();
//                   toast.success("Site deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting Site:", error);
//                   toast.error("Failed to delete Site", { icon: false });
//                 }
//               }}
//             >
//               Yes
//             </Button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//       resetForm();
//     }, 400);
//   };

//   const filteredBranches = branches.filter(
//     (b) =>
//       b.name?.toLowerCase().includes(search.toLowerCase()) ||
//       b.branch_address?.toLowerCase().includes(search.toLowerCase()) ||
//       b.contact_number?.includes(search)
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentBranches = filteredBranches.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredBranches.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">
//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
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
//         .branch-info-item {
//           display: flex;
//           align-items: center;
//           margin-bottom: 5px;
//           font-size: 0.85rem;
//         }
//         .branch-info-icon {
//           margin-right: 8px;
//           color: #6c757d;
//           min-width: 16px;
//         }
//       `}</style>

//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Site</h5>
//         <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button variant="success" onClick={() => setShowModal(true)}>
//             <i className="bi bi-plus-lg fs-6"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {/* Search + Entries Per Page */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 ms-2 "
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             {/* <option value="5">5</option> */}
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//             <option value="100">100</option>
//           </select>

//         </div>
//         <Form.Control
//           type="text"
//           className="form-control-sm"
//           style={{ maxWidth: "250px" }}
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       {/* Table */}
//       <div className="table-responsive">
//          {loading ? (
//             <div className="text-center py-5">
//               <Spinner animation="border" variant="success" />
//             </div>
//           ) : (
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Site Name</th>
//               <th>Contact Information</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentBranches.length > 0 ? (
//               currentBranches.map((branch) => (
//                 <tr key={branch.id}>
//                   <td>
//                     <div className="fw-semibold">{branch.name}</div>
//                     {branch.branch_address && (
//                       <div className="branch-info-item">
//                         <FaMapMarkerAlt
//                           className="branch-info-icon"
//                           size={12}
//                         />
//                         <small className="text-muted">
//                           {branch.branch_address}
//                         </small>
//                       </div>
//                     )}
//                   </td>
//                   <td>
//                     {branch.contact_number && (
//                       <div className="branch-info-item">
//                         <FaPhone className="branch-info-icon" size={12} />
//                         <small>{branch.contact_number}</small>
//                       </div>
//                     )}
//                     {branch.co_ordinates && (
//                       <div className="branch-info-item">
//                         <FaLocationArrow
//                           className="branch-info-icon"
//                           size={12}
//                         />
//                         <small className="text-muted">
//                           {branch.co_ordinates}
//                         </small>
//                       </div>
//                     )}
//                     {!branch.contact_number && !branch.co_ordinates && (
//                       <small className="text-muted">No contact info</small>
//                     )}
//                   </td>
//                   <td>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-info btn-sm me-2 square-btn"
//                         onClick={() => handleEdit(branch)}
//                       >
//                          <i className="bi bi-pencil text-white"></i>
//                       </Button>
//                     </OverlayTrigger>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Delete</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-danger btn-sm square-btn"
//                         onClick={() => handleDelete(branch.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </OverlayTrigger>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="text-center">
//                   No Sites found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>)}
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredBranches.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredBranches.length)} of{" "}
//           {filteredBranches.length} entries
//         </div>
//         <div>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 «
//               </button>
//             </li>
//             {Array.from({ length: pageCount }, (_, i) => (
//               <li
//                 key={i + 1}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${
//                 currentPage === pageCount ? "disabled" : ""
//               }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 »
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Modal: uses native browser constraint validation for required fields */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         size="md"
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Form onSubmit={handleSubmit}>
//           <Modal.Header closeButton>
//             <Modal.Title>
//               {editId ? "Edit Site" : "Create Site"}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Row>
//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>
//                   Site Name <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={newBranch.name}
//                     onChange={(e) =>
//                       setNewBranch({ ...newBranch, name: e.target.value })
//                     }
//                     placeholder="Enter Site name"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={12}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>
//                   Site Address <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     value={newBranch.branch_address}
//                     onChange={(e) =>
//                       setNewBranch({
//                         ...newBranch,
//                         branch_address: e.target.value,
//                       })
//                     }
//                     placeholder="Enter full Site address"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>
//                     Contact Number <span className="text-danger">*</span>
//                   </Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text className="bg-light border-end-0">
//                       +91
//                     </InputGroup.Text>

//                     <Form.Control
//                       type="tel"
//                       value={newBranch.contact_number}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, ""); // digits only
//                         if (value.length <= 10) {
//                           setNewBranch({ ...newBranch, contact_number: value });
//                         }
//                       }}
//                       placeholder="Enter 10-digit phone number"
//                       required
//                       maxLength={10}
//                       pattern="\d{10}" // 👈 ensures exactly 10 digits
//                       title="Please enter a valid 10-digit phone number" // 👈 tooltip message on invalid
//                       className="border-start-0"
//                     />
//                   </InputGroup>
//                   <Form.Text className="text-muted">
//                     Enter 10-digit phone number
//                   </Form.Text>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Coordinates <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={newBranch.co_ordinates}
//                     onChange={(e) =>
//                       setNewBranch({
//                         ...newBranch,
//                         co_ordinates: e.target.value,
//                       })
//                     }
//                     placeholder="e.g., 20.2961,85.8245"
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             {/* submit button -> triggers native validation before handleSubmit runs */}
//             <Button variant="success" type="submit">
//               {editId ? "Update Site" : "Create Site"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default BranchList;

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import branchService from "../../../services/branchService";
import {
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaLocationArrow,
} from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    branch_address: "",
    contact_number: "",
    co_ordinates: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: handleSubmit -> uses native browser constraint validation.
  // The submit event will only fire when the form is valid, so we can safely proceed.
  const handleSubmit = async (e) => {
    e.preventDefault(); // runs only when browser validation passed
    try {
      const payload = {
        name: newBranch.name.trim(),
        branch_address: newBranch.branch_address.trim() || null,
        contact_number: newBranch.contact_number.trim() || null,
        co_ordinates: newBranch.co_ordinates.trim() || null,
      };

      if (editId) {
        await branchService.update(editId, payload);
        toast.success("Site successfully updated.", { icon: false });
      } else {
        await branchService.create(payload);
        toast.success("Site successfully created.", { icon: false });
      }

      resetForm();
      handleCloseModal();
      fetchBranches();
      {
        location.state?.from
          ? navigate("/employees/create", {
              state: { from: location.pathname },
            })
          : navigate(0);
      }
    } catch (error) {
      console.error("Error saving Site:", error);
      toast.error("Failed to save Site", { icon: false });
    }
  };

  const resetForm = () => {
    setNewBranch({
      name: "",
      branch_address: "",
      contact_number: "",
      co_ordinates: "",
    });
    setEditId(null);
  };

  const handleEdit = (branch) => {
    setEditId(branch.id);
    setNewBranch({
      name: branch.name || "",
      branch_address: branch.branch_address || "",
      contact_number: branch.contact_number || "",
      co_ordinates: branch.co_ordinates || "",
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action can not be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                try {
                  await branchService.remove(id);
                  fetchBranches();
                  onClose();
                  toast.success("Site deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting Site:", error);
                  toast.error("Failed to delete Site", { icon: false });
                }
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      resetForm();
    }, 400);
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.branch_address?.toLowerCase().includes(search.toLowerCase()) ||
      b.contact_number?.includes(search)
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentBranches = filteredBranches.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredBranches.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
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
        .branch-info-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          font-size: 0.85rem;
        }
        .branch-info-icon {
          margin-right: 8px;
          color: #6c757d;
          min-width: 16px;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Site</h5>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button variant="success" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search + Entries Per Page */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 ms-2 "
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >
            {/* <option value="5">5</option> */}
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <Form.Control
          type="text"
          className="form-control-sm"
          style={{ maxWidth: "250px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Site Name</th>
                <th>Contact Information</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBranches.length > 0 ? (
                currentBranches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <div className="fw-semibold">{branch.name}</div>
                      {branch.branch_address && (
                        <div className="branch-info-item">
                          <FaMapMarkerAlt
                            className="branch-info-icon"
                            size={12}
                          />
                          <small className="text-muted">
                            {branch.branch_address}
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      {branch.contact_number && (
                        <div className="branch-info-item">
                          <FaPhone className="branch-info-icon" size={12} />
                          <small>{branch.contact_number}</small>
                        </div>
                      )}
                      {branch.co_ordinates && (
                        <div className="branch-info-item">
                          <FaLocationArrow
                            className="branch-info-icon"
                            size={12}
                          />
                          <small className="text-muted">
                            {branch.co_ordinates}
                          </small>
                        </div>
                      )}
                      {!branch.contact_number && !branch.co_ordinates && (
                        <small className="text-muted">No contact info</small>
                      )}
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          className="btn btn-info btn-sm me-2 square-btn"
                          onClick={() => handleEdit(branch)}
                        >
                          <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          className="btn btn-danger btn-sm square-btn"
                          onClick={() => handleDelete(branch.id)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No Sites found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredBranches.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredBranches.length)} of{" "}
          {filteredBranches.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === pageCount ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                »
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal: uses native browser constraint validation for required fields */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="md"
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Site" : "Create Site"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Site Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newBranch.name}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, name: e.target.value })
                    }
                    placeholder="Enter Site name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Site Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newBranch.branch_address}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        branch_address: e.target.value,
                      })
                    }
                    placeholder="Enter full Site address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Contact Number <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      +91
                    </InputGroup.Text>

                    <Form.Control
                      type="tel"
                      value={newBranch.contact_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // digits only
                        if (value.length <= 10) {
                          setNewBranch({ ...newBranch, contact_number: value });
                        }
                      }}
                      placeholder="Enter 10-digit phone number"
                      required
                      maxLength={10}
                      pattern="\d{10}" // 👈 ensures exactly 10 digits
                      title="Please enter a valid 10-digit phone number" // 👈 tooltip message on invalid
                      className="border-start-0"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Enter 10-digit phone number
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Coordinates <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newBranch.co_ordinates}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        co_ordinates: e.target.value,
                      })
                    }
                    placeholder="e.g., 20.2961,85.8245"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            {/* submit button -> triggers native validation before handleSubmit runs */}
            <Button variant="success" type="submit">
              {editId ? "Update Site" : "Create Site"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchList;
