// import React, { useEffect, useState } from "react";
// import { Table, Button, Input, Select, Card, Row, Col } from "antd";
// import { Spinner } from "react-bootstrap";
// import { Form } from "react-bootstrap";
// import { EyeOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import apiClient from "../../../../services/apiClient";
// import "antd/dist/reset.css";
// import "./SetSalaryList.css";
// import BreadCrumb from "../../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import payslipTypeService from "../../../../services/paysliptypeService"; // Import payslip type service

// const { Option } = Select;

// const payrollTypeMap = {
//   1: "Monthly",
// };

// const SetSalaryList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const navigate = useNavigate();
//   const [payslipTypes, setPayslipTypes] = useState([]); // State for payslip types

//   // Fetch payslip types on component mount
//   useEffect(() => {
//     const fetchPayslipTypes = async () => {
//       try {
//         const data = await payslipTypeService.getAll();
//         console.log("Payslip Types Data:", data);
//         setPayslipTypes(data || []);
//       } catch (err) {
//         console.error("Error loading payslip types:", err);
//       }
//     };

//     fetchPayslipTypes();
//   }, []);

//   // Function to get payslip type name by ID
//   const getPayslipTypeName = (payslipTypeId) => {
//     if (!payslipTypeId) return "Not Set";
    
//     // First check the existing payrollTypeMap
//     if (payrollTypeMap[payslipTypeId]) {
//       return payrollTypeMap[payslipTypeId];
//     }
    
//     // Then check the fetched payslip types
//     const payslipType = payslipTypes.find(
//       (type) => type.id?.toString() === payslipTypeId.toString()
//     );

//     return payslipType?.name || `Type ${payslipTypeId}`;
//   };

//   useEffect(() => {
//     const fetchEmployeesWithNetSalary = async () => {
//       try {
//         setLoading(true);

//         // 1) Fetch employees
//         const response = await apiClient.get("/employees");
//         const employeesData = Array.isArray(response.data?.data)
//           ? response.data.data
//           : [];

//         // 2) Fetch net salary for each employee (correct endpoint!)
//         const employeesWithNet = await Promise.all(
//           employeesData.map(async (emp) => {
//             try {
//               const netRes = await apiClient.get(
//                 `/set-salary/${emp.employee_id}/net-salary`
//               );

//               const netSalary =
//                 netRes.data?.data?.breakdown?.totals?.net ?? emp.salary;

//               return {
//                 ...emp,
//                 salary_type_name: getPayslipTypeName(emp.salary_type), // Use the new function
//                 net_salary: netSalary,
//               };
//             } catch (err) {
//               console.error(
//                 `? Failed to fetch net salary for employee ${emp.employee_id}`,
//                 err
//               );
//               return {
//                 ...emp,
//                 salary_type_name: getPayslipTypeName(emp.salary_type), // Use the new function
//                 net_salary: emp.salary, // fallback
//               };
//             }
//           })
//         );

//         setEmployees(employeesWithNet);
//       } catch (error) {
//         console.error("? Failed to fetch employees", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployeesWithNetSalary();
//   }, [payslipTypes]); // Add payslipTypes as dependency

//   const formatCurrency = (value) => {
//     if (!value || isNaN(value)) return "? 0.00";
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(value);
//   };

//   const filteredData = employees.filter((emp) =>
//     emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const pageCount = Math.ceil(filteredData.length / entriesPerPage);

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   const columns = [
//     {
//       title: "EMPLOYEE ID",
//       dataIndex: "employee_id",
//       render: (id, record) => (
//         <div
//           className="px-3 py-1 border border-success rounded cursor-pointer"
//           style={{
//              color: "#77db4d",
//             fontWeight: 500,
//             display: "inline-block",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.backgroundColor = "#28a745";
//             e.currentTarget.style.color = "white";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.backgroundColor = "";
//             e.currentTarget.style.color = "#77db4d";
//           }}
//           onClick={() =>
//             navigate(`/payroll/set-salary/${record.employee_id || record.id}`)
//           }
//         >
//           {id
//             ? `#EMP${String(id).padStart(5, "0")}`
//             : `#EMP${String(record.id).padStart(5, "0")}`}
//         </div>
//       ),
//     },
//     {
//       title: "NAME",
//       dataIndex: "name",
//       render: (text) => text || "-",
//     },
//     {
//       title: "PAYROLL TYPE",
//       dataIndex: "salary_type_name",
//       render: (text) => text,
//     },
//     {
//       title: "SALARY",
//       dataIndex: "salary",
//       render: (value) => formatCurrency(value),
//     },
//     {
//       title: "NET SALARY",
//       dataIndex: "net_salary",
//       render: (value) => formatCurrency(value),
//     },
//     {
//       title: "ACTION",
//       render: (_, record) => (
//         <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
//           <Button
//             shape="circle"
//             icon={<EyeOutlined />}
//             style={{
//               backgroundColor: "#ffa500",
//               border: "none",
//               color: "white",
//             }}
//             onClick={() =>
//               navigate(`/payroll/set-salary/${record.employee_id || record.id}`)
//             }
//           />
//         </OverlayTrigger>
//       ),
//     },
//   ];

//   return (
//     <Card className="salary-list-card" bordered={false}>
//       <div className="pb-2">
//         <h2 className="page-title ">Manage Employee Salary</h2>

//         <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//       </div>
//         <>
//           {/* Controls - Updated to match your example */}
//           <div className="d-flex justify-content-between align-items-center ">
//             <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
//               <select
//                 className="form-select me-2 "
//                 value={entriesPerPage}
//                 onChange={(e) => {
//                   setEntriesPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 style={{ width: "80px", height: "40px" }}
//               >
//                 {/* <option value={5}>5</option> */}
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
             
//             </div>

//             <input
//               className="form-control form-control-sm  w-auto ms-auto"
//               type="text"
//               placeholder="Search by name..."
//               style={{ maxWidth: "250px", margin: "0px" }}
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>

//           {/* Table */}
//           <div
//             className="responsive-table  table table-hover mb-0 table-striped "
//             style={{ marginTop: "16px" }}
//           >
//              {loading ? (
//                         <div className="text-center py-5 d-flex justify-content-center align-items-center" style={{height:"40vh"}}>
//                           <Spinner animation="border" variant="success" />
//                         </div>
//                       ) : (
//             <Table
//               rowKey="id"
//               columns={columns}
//               dataSource={paginatedData}
//               pagination={false}
//               bordered
//               size="middle"
//               scroll={{ x: "max-content" }}
//               table-striped
//             />)}
//           </div>

//           {/* Footer */}
//           <div className="d-flex justify-content-between align-items-center mt-2">
//             <div className="small text-muted ">
//               Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
//               {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
//               {filteredData.length} entries
//             </div>
//             <div>
//               <ul className="pagination pagination-sm mb-0">
//                 <li
//                   className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                   >
//                     «
//                   </button>
//                 </li>
//                 {Array.from({ length: pageCount }, (_, i) => (
//                   <li
//                     key={i + 1}
//                     className={`page-item ${
//                       currentPage === i + 1 ? "active" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage(i + 1)}
//                     >
//                       {i + 1}
//                     </button>
//                   </li>
//                 ))}
//                 <li
//                   className={`page-item ${
//                     currentPage === pageCount ? "disabled" : ""
//                   }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                   >
//                     »
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </>

//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
//     </Card>
//   );
// };

// export default SetSalaryList;

import React, { useEffect, useState } from "react";
import { Table, Button, Input, Select, Card, Row, Col } from "antd";
import { Spinner } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/apiClient";
import "antd/dist/reset.css";
import "./SetSalaryList.css";
import BreadCrumb from "../../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import payslipTypeService from "../../../../services/paysliptypeService"; 
const { Option } = Select;

const payrollTypeMap = {
  1: "Monthly",
};

const SetSalaryList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [payslipTypes, setPayslipTypes] = useState([]); // State for payslip types

  // Fetch payslip types on component mount
  useEffect(() => {
    const fetchPayslipTypes = async () => {
      try {
        const data = await payslipTypeService.getAll();
        console.log("Payslip Types Data:", data);
        setPayslipTypes(data || []);
      } catch (err) {
        console.error("Error loading payslip types:", err);
      }
    };

    fetchPayslipTypes();
  }, []);

  // Function to get payslip type name by ID
  const getPayslipTypeName = (payslipTypeId) => {
    if (!payslipTypeId) return "Not Set";
    
    // First check the existing payrollTypeMap
    if (payrollTypeMap[payslipTypeId]) {
      return payrollTypeMap[payslipTypeId];
    }
    
    // Then check the fetched payslip types
    const payslipType = payslipTypes.find(
      (type) => type.id?.toString() === payslipTypeId.toString()
    );

    return payslipType?.name || `Type ${payslipTypeId}`;
  };

  useEffect(() => {
    const fetchEmployeesWithNetSalary = async () => {
      try {
        setLoading(true);

        // 1) Fetch employees
        const response = await apiClient.get("/employees");
        const employeesData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // 2) Fetch net salary for each employee (correct endpoint!)
        const employeesWithNet = await Promise.all(
          employeesData.map(async (emp) => {
            try {
              const netRes = await apiClient.get(
                `/set-salary/${emp.employee_id}/net-salary`
              );

              const netSalary =
                netRes.data?.data?.breakdown?.totals?.net ?? emp.salary;

              return {
                ...emp,
                salary_type_name: getPayslipTypeName(emp.salary_type), // Use the new function
                net_salary: netSalary,
              };
            } catch (err) {
              console.error(
                `? Failed to fetch net salary for employee ${emp.employee_id}`,
                err
              );
              return {
                ...emp,
                salary_type_name: getPayslipTypeName(emp.salary_type), // Use the new function
                net_salary: emp.salary, // fallback
              };
            }
          })
        );

        setEmployees(employeesWithNet);
      } catch (error) {
        console.error("? Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesWithNetSalary();
  }, [payslipTypes]); // Add payslipTypes as dependency

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return " 0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const filteredData = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const pageCount = Math.ceil(filteredData.length / entriesPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const columns = [
    {
      title: "EMPLOYEE ID",
      dataIndex: "employee_id",
      render: (id, record) => (
        <div
          className="px-3 py-1 border border-success rounded cursor-pointer"
          style={{
             color: "#77db4d",
            fontWeight: 500,
            display: "inline-block",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "#77db4d";
          }}
          onClick={() =>
            navigate(`/payroll/set-salary/${record.employee_id || record.id}`)
          }
        >
          {id
            ? `#EMP${String(id).padStart(5, "0")}`
            : `#EMP${String(record.id).padStart(5, "0")}`}
        </div>
      ),
    },
    {
      title: "NAME",
      dataIndex: "name",
      render: (text) => text || "-",
    },
    {
      title: "PAYROLL TYPE",
      dataIndex: "salary_type_name",
      render: (text) => text,
    },
    {
      title: "SALARY",
      dataIndex: "salary",
      render: (value) => formatCurrency(value),
    },
    {
      title: "NET SALARY",
      dataIndex: "net_salary",
      render: (value) => formatCurrency(value),
    },
    {
      title: "ACTION",
      render: (_, record) => (
        <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
          <Button
            shape="circle"
            icon={<EyeOutlined />}
            style={{
              backgroundColor: "#ffa500",
              border: "none",
              color: "white",
            }}
            onClick={() =>
              navigate(`/payroll/set-salary/${record.employee_id || record.id}`)
            }
          />
        </OverlayTrigger>
      ),
    },
  ];

  return (
    <Card className="salary-list-card" bordered={false}>
      <div className="pb-2">
        <h2 className="page-title ">Manage Employee Salary</h2>

        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>
        <>
          {/* Controls - Updated to match your example */}
          <div className="d-flex justify-content-between align-items-center ">
            <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
              <select
                className="form-select me-2 "
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: "80px", height: "40px" }}
              >
                {/* <option value={5}>5</option> */}
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
             
            </div>

            <input
              className="form-control form-control-sm  w-auto ms-auto"
              type="text"
              placeholder="Search by name..."
              style={{ maxWidth: "250px", margin: "0px" }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Table */}
          <div
            className="responsive-table  table table-hover mb-0 table-striped "
            style={{ marginTop: "16px" }}
          >
             {loading ? (
                        <div className="text-center py-5 d-flex justify-content-center align-items-center" style={{height:"40vh"}}>
                          <Spinner animation="border" variant="success" />
                        </div>
                      ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: "max-content" }}
              table-striped
            />)}
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="small text-muted ">
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
                  >
                    «
                  </button>
                </li>
                {Array.from({ length: pageCount }, (_, i) => (
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
        </>

      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
    </Card>
  );
};

export default SetSalaryList;