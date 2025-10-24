// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Alert, Button, Card, Row, Col, Image } from "react-bootstrap";
// import {
//   getEmployeeById,
//   getEmployeeDocuments,
// } from "../../../services/hrmService";
// import branchService from "../../../services/branchService";
// import departmentService from "../../../services/departmentService";
// import designationService from "../../../services/designationService";
// import { getEmployeeByEmployeeId } from "../../../services/hrmService";
// import BreadCrumb from "../../../components/BreadCrumb";
// import { Dropdown, ButtonGroup } from "react-bootstrap";
// import { PencilSquare } from "react-bootstrap-icons";

// const EmployeeDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const BASE_URL = import.meta.env.VITE_BASE_URL;
//   const [employee, setEmployee] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [empData, docsData, branchRes, deptRes, desigRes] =
//           await Promise.all([
//             getEmployeeByEmployeeId(id), // Use the new function

//             getEmployeeDocuments(id),
//             branchService.getAll(),
//             departmentService.getAll(),
//             designationService.getAll(),
//           ]);

//         setEmployee(empData);
//         setDocuments(docsData || []);
//         setBranches(branchRes || []);
//         setDepartments(deptRes || []);
//         setDesignations(desigRes || []);
//       } catch (error) {
//         console.error("Error loading employee details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id]);

//   const getNameById = (list, id) => {
//     const match = list.find((item) => String(item.id) === String(id));
//     return match?.name || "-";
//   };

//   if (!employee) {
//     return <div className="container mt-4"></div>;
//   }

//   const headerStyle = {
//     display: "flex",
//     alignItems: "center",
//     fontWeight: "600",
//     fontSize: "18px",
//     position: "relative",
//     marginBottom: "8px",
//   };

//   const verticalBar = {
//     width: "4px",
//     height: "30px",
//     backgroundColor: "#6FD943",
//     borderRadius: "0 3px 3px 0",
//     marginRight: "10px",
//     marginLeft: "-26px", // move bar to the very left edge of the card
//   };

//   const renderCardHeader = (title) => (
//     <div style={headerStyle}>
//       <div style={verticalBar}></div>
//       {title}
//     </div>
//   );

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="fw-bold">Employee Details</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <div className="d-flex gap-2">
//           <Dropdown as={ButtonGroup}>
//             <Dropdown.Toggle
//               variant="white"
//               className="text-success border"
//               style={{ borderColor: "#6FD943" }}
//             >
//               {" "}
//               Joining Letter
//             </Dropdown.Toggle>
//             <Dropdown.Menu>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> PDF
//               </Dropdown.Item>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> DOC
//               </Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//           <Dropdown as={ButtonGroup}>
//             <Dropdown.Toggle
//               variant="white"
//               className="text-success border"
//               style={{ borderColor: "#6FD943" }}
//             >
//               {" "}
//               Experience Certificate
//             </Dropdown.Toggle>
//             <Dropdown.Menu>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> PDF
//               </Dropdown.Item>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> DOC
//               </Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//           <Dropdown as={ButtonGroup}>
//             <Dropdown.Toggle
//               variant="white"
//               className="text-success border"
//               style={{ borderColor: "#46ea00ff" }}
//             >
//               {" "}
//               NOC
//             </Dropdown.Toggle>
//             <Dropdown.Menu>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> PDF
//               </Dropdown.Item>
//               <Dropdown.Item href="#">
//                 <i className="bi bi-download me-2"></i> DOC
//               </Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//           <Button
//             className="border-0 px-2 d-flex justify-content-center align-items-center"
//             style={{
//               backgroundColor: "#3EC9D6",
//               color: "#fff",
//               height: "40px",
//               width: "40px",
//             }}
//             onClick={() => navigate(`/employees/edit/${id}`)}
//           >
//             <i className="bi bi-pencil fs-6"></i>
//           </Button>
//         </div>
//       </div>

//       <Row className="g-4">
//         {/* Personal Detail */}
//         <Col md={6}>
//           <Card
//             style={{ width: "100%", minHeight: "238px" }}
//             className="shadow-sm"
//           >
//             <Card.Body>
//               {renderCardHeader("Personal Details")}
//               <hr />
//               <Row>
//                 <Col md={6}>
//                   <DetailRow label="Employee ID" value={employee.employee_id} />
//                   <DetailRow label="Phone" value={employee.phone} />
//                   <DetailRow label="Date of Birth" value={employee.dob} />
//                   <DetailRow
//                     label="Aadhaar Number"
//                     value={employee.aadhaar_number}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <DetailRow label="Name" value={employee.name} />
//                   <DetailRow label="Email" value={employee.email} />
//                   <DetailRow label="Address" value={employee.address} />
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Company Detail */}
//         <Col md={6}>
//           <Card
//             style={{ width: "100%", minHeight: "238px" }}
//             className="shadow-sm"
//           >
//             <Card.Body>
//               {renderCardHeader("Company Details")}
//               <hr />
//               <Row>
//                 <Col md={6}>
//                   <DetailRow
//                     label="Branch"
//                     value={
//                       employee.branch?.name ||
//                       getNameById(branches, employee.branch_id)
//                     }
//                   />
//                   <DetailRow
//                     label="Department"
//                     value={
//                       employee.department?.name ||
//                       getNameById(departments, employee.department_id)
//                     }
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <DetailRow
//                     label="Designation"
//                     value={
//                       employee.designation?.name ||
//                       getNameById(designations, employee.designation_id)
//                     }
//                   />
//                   <DetailRow
//                     label="Date of Joining"
//                     value={employee.company_doj}
//                   />
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Document Detail */}
//         {/* Document Detail */}
//         <Col md={6}>
//           <Card
//             style={{
//               width: "100%",
//               minHeight: "240px",
//               overflow: "hidden",
//             }}
//             className="shadow-sm"
//           >
//             <Card.Body
//               style={{
//                 maxHeight: "240px", // ✅ Limit height of inner content
//                 overflowY: "auto", // ✅ Enable vertical scroll
//                 scrollbarWidth: "thin", // ✅ For Firefox (thin scrollbar)
//               }}
//             >
//               {renderCardHeader("Document Details")}
//               <hr />
//               <Row>
//                 {documents.length > 0 ? (
//                   documents.map((doc) => {
//                     const correctUrl = doc.document_value.startsWith("http")
//                       ? doc.document_value
//                       : `${BASE_URL}/uploads/misc/${doc.document_value}`;

//                     const finalUrl = correctUrl
//                       .replace(/%5B/gi, "[")
//                       .replace(/%5D/gi, "]");

//                     return (
//                       <Col key={doc.id} md={6} className="mb-3">
//                         <p style={{ fontWeight: "bold" }}>
//                           {doc.document?.name || "Unknown Document"} :
//                           <a
//                             href={finalUrl}
//                             target="_blank"
//                             rel="noreferrer"
//                             style={{ color: "green", marginLeft: "5px" }}
//                           >
//                             View
//                           </a>
//                         </p>
//                       </Col>
//                     );
//                   })
//                 ) : (
//                   <Alert variant="info">No documents available.</Alert>
//                 )}
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Bank Account Detail */}
//         <Col md={6}>
//           <Card
//             style={{ width: "100%", minHeight: "238px" }}
//             className="shadow-sm"
//           >
//             <Card.Body>
//               {renderCardHeader("Bank Account Details")}
//               <hr />
//               <Row>
//                 <Col md={6}>
//                   <DetailRow
//                     label="Account Holder Name"
//                     value={employee.account_holder_name}
//                   />
//                   <DetailRow label="Bank Name" value={employee.bank_name} />
//                   <DetailRow
//                     label="Branch Location"
//                     value={employee.branch_location}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <DetailRow
//                     label="Account Number"
//                     value={employee.account_number}
//                   />
//                   <DetailRow
//                     label="Bank Identifier Code"
//                     value={employee.bank_identifier_code}
//                   />
//                   <DetailRow
//                     label="Tax Payer Id"
//                     value={employee.tax_payer_id}
//                   />
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// // ✅ Reusable component for bold label + normal value
// const DetailRow = ({ label, value }) => (
//   <p style={{ marginBottom: "10px" }}>
//     <span style={{ fontWeight: "bold" }}>{label}: </span>
//     <span>{value || "-"}</span>
//   </p>
// );

// export default EmployeeDetail;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Row, Col, Image } from "react-bootstrap";
import {
  getEmployeeById,
  getEmployeeDocuments,
} from "../../../services/hrmService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import { getEmployeeByEmployeeId } from "../../../services/hrmService";
import BreadCrumb from "../../../components/BreadCrumb";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import { PencilSquare } from "react-bootstrap-icons";

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, docsData, branchRes, deptRes, desigRes] =
          await Promise.all([
            getEmployeeByEmployeeId(id), // Use the new function

            getEmployeeDocuments(id),
            branchService.getAll(),
            departmentService.getAll(),
            designationService.getAll(),
          ]);

        setEmployee(empData);
        setDocuments(docsData || []);
        setBranches(branchRes || []);
        setDepartments(deptRes || []);
        setDesignations(desigRes || []);
      } catch (error) {
        console.error("Error loading employee details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getNameById = (list, id) => {
    const match = list.find((item) => String(item.id) === String(id));
    return match?.name || "-";
  };

  if (!employee) {
    return <div className="container mt-4"></div>;
  }

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
    fontSize: "18px",
    position: "relative",
    marginBottom: "8px",
  };

  const verticalBar = {
    width: "4px",
    height: "30px",
    backgroundColor: "#6FD943",
    borderRadius: "0 3px 3px 0",
    marginRight: "10px",
    marginLeft: "-26px", // move bar to the very left edge of the card
  };

  const renderCardHeader = (title) => (
    <div style={headerStyle}>
      <div style={verticalBar}></div>
      {title}
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Employee Details</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <div className="d-flex gap-2">
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#6FD943" }}
            >
              {" "}
              Joining Letter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#6FD943" }}
            >
              {" "}
              Experience Certificate
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#46ea00ff" }}
            >
              {" "}
              NOC
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            className="border-0 px-2 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: "#3EC9D6",
              color: "#fff",
              height: "40px",
              width: "40px",
            }}
            onClick={() => navigate(`/employees/edit/${id}`)}
          >
            <i className="bi bi-pencil fs-6"></i>
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Personal Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Personal Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow label="Employee ID" value={employee.employee_id} />
                  <DetailRow label="Phone" value={employee.phone} />
                  <DetailRow label="Date of Birth" value={employee.dob} />
                  <DetailRow
                    label="Aadhaar Number"
                    value={employee.aadhaar_number}
                  />
                  {/* NEW FIELDS */}
                  <DetailRow
                    label="Father's Name"
                    value={employee.father_name}
                  />
                  <DetailRow label="UAN Number" value={employee.uan_number} />
                </Col>
                <Col md={6}>
                  <DetailRow label="Name" value={employee.name} />
                  <DetailRow label="Email" value={employee.email} />
                  <DetailRow label="Address" value={employee.address} />
                  {/* NEW FIELDS */}
                  <DetailRow label="IP Number" value={employee.ip_number} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Company Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Company Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow
                    label="Site"
                    value={
                      employee.branch?.name ||
                      getNameById(branches, employee.branch_id)
                    }
                  />
                  <DetailRow
                    label="Department"
                    value={
                      employee.department?.name ||
                      getNameById(departments, employee.department_id)
                    }
                  />
                  {/* NEW FIELD */}
                  <DetailRow label="Skills" value={employee.skills} />
                </Col>
                <Col md={6}>
                  <DetailRow
                    label="Designation"
                    value={
                      employee.designation?.name ||
                      getNameById(designations, employee.designation_id)
                    }
                  />
                  <DetailRow
                    label="Date of Joining"
                    value={employee.company_doj}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Document Detail */}
        <Col md={6}>
          <Card
            style={{
              width: "100%",
              minHeight: "270px",
              overflow: "hidden",
            }}
            className="shadow-sm"
          >
            <Card.Body
              style={{
                maxHeight: "270px", // ✅ Limit height of inner content
                overflowY: "auto", // ✅ Enable vertical scroll
                scrollbarWidth: "thin", // ✅ For Firefox (thin scrollbar)
              }}
            >
              {renderCardHeader("Document Details")}
              <hr />
              <Row>
                {documents.length > 0 ? (
                  documents.map((doc) => {
                    const correctUrl = doc.document_value.startsWith("http")
                      ? doc.document_value
                      : `${BASE_URL}/uploads/misc/${doc.document_value}`;

                    const finalUrl = correctUrl
                      .replace(/%5B/gi, "[")
                      .replace(/%5D/gi, "]");

                    return (
                      <Col key={doc.id} md={6} className="mb-3">
                        <p style={{ fontWeight: "bold" }}>
                          {doc.document?.name || "Unknown Document"} :
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "green", marginLeft: "5px" }}
                          >
                            View
                          </a>
                        </p>
                      </Col>
                    );
                  })
                ) : (
                  <Alert variant="info">No documents available.</Alert>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Bank Account Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Bank Account Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow
                    label="Account Holder Name"
                    value={employee.account_holder_name}
                  />
                  <DetailRow label="Bank Name" value={employee.bank_name} />
                  <DetailRow
                    label="Site Location"
                    value={employee.branch_location}
                  />
                </Col>
                <Col md={6}>
                  <DetailRow
                    label="Account Number"
                    value={employee.account_number}
                  />
                  <DetailRow
                    label="Bank Identifier Code"
                    value={employee.bank_identifier_code}
                  />
                  <DetailRow
                    label="Tax Payer Id"
                    value={employee.tax_payer_id}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ✅ Reusable component for bold label + normal value
const DetailRow = ({ label, value }) => (
  <p style={{ marginBottom: "10px" }}>
    <span style={{ fontWeight: "bold" }}>{label}: </span>
    <span>{value || "-"}</span>
  </p>
);

export default EmployeeDetail;
