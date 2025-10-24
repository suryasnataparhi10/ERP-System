// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Form,
//   Button,
//   OverlayTrigger,
//   Tooltip,
//   Toast,
//   ToastContainer,
//   Row,
//   Col,
// } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../../components/BreadCrumb";
// import {
//   getBranches,
//   getDepartments,
//   getEmployees,
// } from "../../../services/hrmService";
// import attendanceService from "../../../services/attendanceService";
// import {
//   FaSearch,
//   FaSyncAlt,
//   FaFileExport,
//   FaEdit,
//   FaTrash,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// const AttendanceList = () => {
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [isClosing, setIsClosing] = useState(false);

//   const [filters, setFilters] = useState({
//     type: "Monthly",
//     month: new Date().toISOString().slice(0, 7),
//     date: new Date().toISOString().slice(0, 10),
//     branch_id: "",
//     department_id: "",
//     employee_type: "",
//     search: "",
//   });

//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [currentRecord, setCurrentRecord] = useState({
//     id: null,
//     employee_id: "",
//     date: "",
//     status: "Present",
//     clock_in_hours: "13",
//     clock_in_minutes: "41",
//     clock_in_seconds: "21",
//     clock_out_hours: "14",
//     clock_out_minutes: "44",
//     clock_out_seconds: "00",
//     late_hours: "00",
//     late_minutes: "00",
//     late_seconds: "00",
//     early_leaving_hours: "00",
//     early_leaving_minutes: "00",
//     early_leaving_seconds: "00",
//     overtime_hours: "00",
//     overtime_minutes: "00",
//     overtime_seconds: "00",
//     total_rest: 0,
//     reason: "",
//   });

//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     bg: "success",
//   });
//   const navigate = useNavigate();

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, bg: type });
//     setTimeout(() => setToast({ ...toast, show: false }), 3000);
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 700);
//   };

//   useEffect(() => {
//     loadInitialData();
//     loadAttendance();
//   }, []);

//   useEffect(() => {
//     if (filters.employee_type) {
//       loadAttendance();
//     }
//   }, [filters.employee_type]);

//   useEffect(() => {
//     applyFilters();
//   }, [filters, attendanceData]);

//   const loadInitialData = async () => {
//     try {
//       const [branchesData, departmentsData, employeesData] = await Promise.all([
//         getBranches(),
//         getDepartments(),
//         getEmployees(),
//       ]);

//       setBranches(branchesData);

//       let departmentsList = [];
//       if (Array.isArray(departmentsData)) {
//         departmentsList = departmentsData;
//       } else if (departmentsData && Array.isArray(departmentsData.data)) {
//         departmentsList = departmentsData.data;
//       } else if (
//         departmentsData &&
//         departmentsData.success &&
//         Array.isArray(departmentsData.data)
//       ) {
//         departmentsList = departmentsData.data;
//       }

//       setDepartments(departmentsList);
//       setEmployees(employeesData);
//     } catch (error) {
//       console.error("Error loading initial data:", error);
//     }
//   };

//   // const loadAttendance = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const response = await attendanceService.getAll();
//   //     if (response.data.success) {
//   //       setAttendanceData(response.data.data);
//   //     } else {
//   //       console.error("Failed to load attendance:", response.data.message);
//   //       setAttendanceData([]);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading attendance:", error);
//   //     setAttendanceData([]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const loadAttendance = async () => {
//     setLoading(true);
//     try {
//       // Pass employee_type as query parameter to backend
//       const params = {};
//       if (filters.employee_type) {
//         params.employee_type = filters.employee_type;
//       }

//       const response = await attendanceService.getAll(params);
//       if (response.data.success) {
//         setAttendanceData(response.data.data);
//       } else {
//         console.error("Failed to load attendance:", response.data.message);
//         setAttendanceData([]);
//       }
//     } catch (error) {
//       console.error("Error loading attendance:", error);
//       setAttendanceData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get employee type from employee data
//   const getEmployeeType = (employeeId) => {
//     const employee = employees.find((emp) => emp.id == employeeId);
//     return employee?.employee_type || "Permanent";
//   };

//   // Get filtered departments based on selected branch
//   const getFilteredDepartments = () => {
//     if (!filters.branch_id) return departments;

//     const branchEmployees = employees.filter(
//       (emp) => emp.branch_id == filters.branch_id
//     );

//     const departmentIds = [
//       ...new Set(branchEmployees.map((emp) => emp.department_id)),
//     ];

//     return departments.filter(
//       (dept) =>
//         departmentIds.includes(dept.id) || dept.branch_id == filters.branch_id
//     );
//   };

//   const applyFilters = () => {
//     let filtered = [...attendanceData];

//     if (filters.branch_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.branch_id == filters.branch_id
//       );
//     }

//     if (filters.department_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.department_id == filters.department_id
//       );
//     }

//     // if (filters.employee_type) {
//     //   filtered = filtered.filter((item) => {
//     //     const employeeType = getEmployeeType(item.employee_id);
//     //     return employeeType === filters.employee_type;
//     //   });
//     // }

//     if (filters.type === "Monthly" && filters.month) {
//       filtered = filtered.filter(
//         (item) => item.date.slice(0, 7) === filters.month
//       );
//     } else if (filters.type === "Daily" && filters.date) {
//       filtered = filtered.filter((item) => item.date === filters.date);
//     }

//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(
//         (item) =>
//           item.employee?.name?.toLowerCase().includes(searchLower) ||
//           item.employee?.employee_id?.toLowerCase().includes(searchLower) ||
//           item.status?.toLowerCase().includes(searchLower) ||
//           item.reason?.toLowerCase().includes(searchLower) ||
//           item.shift?.title?.toLowerCase().includes(searchLower)
//       );
//     }

//     setFilteredData(filtered);
//   };

//   const getBranchName = (branchId) => {
//     if (!branchId) return "No Branch";
//     const branch = branches.find((b) => b.id == branchId);
//     return branch ? branch.name : `Branch ${branchId}`;
//   };

//   const getDepartmentName = (departmentId) => {
//     if (!departmentId) return "No Department";
//     const department = departments.find((d) => d.id == departmentId);
//     return department ? department.name : `Department ${departmentId}`;
//   };

//   const getShiftName = (shift) => {
//     if (!shift) return "No Shift";
//     return shift.title || `Shift ${shift.id}`;
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;

//     setFilters((prev) => {
//       if (name === "branch_id") {
//         return {
//           ...prev,
//           [name]: value,
//           department_id: "",
//         };
//       }

//       return {
//         ...prev,
//         [name]: value,
//       };
//     });
//   };

//   const handleTypeChange = (type) => {
//     setFilters((prev) => ({
//       ...prev,
//       type,
//     }));
//   };

//   // const handleRefresh = () => {
//   //   loadAttendance();
//   //   setFilters({
//   //     type: "Monthly",
//   //     month: new Date().toISOString().slice(0, 7),
//   //     date: new Date().toISOString().slice(0, 10),
//   //     branch_id: "",
//   //     department_id: "",
//   //     employee_type: "",
//   //     search: "",
//   //   });
//   // };

//   // const handleSearch = () => {
//   //   applyFilters();
//   // };

//   const handleRefresh = () => {
//     loadAttendance();
//     setFilters({
//       type: "Monthly",
//       month: new Date().toISOString().slice(0, 7),
//       date: new Date().toISOString().slice(0, 10),
//       branch_id: "",
//       department_id: "",
//       employee_type: "",
//       search: "",
//     });
//   };

//   const handleSearch = () => {
//     // Instead of just applying local filters, reload data from server with all filters
//     loadAttendance();
//   };

//   // Parse time string to hours, minutes, seconds
//   const parseTimeString = (timeString) => {
//     if (!timeString || timeString === "00:00:00") {
//       return { hours: "00", minutes: "00", seconds: "00" };
//     }

//     // Remove date part if present
//     const timeOnly = timeString.includes(" ")
//       ? timeString.split(" ")[1]
//       : timeString;
//     const [hours = "00", minutes = "00", seconds = "00"] = timeOnly.split(":");

//     return {
//       hours: hours.padStart(2, "0"),
//       minutes: minutes.padStart(2, "0"),
//       seconds: seconds.padStart(2, "0"),
//     };
//   };

//   const handleEdit = (record) => {
//     console.log("Editing record:", record);

//     const clockInTime = parseTimeString(record.clock_in);
//     const clockOutTime = parseTimeString(record.clock_out);
//     const lateTime = parseTimeString(record.late);
//     const earlyLeavingTime = parseTimeString(record.early_leaving);
//     const overtimeTime = parseTimeString(record.overtime);

//     // Get employee_id from the record
//     const employeeId = record.employee_id || record.employee?.id;

//     console.log("Extracted employee ID:", employeeId);

//     setCurrentRecord({
//       id: record.id,
//       employee_id: employeeId,
//       date: record.date,
//       status: record.status || "Present",
//       clock_in_hours: clockInTime.hours,
//       clock_in_minutes: clockInTime.minutes,
//       clock_in_seconds: clockInTime.seconds,
//       clock_out_hours: clockOutTime.hours,
//       clock_out_minutes: clockOutTime.minutes,
//       clock_out_seconds: clockOutTime.seconds,
//       late_hours: lateTime.hours,
//       late_minutes: lateTime.minutes,
//       late_seconds: lateTime.seconds,
//       early_leaving_hours: earlyLeavingTime.hours,
//       early_leaving_minutes: earlyLeavingTime.minutes,
//       early_leaving_seconds: earlyLeavingTime.seconds,
//       overtime_hours: overtimeTime.hours,
//       overtime_minutes: overtimeTime.minutes,
//       overtime_seconds: overtimeTime.seconds,
//       total_rest: record.total_rest || 0,
//       reason: record.reason || "",
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
//                   await attendanceService.delete(id);
//                   onClose();
//                   showToast(
//                     "Attendance record deleted successfully!",
//                     "success"
//                   );
//                   loadAttendance();
//                 } catch (error) {
//                   console.error("Delete failed:", error);
//                   onClose();
//                   showToast("Failed to delete attendance record!", "danger");
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

//   const handleModalChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentRecord((prev) => ({ ...prev, [name]: value }));
//   };

//   // FIXED: handleModalSubmit with proper early-leaving and overtime updates
//   const handleModalSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log("=== Starting Update ===");
//       console.log("Current Record:", currentRecord);

//       // Check if employee_id exists
//       if (!currentRecord.employee_id) {
//         throw new Error("Employee ID is missing from the record");
//       }

//       // Combine time components into HH:MM:SS format
//       const clock_in = `${currentRecord.clock_in_hours}:${currentRecord.clock_in_minutes}:${currentRecord.clock_in_seconds}`;
//       const clock_out = `${currentRecord.clock_out_hours}:${currentRecord.clock_out_minutes}:${currentRecord.clock_out_seconds}`;
//       const late = `${currentRecord.late_hours}:${currentRecord.late_minutes}:${currentRecord.late_seconds}`;
//       const early_leaving = `${currentRecord.early_leaving_hours}:${currentRecord.early_leaving_minutes}:${currentRecord.early_leaving_seconds}`;
//       const overtime = `${currentRecord.overtime_hours}:${currentRecord.overtime_minutes}:${currentRecord.overtime_seconds}`;

//       console.log("Updating attendance for record:", currentRecord.id);

//       // Find the employee to get employee_code (employee_id)
//       const employee = employees.find(
//         (emp) => emp.id == currentRecord.employee_id
//       );

//       console.log("Found employee:", employee);

//       if (!employee) {
//         throw new Error(
//           `Employee not found. Looking for ID: ${currentRecord.employee_id}`
//         );
//       }

//       // Use the employee_code (employee.employee_id) for early-leaving and overtime endpoints
//       const employeeCode = employee.employee_id;

//       let successCount = 0;

//       // Update early leaving if changed - FIXED: Use proper endpoint
//       if (early_leaving && early_leaving !== "00:00:00") {
//         try {
//           console.log(
//             "Updating early leaving for employee code:",
//             employeeCode
//           );

//           // FIXED: Use the correct endpoint format as per your backend
//           await attendanceService.updateEarlyLeaving(employeeCode, {
//             date: currentRecord.date,
//             clock_out: `${currentRecord.date} ${clock_out}`, // Required field for early leaving
//             early_leaving: early_leaving,
//             reason: currentRecord.reason,
//           });
//           console.log("Early leaving updated successfully");
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update early leaving:", error);
//           // Continue with other updates even if this fails
//         }
//       } else {
//         successCount++;
//       }

//       // Update overtime if changed
//       if (overtime && overtime !== "00:00:00") {
//         try {
//           console.log("Updating overtime for employee code:", employeeCode);
//           await attendanceService.updateOvertime(employeeCode, {
//             date: currentRecord.date,
//             overtime: overtime,
//             reason: currentRecord.reason,
//           });
//           console.log("Overtime updated successfully");
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update overtime:", error);
//           // Continue with other updates even if this fails
//         }
//       } else {
//         successCount++;
//       }

//       // Update main attendance record
//       try {
//         const mainUpdateData = {
//           date: currentRecord.date,
//           status: currentRecord.status,
//           clock_in:
//             clock_in !== "00:00:00"
//               ? `${currentRecord.date} ${clock_in}`
//               : null,
//           clock_out:
//             clock_out !== "00:00:00"
//               ? `${currentRecord.date} ${clock_out}`
//               : null,
//           late: late,
//           total_rest: parseInt(currentRecord.total_rest) || 0,
//           reason: currentRecord.reason || null,
//         };

//         console.log(
//           "Updating main attendance for record ID:",
//           currentRecord.id
//         );
//         console.log("Main update data:", mainUpdateData);

//         await attendanceService.update(currentRecord.id, mainUpdateData);
//         console.log("Main attendance updated successfully");
//         successCount++;
//       } catch (error) {
//         console.error("Failed to update main attendance:", error);
//         if (error.response?.status === 404) {
//           console.warn(
//             "Attendance record not found, it might have been deleted"
//           );
//           // Continue with success since early-leaving/overtime might have updated
//         } else {
//           throw error; // Re-throw other errors
//         }
//       }

//       // Success - close modal and show toast
//       if (successCount > 0) {
//         setIsClosing(true);
//         setTimeout(() => {
//           setShowModal(false);
//           setIsClosing(false);
//           showToast("Attendance updated successfully!", "success");
//           loadAttendance();
//         }, 700);
//       } else {
//         throw new Error("All update operations failed");
//       }
//     } catch (error) {
//       console.error("Update failed:", error);

//       let errorMessage = "Failed to update attendance!";
//       if (error.response?.status === 404) {
//         errorMessage =
//           "Attendance record not found. Please refresh and try again.";
//       } else if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       showToast(errorMessage, "danger");
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString || timeString === "00:00:00") return "-";
//     if (timeString.includes(" ")) {
//       return timeString.split(" ")[1];
//     }
//     return timeString;
//   };

//   const formatShiftTime = (timeString) => {
//     if (!timeString) return "-";
//     // Convert "HH:MM:SS" to "HH:MM" format
//     if (timeString.includes(":")) {
//       const parts = timeString.split(":");
//       return `${parts[0]}:${parts[1]}`;
//     }
//     return timeString;
//   };

//   const getEmployeeDetails = (attendanceRecord) => {
//     if (attendanceRecord.employee) {
//       const employee = attendanceRecord.employee;
//       const employeeType = getEmployeeType(employee.id);

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     const employee = employees.find(
//       (emp) => emp.id === attendanceRecord.employee_id
//     );
//     if (employee) {
//       const employeeType = employee.employee_type || "Permanent";

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     return {
//       name: "Unknown",
//       employee_id: "N/A",
//       employee_type: "Permanent",
//       branch_name: "Unknown Branch",
//       department_name: "Unknown Department",
//     };
//   };

//   const getEmployeeName = (employeeId) => {
//     const attendanceRecord = attendanceData.find(
//       (item) => item.employee_id === employeeId
//     );
//     if (attendanceRecord?.employee?.name) {
//       return attendanceRecord.employee.name;
//     }
//     const employee = employees.find((emp) => emp.id === employeeId);
//     return employee ? employee.name : "Unknown";
//   };

//   // Generate options for time selects
//   const generateTimeOptions = (type) => {
//     const options = [];
//     const max = type === "hours" ? 23 : 59;

//     for (let i = 0; i <= max; i++) {
//       const value = i.toString().padStart(2, "0");
//       options.push(
//         <option key={value} value={value}>
//           {value}
//         </option>
//       );
//     }
//     return options;
//   };

//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentData = filteredData.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );

//   const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="container mt-4">
//       <style>{`
//         .entries-select:focus {
//           border-color: #6FD943 !important;
//           box-shadow: 0 0 0px 4px #70d94360 !important;
//         }

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

//         .btn-pink {
//           background-color: #f5365c;
//           color: #fff;
//           border: none;
//         }
//         .btn-pink:hover {
//           background-color: #e43156;
//           color: #fff;
//         }
//         .btn-pink:active,
//         .btn-pink:focus {
//           background-color: #f5365c !important;
//           box-shadow: none !important;
//         }

//         .btn-brown {
//           background-color: #563d7c;
//           color: #fff;
//           border: none;
//         }
//         .btn-brown:hover {
//           background-color: #4a366c;
//           color: #fff;
//         }

//         .square-btn {
//           width: 38px;
//           height: 38px;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0;
//           font-size: 16px;
//           border-radius: 6px;
//         }
//         .table th {
//           font-weight: 600;
//           background-color: #f8f9fa;
//         }

//         .employee-type-badge {
//           font-size: 0.75em;
//           padding: 0.25em 0.5em;
//         }

//         .time-select-group {
//           display: flex;
//           gap: 5px;
//           align-items: center;
//         }
//         .time-select-group select {
//           flex: 1;
//         }
//         .time-separator {
//           font-weight: bold;
//           color: #666;
//         }
//         .reason-cell {
//           max-width: 200px;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         .shift-info {
//           font-size: 0.8em;
//           color: #666;
//         }
//       `}</style>

//       <h4 className="fw-semibold">Manage Attendance List</h4>
//       <BreadCrumb pathname={location.pathname} onNavigate={navigate} />

//       {/* Filters Section */}
//       <div className="bg-white rounded shadow-sm p-4 mb-4">
//         <div className="row align-items-end g-3">
//           <div className="col-md-2">
//             <label className="form-label fw-bold d-block mb-2">Type</label>
//             <div className="d-flex rounded-pill bg-light p-1 gap-1">
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${filters.type === "Monthly"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                   }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Monthly")}
//               >
//                 Monthly
//               </div>
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${filters.type === "Daily"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                   }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Daily")}
//               >
//                 Daily
//               </div>
//             </div>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">
//               {filters.type === "Monthly" ? "Month" : "Date"}
//             </label>
//             {filters.type === "Monthly" ? (
//               <input
//                 type="month"
//                 className="form-control"
//                 name="month"
//                 value={filters.month}
//                 onChange={handleFilterChange}
//               />
//             ) : (
//               <input
//                 type="date"
//                 className="form-control"
//                 name="date"
//                 value={filters.date || ""}
//                 onChange={handleFilterChange}
//               />
//             )}
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Branch</label>
//             <select
//               className="form-select"
//               name="branch_id"
//               value={filters.branch_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Branch</option>
//               {branches.map((branch) => (
//                 <option key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Department</label>
//             <select
//               className="form-select"
//               name="department_id"
//               value={filters.department_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Department</option>
//               {getFilteredDepartments().map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Employee Type</label>
//             <select
//               className="form-select"
//               name="employee_type"
//               value={filters.employee_type}
//               onChange={handleFilterChange}
//             >
//               <option value="">All Types</option>
//               <option value="Permanent">Permanent</option>
//               <option value="Contractual">Contractual</option>
//             </select>
//           </div>

//           <div className="col-md-2 d-flex gap-2 justify-content-end">
//             <OverlayTrigger placement="top" overlay={<Tooltip>Apply</Tooltip>}>
//               <button
//                 className="btn btn-success square-btn"
//                 onClick={handleSearch}
//               >
//                 <FaSearch />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Reset</Tooltip>}>
//               <button
//                 className="btn btn-pink square-btn"
//                 onClick={handleRefresh}
//               >
//                 <FaSyncAlt />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Import</Tooltip>}>
//               <button className="btn btn-brown square-btn">
//                 <FaFileExport />
//               </button>
//             </OverlayTrigger>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Combined Entries + Search + Table + Pagination */}
//       <div className="bg-white p-3 mb-4 rounded shadow-sm mt-3">
//         {/* Entries & Search */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
//           <div className="d-flex align-items-center gap-2">
//             <Form.Select
//               className=""
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(parseInt(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               {[10, 25, 50, 100].map((num) => (
//                 <option key={num} value={num}>
//                   {num}
//                 </option>
//               ))}
//             </Form.Select>

//           </div>

//           <div className="d-flex align-items-center">
//             <input
//               type="text"
//               value={filters.search}
//               onChange={handleFilterChange}
//               name="search"
//               placeholder="Search..."
//               className="form-control form-control-sm"
//               style={{ maxWidth: "200px" }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover table-striped align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Employee</th>
//                 <th>Date</th>
//                 <th>Status</th>
//                 <th>Shift</th>
//                 <th>Clock In</th>
//                 {/* <th>Clock Out</th> */}
//                 <th>Early Leaving</th>
//                 <th>Overtime</th>
//                 <th>Reason</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="10" className="text-center py-3 text-success">
//                     <div
//                       className="spinner-border spinner-border-sm me-2 "
//                       role="status"
//                     ></div>
//                     Loading attendance data...
//                   </td>
//                 </tr>
//               ) : currentData.length === 0 ? (
//                 <tr>
//                   <td colSpan="10" className="text-center py-3">
//                     No records found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((item) => {
//                   const employee = getEmployeeDetails(item);
//                   return (
//                     <tr key={item.id}>
//                       <td>
//                         <div>
//                           <div className="fw-semibold">{employee.name}</div>
//                           <span
//                             className={`badge employee-type-badge ${employee.employee_type === "Permanent"
//                                 ? "bg-primary"
//                                 : "bg-warning text-dark"
//                               }`}
//                           >
//                             {employee.employee_type}
//                           </span>
//                           <br />
//                         </div>
//                       </td>
//                       <td>{new Date(item.date).toLocaleDateString()}</td>
//                       <td>
//                         <span
//                           className={`badge ${item.status === "Present"
//                               ? "bg-success"
//                               : item.status === "Absent"
//                                 ? "bg-danger"
//                                 : "bg-warning"
//                             }`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                       <td>
//                         {item.shift ? (
//                           <div className="shift-info">
//                             <div className="fw-semibold">
//                               {item.shift.title}
//                             </div>
//                             <small>
//                               {formatShiftTime(item.shift.start_time)} -{" "}
//                               {formatShiftTime(item.shift.end_time)}
//                             </small>
//                           </div>
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>{formatTime(item.clock_in)}</td>
//                       {/* <td>{formatTime(item.clock_out)}</td> */}
//                       <td>{formatTime(item.early_leaving)}</td>
//                       <td>{formatTime(item.overtime)}</td>
//                       <td style={{
//                         width: "400px",       // fixed width
//                         whiteSpace: "normal", // allow wrapping
//                         wordWrap: "break-word",
//                         // break long words
//                       }} className="reason-cell" title={item.reason}>
//                         {item.reason || "-"}
//                       </td>
//                       <td>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-info btn-sm me-2 square-btn"
//                             onClick={() => handleEdit(item)}
//                           >
//                             <FaEdit />
//                           </button>
//                         </OverlayTrigger>

//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-danger btn-sm square-btn"
//                             onClick={() => handleDelete(item.id)}
//                           >
//                             <FaTrash />
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 gap-2">
//           <div className="small text-muted">
//             Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
//             {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>

//           <div>
//             <ul className="pagination pagination-sm mb-0">
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {Array.from({ length: totalPages }, (_, i) => (
//                 <li
//                   key={i + 1}
//                   className={`page-item ${currentPage === i + 1 ? "active" : ""
//                     }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(i + 1)}
//                   >
//                     {i + 1}
//                   </button>
//                 </li>
//               ))}

//               <li
//                 className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                   }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   disabled={currentPage === totalPages}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       <ToastContainer
//         position="top-end"
//         className="p-3"
//         style={{ zIndex: 9999 }}
//       >
//         <Toast
//           onClose={() => setToast({ ...toast, show: false })}
//           show={toast.show}
//           delay={3000}
//           autohide
//           bg={toast.bg}
//         >
//           <Toast.Body className="text-white fw-semibold">
//             {toast.message}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>

//       {/* Edit Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         size="md"
//       >
//         <Form onSubmit={handleModalSubmit}>
//           <Modal.Header closeButton>
//             <Modal.Title>Edit Attendance</Modal.Title>
//           </Modal.Header>

//           <Modal.Body>
//             {/* Employee */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Employee<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 value={getEmployeeName(currentRecord.employee_id)}
//                 readOnly
//               />
//             </Form.Group>

//             {/* Date */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Date<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={currentRecord.date || ""}
//                 onChange={handleModalChange}
//                 required
//               />
//             </Form.Group>

//             {/* Status */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Status<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="status"
//                 value={currentRecord.status || ""}
//                 onChange={handleModalChange}
//                 required
//               >
//                 <option value="Present">Present</option>
//                 <option value="Absent">Absent</option>
//                 <option value="Late">Late</option>
//                 <option value="Half Day">Half Day</option>
//                 <option value="On Leave">On Leave</option>
//               </Form.Select>
//             </Form.Group>

//             {/* Clock In */}
//             {/* <Form.Group className="mb-3">
//               <Form.Label>Clock In</Form.Label>
//               <div className="time-select-group">
//                 <Form.Select
//                   name="clock_in_hours"
//                   value={currentRecord.clock_in_hours}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("hours")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="clock_in_minutes"
//                   value={currentRecord.clock_in_minutes}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("minutes")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="clock_in_seconds"
//                   value={currentRecord.clock_in_seconds}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("seconds")}
//                 </Form.Select>
//               </div>
//             </Form.Group> */}

//             <Form.Group className="mb-3">
//               <Form.Label>Clock In</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_hours"
//                     value={currentRecord.clock_in_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_minutes"
//                     value={currentRecord.clock_in_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>

//                   <Form.Select
//                     name="clock_in_seconds"
//                     value={currentRecord.clock_in_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             {/* Clock Out */}
//             {/* <Form.Group className="mb-3">
//               <Form.Label>Clock Out</Form.Label>
//               <div className="time-select-group">
//                 <Form.Select
//                   name="clock_out_hours"
//                   value={currentRecord.clock_out_hours}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("hours")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="clock_out_minutes"
//                   value={currentRecord.clock_out_minutes}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("minutes")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="clock_out_seconds"
//                   value={currentRecord.clock_out_seconds}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("seconds")}
//                 </Form.Select>
//               </div>
//             </Form.Group> */}

//             <Form.Group className="mb-3">
//               <Form.Label>Clock Out</Form.Label>
//               <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_hours"
//                     value={currentRecord.clock_out_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_minutes"
//                     value={currentRecord.clock_out_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_seconds"
//                     value={currentRecord.clock_out_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             {/* Early Leaving */}
//             {/* <Form.Group className="mb-3">
//               <Form.Label>Early Leaving</Form.Label>
//               <div className="time-select-group">
//                 <Form.Select
//                   name="early_leaving_hours"
//                   value={currentRecord.early_leaving_hours}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("hours")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="early_leaving_minutes"
//                   value={currentRecord.early_leaving_minutes}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("minutes")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="early_leaving_seconds"
//                   value={currentRecord.early_leaving_seconds}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("seconds")}
//                 </Form.Select>
//               </div>
//             </Form.Group> */}

//             <Form.Group className="mb-3">
//               <Form.Label>Early Leaving</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_hours"
//                     value={currentRecord.early_leaving_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_minutes"
//                     value={currentRecord.early_leaving_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_seconds"
//                     value={currentRecord.early_leaving_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             {/* Overtime */}
//             {/* <Form.Group className="mb-3">
//               <Form.Label>Overtime</Form.Label>
//               <div className="time-select-group">
//                 <Form.Select
//                   name="overtime_hours"
//                   value={currentRecord.overtime_hours}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("hours")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="overtime_minutes"
//                   value={currentRecord.overtime_minutes}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("minutes")}
//                 </Form.Select>
//                 <span className="time-separator">:</span>
//                 <Form.Select
//                   name="overtime_seconds"
//                   value={currentRecord.overtime_seconds}
//                   onChange={handleModalChange}
//                 >
//                   {generateTimeOptions("seconds")}
//                 </Form.Select>
//               </div>
//             </Form.Group> */}

//             <Form.Group className="mb-3">
//               <Form.Label>Overtime</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_hours"
//                     value={currentRecord.overtime_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_minutes"
//                     value={currentRecord.overtime_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_seconds"
//                     value={currentRecord.overtime_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             {/* Reason Field */}
//             {/*
//             <Form.Group className="mb-3">
//               <Form.Label className="required-field">
//                 Reason<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="reason"
//                 value={currentRecord.reason || ""}
//                 onChange={handleModalChange}
//                 placeholder="Enter reason for attendance modification..."
//                 required
//               />
//               <Form.Control.Feedback type="invalid">
//                 Please provide a reason for the attendance modification.
//               </Form.Control.Feedback>
//             </Form.Group> */}

//             {/* <Form.Group className="mb-3">
//               <Form.Label>Reason</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="reason"
//                 value={currentRecord.reason || ""}
//                 onChange={handleModalChange}
//                 placeholder="Enter reason for attendance modification..."
//               />
//             </Form.Group> */}
//             <Form.Group className="mb-3">
//               <Form.Label className="required-field">
//                 Reason<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="reason"
//                 value={currentRecord.reason || ""}
//                 onChange={handleModalChange}
//                 placeholder="Enter reason for attendance modification..."
//                 required
//               />
//               <Form.Control.Feedback type="invalid">
//                 Please provide a reason for the attendance modification.
//               </Form.Control.Feedback>
//             </Form.Group>
//           </Modal.Body>

//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="success">
//               Update
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AttendanceList;
// ---------------------------

// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Form,
//   Button,
//   OverlayTrigger,
//   Tooltip,
//   Toast,
//   ToastContainer,
//   Row,
//   Col,
//   Card,
//   Badge,
// } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../../components/BreadCrumb";
// import {
//   getBranches,
//   getDepartments,
//   getEmployees,
// } from "../../../services/hrmService";
// import attendanceService from "../../../services/attendanceService";
// import {
//   FaSearch,
//   FaSyncAlt,
//   FaFileExport,
//   FaEdit,
//   FaTrash,
//   FaUser,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const AttendanceList = () => {
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [isClosing, setIsClosing] = useState(false);
//   const [showEmployeeAttendanceModal, setShowEmployeeAttendanceModal] =
//     useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeAttendance, setEmployeeAttendance] = useState([]);
//   const [employeeAttendanceLoading, setEmployeeAttendanceLoading] =
//     useState(false);

//   const [filters, setFilters] = useState({
//     type: "Monthly",
//     month: new Date().toISOString().slice(0, 7),
//     date: new Date().toISOString().slice(0, 10),
//     branch_id: "",
//     department_id: "",
//     employee_type: "",
//     search: "",
//   });

//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [currentRecord, setCurrentRecord] = useState({
//     id: null,
//     employee_id: "",
//     date: "",
//     status: "Present",
//     clock_in_hours: "13",
//     clock_in_minutes: "41",
//     clock_in_seconds: "21",
//     clock_out_hours: "14",
//     clock_out_minutes: "44",
//     clock_out_seconds: "00",
//     late_hours: "00",
//     late_minutes: "00",
//     late_seconds: "00",
//     early_leaving_hours: "00",
//     early_leaving_minutes: "00",
//     early_leaving_seconds: "00",
//     overtime_hours: "00",
//     overtime_minutes: "00",
//     overtime_seconds: "00",
//     total_rest: 0,
//     reason: "",
//   });

//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     bg: "success",
//   });
//   const navigate = useNavigate();

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, bg: type });
//     setTimeout(() => setToast({ ...toast, show: false }), 3000);
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 700);
//   };

//   const handleCloseEmployeeAttendanceModal = () => {
//     setShowEmployeeAttendanceModal(false);
//     setSelectedEmployee(null);
//     setEmployeeAttendance([]);
//   };

//   useEffect(() => {
//     loadInitialData();
//     loadAttendance();
//   }, []);

//   useEffect(() => {
//     if (filters.employee_type) {
//       loadAttendance();
//     }
//   }, [filters.employee_type]);

//   useEffect(() => {
//     applyFilters();
//   }, [filters, attendanceData]);

//   const loadInitialData = async () => {
//     try {
//       const [branchesData, departmentsData, employeesData] = await Promise.all([
//         getBranches(),
//         getDepartments(),
//         getEmployees(),
//       ]);

//       setBranches(branchesData);

//       let departmentsList = [];
//       if (Array.isArray(departmentsData)) {
//         departmentsList = departmentsData;
//       } else if (departmentsData && Array.isArray(departmentsData.data)) {
//         departmentsList = departmentsData.data;
//       } else if (
//         departmentsData &&
//         departmentsData.success &&
//         Array.isArray(departmentsData.data)
//       ) {
//         departmentsList = departmentsData.data;
//       }

//       setDepartments(departmentsList);
//       setEmployees(employeesData);
//     } catch (error) {
//       console.error("Error loading initial data:", error);
//     }
//   };

//   const loadAttendance = async () => {
//     setLoading(true);
//     try {
//       // Pass employee_type as query parameter to backend
//       const params = {};
//       if (filters.employee_type) {
//         params.employee_type = filters.employee_type;
//       }

//       const response = await attendanceService.getAll(params);
//       if (response.data.success) {
//         setAttendanceData(response.data.data);
//       } else {
//         console.error("Failed to load attendance:", response.data.message);
//         setAttendanceData([]);
//       }
//     } catch (error) {
//       console.error("Error loading attendance:", error);
//       setAttendanceData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // FIXED: Load individual employee attendance using direct API call
//   // const loadEmployeeAttendance = async (
//   //   employeeId,
//   //   employeeCode,
//   //   month = null
//   // ) => {
//   //   setEmployeeAttendanceLoading(true);
//   //   try {
//   //     // Use the employee summary endpoint directly
//   //     let url = `/attendance-summary/${employeeCode}`;
//   //     const params = {};

//   //     if (month) {
//   //       const [yearPart, monthPart] = month.split("-");
//   //       params.month = parseInt(monthPart);
//   //       params.year = parseInt(yearPart);
//   //     } else {
//   //       // Default to current month
//   //       const now = new Date();
//   //       params.month = now.getMonth() + 1;
//   //       params.year = now.getFullYear();
//   //     }

//   //     console.log("Loading employee attendance:", { employeeCode, params });

//   //     // Use the existing apiClient from attendanceService or make direct call
//   //     const response = await attendanceService.getAll({
//   //       ...params,
//   //       employee_id: employeeCode,
//   //       summary: true, // Add a flag to indicate this is a summary request
//   //     });

//   //     // Alternative: If the above doesn't work, you might need to create a new method in attendanceService
//   //     // For now, let's try to use the existing getAll with different parameters

//   //     if (response.data && response.data.success) {
//   //       setEmployeeAttendance(response.data.data);
//   //       console.log(
//   //         "Employee attendance loaded:",
//   //         response.data.data.length,
//   //         "records"
//   //       );
//   //     } else {
//   //       console.error(
//   //         "Failed to load employee attendance:",
//   //         response.data?.message
//   //       );
//   //       setEmployeeAttendance([]);
//   //       showToast("No attendance records found for this employee", "warning");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error loading employee attendance:", error);
//   //     setEmployeeAttendance([]);
//   //     showToast("Error loading employee attendance data", "danger");
//   //   } finally {
//   //     setEmployeeAttendanceLoading(false);
//   //   }
//   // };

//   // FIXED: Load individual employee attendance using the correct endpoint
//   const loadEmployeeAttendance = async (
//     employeeId,
//     employeeCode,
//     month = null
//   ) => {
//     setEmployeeAttendanceLoading(true);
//     try {
//       const params = {};

//       if (month) {
//         const [yearPart, monthPart] = month.split("-");
//         params.month = parseInt(monthPart);
//         params.year = parseInt(yearPart);
//       } else {
//         // Default to current month
//         const now = new Date();
//         params.month = now.getMonth() + 1;
//         params.year = now.getFullYear();
//       }

//       console.log("Loading employee attendance:", {
//         employeeCode,
//         params,
//         endpoint: `/attendance/attendance-summary/${employeeCode}`,
//       });

//       // Use the correct endpoint for employee attendance summary
//       const response = await attendanceService.getEmployeeAttendanceSummary(
//         employeeCode,
//         params
//       );

//       if (response.data && response.data.success) {
//         setEmployeeAttendance(response.data.data);
//         console.log(
//           "Employee attendance loaded:",
//           response.data.data.length,
//           "records"
//         );
//       } else {
//         console.error(
//           "Failed to load employee attendance:",
//           response.data?.message
//         );
//         setEmployeeAttendance([]);
//         showToast("No attendance records found for this employee", "warning");
//       }
//     } catch (error) {
//       console.error("Error loading employee attendance:", error);
//       setEmployeeAttendance([]);
//       showToast("Error loading employee attendance data", "danger");
//     } finally {
//       setEmployeeAttendanceLoading(false);
//     }
//   };

//   // FIXED: Handle employee click to show attendance popup
//   const handleEmployeeClick = async (
//     employeeId,
//     employeeCode,
//     employeeName
//   ) => {
//     console.log("Employee clicked:", {
//       employeeId,
//       employeeCode,
//       employeeName,
//     });

//     setSelectedEmployee({
//       id: employeeId,
//       code: employeeCode,
//       name: employeeName,
//     });

//     // Use current filter month or default to current month
//     const selectedMonth =
//       filters.type === "Monthly"
//         ? filters.month
//         : new Date().toISOString().slice(0, 7);

//     console.log("Loading attendance for month:", selectedMonth);

//     await loadEmployeeAttendance(employeeId, employeeCode, selectedMonth);
//     setShowEmployeeAttendanceModal(true);
//   };

//   // Get employee type from employee data
//   const getEmployeeType = (employeeId) => {
//     const employee = employees.find((emp) => emp.id == employeeId);
//     return employee?.employee_type || "Permanent";
//   };

//   // Get filtered departments based on selected branch
//   const getFilteredDepartments = () => {
//     if (!filters.branch_id) return departments;

//     const branchEmployees = employees.filter(
//       (emp) => emp.branch_id == filters.branch_id
//     );

//     const departmentIds = [
//       ...new Set(branchEmployees.map((emp) => emp.department_id)),
//     ];

//     return departments.filter(
//       (dept) =>
//         departmentIds.includes(dept.id) || dept.branch_id == filters.branch_id
//     );
//   };

//   const applyFilters = () => {
//     let filtered = [...attendanceData];

//     if (filters.branch_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.branch_id == filters.branch_id
//       );
//     }

//     if (filters.department_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.department_id == filters.department_id
//       );
//     }

//     if (filters.type === "Monthly" && filters.month) {
//       filtered = filtered.filter(
//         (item) => item.date.slice(0, 7) === filters.month
//       );
//     } else if (filters.type === "Daily" && filters.date) {
//       filtered = filtered.filter((item) => item.date === filters.date);
//     }

//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(
//         (item) =>
//           item.employee?.name?.toLowerCase().includes(searchLower) ||
//           item.employee?.employee_id?.toLowerCase().includes(searchLower) ||
//           item.status?.toLowerCase().includes(searchLower) ||
//           item.reason?.toLowerCase().includes(searchLower) ||
//           item.shift?.title?.toLowerCase().includes(searchLower)
//       );
//     }

//     setFilteredData(filtered);
//   };

//   const getBranchName = (branchId) => {
//     if (!branchId) return "No Branch";
//     const branch = branches.find((b) => b.id == branchId);
//     return branch ? branch.name : `Branch ${branchId}`;
//   };

//   const getDepartmentName = (departmentId) => {
//     if (!departmentId) return "No Department";
//     const department = departments.find((d) => d.id == departmentId);
//     return department ? department.name : `Department ${departmentId}`;
//   };

//   const getShiftName = (shift) => {
//     if (!shift) return "No Shift";
//     return shift.title || `Shift ${shift.id}`;
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;

//     setFilters((prev) => {
//       if (name === "branch_id") {
//         return {
//           ...prev,
//           [name]: value,
//           department_id: "",
//         };
//       }

//       return {
//         ...prev,
//         [name]: value,
//       };
//     });
//   };

//   const handleTypeChange = (type) => {
//     setFilters((prev) => ({
//       ...prev,
//       type,
//     }));
//   };

//   const handleRefresh = () => {
//     loadAttendance();
//     setFilters({
//       type: "Monthly",
//       month: new Date().toISOString().slice(0, 7),
//       date: new Date().toISOString().slice(0, 10),
//       branch_id: "",
//       department_id: "",
//       employee_type: "",
//       search: "",
//     });
//   };

//   const handleSearch = () => {
//     loadAttendance();
//   };

//   // Parse time string to hours, minutes, seconds
//   const parseTimeString = (timeString) => {
//     if (!timeString || timeString === "00:00:00") {
//       return { hours: "00", minutes: "00", seconds: "00" };
//     }

//     // Remove date part if present
//     const timeOnly = timeString.includes(" ")
//       ? timeString.split(" ")[1]
//       : timeString;
//     const [hours = "00", minutes = "00", seconds = "00"] = timeOnly.split(":");

//     return {
//       hours: hours.padStart(2, "0"),
//       minutes: minutes.padStart(2, "0"),
//       seconds: seconds.padStart(2, "0"),
//     };
//   };

//   const handleEdit = (record) => {
//     console.log("Editing record:", record);

//     const clockInTime = parseTimeString(record.clock_in);
//     const clockOutTime = parseTimeString(record.clock_out);
//     const lateTime = parseTimeString(record.late);
//     const earlyLeavingTime = parseTimeString(record.early_leaving);
//     const overtimeTime = parseTimeString(record.overtime);

//     // Get employee_id from the record
//     const employeeId = record.employee_id || record.employee?.id;

//     console.log("Extracted employee ID:", employeeId);

//     setCurrentRecord({
//       id: record.id,
//       employee_id: employeeId,
//       date: record.date,
//       status: record.status || "Present",
//       clock_in_hours: clockInTime.hours,
//       clock_in_minutes: clockInTime.minutes,
//       clock_in_seconds: clockInTime.seconds,
//       clock_out_hours: clockOutTime.hours,
//       clock_out_minutes: clockOutTime.minutes,
//       clock_out_seconds: clockOutTime.seconds,
//       late_hours: lateTime.hours,
//       late_minutes: lateTime.minutes,
//       late_seconds: lateTime.seconds,
//       early_leaving_hours: earlyLeavingTime.hours,
//       early_leaving_minutes: earlyLeavingTime.minutes,
//       early_leaving_seconds: earlyLeavingTime.seconds,
//       overtime_hours: overtimeTime.hours,
//       overtime_minutes: overtimeTime.minutes,
//       overtime_seconds: overtimeTime.seconds,
//       total_rest: record.total_rest || 0,
//       reason: record.reason || "",
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
//                   await attendanceService.delete(id);
//                   onClose();
//                   showToast(
//                     "Attendance record deleted successfully!",
//                     "success"
//                   );
//                   loadAttendance();
//                 } catch (error) {
//                   console.error("Delete failed:", error);
//                   onClose();
//                   showToast("Failed to delete attendance record!", "danger");
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

//   const handleModalChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentRecord((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleModalSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log("=== Starting Update ===");
//       console.log("Current Record:", currentRecord);

//       // Check if employee_id exists
//       if (!currentRecord.employee_id) {
//         throw new Error("Employee ID is missing from the record");
//       }

//       // Combine time components into HH:MM:SS format
//       const clock_in = `${currentRecord.clock_in_hours}:${currentRecord.clock_in_minutes}:${currentRecord.clock_in_seconds}`;
//       const clock_out = `${currentRecord.clock_out_hours}:${currentRecord.clock_out_minutes}:${currentRecord.clock_out_seconds}`;
//       const late = `${currentRecord.late_hours}:${currentRecord.late_minutes}:${currentRecord.late_seconds}`;
//       const early_leaving = `${currentRecord.early_leaving_hours}:${currentRecord.early_leaving_minutes}:${currentRecord.early_leaving_seconds}`;
//       const overtime = `${currentRecord.overtime_hours}:${currentRecord.overtime_minutes}:${currentRecord.overtime_seconds}`;

//       console.log("Updating attendance for record:", currentRecord.id);

//       // Find the employee to get employee_code (employee_id)
//       const employee = employees.find(
//         (emp) => emp.id == currentRecord.employee_id
//       );

//       console.log("Found employee:", employee);

//       if (!employee) {
//         throw new Error(
//           `Employee not found. Looking for ID: ${currentRecord.employee_id}`
//         );
//       }

//       // Use the employee_code (employee.employee_id) for early-leaving and overtime endpoints
//       const employeeCode = employee.employee_id;

//       let successCount = 0;

//       // Update early leaving if changed - FIXED: Use proper endpoint
//       if (early_leaving && early_leaving !== "00:00:00") {
//         try {
//           console.log(
//             "Updating early leaving for employee code:",
//             employeeCode
//           );

//           // FIXED: Use the correct endpoint format as per your backend
//           await attendanceService.updateEarlyLeaving(employeeCode, {
//             date: currentRecord.date,
//             clock_out: `${currentRecord.date} ${clock_out}`, // Required field for early leaving
//             early_leaving: early_leaving,
//             reason: currentRecord.reason,
//           });
//           console.log("Early leaving updated successfully");
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update early leaving:", error);
//           // Continue with other updates even if this fails
//         }
//       } else {
//         successCount++;
//       }

//       // Update overtime if changed
//       if (overtime && overtime !== "00:00:00") {
//         try {
//           console.log("Updating overtime for employee code:", employeeCode);
//           await attendanceService.updateOvertime(employeeCode, {
//             date: currentRecord.date,
//             overtime: overtime,
//             reason: currentRecord.reason,
//           });
//           console.log("Overtime updated successfully");
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update overtime:", error);
//           // Continue with other updates even if this fails
//         }
//       } else {
//         successCount++;
//       }

//       // Update main attendance record
//       try {
//         const mainUpdateData = {
//           date: currentRecord.date,
//           status: currentRecord.status,
//           clock_in:
//             clock_in !== "00:00:00"
//               ? `${currentRecord.date} ${clock_in}`
//               : null,
//           clock_out:
//             clock_out !== "00:00:00"
//               ? `${currentRecord.date} ${clock_out}`
//               : null,
//           late: late,
//           total_rest: parseInt(currentRecord.total_rest) || 0,
//           reason: currentRecord.reason || null,
//         };

//         console.log(
//           "Updating main attendance for record ID:",
//           currentRecord.id
//         );
//         console.log("Main update data:", mainUpdateData);

//         await attendanceService.update(currentRecord.id, mainUpdateData);
//         console.log("Main attendance updated successfully");
//         successCount++;
//       } catch (error) {
//         console.error("Failed to update main attendance:", error);
//         if (error.response?.status === 404) {
//           console.warn(
//             "Attendance record not found, it might have been deleted"
//           );
//           // Continue with success since early-leaving/overtime might have updated
//         } else {
//           throw error; // Re-throw other errors
//         }
//       }

//       // Success - close modal and show toast
//       if (successCount > 0) {
//         setIsClosing(true);
//         setTimeout(() => {
//           setShowModal(false);
//           setIsClosing(false);
//           showToast("Attendance updated successfully!", "success");
//           loadAttendance();
//         }, 700);
//       } else {
//         throw new Error("All update operations failed");
//       }
//     } catch (error) {
//       console.error("Update failed:", error);

//       let errorMessage = "Failed to update attendance!";
//       if (error.response?.status === 404) {
//         errorMessage =
//           "Attendance record not found. Please refresh and try again.";
//       } else if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       showToast(errorMessage, "danger");
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString || timeString === "00:00:00") return "-";
//     if (timeString.includes(" ")) {
//       return timeString.split(" ")[1];
//     }
//     return timeString;
//   };

//   const formatShiftTime = (timeString) => {
//     if (!timeString) return "-";
//     // Convert "HH:MM:SS" to "HH:MM" format
//     if (timeString.includes(":")) {
//       const parts = timeString.split(":");
//       return `${parts[0]}:${parts[1]}`;
//     }
//     return timeString;
//   };

//   const getEmployeeDetails = (attendanceRecord) => {
//     if (attendanceRecord.employee) {
//       const employee = attendanceRecord.employee;
//       const employeeType = getEmployeeType(employee.id);

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     const employee = employees.find(
//       (emp) => emp.id === attendanceRecord.employee_id
//     );
//     if (employee) {
//       const employeeType = employee.employee_type || "Permanent";

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     return {
//       name: "Unknown",
//       employee_id: "N/A",
//       employee_type: "Permanent",
//       branch_name: "Unknown Branch",
//       department_name: "Unknown Department",
//     };
//   };

//   const getEmployeeName = (employeeId) => {
//     const attendanceRecord = attendanceData.find(
//       (item) => item.employee_id === employeeId
//     );
//     if (attendanceRecord?.employee?.name) {
//       return attendanceRecord.employee.name;
//     }
//     const employee = employees.find((emp) => emp.id === employeeId);
//     return employee ? employee.name : "Unknown";
//   };

//   // Generate options for time selects
//   const generateTimeOptions = (type) => {
//     const options = [];
//     const max = type === "hours" ? 23 : 59;

//     for (let i = 0; i <= max; i++) {
//       const value = i.toString().padStart(2, "0");
//       options.push(
//         <option key={value} value={value}>
//           {value}
//         </option>
//       );
//     }
//     return options;
//   };

//   // NEW: Get status badge color
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Present":
//         return "success";
//       case "Absent":
//         return "danger";
//       case "Late":
//         return "warning";
//       case "Half Day":
//         return "info";
//       case "On Leave":
//         return "secondary";
//       default:
//         return "light";
//     }
//   };

//   // NEW: Format date for display
//   const formatDisplayDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       day: "numeric",
//       month: "short",
//     });
//   };

//   // NEW: Get day name from date
//   const getDayName = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", { weekday: "short" });
//   };

//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentData = filteredData.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );

//   const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="container mt-4">
//       <style>{`
//         .entries-select:focus {
//           border-color: #6FD943 !important;
//           box-shadow: 0 0 0px 4px #70d94360 !important;
//         }

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

//         .btn-pink {
//           background-color: #f5365c;
//           color: #fff;
//           border: none;
//         }
//         .btn-pink:hover {
//           background-color: #e43156;
//           color: #fff;
//         }
//         .btn-pink:active,
//         .btn-pink:focus {
//           background-color: #f5365c !important;
//           box-shadow: none !important;
//         }

//         .btn-brown {
//           background-color: #563d7c;
//           color: #fff;
//           border: none;
//         }
//         .btn-brown:hover {
//           background-color: #4a366c;
//           color: #fff;
//         }

//         .square-btn {
//           width: 38px;
//           height: 38px;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0;
//           font-size: 16px;
//           border-radius: 6px;
//         }
//         .table th {
//           font-weight: 600;
//           background-color: #f8f9fa;
//         }

//         .employee-type-badge {
//           font-size: 0.75em;
//           padding: 0.25em 0.5em;
//         }

//         .time-select-group {
//           display: flex;
//           gap: 5px;
//           align-items: center;
//         }
//         .time-select-group select {
//           flex: 1;
//         }
//         .time-separator {
//           font-weight: bold;
//           color: #666;
//         }
//         .reason-cell {
//           max-width: 200px;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         .shift-info {
//           font-size: 0.8em;
//           color: #666;
//         }

//         /* NEW: Employee name clickable style */
//         .employee-name-clickable {
//           cursor: pointer;
//           color: #007bff;
//           text-decoration: none;
//           transition: color 0.2s;
//         }
//         .employee-name-clickable:hover {
//           color: #0056b3;
//           text-decoration: underline;
//         }

//         /* NEW: Calendar grid styles */
//         .calendar-grid {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 8px;
//           margin-top: 15px;
//         }
//         .calendar-day {
//           border: 1px solid #dee2e6;
//           border-radius: 6px;
//           padding: 8px;
//           text-align: center;
//           min-height: 80px;
//           background: white;
//         }
//         .calendar-day.weekend {
//           background-color: #f8f9fa;
//         }
//         .calendar-day-header {
//           font-weight: 600;
//           font-size: 0.9em;
//           margin-bottom: 4px;
//           color: #495057;
//         }
//         .calendar-day-number {
//           font-size: 1.1em;
//           font-weight: bold;
//           margin-bottom: 4px;
//         }
//         .calendar-status {
//           font-size: 0.75em;
//           padding: 2px 6px;
//           border-radius: 12px;
//         }
//       `}</style>

//       <h4 className="fw-semibold">Manage Attendance List</h4>
//       <BreadCrumb pathname={location.pathname} onNavigate={navigate} />

//       {/* Filters Section */}
//       <div className="bg-white rounded shadow-sm p-4 mb-4">
//         <div className="row align-items-end g-3">
//           <div className="col-md-2">
//             <label className="form-label fw-bold d-block mb-2">Type</label>
//             <div className="d-flex rounded-pill bg-light p-1 gap-1">
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${
//                   filters.type === "Monthly"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                 }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Monthly")}
//               >
//                 Monthly
//               </div>
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${
//                   filters.type === "Daily"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                 }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Daily")}
//               >
//                 Daily
//               </div>
//             </div>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">
//               {filters.type === "Monthly" ? "Month" : "Date"}
//             </label>
//             {filters.type === "Monthly" ? (
//               <input
//                 type="month"
//                 className="form-control"
//                 name="month"
//                 value={filters.month}
//                 onChange={handleFilterChange}
//               />
//             ) : (
//               <input
//                 type="date"
//                 className="form-control"
//                 name="date"
//                 value={filters.date || ""}
//                 onChange={handleFilterChange}
//               />
//             )}
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Branch</label>
//             <select
//               className="form-select"
//               name="branch_id"
//               value={filters.branch_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Branch</option>
//               {branches.map((branch) => (
//                 <option key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Department</label>
//             <select
//               className="form-select"
//               name="department_id"
//               value={filters.department_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Department</option>
//               {getFilteredDepartments().map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Employee Type</label>
//             <select
//               className="form-select"
//               name="employee_type"
//               value={filters.employee_type}
//               onChange={handleFilterChange}
//             >
//               <option value="">All Types</option>
//               <option value="Permanent">Permanent</option>
//               <option value="Contractual">Contractual</option>
//             </select>
//           </div>

//           <div className="col-md-2 d-flex gap-2 justify-content-end">
//             <OverlayTrigger placement="top" overlay={<Tooltip>Apply</Tooltip>}>
//               <button
//                 className="btn btn-success square-btn"
//                 onClick={handleSearch}
//               >
//                 <FaSearch />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Reset</Tooltip>}>
//               <button
//                 className="btn btn-pink square-btn"
//                 onClick={handleRefresh}
//               >
//                 <FaSyncAlt />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Import</Tooltip>}>
//               <button className="btn btn-brown square-btn">
//                 <FaFileExport />
//               </button>
//             </OverlayTrigger>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Combined Entries + Search + Table + Pagination */}
//       <div className="bg-white p-3 mb-4 rounded shadow-sm mt-3">
//         {/* Entries & Search */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
//           <div className="d-flex align-items-center gap-2">
//             <Form.Select
//               className=""
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(parseInt(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               {[10, 25, 50, 100].map((num) => (
//                 <option key={num} value={num}>
//                   {num}
//                 </option>
//               ))}
//             </Form.Select>
//           </div>

//           <div className="d-flex align-items-center">
//             <input
//               type="text"
//               value={filters.search}
//               onChange={handleFilterChange}
//               name="search"
//               placeholder="Search..."
//               className="form-control form-control-sm"
//               style={{ maxWidth: "200px" }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover table-striped align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Employee</th>
//                 <th>Date</th>
//                 <th>Status</th>
//                 <th>Shift</th>
//                 <th>Clock In</th>
//                 <th>Early Leaving</th>
//                 <th>Overtime</th>
//                 <th>Reason</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-3 text-success">
//                     <div
//                       className="spinner-border spinner-border-sm me-2 "
//                       role="status"
//                     ></div>
//                     Loading attendance data...
//                   </td>
//                 </tr>
//               ) : currentData.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-3">
//                     No records found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((item) => {
//                   const employee = getEmployeeDetails(item);
//                   return (
//                     <tr key={item.id}>
//                       <td>
//                         <div>
//                           {/* UPDATED: Make employee name clickable */}
//                           <div
//                             className="employee-name-clickable fw-semibold"
//                             onClick={() =>
//                               handleEmployeeClick(
//                                 item.employee_id || item.employee?.id,
//                                 employee.employee_id,
//                                 employee.name
//                               )
//                             }
//                             title="Click to view monthly attendance"
//                           >
//                             {employee.name}
//                             <FaUser className="ms-1" size={12} />
//                           </div>
//                           <span
//                             className={`badge employee-type-badge ${
//                               employee.employee_type === "Permanent"
//                                 ? "bg-primary"
//                                 : "bg-warning text-dark"
//                             }`}
//                           >
//                             {employee.employee_type}
//                           </span>
//                           <br />
//                         </div>
//                       </td>
//                       <td>{new Date(item.date).toLocaleDateString()}</td>
//                       <td>
//                         <span
//                           className={`badge ${
//                             item.status === "Present"
//                               ? "bg-success"
//                               : item.status === "Absent"
//                               ? "bg-danger"
//                               : "bg-warning"
//                           }`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                       <td>
//                         {item.shift ? (
//                           <div className="shift-info">
//                             <div className="fw-semibold">
//                               {item.shift.title}
//                             </div>
//                             <small>
//                               {formatShiftTime(item.shift.start_time)} -{" "}
//                               {formatShiftTime(item.shift.end_time)}
//                             </small>
//                           </div>
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>{formatTime(item.clock_in)}</td>
//                       <td>{formatTime(item.early_leaving)}</td>
//                       <td>{formatTime(item.overtime)}</td>
//                       <td
//                         style={{
//                           width: "400px", // fixed width
//                           whiteSpace: "normal", // allow wrapping
//                           wordWrap: "break-word",
//                           // break long words
//                         }}
//                         className="reason-cell"
//                         title={item.reason}
//                       >
//                         {item.reason || "-"}
//                       </td>
//                       <td>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-info btn-sm me-2 square-btn"
//                             onClick={() => handleEdit(item)}
//                           >
//                             <FaEdit />
//                           </button>
//                         </OverlayTrigger>

//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-danger btn-sm square-btn"
//                             onClick={() => handleDelete(item.id)}
//                           >
//                             <FaTrash />
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 gap-2">
//           <div className="small text-muted">
//             Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
//             {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>

//           <div>
//             <ul className="pagination pagination-sm mb-0">
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {Array.from({ length: totalPages }, (_, i) => (
//                 <li
//                   key={i + 1}
//                   className={`page-item ${
//                     currentPage === i + 1 ? "active" : ""
//                   }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(i + 1)}
//                   >
//                     {i + 1}
//                   </button>
//                 </li>
//               ))}

//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   disabled={currentPage === totalPages}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       <ToastContainer
//         position="top-end"
//         className="p-3"
//         style={{ zIndex: 9999 }}
//       >
//         <Toast
//           onClose={() => setToast({ ...toast, show: false })}
//           show={toast.show}
//           delay={3000}
//           autohide
//           bg={toast.bg}
//         >
//           <Toast.Body className="text-white fw-semibold">
//             {toast.message}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>

//       {/* Edit Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         size="md"
//       >
//         <Form onSubmit={handleModalSubmit}>
//           <Modal.Header closeButton>
//             <Modal.Title>Edit Attendance</Modal.Title>
//           </Modal.Header>

//           <Modal.Body>
//             {/* Employee */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Employee<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 value={getEmployeeName(currentRecord.employee_id)}
//                 readOnly
//               />
//             </Form.Group>

//             {/* Date */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Date<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={currentRecord.date || ""}
//                 onChange={handleModalChange}
//                 required
//               />
//             </Form.Group>

//             {/* Status */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Status<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="status"
//                 value={currentRecord.status || ""}
//                 onChange={handleModalChange}
//                 required
//               >
//                 <option value="Present">Present</option>
//                 <option value="Absent">Absent</option>
//                 <option value="Late">Late</option>
//                 <option value="Half Day">Half Day</option>
//                 <option value="On Leave">On Leave</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Clock In</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_hours"
//                     value={currentRecord.clock_in_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_minutes"
//                     value={currentRecord.clock_in_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>

//                   <Form.Select
//                     name="clock_in_seconds"
//                     value={currentRecord.clock_in_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Clock Out</Form.Label>
//               <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_hours"
//                     value={currentRecord.clock_out_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_minutes"
//                     value={currentRecord.clock_out_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_seconds"
//                     value={currentRecord.clock_out_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Early Leaving</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_hours"
//                     value={currentRecord.early_leaving_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_minutes"
//                     value={currentRecord.early_leaving_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_seconds"
//                     value={currentRecord.early_leaving_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Overtime</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_hours"
//                     value={currentRecord.overtime_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_minutes"
//                     value={currentRecord.overtime_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_seconds"
//                     value={currentRecord.overtime_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label className="required-field">
//                 Reason<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="reason"
//                 value={currentRecord.reason || ""}
//                 onChange={handleModalChange}
//                 placeholder="Enter reason for attendance modification..."
//                 required
//               />
//               <Form.Control.Feedback type="invalid">
//                 Please provide a reason for the attendance modification.
//               </Form.Control.Feedback>
//             </Form.Group>
//           </Modal.Body>

//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="success">
//               Update
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       {/* NEW: Employee Attendance Modal */}
//       <Modal
//         show={showEmployeeAttendanceModal}
//         onHide={handleCloseEmployeeAttendanceModal}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <FaUser className="me-2" />
//             {selectedEmployee?.name} - Monthly Attendance
//             {/* <Badge bg="secondary" className="ms-2">
//               ID: {selectedEmployee?.code}
//             </Badge> */}
//           </Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           {employeeAttendanceLoading ? (
//             <div className="text-center py-4">
//               <div className="spinner-border text-success" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p className="mt-2">Loading attendance data...</p>
//             </div>
//           ) : employeeAttendance.length === 0 ? (
//             <div className="text-center py-4">
//               <FaCalendarAlt size={48} className="text-muted mb-3" />
//               <p>No attendance records found for this employee.</p>
//             </div>
//           ) : (
//             <>
//               {/* Calendar Grid */}
//               {/* Enhanced Calendar Grid */}
//               <div className="calendar-grid">
//                 {/* Headers */}
//                 {/* {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//                   (day) => (
//                     <div
//                       key={day}
//                       className="calendar-day-header text-center text-muted small fw-bold"
//                     >
//                       {day}
//                     </div>
//                   )
//                 )} */}

//                 {/* Calendar Days */}
//                 {employeeAttendance.map((record) => {
//                   const date = new Date(record.date);
//                   const dayOfWeek = date.getDay();
//                   const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//                   // Format times for display
//                   const clockInTime = formatTime(record.clock_in);
//                   const earlyLeavingTime = formatTime(record.early_leaving);
//                   const overtimeTime = formatTime(record.overtime);
//                   const shiftName = record.shift?.title || "-";
//                   const shiftTime = record.shift
//                     ? `${formatShiftTime(
//                         record.shift.start_time
//                       )}-${formatShiftTime(record.shift.end_time)}`
//                     : "";

//                   return (
//                     <div
//                       key={record.date}
//                       className={`calendar-day ${isWeekend ? "weekend" : ""} ${
//                         record.status === "Absent" ? "absent-day" : ""
//                       }`}
//                     >
//                       <div className="calendar-day-number">
//                         {formatDisplayDate(record.date)}
//                       </div>
//                       <div className="calendar-day-header small text-muted">
//                         {getDayName(record.date)}
//                       </div>

//                       {/* Status Badge */}
//                       <Badge
//                         bg={getStatusBadge(record.status)}
//                         className="calendar-status mb-1"
//                       >
//                         {record.status}
//                       </Badge>

//                       {/* Shift Information */}
//                       {shiftName !== "-" && (
//                         <div className="small text-primary mt-1 fw-semibold">
//                           {shiftName}
//                         </div>
//                       )}
//                       {shiftTime && (
//                         <div className="small text-muted">{shiftTime}</div>
//                       )}

//                       {/* Clock In Time */}
//                       {clockInTime !== "-" && (
//                         <div className="small text-success mt-1">
//                           <strong>In:</strong> {clockInTime}
//                         </div>
//                       )}

//                       {/* Early Leaving */}
//                       {earlyLeavingTime !== "-" && (
//                         <div className="small text-warning mt-1">
//                           <strong>Early:</strong> {earlyLeavingTime}
//                         </div>
//                       )}

//                       {/* Overtime */}
//                       {overtimeTime !== "-" && (
//                         <div className="small text-info mt-1">
//                           <strong>OT:</strong> {overtimeTime}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Summary */}
//               <Row className="mt-4">
//                 <Col md={6}>
//                   <Card className="border-0 bg-light">
//                     <Card.Body className="py-2">
//                       <small className="text-muted">
//                         Total Records: {employeeAttendance.length}
//                       </small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 <Col md={6}>
//                   <Card className="border-0 bg-light">
//                     <Card.Body className="py-2">
//                       <small className="text-muted">
//                         Period: {employeeAttendance[0]?.date} to{" "}
//                         {
//                           employeeAttendance[employeeAttendance.length - 1]
//                             ?.date
//                         }
//                       </small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               </Row>
//             </>
//           )}
//         </Modal.Body>

//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={handleCloseEmployeeAttendanceModal}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default AttendanceList;

// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Form,
//   Button,
//   OverlayTrigger,
//   Tooltip,
//   Toast,
//   ToastContainer,
//   Row,
//   Col,
//   Card,
//   Badge,
// } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../../components/BreadCrumb";
// import {
//   getBranches,
//   getDepartments,
//   getEmployees,
// } from "../../../services/hrmService";
// import attendanceService from "../../../services/attendanceService";
// import {
//   FaSearch,
//   FaSyncAlt,
//   FaFileExport,
//   FaEdit,
//   FaTrash,
//   FaUser,
//   FaCalendarAlt,
//   FaClock,
//   FaSignOutAlt,
//   FaBusinessTime,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const AttendanceList = () => {
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [isClosing, setIsClosing] = useState(false);
//   const [showEmployeeAttendanceModal, setShowEmployeeAttendanceModal] =
//     useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeAttendance, setEmployeeAttendance] = useState([]);
//   const [employeeAttendanceLoading, setEmployeeAttendanceLoading] =
//     useState(false);

//   const [filters, setFilters] = useState({
//     type: "Monthly",
//     month: new Date().toISOString().slice(0, 7),
//     date: new Date().toISOString().slice(0, 10),
//     branch_id: "",
//     department_id: "",
//     employee_type: "",
//     search: "",
//   });

//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [currentRecord, setCurrentRecord] = useState({
//     id: null,
//     employee_id: "",
//     date: "",
//     status: "Present",
//     clock_in_hours: "00",
//     clock_in_minutes: "00",
//     clock_in_seconds: "00",
//     clock_out_hours: "00",
//     clock_out_minutes: "00",
//     clock_out_seconds: "00",
//     late_hours: "00",
//     late_minutes: "00",
//     late_seconds: "00",
//     early_leaving_hours: "00",
//     early_leaving_minutes: "00",
//     early_leaving_seconds: "00",
//     overtime_hours: "00",
//     overtime_minutes: "00",
//     overtime_seconds: "00",
//     total_rest: 0,
//     reason: "",
//   });

//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     bg: "success",
//   });
//   const navigate = useNavigate();

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, bg: type });
//     setTimeout(() => setToast({ ...toast, show: false }), 3000);
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 700);
//   };

//   const handleCloseEmployeeAttendanceModal = () => {
//     setShowEmployeeAttendanceModal(false);
//     setSelectedEmployee(null);
//     setEmployeeAttendance([]);
//   };

//   useEffect(() => {
//     loadInitialData();
//     loadAttendance();
//   }, []);

//   useEffect(() => {
//     if (filters.employee_type) {
//       loadAttendance();
//     }
//   }, [filters.employee_type]);

//   useEffect(() => {
//     applyFilters();
//   }, [filters, attendanceData]);

//   const loadInitialData = async () => {
//     try {
//       const [branchesData, departmentsData, employeesData] = await Promise.all([
//         getBranches(),
//         getDepartments(),
//         getEmployees(),
//       ]);

//       setBranches(branchesData);

//       let departmentsList = [];
//       if (Array.isArray(departmentsData)) {
//         departmentsList = departmentsData;
//       } else if (departmentsData && Array.isArray(departmentsData.data)) {
//         departmentsList = departmentsData.data;
//       } else if (
//         departmentsData &&
//         departmentsData.success &&
//         Array.isArray(departmentsData.data)
//       ) {
//         departmentsList = departmentsData.data;
//       }

//       setDepartments(departmentsList);
//       setEmployees(employeesData);
//     } catch (error) {
//       console.error("Error loading initial data:", error);
//     }
//   };

//   const loadAttendance = async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (filters.employee_type) {
//         params.employee_type = filters.employee_type;
//       }

//       const response = await attendanceService.getAll(params);
//       if (response.data.success) {
//         setAttendanceData(response.data.data);
//       } else {
//         console.error("Failed to load attendance:", response.data.message);
//         setAttendanceData([]);
//       }
//     } catch (error) {
//       console.error("Error loading attendance:", error);
//       setAttendanceData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadEmployeeAttendance = async (
//     employeeId,
//     employeeCode,
//     month = null
//   ) => {
//     setEmployeeAttendanceLoading(true);
//     try {
//       const params = {};

//       if (month) {
//         const [yearPart, monthPart] = month.split("-");
//         params.month = parseInt(monthPart);
//         params.year = parseInt(yearPart);
//       } else {
//         const now = new Date();
//         params.month = now.getMonth() + 1;
//         params.year = now.getFullYear();
//       }

//       console.log("Loading employee attendance:", {
//         employeeCode,
//         params,
//       });

//       const response = await attendanceService.getEmployeeAttendanceSummary(
//         employeeCode,
//         params
//       );

//       if (response.data && response.data.success) {
//         setEmployeeAttendance(response.data.data);
//         console.log(
//           "Employee attendance loaded:",
//           response.data.data.length,
//           "records"
//         );
//       } else {
//         console.error(
//           "Failed to load employee attendance:",
//           response.data?.message
//         );
//         setEmployeeAttendance([]);
//         showToast("No attendance records found for this employee", "warning");
//       }
//     } catch (error) {
//       console.error("Error loading employee attendance:", error);
//       setEmployeeAttendance([]);
//       showToast("Error loading employee attendance data", "danger");
//     } finally {
//       setEmployeeAttendanceLoading(false);
//     }
//   };

//   const handleEmployeeClick = async (
//     employeeId,
//     employeeCode,
//     employeeName
//   ) => {
//     console.log("Employee clicked:", {
//       employeeId,
//       employeeCode,
//       employeeName,
//     });

//     setSelectedEmployee({
//       id: employeeId,
//       code: employeeCode,
//       name: employeeName,
//     });

//     const selectedMonth =
//       filters.type === "Monthly"
//         ? filters.month
//         : new Date().toISOString().slice(0, 7);

//     console.log("Loading attendance for month:", selectedMonth);

//     await loadEmployeeAttendance(employeeId, employeeCode, selectedMonth);
//     setShowEmployeeAttendanceModal(true);
//   };

//   const getEmployeeType = (employeeId) => {
//     const employee = employees.find((emp) => emp.id == employeeId);
//     return employee?.employee_type || "Permanent";
//   };

//   const getFilteredDepartments = () => {
//     if (!filters.branch_id) return departments;

//     const branchEmployees = employees.filter(
//       (emp) => emp.branch_id == filters.branch_id
//     );

//     const departmentIds = [
//       ...new Set(branchEmployees.map((emp) => emp.department_id)),
//     ];

//     return departments.filter(
//       (dept) =>
//         departmentIds.includes(dept.id) || dept.branch_id == filters.branch_id
//     );
//   };

//   const applyFilters = () => {
//     let filtered = [...attendanceData];

//     if (filters.branch_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.branch_id == filters.branch_id
//       );
//     }

//     if (filters.department_id) {
//       filtered = filtered.filter(
//         (item) => item.employee?.department_id == filters.department_id
//       );
//     }

//     if (filters.type === "Monthly" && filters.month) {
//       filtered = filtered.filter(
//         (item) => item.date.slice(0, 7) === filters.month
//       );
//     } else if (filters.type === "Daily" && filters.date) {
//       filtered = filtered.filter((item) => item.date === filters.date);
//     }

//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(
//         (item) =>
//           item.employee?.name?.toLowerCase().includes(searchLower) ||
//           item.employee?.employee_id?.toLowerCase().includes(searchLower) ||
//           item.status?.toLowerCase().includes(searchLower) ||
//           item.reason?.toLowerCase().includes(searchLower) ||
//           item.shift?.title?.toLowerCase().includes(searchLower)
//       );
//     }

//     setFilteredData(filtered);
//   };

//   const getBranchName = (branchId) => {
//     if (!branchId) return "No Branch";
//     const branch = branches.find((b) => b.id == branchId);
//     return branch ? branch.name : `Branch ${branchId}`;
//   };

//   const getDepartmentName = (departmentId) => {
//     if (!departmentId) return "No Department";
//     const department = departments.find((d) => d.id == departmentId);
//     return department ? department.name : `Department ${departmentId}`;
//   };

//   const getShiftName = (shift) => {
//     if (!shift) return "No Shift";
//     return shift.title || `Shift ${shift.id}`;
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;

//     setFilters((prev) => {
//       if (name === "branch_id") {
//         return {
//           ...prev,
//           [name]: value,
//           department_id: "",
//         };
//       }

//       return {
//         ...prev,
//         [name]: value,
//       };
//     });
//   };

//   const handleTypeChange = (type) => {
//     setFilters((prev) => ({
//       ...prev,
//       type,
//     }));
//   };

//   const handleRefresh = () => {
//     loadAttendance();
//     setFilters({
//       type: "Monthly",
//       month: new Date().toISOString().slice(0, 7),
//       date: new Date().toISOString().slice(0, 10),
//       branch_id: "",
//       department_id: "",
//       employee_type: "",
//       search: "",
//     });
//   };

//   const handleSearch = () => {
//     loadAttendance();
//   };

//   const parseTimeString = (timeString) => {
//     if (!timeString || timeString === "00:00:00") {
//       return { hours: "00", minutes: "00", seconds: "00" };
//     }

//     const timeOnly = timeString.includes(" ")
//       ? timeString.split(" ")[1]
//       : timeString;
//     const [hours = "00", minutes = "00", seconds = "00"] = timeOnly.split(":");

//     return {
//       hours: hours.padStart(2, "0"),
//       minutes: minutes.padStart(2, "0"),
//       seconds: seconds.padStart(2, "0"),
//     };
//   };

//   const handleEdit = (record) => {
//     console.log("Editing record:", record);

//     const clockInTime = parseTimeString(record.clock_in);
//     const clockOutTime = parseTimeString(record.clock_out);
//     const lateTime = parseTimeString(record.late);
//     const earlyLeavingTime = parseTimeString(record.early_leaving);
//     const overtimeTime = parseTimeString(record.overtime);

//     const employeeId = record.employee_id || record.employee?.id;

//     console.log("Extracted employee ID:", employeeId);

//     setCurrentRecord({
//       id: record.id,
//       employee_id: employeeId,
//       date: record.date,
//       status: record.status || "Present",
//       clock_in_hours: clockInTime.hours,
//       clock_in_minutes: clockInTime.minutes,
//       clock_in_seconds: clockInTime.seconds,
//       clock_out_hours: clockOutTime.hours,
//       clock_out_minutes: clockOutTime.minutes,
//       clock_out_seconds: clockOutTime.seconds,
//       late_hours: lateTime.hours,
//       late_minutes: lateTime.minutes,
//       late_seconds: lateTime.seconds,
//       early_leaving_hours: earlyLeavingTime.hours,
//       early_leaving_minutes: earlyLeavingTime.minutes,
//       early_leaving_seconds: earlyLeavingTime.seconds,
//       overtime_hours: overtimeTime.hours,
//       overtime_minutes: overtimeTime.minutes,
//       overtime_seconds: overtimeTime.seconds,
//       total_rest: record.total_rest || 0,
//       reason: record.reason || "",
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
//                   await attendanceService.delete(id);
//                   onClose();
//                   showToast(
//                     "Attendance record deleted successfully!",
//                     "success"
//                   );
//                   loadAttendance();
//                 } catch (error) {
//                   console.error("Delete failed:", error);
//                   onClose();
//                   showToast("Failed to delete attendance record!", "danger");
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

//   const handleModalChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentRecord((prev) => ({ ...prev, [name]: value }));
//   };

//   // Debug function for API calls
//   const debugAPICall = (endpoint, data, employeeCode) => {
//     console.log(`🔍 API Call to: ${endpoint}`);
//     console.log("📤 Request Data:", data);
//     console.log("👤 Employee Code:", employeeCode);
//     console.log("📅 Date:", currentRecord.date);
//     console.log("---");
//   };

//   const handleModalSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log("=== Starting Update ===");
//       console.log("Current Record:", currentRecord);

//       if (!currentRecord.employee_id) {
//         throw new Error("Employee ID is missing from the record");
//       }

//       // Combine time components into HH:MM:SS format
//       const clock_in = `${currentRecord.clock_in_hours}:${currentRecord.clock_in_minutes}:${currentRecord.clock_in_seconds}`;
//       const clock_out = `${currentRecord.clock_out_hours}:${currentRecord.clock_out_minutes}:${currentRecord.clock_out_seconds}`;
//       const late = `${currentRecord.late_hours}:${currentRecord.late_minutes}:${currentRecord.late_seconds}`;
//       const early_leaving = `${currentRecord.early_leaving_hours}:${currentRecord.early_leaving_minutes}:${currentRecord.early_leaving_seconds}`;
//       const overtime = `${currentRecord.overtime_hours}:${currentRecord.overtime_minutes}:${currentRecord.overtime_seconds}`;

//       console.log("Formatted times:", {
//         clock_in,
//         clock_out,
//         late,
//         early_leaving,
//         overtime,
//       });

//       const employee = employees.find(
//         (emp) => emp.id == currentRecord.employee_id
//       );

//       console.log("Found employee:", employee);

//       if (!employee) {
//         throw new Error(
//           `Employee not found. Looking for ID: ${currentRecord.employee_id}`
//         );
//       }

//       const employeeCode = employee.employee_id;
//       let successCount = 0;

//       // Update early leaving if clock_out time is provided
//       if (clock_out && clock_out !== "00:00:00") {
//         try {
//           console.log("Updating early leaving for employee:", employeeCode);

//           const earlyLeavingData = {
//             date: currentRecord.date,
//             clock_out: `${currentRecord.date} ${clock_out}`,
//             reason: currentRecord.reason || "Updated via attendance edit",
//           };

//           debugAPICall("early-leaving", earlyLeavingData, employeeCode);

//           const response = await attendanceService.updateEarlyLeaving(
//             employeeCode,
//             earlyLeavingData
//           );
//           console.log("Early leaving update response:", response.data);
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update early leaving:", error);

//           if (error.response?.status === 400) {
//             const errorMsg =
//               error.response.data?.message || "Invalid data for early leaving";
//             console.warn("Early leaving validation failed:", errorMsg);
//             successCount++;
//           } else if (error.response?.status === 404) {
//             console.warn(
//               "Employee or attendance record not found for early leaving"
//             );
//             successCount++;
//           } else {
//             console.error("Unexpected error updating early leaving:", error);
//             successCount++;
//           }
//         }
//       } else {
//         successCount++;
//       }

//       // Update overtime if changed
//       if (overtime && overtime !== "00:00:00") {
//         try {
//           console.log("Updating overtime for employee code:", employeeCode);

//           const overtimeData = {
//             date: currentRecord.date,
//             overtime: overtime,
//             reason: currentRecord.reason || "Updated via attendance edit",
//           };

//           debugAPICall("overtime", overtimeData, employeeCode);

//           await attendanceService.updateOvertime(employeeCode, overtimeData);
//           console.log("Overtime updated successfully");
//           successCount++;
//         } catch (error) {
//           console.error("Failed to update overtime:", error);

//           if (error.response?.status === 400) {
//             console.warn(
//               "Overtime validation failed, continuing with other updates"
//             );
//             successCount++;
//           } else if (error.response?.status === 404) {
//             console.warn(
//               "Employee or attendance record not found for overtime"
//             );
//             successCount++;
//           } else {
//             console.error("Unexpected error updating overtime:", error);
//             successCount++;
//           }
//         }
//       } else {
//         successCount++;
//       }

//       // Update main attendance record
//       try {
//         const mainUpdateData = {
//           date: currentRecord.date,
//           status: currentRecord.status,
//           clock_in:
//             clock_in !== "00:00:00"
//               ? `${currentRecord.date} ${clock_in}`
//               : null,
//           clock_out:
//             clock_out !== "00:00:00"
//               ? `${currentRecord.date} ${clock_out}`
//               : null,
//           late: late !== "00:00:00" ? late : "00:00:00",
//           total_rest: parseInt(currentRecord.total_rest) || 0,
//           reason: currentRecord.reason || null,
//         };

//         console.log(
//           "Updating main attendance for record ID:",
//           currentRecord.id
//         );
//         console.log("Main update data:", mainUpdateData);

//         await attendanceService.update(currentRecord.id, mainUpdateData);
//         console.log("Main attendance updated successfully");
//         successCount++;
//       } catch (error) {
//         console.error("Failed to update main attendance:", error);
//         if (error.response?.status === 404) {
//           console.warn(
//             "Attendance record not found, it might have been deleted"
//           );
//         } else {
//           throw error;
//         }
//       }

//       // Success - close modal and show toast
//       if (successCount > 0) {
//         setIsClosing(true);
//         setTimeout(() => {
//           setShowModal(false);
//           setIsClosing(false);
//           showToast("Attendance updated successfully!", "success");
//           loadAttendance();
//         }, 700);
//       } else {
//         throw new Error("All update operations failed");
//       }
//     } catch (error) {
//       console.error("Update failed:", error);

//       let errorMessage = "Failed to update attendance!";

//       if (error.response?.status === 404) {
//         errorMessage =
//           "Attendance record not found. Please refresh and try again.";
//       } else if (error.response?.status === 400) {
//         errorMessage = error.response.data?.message || "Invalid data provided.";
//       } else if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       if (error.response?.data?.details) {
//         errorMessage += ` Details: ${JSON.stringify(
//           error.response.data.details
//         )}`;
//       }

//       showToast(errorMessage, "danger");
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString || timeString === "00:00:00") return "-";
//     if (timeString.includes(" ")) {
//       const timePart = timeString.split(" ")[1];
//       return timePart.slice(0, 5); // Remove seconds for cleaner display
//     }
//     return timeString.slice(0, 5); // Remove seconds for cleaner display
//   };

//   const formatShiftTime = (timeString) => {
//     if (!timeString) return "-";
//     if (timeString.includes(":")) {
//       const parts = timeString.split(":");
//       return `${parts[0]}:${parts[1]}`;
//     }
//     return timeString;
//   };

//   const getEmployeeDetails = (attendanceRecord) => {
//     if (attendanceRecord.employee) {
//       const employee = attendanceRecord.employee;
//       const employeeType = getEmployeeType(employee.id);

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     const employee = employees.find(
//       (emp) => emp.id === attendanceRecord.employee_id
//     );
//     if (employee) {
//       const employeeType = employee.employee_type || "Permanent";

//       return {
//         name: employee.name || "Unknown",
//         employee_id: employee.employee_id || "N/A",
//         employee_type: employeeType,
//         branch_name: getBranchName(employee.branch_id),
//         department_name: getDepartmentName(employee.department_id),
//       };
//     }

//     return {
//       name: "Unknown",
//       employee_id: "N/A",
//       employee_type: "Permanent",
//       branch_name: "Unknown Branch",
//       department_name: "Unknown Department",
//     };
//   };

//   const getEmployeeName = (employeeId) => {
//     const attendanceRecord = attendanceData.find(
//       (item) => item.employee_id === employeeId
//     );
//     if (attendanceRecord?.employee?.name) {
//       return attendanceRecord.employee.name;
//     }
//     const employee = employees.find((emp) => emp.id === employeeId);
//     return employee ? employee.name : "Unknown";
//   };

//   const generateTimeOptions = (type) => {
//     const options = [];
//     const max = type === "hours" ? 23 : 59;

//     for (let i = 0; i <= max; i++) {
//       const value = i.toString().padStart(2, "0");
//       options.push(
//         <option key={value} value={value}>
//           {value}
//         </option>
//       );
//     }
//     return options;
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Present":
//         return "success";
//       case "Absent":
//         return "danger";
//       case "Late":
//         return "warning";
//       case "Half Day":
//         return "info";
//       case "On Leave":
//         return "secondary";
//       default:
//         return "light";
//     }
//   };

//   const formatDisplayDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       day: "numeric",
//       month: "short",
//     });
//   };

//   const getDayName = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", { weekday: "short" });
//   };

//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentData = filteredData.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );

//   const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="container mt-4">
//       <style>{`
//         .entries-select:focus {
//           border-color: #6FD943 !important;
//           box-shadow: 0 0 0px 4px #70d94360 !important;
//         }

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

//         .btn-pink {
//           background-color: #f5365c;
//           color: #fff;
//           border: none;
//         }
//         .btn-pink:hover {
//           background-color: #e43156;
//           color: #fff;
//         }
//         .btn-pink:active,
//         .btn-pink:focus {
//           background-color: #f5365c !important;
//           box-shadow: none !important;
//         }

//         .btn-brown {
//           background-color: #563d7c;
//           color: #fff;
//           border: none;
//         }
//         .btn-brown:hover {
//           background-color: #4a366c;
//           color: #fff;
//         }

//         .square-btn {
//           width: 38px;
//           height: 38px;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0;
//           font-size: 16px;
//           border-radius: 6px;
//         }
//         .table th {
//           font-weight: 600;
//           background-color: #f8f9fa;
//         }

//         .employee-type-badge {
//           font-size: 0.75em;
//           padding: 0.25em 0.5em;
//         }

//         .time-select-group {
//           display: flex;
//           gap: 5px;
//           align-items: center;
//         }
//         .time-select-group select {
//           flex: 1;
//         }
//         .time-separator {
//           font-weight: bold;
//           color: #666;
//         }
//         .reason-cell {
//           max-width: 200px;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         .shift-info {
//           font-size: 0.8em;
//           color: #666;
//         }

//         .employee-name-clickable {
//           cursor: pointer;
//           color: #007bff;
//           text-decoration: none;
//           transition: color 0.2s;
//         }
//         .employee-name-clickable:hover {
//           color: #0056b3;
//           text-decoration: underline;
//         }

//         /* Enhanced Calendar Grid Styles */
//         .calendar-grid {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 10px;
//           margin-top: 15px;
//         }

//         .calendar-day {
//           border: 1px solid #dee2e6;
//           border-radius: 8px;
//           padding: 10px;
//           text-align: center;
//           min-height: 140px;
//           background: white;
//           transition: all 0.2s ease;
//           position: relative;
//         }

//         .calendar-day:hover {
//           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//           transform: translateY(-2px);
//         }

//         .calendar-day.weekend {
//           background-color: #f8f9fa;
//         }

//         .calendar-day.absent-day {
//           background-color: #fff5f5;
//           border-color: #e55353;
//         }

//         .calendar-day-header {
//           font-weight: 600;
//           font-size: 0.8em;
//           margin-bottom: 4px;
//           color: #495057;
//         }

//         .calendar-day-number {
//           font-size: 1.1em;
//           font-weight: bold;
//           margin-bottom: 4px;
//           color: #2c3e50;
//         }

//         .calendar-status {
//           font-size: 0.7em;
//           padding: 3px 8px;
//           border-radius: 12px;
//           margin-bottom: 5px;
//         }

//         .calendar-day .small {
//           font-size: 0.7em;
//           line-height: 1.2;
//         }

//         .calendar-day .text-success {
//           color: #28a745 !important;
//         }

//         .calendar-day .text-warning {
//           color: #ffc107 !important;
//         }

//         .calendar-day .text-info {
//           color: #17a2b8 !important;
//         }

//         .calendar-day .text-primary {
//           color: #007bff !important;
//         }

//         .calendar-day .text-muted {
//           color: #6c757d !important;
//         }

//         .summary-card {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           border: none;
//         }

//         .summary-card .card-body {
//           padding: 1rem;
//         }

//         .time-info-item {
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           margin-bottom: 2px;
//         }
//       `}</style>

//       <h4 className="fw-semibold">Manage Attendance List</h4>
//       <BreadCrumb pathname={location.pathname} onNavigate={navigate} />

//       {/* Filters Section */}
//       <div className="bg-white rounded shadow-sm p-4 mb-4">
//         <div className="row align-items-end g-3">
//           <div className="col-md-2">
//             <label className="form-label fw-bold d-block mb-2">Type</label>
//             <div className="d-flex rounded-pill bg-light p-1 gap-1">
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${
//                   filters.type === "Monthly"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                 }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Monthly")}
//               >
//                 Monthly
//               </div>
//               <div
//                 className={`flex-fill text-center py-1 rounded-pill ${
//                   filters.type === "Daily"
//                     ? "bg-success text-white fw-semibold"
//                     : "text-dark"
//                 }`}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleTypeChange("Daily")}
//               >
//                 Daily
//               </div>
//             </div>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">
//               {filters.type === "Monthly" ? "Month" : "Date"}
//             </label>
//             {filters.type === "Monthly" ? (
//               <input
//                 type="month"
//                 className="form-control"
//                 name="month"
//                 value={filters.month}
//                 onChange={handleFilterChange}
//               />
//             ) : (
//               <input
//                 type="date"
//                 className="form-control"
//                 name="date"
//                 value={filters.date || ""}
//                 onChange={handleFilterChange}
//               />
//             )}
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Branch</label>
//             <select
//               className="form-select"
//               name="branch_id"
//               value={filters.branch_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Branch</option>
//               {branches.map((branch) => (
//                 <option key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Department</label>
//             <select
//               className="form-select"
//               name="department_id"
//               value={filters.department_id}
//               onChange={handleFilterChange}
//             >
//               <option value="">Select Department</option>
//               {getFilteredDepartments().map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-2">
//             <label className="form-label fw-bold">Employee Type</label>
//             <select
//               className="form-select"
//               name="employee_type"
//               value={filters.employee_type}
//               onChange={handleFilterChange}
//             >
//               <option value="">All Types</option>
//               <option value="Permanent">Permanent</option>
//               <option value="Contractual">Contractual</option>
//             </select>
//           </div>

//           <div className="col-md-2 d-flex gap-2 justify-content-end">
//             <OverlayTrigger placement="top" overlay={<Tooltip>Apply</Tooltip>}>
//               <button
//                 className="btn btn-success square-btn"
//                 onClick={handleSearch}
//               >
//                 <FaSearch />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Reset</Tooltip>}>
//               <button
//                 className="btn btn-pink square-btn"
//                 onClick={handleRefresh}
//               >
//                 <FaSyncAlt />
//               </button>
//             </OverlayTrigger>

//             <OverlayTrigger placement="top" overlay={<Tooltip>Import</Tooltip>}>
//               <button className="btn btn-brown square-btn">
//                 <FaFileExport />
//               </button>
//             </OverlayTrigger>
//           </div>
//         </div>
//       </div>

//       {/* Combined Entries + Search + Table + Pagination */}
//       <div className="bg-white p-3 mb-4 rounded shadow-sm mt-3">
//         {/* Entries & Search */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
//           <div className="d-flex align-items-center gap-2">
//             <Form.Select
//               className=""
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(parseInt(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               {[10, 25, 50, 100].map((num) => (
//                 <option key={num} value={num}>
//                   {num}
//                 </option>
//               ))}
//             </Form.Select>
//           </div>

//           <div className="d-flex align-items-center">
//             <input
//               type="text"
//               value={filters.search}
//               onChange={handleFilterChange}
//               name="search"
//               placeholder="Search..."
//               className="form-control form-control-sm"
//               style={{ maxWidth: "200px" }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover table-striped align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Employee</th>
//                 <th>Date</th>
//                 <th>Status</th>
//                 <th>Shift</th>
//                 <th>Clock In</th>
//                 <th>Early Leaving</th>
//                 <th>Overtime</th>
//                 <th>Reason</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-3 text-success">
//                     <div
//                       className="spinner-border spinner-border-sm me-2 "
//                       role="status"
//                     ></div>
//                     Loading attendance data...
//                   </td>
//                 </tr>
//               ) : currentData.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-3">
//                     No records found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((item) => {
//                   const employee = getEmployeeDetails(item);
//                   return (
//                     <tr key={item.id}>
//                       <td>
//                         <div>
//                           <div
//                             className="employee-name-clickable fw-semibold"
//                             onClick={() =>
//                               handleEmployeeClick(
//                                 item.employee_id || item.employee?.id,
//                                 employee.employee_id,
//                                 employee.name
//                               )
//                             }
//                             title="Click to view monthly attendance"
//                           >
//                             {employee.name}
//                             <FaUser className="ms-1" size={12} />
//                           </div>
//                           <span
//                             className={`badge employee-type-badge ${
//                               employee.employee_type === "Permanent"
//                                 ? "bg-primary"
//                                 : "bg-warning text-dark"
//                             }`}
//                           >
//                             {employee.employee_type}
//                           </span>
//                           <br />
//                         </div>
//                       </td>
//                       <td>{new Date(item.date).toLocaleDateString()}</td>
//                       <td>
//                         <span
//                           className={`badge ${
//                             item.status === "Present"
//                               ? "bg-success"
//                               : item.status === "Absent"
//                               ? "bg-danger"
//                               : "bg-warning"
//                           }`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                       <td>
//                         {item.shift ? (
//                           <div className="shift-info">
//                             <div className="fw-semibold">
//                               {item.shift.title}
//                             </div>
//                             <small>
//                               {formatShiftTime(item.shift.start_time)} -{" "}
//                               {formatShiftTime(item.shift.end_time)}
//                             </small>
//                           </div>
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>{formatTime(item.clock_in)}</td>
//                       <td>{formatTime(item.early_leaving)}</td>
//                       <td>{formatTime(item.overtime)}</td>
//                       <td
//                         style={{
//                           width: "400px",
//                           whiteSpace: "normal",
//                           wordWrap: "break-word",
//                         }}
//                         className="reason-cell"
//                         title={item.reason}
//                       >
//                         {item.reason || "-"}
//                       </td>
//                       <td>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-info btn-sm me-2 square-btn"
//                             onClick={() => handleEdit(item)}
//                           >
//                             {/* <FaEdit /> */}
//                             <i className="bi bi-pencil-fill"></i>
//                           </button>
//                         </OverlayTrigger>

//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-danger btn-sm square-btn"
//                             onClick={() => handleDelete(item.id)}
//                           >
//                             <FaTrash />
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 gap-2">
//           <div className="small text-muted">
//             Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
//             {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>

//           <div>
//             <ul className="pagination pagination-sm mb-0">
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {Array.from({ length: totalPages }, (_, i) => (
//                 <li
//                   key={i + 1}
//                   className={`page-item ${
//                     currentPage === i + 1 ? "active" : ""
//                   }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(i + 1)}
//                   >
//                     {i + 1}
//                   </button>
//                 </li>
//               ))}

//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   disabled={currentPage === totalPages}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       <ToastContainer
//         position="top-end"
//         className="p-3"
//         style={{ zIndex: 9999 }}
//       >
//         <Toast
//           onClose={() => setToast({ ...toast, show: false })}
//           show={toast.show}
//           delay={3000}
//           autohide
//           bg={toast.bg}
//         >
//           <Toast.Body className="text-white fw-semibold">
//             {toast.message}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>

//       {/* Edit Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         size="md"
//       >
//         <Form onSubmit={handleModalSubmit}>
//           <Modal.Header closeButton>
//             <Modal.Title>Edit Attendance</Modal.Title>
//           </Modal.Header>

//           <Modal.Body>
//             {/* Employee */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Employee<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 value={getEmployeeName(currentRecord.employee_id)}
//                 readOnly
//               />
//             </Form.Group>

//             {/* Date */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Date<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={currentRecord.date || ""}
//                 onChange={handleModalChange}
//                 required
//               />
//             </Form.Group>

//             {/* Status */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Status<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="status"
//                 value={currentRecord.status || ""}
//                 onChange={handleModalChange}
//                 required
//               >
//                 <option value="Present">Present</option>
//                 <option value="Absent">Absent</option>
//                 <option value="Late">Late</option>
//                 <option value="Half Day">Half Day</option>
//                 <option value="On Leave">On Leave</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Clock In</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_hours"
//                     value={currentRecord.clock_in_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_in_minutes"
//                     value={currentRecord.clock_in_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>

//                   <Form.Select
//                     name="clock_in_seconds"
//                     value={currentRecord.clock_in_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Clock Out</Form.Label>
//               <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_hours"
//                     value={currentRecord.clock_out_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_minutes"
//                     value={currentRecord.clock_out_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="clock_out_seconds"
//                     value={currentRecord.clock_out_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Early Leaving</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_hours"
//                     value={currentRecord.early_leaving_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_minutes"
//                     value={currentRecord.early_leaving_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="early_leaving_seconds"
//                     value={currentRecord.early_leaving_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Overtime</Form.Label>
//               <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Hour
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_hours"
//                     value={currentRecord.overtime_hours}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("hours")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Minute
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_minutes"
//                     value={currentRecord.overtime_minutes}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("minutes")}
//                   </Form.Select>
//                 </div>
//                 <span className="time-separator  mt-4">:</span>
//                 <div className="d-flex flex-column w-100">
//                   <Form.Text className="text-muted d-block text-center">
//                     Second
//                   </Form.Text>
//                   <Form.Select
//                     name="overtime_seconds"
//                     value={currentRecord.overtime_seconds}
//                     onChange={handleModalChange}
//                   >
//                     {generateTimeOptions("seconds")}
//                   </Form.Select>
//                 </div>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label className="required-field">
//                 Reason<span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="reason"
//                 value={currentRecord.reason || ""}
//                 onChange={handleModalChange}
//                 placeholder="Enter reason for attendance modification..."
//                 required
//               />
//               <Form.Control.Feedback type="invalid">
//                 Please provide a reason for the attendance modification.
//               </Form.Control.Feedback>
//             </Form.Group>
//           </Modal.Body>

//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="success">
//               Update
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       {/* Employee Attendance Modal */}
//       <Modal
//         show={showEmployeeAttendanceModal}
//         onHide={handleCloseEmployeeAttendanceModal}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <FaUser className="me-2" />
//             {selectedEmployee?.name} - Monthly Attendance
//           </Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           {employeeAttendanceLoading ? (
//             <div className="text-center py-4">
//               <div className="spinner-border text-success" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p className="mt-2">Loading attendance data...</p>
//             </div>
//           ) : employeeAttendance.length === 0 ? (
//             <div className="text-center py-4">
//               <FaCalendarAlt size={48} className="text-muted mb-3" />
//               <p>No attendance records found for this employee.</p>
//             </div>
//           ) : (
//             <>
//               {/* Enhanced Calendar Grid */}
//               <div className="calendar-grid">
//                 {/* Headers */}
//                 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//                   (day) => (
//                     <div
//                       key={day}
//                       className="calendar-day-header text-center text-muted small fw-bold"
//                     >
//                       {day}
//                     </div>
//                   )
//                 )}

//                 {/* Calendar Days */}
//                 {employeeAttendance.map((record) => {
//                   const date = new Date(record.date);
//                   const dayOfWeek = date.getDay();
//                   const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//                   const clockInTime = formatTime(record.clock_in);
//                   const earlyLeavingTime = formatTime(record.early_leaving);
//                   const overtimeTime = formatTime(record.overtime);
//                   const shiftName = record.shift?.title || "-";
//                   const shiftTime = record.shift
//                     ? `${formatShiftTime(
//                         record.shift.start_time
//                       )}-${formatShiftTime(record.shift.end_time)}`
//                     : "";

//                   return (
//                     <div
//                       key={record.date}
//                       className={`calendar-day ${isWeekend ? "weekend" : ""} ${
//                         record.status === "Absent" ? "absent-day" : ""
//                       }`}
//                     >
//                       <div className="calendar-day-number">
//                         {formatDisplayDate(record.date)}
//                       </div>
//                       <div className="calendar-day-header small text-muted">
//                         {getDayName(record.date)}
//                       </div>

//                       {/* Status Badge */}
//                       <Badge
//                         bg={getStatusBadge(record.status)}
//                         className="calendar-status mb-1"
//                       >
//                         {record.status}
//                       </Badge>

//                       {/* Shift Information */}
//                       {shiftName !== "-" && (
//                         <div className="small text-primary mt-1 fw-semibold">
//                           {shiftName}
//                         </div>
//                       )}
//                       {shiftTime && (
//                         <div className="small text-muted">{shiftTime}</div>
//                       )}

//                       {/* Clock In Time */}
//                       {clockInTime !== "-" && (
//                         <div className="small text-success mt-1 time-info-item">
//                           <FaClock size={10} />
//                           <strong>In:</strong> {clockInTime}
//                         </div>
//                       )}

//                       {/* Early Leaving */}
//                       {earlyLeavingTime !== "-" && (
//                         <div className="small text-warning mt-1 time-info-item">
//                           <FaSignOutAlt size={10} />
//                           <strong>Early:</strong> {earlyLeavingTime}
//                         </div>
//                       )}

//                       {/* Overtime */}
//                       {overtimeTime !== "-" && (
//                         <div className="small text-info mt-1 time-info-item">
//                           <FaBusinessTime size={10} />
//                           <strong>OT:</strong> {overtimeTime}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Enhanced Summary */}
//               {/* <Row className="mt-4">
//                 <Col md={4}>
//                   <Card className="summary-card">
//                     <Card.Body className="text-center py-3">
//                       <h5 className="mb-1">{employeeAttendance.length}</h5>
//                       <small>Total Records</small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 <Col md={4}>
//                   <Card className="border-0 bg-light">
//                     <Card.Body className="text-center py-3">
//                       <h6 className="mb-1 text-dark">Period</h6>
//                       <small className="text-muted">
//                         {employeeAttendance[0]?.date} to{" "}
//                         {
//                           employeeAttendance[employeeAttendance.length - 1]
//                             ?.date
//                         }
//                       </small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 <Col md={4}>
//                   <Card className="border-0 bg-success text-white">
//                     <Card.Body className="text-center py-3">
//                       <h6 className="mb-1">Present Days</h6>
//                       <small>
//                         {
//                           employeeAttendance.filter(
//                             (record) => record.status === "Present"
//                           ).length
//                         }{" "}
//                         days
//                       </small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               </Row> */}
//                <Row className="mt-4">
//                 <Col md={4}>
//                   <Card className="summary-card">
//                     <Card.Body className="text-center py-3">
//                       <h5 className="mb-1">{employeeAttendance.length}</h5>
//                       <small>Total Records</small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 <Col md={4}>
//                   <Card className="attendance-summary-card bg-danger text-white">
//                     <Card.Body className="text-center py-3">
//                       <h5 className="mb-1">
//                         {
//                           employeeAttendance.filter(
//                             (record) => record.status === "Absent"
//                           ).length
//                         }
//                       </h5>
//                       <small>Total Absent</small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 <Col md={4}>
//                   <Card className="attendance-summary-card bg-success text-white">
//                     <Card.Body className="text-center py-3">
//                       <h5 className="mb-1">
//                         {
//                           employeeAttendance.filter(
//                             (record) => record.status === "Present"
//                           ).length
//                         }
//                       </h5>
//                       <small>Present Days</small>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//                 {/* <Col md={3}>
//                   <Card className="attendance-summary-card bg-light">
//                     <Card.Body className="text-center py-3">
//                       <h6 className="mb-1 text-dark">Period</h6>
//                       <small className="text-muted">
//                         {formatPeriodDisplay(employeeAttendance)}
//                       </small>
//                     </Card.Body>
//                   </Card>
//                 </Col> */}
//               </Row>
//             </>
//           )}
//         </Modal.Body>

//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={handleCloseEmployeeAttendanceModal}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default AttendanceList;

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
  Row,
  Col,
  Card,
  Badge,
  Container, // Add this import
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../../components/BreadCrumb";
import {
  getBranches,
  getDepartments,
  getEmployees,
} from "../../../services/hrmService";
import attendanceService from "../../../services/attendanceService";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaBusinessTime,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showEmployeeAttendanceModal, setShowEmployeeAttendanceModal] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [employeeAttendanceLoading, setEmployeeAttendanceLoading] =
    useState(false);

  const [filters, setFilters] = useState({
    type: "Monthly",
    month: new Date().toISOString().slice(0, 7),
    date: new Date().toISOString().slice(0, 10),
    branch_id: "",
    department_id: "",
    employee_type: "",
    search: "",
  });

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentRecord, setCurrentRecord] = useState({
    id: null,
    employee_id: "",
    date: "",
    status: "Present",
    clock_in_hours: "00",
    clock_in_minutes: "00",
    clock_in_seconds: "00",
    clock_out_hours: "00",
    clock_out_minutes: "00",
    clock_out_seconds: "00",
    late_hours: "00",
    late_minutes: "00",
    late_seconds: "00",
    early_leaving_hours: "00",
    early_leaving_minutes: "00",
    early_leaving_seconds: "00",
    overtime_hours: "00",
    overtime_minutes: "00",
    overtime_seconds: "00",
    total_rest: 0,
    reason: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, bg: type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 700);
  };

  const handleCloseEmployeeAttendanceModal = () => {
    setShowEmployeeAttendanceModal(false);
    setSelectedEmployee(null);
    setEmployeeAttendance([]);
  };

  useEffect(() => {
    loadInitialData();
    loadAttendance();
  }, []);

  useEffect(() => {
    if (filters.employee_type) {
      loadAttendance();
    }
  }, [filters.employee_type]);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceData]);

  const loadInitialData = async () => {
    try {
      const [branchesData, departmentsData, employeesData] = await Promise.all([
        getBranches(),
        getDepartments(),
        getEmployees(),
      ]);

      setBranches(branchesData);

      let departmentsList = [];
      if (Array.isArray(departmentsData)) {
        departmentsList = departmentsData;
      } else if (departmentsData && Array.isArray(departmentsData.data)) {
        departmentsList = departmentsData.data;
      } else if (
        departmentsData &&
        departmentsData.success &&
        Array.isArray(departmentsData.data)
      ) {
        departmentsList = departmentsData.data;
      }

      setDepartments(departmentsList);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.employee_type) {
        params.employee_type = filters.employee_type;
      }

      const response = await attendanceService.getAll(params);
      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        console.error("Failed to load attendance:", response.data.message);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeAttendance = async (
    employeeId,
    employeeCode,
    month = null
  ) => {
    setEmployeeAttendanceLoading(true);
    try {
      const params = {};

      if (month) {
        const [yearPart, monthPart] = month.split("-");
        params.month = parseInt(monthPart);
        params.year = parseInt(yearPart);
      } else {
        const now = new Date();
        params.month = now.getMonth() + 1;
        params.year = now.getFullYear();
      }

      console.log("Loading employee attendance:", {
        employeeCode,
        params,
      });

      const response = await attendanceService.getEmployeeAttendanceSummary(
        employeeCode,
        params
      );

      if (response.data && response.data.success) {
        setEmployeeAttendance(response.data.data);
        console.log(
          "Employee attendance loaded:",
          response.data.data.length,
          "records"
        );
      } else {
        console.error(
          "Failed to load employee attendance:",
          response.data?.message
        );
        setEmployeeAttendance([]);
        showToast("No attendance records found for this employee", "warning");
      }
    } catch (error) {
      console.error("Error loading employee attendance:", error);
      setEmployeeAttendance([]);
      showToast("Error loading employee attendance data", "danger");
    } finally {
      setEmployeeAttendanceLoading(false);
    }
  };

  const handleEmployeeClick = async (
    employeeId,
    employeeCode,
    employeeName
  ) => {
    console.log("Employee clicked:", {
      employeeId,
      employeeCode,
      employeeName,
    });

    setSelectedEmployee({
      id: employeeId,
      code: employeeCode,
      name: employeeName,
    });

    const selectedMonth =
      filters.type === "Monthly"
        ? filters.month
        : new Date().toISOString().slice(0, 7);

    console.log("Loading attendance for month:", selectedMonth);

    await loadEmployeeAttendance(employeeId, employeeCode, selectedMonth);
    setShowEmployeeAttendanceModal(true);
  };

  const getEmployeeType = (employeeId) => {
    const employee = employees.find((emp) => emp.id == employeeId);
    return employee?.employee_type || "Permanent";
  };

  const getFilteredDepartments = () => {
    if (!filters.branch_id) return departments;

    const branchEmployees = employees.filter(
      (emp) => emp.branch_id == filters.branch_id
    );

    const departmentIds = [
      ...new Set(branchEmployees.map((emp) => emp.department_id)),
    ];

    return departments.filter(
      (dept) =>
        departmentIds.includes(dept.id) || dept.branch_id == filters.branch_id
    );
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    if (filters.branch_id) {
      filtered = filtered.filter(
        (item) => item.employee?.branch_id == filters.branch_id
      );
    }

    if (filters.department_id) {
      filtered = filtered.filter(
        (item) => item.employee?.department_id == filters.department_id
      );
    }

    if (filters.type === "Monthly" && filters.month) {
      filtered = filtered.filter(
        (item) => item.date.slice(0, 7) === filters.month
      );
    } else if (filters.type === "Daily" && filters.date) {
      filtered = filtered.filter((item) => item.date === filters.date);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.employee?.name?.toLowerCase().includes(searchLower) ||
          item.employee?.employee_id?.toLowerCase().includes(searchLower) ||
          item.status?.toLowerCase().includes(searchLower) ||
          item.reason?.toLowerCase().includes(searchLower) ||
          item.shift?.title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
  };

  const getBranchName = (branchId) => {
    if (!branchId) return "No Branch";
    const branch = branches.find((b) => b.id == branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "No Department";
    const department = departments.find((d) => d.id == departmentId);
    return department ? department.name : `Department ${departmentId}`;
  };

  const getShiftName = (shift) => {
    if (!shift) return "No Shift";
    return shift.title || `Shift ${shift.id}`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      if (name === "branch_id") {
        return {
          ...prev,
          [name]: value,
          department_id: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleRefresh = () => {
    loadAttendance();
    setFilters({
      type: "Monthly",
      month: new Date().toISOString().slice(0, 7),
      date: new Date().toISOString().slice(0, 10),
      branch_id: "",
      department_id: "",
      employee_type: "",
      search: "",
    });
  };

  const handleSearch = () => {
    loadAttendance();
  };

  const parseTimeString = (timeString) => {
    if (!timeString || timeString === "00:00:00") {
      return { hours: "00", minutes: "00", seconds: "00" };
    }

    const timeOnly = timeString.includes(" ")
      ? timeString.split(" ")[1]
      : timeString;
    const [hours = "00", minutes = "00", seconds = "00"] = timeOnly.split(":");

    return {
      hours: hours.padStart(2, "0"),
      minutes: minutes.padStart(2, "0"),
      seconds: seconds.padStart(2, "0"),
    };
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);

    const clockInTime = parseTimeString(record.clock_in);
    const clockOutTime = parseTimeString(record.clock_out);
    const lateTime = parseTimeString(record.late);
    const earlyLeavingTime = parseTimeString(record.early_leaving);
    const overtimeTime = parseTimeString(record.overtime);

    const employeeId = record.employee_id || record.employee?.id;

    console.log("Extracted employee ID:", employeeId);

    setCurrentRecord({
      id: record.id,
      employee_id: employeeId,
      date: record.date,
      status: record.status || "Present",
      clock_in_hours: clockInTime.hours,
      clock_in_minutes: clockInTime.minutes,
      clock_in_seconds: clockInTime.seconds,
      clock_out_hours: clockOutTime.hours,
      clock_out_minutes: clockOutTime.minutes,
      clock_out_seconds: clockOutTime.seconds,
      late_hours: lateTime.hours,
      late_minutes: lateTime.minutes,
      late_seconds: lateTime.seconds,
      early_leaving_hours: earlyLeavingTime.hours,
      early_leaving_minutes: earlyLeavingTime.minutes,
      early_leaving_seconds: earlyLeavingTime.seconds,
      overtime_hours: overtimeTime.hours,
      overtime_minutes: overtimeTime.minutes,
      overtime_seconds: overtimeTime.seconds,
      total_rest: record.total_rest || 0,
      reason: record.reason || "",
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
                  await attendanceService.delete(id);
                  onClose();
                  showToast(
                    "Attendance record deleted successfully!",
                    "success"
                  );
                  loadAttendance();
                } catch (error) {
                  console.error("Delete failed:", error);
                  onClose();
                  showToast("Failed to delete attendance record!", "danger");
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

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord((prev) => ({ ...prev, [name]: value }));
  };

  // Debug function for API calls
  const debugAPICall = (endpoint, data, employeeCode) => {
    console.log(`🔍 API Call to: ${endpoint}`);
    console.log("📤 Request Data:", data);
    console.log("👤 Employee Code:", employeeCode);
    console.log("📅 Date:", currentRecord.date);
    console.log("---");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("=== Starting Update ===");
      console.log("Current Record:", currentRecord);

      if (!currentRecord.employee_id) {
        throw new Error("Employee ID is missing from the record");
      }

      // Combine time components into HH:MM:SS format
      const clock_in = `${currentRecord.clock_in_hours}:${currentRecord.clock_in_minutes}:${currentRecord.clock_in_seconds}`;
      const clock_out = `${currentRecord.clock_out_hours}:${currentRecord.clock_out_minutes}:${currentRecord.clock_out_seconds}`;
      const late = `${currentRecord.late_hours}:${currentRecord.late_minutes}:${currentRecord.late_seconds}`;
      const early_leaving = `${currentRecord.early_leaving_hours}:${currentRecord.early_leaving_minutes}:${currentRecord.early_leaving_seconds}`;
      const overtime = `${currentRecord.overtime_hours}:${currentRecord.overtime_minutes}:${currentRecord.overtime_seconds}`;

      console.log("Formatted times:", {
        clock_in,
        clock_out,
        late,
        early_leaving,
        overtime,
      });

      const employee = employees.find(
        (emp) => emp.id == currentRecord.employee_id
      );

      console.log("Found employee:", employee);

      if (!employee) {
        throw new Error(
          `Employee not found. Looking for ID: ${currentRecord.employee_id}`
        );
      }

      const employeeCode = employee.employee_id;
      let successCount = 0;

      // Update early leaving if clock_out time is provided
      if (clock_out && clock_out !== "00:00:00") {
        try {
          console.log("Updating early leaving for employee:", employeeCode);

          const earlyLeavingData = {
            date: currentRecord.date,
            clock_out: `${currentRecord.date} ${clock_out}`,
            reason: currentRecord.reason || "Updated via attendance edit",
          };

          debugAPICall("early-leaving", earlyLeavingData, employeeCode);

          const response = await attendanceService.updateEarlyLeaving(
            employeeCode,
            earlyLeavingData
          );
          console.log("Early leaving update response:", response.data);
          successCount++;
        } catch (error) {
          console.error("Failed to update early leaving:", error);

          if (error.response?.status === 400) {
            const errorMsg =
              error.response.data?.message || "Invalid data for early leaving";
            console.warn("Early leaving validation failed:", errorMsg);
            successCount++;
          } else if (error.response?.status === 404) {
            console.warn(
              "Employee or attendance record not found for early leaving"
            );
            successCount++;
          } else {
            console.error("Unexpected error updating early leaving:", error);
            successCount++;
          }
        }
      } else {
        successCount++;
      }

      // Update overtime if changed
      if (overtime && overtime !== "00:00:00") {
        try {
          console.log("Updating overtime for employee code:", employeeCode);

          const overtimeData = {
            date: currentRecord.date,
            overtime: overtime,
            reason: currentRecord.reason || "Updated via attendance edit",
          };

          debugAPICall("overtime", overtimeData, employeeCode);

          await attendanceService.updateOvertime(employeeCode, overtimeData);
          console.log("Overtime updated successfully");
          successCount++;
        } catch (error) {
          console.error("Failed to update overtime:", error);

          if (error.response?.status === 400) {
            console.warn(
              "Overtime validation failed, continuing with other updates"
            );
            successCount++;
          } else if (error.response?.status === 404) {
            console.warn(
              "Employee or attendance record not found for overtime"
            );
            successCount++;
          } else {
            console.error("Unexpected error updating overtime:", error);
            successCount++;
          }
        }
      } else {
        successCount++;
      }

      // Update main attendance record
      try {
        const mainUpdateData = {
          date: currentRecord.date,
          status: currentRecord.status,
          clock_in:
            clock_in !== "00:00:00"
              ? `${currentRecord.date} ${clock_in}`
              : null,
          clock_out:
            clock_out !== "00:00:00"
              ? `${currentRecord.date} ${clock_out}`
              : null,
          late: late !== "00:00:00" ? late : "00:00:00",
          total_rest: parseInt(currentRecord.total_rest) || 0,
          reason: currentRecord.reason || null,
        };

        console.log(
          "Updating main attendance for record ID:",
          currentRecord.id
        );
        console.log("Main update data:", mainUpdateData);

        await attendanceService.update(currentRecord.id, mainUpdateData);
        console.log("Main attendance updated successfully");
        successCount++;
      } catch (error) {
        console.error("Failed to update main attendance:", error);
        if (error.response?.status === 404) {
          console.warn(
            "Attendance record not found, it might have been deleted"
          );
        } else {
          throw error;
        }
      }

      // Success - close modal and show toast
      if (successCount > 0) {
        setIsClosing(true);
        setTimeout(() => {
          setShowModal(false);
          setIsClosing(false);
          showToast("Attendance updated successfully!", "success");
          loadAttendance();
        }, 700);
      } else {
        throw new Error("All update operations failed");
      }
    } catch (error) {
      console.error("Update failed:", error);

      let errorMessage = "Failed to update attendance!";

      if (error.response?.status === 404) {
        errorMessage =
          "Attendance record not found. Please refresh and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid data provided.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.data?.details) {
        errorMessage += ` Details: ${JSON.stringify(
          error.response.data.details
        )}`;
      }

      showToast(errorMessage, "danger");
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "00:00:00") return "-";
    if (timeString.includes(" ")) {
      const timePart = timeString.split(" ")[1];
      return timePart.slice(0, 5); // Remove seconds for cleaner display
    }
    return timeString.slice(0, 5); // Remove seconds for cleaner display
  };

  const formatShiftTime = (timeString) => {
    if (!timeString) return "-";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  const getEmployeeDetails = (attendanceRecord) => {
    if (attendanceRecord.employee) {
      const employee = attendanceRecord.employee;
      const employeeType = getEmployeeType(employee.id);

      return {
        name: employee.name || "Unknown",
        employee_id: employee.employee_id || "N/A",
        employee_type: employeeType,
        branch_name: getBranchName(employee.branch_id),
        department_name: getDepartmentName(employee.department_id),
      };
    }

    const employee = employees.find(
      (emp) => emp.id === attendanceRecord.employee_id
    );
    if (employee) {
      const employeeType = employee.employee_type || "Permanent";

      return {
        name: employee.name || "Unknown",
        employee_id: employee.employee_id || "N/A",
        employee_type: employeeType,
        branch_name: getBranchName(employee.branch_id),
        department_name: getDepartmentName(employee.department_id),
      };
    }

    return {
      name: "Unknown",
      employee_id: "N/A",
      employee_type: "Permanent",
      branch_name: "Unknown Branch",
      department_name: "Unknown Department",
    };
  };

  const getEmployeeName = (employeeId) => {
    const attendanceRecord = attendanceData.find(
      (item) => item.employee_id === employeeId
    );
    if (attendanceRecord?.employee?.name) {
      return attendanceRecord.employee.name;
    }
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "Unknown";
  };

  const generateTimeOptions = (type) => {
    const options = [];
    const max = type === "hours" ? 23 : 59;

    for (let i = 0; i <= max; i++) {
      const value = i.toString().padStart(2, "0");
      options.push(
        <option key={value} value={value}>
          {value}
        </option>
      );
    }
    return options;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "success";
      case "Absent":
        return "danger";
      case "Late":
        return "warning";
      case "Half Day":
        return "info";
      case "On Leave":
        return "secondary";
      default:
        return "light";
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Add this helper function to format period display
  const formatPeriodDisplay = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return "No records";
    }

    // Sort records by date to get the correct range
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const startDate = new Date(sortedRecords[0].date);
    const endDate = new Date(sortedRecords[sortedRecords.length - 1].date);

    // Format dates as DD/MM/YYYY
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
        
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
        
        .btn-pink { 
          background-color: #f5365c; 
          color: #fff; 
          border: none;
        }
        .btn-pink:hover {
          background-color: #e43156;
          color: #fff;
        }
        .btn-pink:active,
        .btn-pink:focus {
          background-color: #f5365c !important;
          box-shadow: none !important;
        }

        .btn-brown { 
          background-color: #563d7c; 
          color: #fff;
          border: none;
        }
        .btn-brown:hover {
          background-color: #4a366c;
          color: #fff;
        }

        .square-btn {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 16px;
          border-radius: 6px;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
        }
        
        .employee-type-badge {
          font-size: 0.75em;
          padding: 0.25em 0.5em;
        }

        .time-select-group {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .time-select-group select {
          flex: 1;
        }
        .time-separator {
          font-weight: bold;
          color: #666;
        }
        .reason-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shift-info {
          font-size: 0.8em;
          color: #666;
        }
        
        .employee-name-clickable {
          cursor: pointer;
          color: #007bff;
          text-decoration: none;
          transition: color 0.2s;
        }
        .employee-name-clickable:hover {
          color: #0056b3;
          text-decoration: underline;
        }
        
        /* Enhanced Calendar Grid Styles */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-top: 15px;
        }
        
        .calendar-day {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          min-height: 140px;
          background: white;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .calendar-day:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .calendar-day.weekend {
          background-color: #f8f9fa;
        }
        
        .calendar-day.absent-day {
          background-color: #fff5f5;
          border-color: #e55353;
        }
        
        .calendar-day-header {
          font-weight: 600;
          font-size: 0.8em;
          margin-bottom: 4px;
          color: #495057;
        }
        
        .calendar-day-number {
          font-size: 1.1em;
          font-weight: bold;
          margin-bottom: 4px;
          color: #2c3e50;
        }
        
        .calendar-status {
          font-size: 0.7em;
          padding: 3px 8px;
          border-radius: 12px;
          margin-bottom: 5px;
        }
        
        .calendar-day .small {
          font-size: 0.7em;
          line-height: 1.2;
        }
        
        .calendar-day .text-success {
          color: #28a745 !important;
        }
        
        .calendar-day .text-warning {
          color: #ffc107 !important;
        }
        
        .calendar-day .text-info {
          color: #17a2b8 !important;
        }
        
        .calendar-day .text-primary {
          color: #007bff !important;
        }
        
        .calendar-day .text-muted {
          color: #6c757d !important;
        }
        
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }
        
        .summary-card .card-body {
          padding: 1rem;
        }
        
        .time-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 2px;
        }

        .attendance-summary-card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>

      <h4 className="fw-semibold">Manage Attendance List</h4>
      <BreadCrumb pathname={location.pathname} onNavigate={navigate} />

      {/* Filters Section */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="row align-items-end g-3">
          <div className="col-md-2">
            <label className="form-label fw-bold d-block mb-2">Type</label>
            <div className="d-flex rounded-pill bg-light p-1 gap-1">
              <div
                className={`flex-fill text-center py-1 rounded-pill ${
                  filters.type === "Monthly"
                    ? "bg-success text-white fw-semibold"
                    : "text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleTypeChange("Monthly")}
              >
                Monthly
              </div>
              <div
                className={`flex-fill text-center py-1 rounded-pill ${
                  filters.type === "Daily"
                    ? "bg-success text-white fw-semibold"
                    : "text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleTypeChange("Daily")}
              >
                Daily
              </div>
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">
              {filters.type === "Monthly" ? "Month" : "Date"}
            </label>
            {filters.type === "Monthly" ? (
              <input
                type="month"
                className="form-control"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
              />
            ) : (
              <input
                type="date"
                className="form-control"
                name="date"
                value={filters.date || ""}
                onChange={handleFilterChange}
              />
            )}
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Site</label>
            <select
              className="form-select"
              name="branch_id"
              value={filters.branch_id}
              onChange={handleFilterChange}
            >
              <option value="">Select Site</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Department</label>
            <select
              className="form-select"
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
            >
              <option value="">Select Department</option>
              {getFilteredDepartments().map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Employee Type</label>
            <select
              className="form-select"
              name="employee_type"
              value={filters.employee_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Permanent">Permanent</option>
              <option value="Contractual">Contractual</option>
            </select>
          </div>

          <div className="col-md-2 d-flex gap-2 justify-content-end">
            <OverlayTrigger placement="top" overlay={<Tooltip>Apply</Tooltip>}>
              <button
                className="btn btn-success square-btn"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>Reset</Tooltip>}>
              <button
                className="btn btn-pink square-btn"
                onClick={handleRefresh}
              >
                <FaSyncAlt />
              </button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>Import</Tooltip>}>
              <button className="btn btn-brown square-btn">
                <FaFileExport />
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </div>

      {/* Combined Entries + Search + Table + Pagination */}
      <div className="bg-white p-3 mb-4 rounded shadow-sm mt-3">
        {/* Entries & Search */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              className=""
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex align-items-center">
            <input
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              name="search"
              placeholder="Search..."
              className="form-control form-control-sm"
              style={{ maxWidth: "200px" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Shift</th>
                <th>Clock In</th>
                <th>Early Leaving</th>
                <th>Overtime</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-3 text-success">
                    <div
                      className="spinner-border spinner-border-sm me-2 "
                      role="status"
                    ></div>
                    Loading attendance data...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-3">
                    No records found.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => {
                  const employee = getEmployeeDetails(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div
                            className="employee-name-clickable fw-semibold"
                            onClick={() =>
                              handleEmployeeClick(
                                item.employee_id || item.employee?.id,
                                employee.employee_id,
                                employee.name
                              )
                            }
                            title="Click to view monthly attendance"
                          >
                            {employee.name}
                            <FaUser className="ms-1" size={12} />
                          </div>
                          <span
                            className={`badge employee-type-badge ${
                              employee.employee_type === "Permanent"
                                ? "bg-primary"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {employee.employee_type}
                          </span>
                          <br />
                        </div>
                      </td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "Present"
                              ? "bg-success"
                              : item.status === "Absent"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.shift ? (
                          <div className="shift-info">
                            <div className="fw-semibold">
                              {item.shift.title}
                            </div>
                            <small>
                              {formatShiftTime(item.shift.start_time)} -{" "}
                              {formatShiftTime(item.shift.end_time)}
                            </small>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{formatTime(item.clock_in)}</td>
                      <td>{formatTime(item.early_leaving)}</td>
                      <td>{formatTime(item.overtime)}</td>
                      <td
                        style={{
                          width: "400px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                        className="reason-cell"
                        title={item.reason}
                      >
                        {item.reason || "-"}
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <button
                            className="btn btn-info btn-sm me-2 square-btn"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                        </OverlayTrigger>

                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <button
                            className="btn btn-danger btn-sm square-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 gap-2">
          <div className="small text-muted">
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>

          <div>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i + 1}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
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
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
          bg={toast.bg}
        >
          <Toast.Body className="text-white fw-semibold">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
        size="md"
      >
        <Form onSubmit={handleModalSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Attendance</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Employee */}
            <Form.Group className="mb-3">
              <Form.Label>
                Employee<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={getEmployeeName(currentRecord.employee_id)}
                readOnly
              />
            </Form.Group>

            {/* Date */}
            <Form.Group className="mb-3">
              <Form.Label>
                Date<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={currentRecord.date || ""}
                onChange={handleModalChange}
                required
              />
            </Form.Group>

            {/* Status */}
            <Form.Group className="mb-3">
              <Form.Label>
                Status<span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="status"
                value={currentRecord.status || ""}
                onChange={handleModalChange}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Clock In</Form.Label>
              <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Hour
                  </Form.Text>
                  <Form.Select
                    name="clock_in_hours"
                    value={currentRecord.clock_in_hours}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("hours")}
                  </Form.Select>
                </div>
                <span className="time-separator mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Minute
                  </Form.Text>
                  <Form.Select
                    name="clock_in_minutes"
                    value={currentRecord.clock_in_minutes}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("minutes")}
                  </Form.Select>
                </div>
                <span className="time-separator mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Second
                  </Form.Text>

                  <Form.Select
                    name="clock_in_seconds"
                    value={currentRecord.clock_in_seconds}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("seconds")}
                  </Form.Select>
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Clock Out</Form.Label>
              <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Hour
                  </Form.Text>
                  <Form.Select
                    name="clock_out_hours"
                    value={currentRecord.clock_out_hours}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("hours")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Minute
                  </Form.Text>
                  <Form.Select
                    name="clock_out_minutes"
                    value={currentRecord.clock_out_minutes}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("minutes")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Second
                  </Form.Text>
                  <Form.Select
                    name="clock_out_seconds"
                    value={currentRecord.clock_out_seconds}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("seconds")}
                  </Form.Select>
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Early Leaving</Form.Label>
              <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Hour
                  </Form.Text>
                  <Form.Select
                    name="early_leaving_hours"
                    value={currentRecord.early_leaving_hours}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("hours")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Minute
                  </Form.Text>
                  <Form.Select
                    name="early_leaving_minutes"
                    value={currentRecord.early_leaving_minutes}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("minutes")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Second
                  </Form.Text>
                  <Form.Select
                    name="early_leaving_seconds"
                    value={currentRecord.early_leaving_seconds}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("seconds")}
                  </Form.Select>
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Overtime</Form.Label>
              <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Hour
                  </Form.Text>
                  <Form.Select
                    name="overtime_hours"
                    value={currentRecord.overtime_hours}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("hours")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Minute
                  </Form.Text>
                  <Form.Select
                    name="overtime_minutes"
                    value={currentRecord.overtime_minutes}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("minutes")}
                  </Form.Select>
                </div>
                <span className="time-separator  mt-4">:</span>
                <div className="d-flex flex-column w-100">
                  <Form.Text className="text-muted d-block text-center">
                    Second
                  </Form.Text>
                  <Form.Select
                    name="overtime_seconds"
                    value={currentRecord.overtime_seconds}
                    onChange={handleModalChange}
                  >
                    {generateTimeOptions("seconds")}
                  </Form.Select>
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="required-field">
                Reason<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={currentRecord.reason || ""}
                onChange={handleModalChange}
                placeholder="Enter reason for attendance modification..."
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a reason for the attendance modification.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Employee Attendance Modal */}
      <Modal
        show={showEmployeeAttendanceModal}
        onHide={handleCloseEmployeeAttendanceModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="align-items-center">
          <Container fluid>
            <Row className="align-items-center w-100">
              <Col md={9}>
                <Modal.Title>
                  <FaUser className="me-2" />
                  {selectedEmployee?.name} - Monthly Attendance
                </Modal.Title>
              </Col>

              <Col md={3}>
                <Card className="attendance-summary-card bg-light mb-0">
                  <Card.Body className="text-center py-2">
                    <h6 className="mb-1 text-dark">Month</h6>
                    <small className="text-muted">
                      {formatPeriodDisplay(employeeAttendance)}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Modal.Header>

        <Modal.Body>
          {employeeAttendanceLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading attendance data...</p>
            </div>
          ) : employeeAttendance.length === 0 ? (
            <div className="text-center py-4">
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <p>No attendance records found for this employee.</p>
            </div>
          ) : (
            <>
              {/* Enhanced Calendar Grid */}
              <div className="calendar-grid">
                {/* Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="calendar-day-header text-center text-muted small fw-bold"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar Days */}
                {employeeAttendance.map((record) => {
                  const date = new Date(record.date);
                  const dayOfWeek = date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  const clockInTime = formatTime(record.clock_in);
                  const earlyLeavingTime = formatTime(record.early_leaving);
                  const overtimeTime = formatTime(record.overtime);
                  const shiftName = record.shift?.title || "-";
                  const shiftTime = record.shift
                    ? `${formatShiftTime(
                        record.shift.start_time
                      )}-${formatShiftTime(record.shift.end_time)}`
                    : "";

                  return (
                    <div
                      key={record.date}
                      className={`calendar-day ${isWeekend ? "weekend" : ""} ${
                        record.status === "Absent" ? "absent-day" : ""
                      }`}
                    >
                      <div className="calendar-day-number">
                        {formatDisplayDate(record.date)}
                      </div>
                      <div className="calendar-day-header small text-muted">
                        {getDayName(record.date)}
                      </div>

                      {/* Status Badge */}
                      <Badge
                        bg={getStatusBadge(record.status)}
                        className="calendar-status mb-1"
                      >
                        {record.status}
                      </Badge>

                      {/* Shift Information */}
                      {shiftName !== "-" && (
                        <div className="small text-primary mt-1 fw-semibold">
                          {shiftName}
                        </div>
                      )}
                      {shiftTime && (
                        <div className="small text-muted">{shiftTime}</div>
                      )}

                      {/* Clock In Time */}
                      {clockInTime !== "-" && (
                        <div className="small text-success mt-1 time-info-item">
                          <FaClock size={10} />
                          <strong>In:</strong> {clockInTime}
                        </div>
                      )}

                      {/* Early Leaving */}
                      {earlyLeavingTime !== "-" && (
                        <div className="small text-warning mt-1 time-info-item">
                          <FaSignOutAlt size={10} />
                          <strong>Early:</strong> {earlyLeavingTime}
                        </div>
                      )}

                      {/* Overtime */}
                      {overtimeTime !== "-" && (
                        <div className="small text-info mt-1 time-info-item">
                          <FaBusinessTime size={10} />
                          <strong>OT:</strong> {overtimeTime}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Summary */}
              <Row className="mt-4">
                <Col md={4}>
                  <Card className="summary-card">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1">{employeeAttendance.length}</h5>
                      <small>Total Records</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="attendance-summary-card bg-danger text-white">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1">
                        {
                          employeeAttendance.filter(
                            (record) => record.status === "Absent"
                          ).length
                        }
                      </h5>
                      <small>Total Absent</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="attendance-summary-card bg-success text-white">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1">
                        {
                          employeeAttendance.filter(
                            (record) => record.status === "Present"
                          ).length
                        }
                      </h5>
                      <small>Present Days</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseEmployeeAttendanceModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceList;
