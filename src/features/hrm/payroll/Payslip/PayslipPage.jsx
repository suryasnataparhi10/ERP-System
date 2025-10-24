import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import salaryService from "../../../../services/salaryService";
import { getEmployeeByEmployeeId } from "../../../../services/hrmService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import PayslipModal from "./PayslipModal";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { Dropdown, ButtonGroup } from "react-bootstrap";
import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import "./payslip.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return dateString; // Return original string if parsing fails
  }
};

const PayslipPage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState("2025");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // keep all data

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewPayslipModal, setViewPayslipModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [bulkPaymentLoading, setBulkPaymentLoading] = useState(false);

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const years = ["2023", "2024", "2025", "2026"];

  const monthNumber = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  const getCurrentMonthName = () => {
    const newDate = new Date().getMonth();
    return months[newDate];
  };

  const [month, setMonth] = useState(getCurrentMonthName);

  const fetchPayslips = async () => {
    try {
      const res = await salaryService.getPayslips();
      if (res.success) {
        // Enhanced: Fetch employee details for each payslip
        const formattedWithJoiningDate = await Promise.all(
          res.data.map(async (p) => {
            const employee = p.employee || {};
            const employeeId = employee.employee_id || p.employee_id;

            let joiningDate = null;

            // Fetch employee details to get joining date
            if (employeeId) {
              try {
                // CORRECTED: Use the actual response variable name
                const empData = await getEmployeeByEmployeeId(employeeId);

                // Check if empData exists and has the joining date
                if (empData) {
                  // Try different possible field names for joining date
                  joiningDate =
                    empData.company_doj ||
                    empData.joining_date ||
                    empData.date_of_joining ||
                    null;
                }
              } catch (error) {
                console.warn(
                  `Could not fetch joining date for employee ${employeeId}:`,
                  error
                );
              }
            }

            // Extract calculation breakdown data
            const calculation = p.calculation_breakdown || {};
            const deductions = calculation.deductions || {};
            const additions = calculation.additions || {};

            return {
              ...p,
              id: employeeId
                ? `#EMP${String(employeeId).padStart(5, "0")}`
                : "N/A",
              rawId: employeeId,
              name: employee.name || "N/A",
              position: employee.designation?.name || "-",
              joining_date: joiningDate, // Add joining date here
              salaryDate: p.salary_month,
              payrollType: p.payslipType?.name || "Monthly",
              salary: Number(p.basic_salary || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              netSalary: Number(p.net_payble || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              status: p.status === "paid" ? "Paid" : "Unpaid",
              salarySlip: p.payslip_no || "-",
              branch: employee.branch?.name || "-",
              department: employee.department?.name || "-",
              createdAt: p.created_at,

              // Basic salary fields
              basic_salary: p.basic_salary,

              // Addition fields
              allowance: p.allowance,
              commission: p.commission,
              other_payment: p.other_payment,
              overtime: p.overtime,

              // Deduction fields
              loan: p.loan,
              saturation_deduction: p.saturation_deduction,
              advance_payment: p.advance_payment,
              leave_deduction: p.leave_deduction,

              // Complete calculation breakdown
              calculation_breakdown: {
                base_salary: calculation.base_salary,
                additions: {
                  allowances: additions.allowances,
                  commissions: additions.commissions,
                  other_payments: additions.other_payments,
                  overtime: additions.overtime,
                  total_additions: additions.total_additions,
                },
                deductions: {
                  loans: deductions.loans,
                  saturation_deductions: deductions.saturation_deductions,
                  advances: deductions.advances,
                  leave_deduction: deductions.leave_deduction,
                  breakdown: deductions.breakdown || [],
                  total_deductions: deductions.total_deductions,
                },
                gross_salary: calculation.gross_salary,
                net_payable: calculation.net_payable,
              },

              // Leave details
              leave_details: p.leave_details || {},
            };
          })
        );

        // ? Sort employees by employee_id (ascending)
        const sortedData = formattedWithJoiningDate.sort(
          (a, b) => (a.rawId || 0) - (b.rawId || 0)
        );

        setAllEmployees(sortedData);
        setEmployees(sortedData);
      }
    } catch (err) {
      console.error("Error fetching payslips:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchPayslips;
  useEffect(() => {
    fetchPayslips();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, search, entries]);

  const handleGeneratePayslip = async () => {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`; // e.g. "2025-09"

    // ? If data exists, proceed with generating payslips
    const data = {
      month: selectedMonth,
      year: year,
      branch_ids: [],
    };

    try {
      setLoading(true);
      const res = await salaryService.bulkGeneratePayslips(data);

      if (res.success) {
        toast.success(`Payslip generated successfully for ${month} ${year}`, {
          position: "top-right",
        });

        await fetchPayslips();
        closeModal();
      } else {
        toast.danger("Failed to generate payslip", { position: "top-right" });
      }
    } catch (err) {
      toast.error("Something went wrong while generating payslips", {
        position: "top-right",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPayment = async () => {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    // Get unpaid payslips for current filter
    const unpaidPayslips = filteredEmployees.filter(
      (emp) => emp.status === "Unpaid" || emp.status === "unpaid"
    );

    if (unpaidPayslips.length === 0) {
      toast.info(
        <div>
          <strong>No Unpaid Payslips</strong>
          <br />
          <small>
            All payslips for {month} {year} are already paid.
          </small>
        </div>,
        { icon: false }
      );
      return;
    }

    // Calculate total amount
    const totalAmount = unpaidPayslips.reduce((sum, emp) => {
      // Extract numeric value from currency string
      const amountStr = emp.netSalary.replace(/[^\d.-]/g, "");
      return sum + parseFloat(amountStr || 0);
    }, 0);

    // Custom confirmation modal
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#28a745" }}>💰</div>
          <h4 className="fw-bold mt-2">Process Bulk Payment?</h4>
          <div className="my-3 p-3 bg-light rounded">
            <p className="mb-1">
              <strong>Period:</strong> {month} {year}
            </p>
            <p className="mb-1">
              <strong>Payslips to pay:</strong> {unpaidPayslips.length}
            </p>
            <p className="mb-0">
              <strong>Total Amount:</strong> ?
              {totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <p>This will mark all unpaid payslips as paid. Continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-secondary me-2 px-4" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                onClose();
                await processBulkPayment();
              }}
            >
              Process Payment
            </button>
          </div>
        </div>
      ),
    });

    const processBulkPayment = async () => {
      try {
        setBulkPaymentLoading(true);

        const paymentData = {
          month: selectedMonth,
          year: year,
          payment_mode: "bank_transfer",
          remarks: `Bulk payment processed on ${new Date().toLocaleDateString()}`,
        };

        const res = await salaryService.bulkPayment(paymentData);

        if (res.success) {
          toast.success(
            <div>
              <strong>? Payment Processed Successfully</strong>
              <br />
              <small>{res.message}</small>
              {res.salary_deduction_info && (
                <>
                  <br />
                  <small>
                    <strong>Amount:</strong> ?
                    {res.salary_deduction_info.total_amount?.toLocaleString(
                      "en-IN"
                    )}
                  </small>
                </>
              )}
            </div>,
            { icon: false, autoClose: 6000 }
          );

          // Refresh data
          fetchPayslips();
        } else {
          throw new Error(res.message || "Payment failed");
        }
      } catch (error) {
        console.error("Bulk payment error:", error);
        toast.error(
          <div>
            <strong>? Payment Failed</strong>
            <br />
            <small>
              {error.response?.data?.message ||
                error.message ||
                "Please try again"}
            </small>
          </div>,
          { icon: false, autoClose: 5000 }
        );
      } finally {
        setBulkPaymentLoading(false);
      }
    };
  };

  const filteredEmployees = React.useMemo(() => {
    // If no month selected, return empty array
    if (!month) return [];

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    // First filter by month/year
    const monthFiltered = allEmployees.filter(
      (emp) =>
        emp.salaryDate?.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    // Then apply search filter
    return monthFiltered.filter(
      (emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [allEmployees, month, year, search]);

  const generateExcel = () => {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    if (monthEmployees.length === 0) {
      return alert(`No payslip data for ${month} ${year}`);
    }

    // 1) gather deduction keys in desired order (ensure PT/TDS/PF come first if present)
    const deductionKeySet = new Set();
    // preferred order for common deduction fields
    const preferred = [
      "PT",
      "TDS",
      "PF",
      "LOAN",
      "ADVANCE PAYMENT",
      "LEAVE DEDUCTION",
    ];

    // first add preferred keys so they appear first (if later present)
    preferred.forEach((k) => deductionKeySet.add(k));

    // scan employees to collect any other dynamic deduction keys (keep insertion order)
    monthEmployees.forEach((emp) => {
      // add main deduction keys if they exist and not already added
      if (emp.loan > 0) deductionKeySet.add("LOAN");
      if (emp.advance_payment > 0) deductionKeySet.add("ADVANCE PAYMENT");
      if (emp.leave_deduction > 0) deductionKeySet.add("LEAVE DEDUCTION");

      // add breakdown names from calculation_breakdown
      emp.calculation_breakdown?.deductions?.breakdown?.forEach((d) => {
        const name = String(d.name || "").toUpperCase();
        if (name) deductionKeySet.add(name);
      });
    });

    // convert Set to array but remove any preferred keys that aren't actually present.
    const allDeductionKeys = Array.from(deductionKeySet).filter((k) => {
      // keep the key if at least one employee has it (check quickly)
      return monthEmployees.some((emp) => {
        if (["LOAN", "ADVANCE PAYMENT", "LEAVE DEDUCTION"].includes(k)) {
          if (k === "LOAN") return emp.loan > 0;
          if (k === "ADVANCE PAYMENT") return emp.advance_payment > 0;
          if (k === "LEAVE DEDUCTION") return emp.leave_deduction > 0;
        }
        // check breakdown
        return !!emp.calculation_breakdown?.deductions?.breakdown?.some(
          (d) => String(d.name || "").toUpperCase() === k
        );
      });
    });

    // 2) create header order (fixed columns + dynamic deduction columns + totals)
    const headers = [
      "EMPLOYEE ID",
      "NAME",
      "PAYROLL TYPE",
      "BASIC SALARY",
      "ALLOWANCE",
      "COMMISSION",
      "OTHER PAYMENT",
      "OVERTIME",
      ...allDeductionKeys, // <-- these will appear BEFORE TOTAL DEDUCTIONS
      "TOTAL DEDUCTIONS",
      "GROSS SALARY",
      "NET SALARY",
      "STATUS",
      "CREATED AT",
    ];

    // 3) build rows consistently (ensure keys match headers)
    const rows = monthEmployees.map((emp) => {
      // build row object with all header keys (missing keys -> 0 or empty)
      const row = {
        "EMPLOYEE ID": emp.id,
        NAME: emp.name,
        "PAYROLL TYPE": emp.payrollType,
        "BASIC SALARY": emp.basic_salary ?? 0,
        ALLOWANCE: emp.allowance ?? 0,
        COMMISSION: emp.commission ?? 0,
        "OTHER PAYMENT": emp.other_payment ?? 0,
        OVERTIME: emp.overtime ?? 0,
        // TOTAL DEDUCTIONS and others filled later
      };

      // fill dynamic deduction values
      // first main ones mapped to our normalized names
      if ((emp.loan ?? 0) > 0) row["LOAN"] = emp.loan;
      if ((emp.advance_payment ?? 0) > 0)
        row["ADVANCE PAYMENT"] = emp.advance_payment;
      if ((emp.leave_deduction ?? 0) > 0)
        row["LEAVE DEDUCTION"] = emp.leave_deduction;

      // fill breakdown deductions
      emp.calculation_breakdown?.deductions?.breakdown?.forEach((d) => {
        const name = String(d.name || "").toUpperCase();
        row[name] = d.amount ?? 0;
      });

      // ensure every deduction header key exists on the row (avoid undefined cells)
      allDeductionKeys.forEach((k) => {
        if (row[k] === undefined) row[k] = 0;
      });

      row["TOTAL DEDUCTIONS"] =
        emp.calculation_breakdown?.deductions?.total_deductions ?? 0;
      row["GROSS SALARY"] = emp.calculation_breakdown?.gross_salary ?? 0;
      row["NET SALARY"] = emp.netSalary ?? 0;
      row["STATUS"] = emp.status ?? "";
      row["CREATED AT"] = emp.createdAt
        ? new Date(emp.createdAt).toLocaleString()
        : "";

      return row;
    });

    // 4) create worksheet forcing header order
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Payslips_${month}_${year}`
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Payslip_${month}_${year}.xlsx`);
  };

  const generatePDF = async () => {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    if (monthEmployees.length === 0) {
      alert(`No payslip data for ${month} ${year}`);
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    document.body.appendChild(tempContainer);

    for (let i = 0; i < monthEmployees.length; i++) {
      const emp = monthEmployees[i];

      const payslipDiv = document.createElement("div");
      payslipDiv.className = "payslip-layout";

      payslipDiv.innerHTML = `
<div style="width: 700px; margin: 20px auto; font-family: Arial, sans-serif; border: 1px solid black; padding: 0px 10px;">
  <h3 style="text-align: center; border-bottom: 1px solid black; margin: 0; padding: 10px 0px;">Venkateswar Engineering Works</h3>
  <h4 style="text-align: center; border-bottom: 1px solid black; margin: 5px 0 10px 0; padding: 10px 0px;">Salary Slip for ${month} ${year}</h4>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
    <tr>
      <td style="width: 50%; padding: 4px;"><strong>Name : ${
        emp.name
      }</strong></td>
      <td style="width: 50%; padding: 4px;"><strong>Department :  ${
        emp.department
      }</strong></td>
    </tr>
    <tr>
      <td style="padding: 4px;"><strong>Emp. No :  ${emp.id}</strong></td>
      <td style="padding: 4px;"><strong>Site Name : ${emp.branch}</strong></td>
    </tr>
    <tr>
      <td style="padding: 4px;"><strong>Designation : ${
        emp.position
      }</strong></td>
      <td style="padding: 4px;"><strong>Date of Joining : ${formatDate(
        emp.company_doj || emp.joining_date
      )}</strong></td>
    </tr>
  </table>

  <!-- EARNINGS TABLE -->
  <table style="width: 100%; border-collapse: collapse; ">
    <thead>
      <tr>
        <th style=" padding: 6px; background: #f2f2f2; text-align: start;">Earnings</th>
        <th style=" padding: 6px; background: #f2f2f2;text-align: end;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style=" padding: 6px;">Basic Salary</td>
        <td style=" padding: 6px; text-align: end;">?${
          emp.basic_salary || "0"
        }</td>
      </tr>
      <tr>
        <td style=" padding: 6px;">Allowances</td>
        <td style=" padding: 6px; text-align: end;">?${
          emp.allowance || "0"
        }</td>
      </tr>
      <tr>
        <td style=" padding: 6px;">Commission</td>
        <td style=" padding: 6px;text-align: end;">?${
          emp.commission || "0"
        }</td>
      </tr>
      <tr>
        <td style=" padding: 6px;">Other Payment</td>
        <td style=" padding: 6px;text-align: end;">?${
          emp.other_payment || "0"
        }</td>
      </tr>
      <tr>
        <td style=" padding: 6px;">Overtime</td>
        <td style=" padding: 6px;text-align: end;">?${emp.overtime || "0"}</td>
      </tr>
      <tr>
        <td style=" padding: 6px;"><strong>Gross Salary</strong></td>
        <td style=" padding: 6px;text-align: end;"><strong>?${
          emp.calculation_breakdown?.gross_salary || "0"
        }</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- DEDUCTIONS TABLE -->
  <table style="width: 100%; border-collapse: collapse;  margin-top: 10px;">
    <thead>
      <tr>
        <th colspan="" style=" padding: 6px; background: #f2f2f2; text-align: start;">Deductions</th>
        <th style=" padding: 6px; background: #f2f2f2;"></th>
      </tr>
    </thead>
    <tbody>
      ${
        emp.loan > 0
          ? `<tr><td style="padding:6px;">Loan</td><td style="padding:6px;text-align:end;">?${
              emp.loan || "0"
            }</td></tr>`
          : ""
      }
      ${
        emp.advance_payment > 0
          ? `<tr><td style="padding:6px;">Advance Payment</td><td style="padding:6px;text-align:end;">?${
              emp.advance_payment || "0"
            }</td></tr>`
          : ""
      }
      ${
        emp.leave_deduction > 0
          ? `<tr><td style="padding:6px;">Leave Deduction</td><td style="padding:6px;text-align:end;">?${
              emp.leave_deduction || "0"
            }</td></tr>`
          : ""
      }
      ${
        emp.calculation_breakdown?.deductions?.breakdown
          ?.map(
            (deduction) =>
              `<tr><td style="padding:6px;">${
                deduction.name
              }</td><td style="padding:6px;text-align:end;">?${
                deduction.amount || "0"
              }</td></tr>`
          )
          .join("") || ""
      }
      <tr class="total-row">
        <td style="padding:6px;"><strong>Total Deductions</strong></td>
        <td style="padding:6px;text-align:end;"><strong>?${
          emp.calculation_breakdown?.deductions?.total_deductions || "0"
        }</strong></td>
      </tr>
    </tbody>
  </table>
  
  <hr>
  
  <!-- NET PAY -->
  <table style="width: 100%; margin-top: 10px; border-collapse: collapse; ">
    <tr>
      <td> <br>Employee Signature   <br> <br> Paid By</td>
      <td style="padding: 6px; text-align: right;"><strong>Net Pay : </strong> <strong>${
        emp.netSalary
      }</strong></td>
    </tr>
  </table>
</div>
    `;

      tempContainer.appendChild(payslipDiv);

      // ... rest of your existing PDF generation code
      const canvas = await html2canvas(payslipDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      if (i > 0) pdf.addPage();

      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      let pdfPageWidth = pdf.internal.pageSize.getWidth();
      let pdfPageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pdfPageWidth - 20;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > pdfPageHeight - 20) {
        imgHeight = pdfPageHeight - 20;
        imgWidth = imgHeight * imgRatio;
      }

      const xOffset = (pdfPageWidth - imgWidth) / 2;
      const yOffset = (pdfPageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
      tempContainer.removeChild(payslipDiv);
    }

    document.body.removeChild(tempContainer);
    pdf.save(`All_Employee_Payslips_${month}_${year}.pdf`);
  };

  const pageCount = Math.ceil(filteredEmployees.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const currentData = filteredEmployees.slice(startIndex, startIndex + entries);

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
                  await salaryService.softDeletePayslip(id);
                  toast.success("Payslip deleted successfully.", {
                    icon: false,
                  });
                  // Refresh the data
                  fetchPayslips();
                } catch (err) {
                  console.error("Failed to delete payslip:", err);
                  toast.error("Failed to delete payslip. Please try again.", {
                    icon: false,
                  });
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
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
      <Container fluid className="p-4">
        <h4 className="fw-bold mb-3">Payslip</h4>
        <p>
          <span className="text-success">Dashboard</span> Payslip
        </p>

        {/* Generate Payslip */}
        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <Row className="align-items-end justify-content-end">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Select Month</Form.Label>
                <Form.Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Select Year</Form.Label>
                <Form.Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                className="mt-3 w-100"
                variant="success"
                onClick={() => setShowModal(true)}
                disabled={loading} // Prevent multiple clicks
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Payslip"
                )}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Find Employee Payslip */}
        <div className="bg-white p-4 rounded shadow-sm">
          <Row className="align-items-center mb-3">
            <Col>
              <h6 className="fw-bold mb-0">Find Employee Payslip</h6>
            </Col>
            <Col md={2}>
              <Form.Select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md="auto">
              <Dropdown as={ButtonGroup}>
                <Button variant="success">Export</Button>
                <Dropdown.Toggle split variant="success" id="dropdown-export" />

                <Dropdown.Menu>
                  <Dropdown.Item onClick={generateExcel}>
                    Export as Excel
                  </Dropdown.Item>
                  <Dropdown.Item onClick={generatePDF}>
                    Export as PDF
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md="auto">
              <Button
                variant="success"
                onClick={handleBulkPayment}
                disabled={bulkPaymentLoading}
              >
                {bulkPaymentLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  "Bulk Payment"
                )}
              </Button>
            </Col>
          </Row>

          {/* Entries & Search */}
          <Row className="mb-2 align-items-center">
            <Col md={2}>
              <Form.Select
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
              >
                <option value={5}>5 entries</option>
                <option value={10}>10 entries</option>
                <option value={20}>20 entries</option>
                <option value={50}>50 entries</option>
              </Form.Select>
            </Col>
            <Col md={{ span: 2, offset: 8 }}>
              <Form.Control
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>

          {/* Table */}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center my-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: "48px", color: "#6c757d" }}>????</div>
              <h5 className="text-muted mt-3">No Payslip Data Available</h5>
              <p className="text-muted">
                {month && year
                  ? `No payslip data found for ${month} ${year}`
                  : "Please select a month to view payslips"}
              </p>
            </div>
          ) : (
            <Table hover responsive striped>
              <thead>
                <tr>
                  <th>EMPLOYEE ID</th>
                  <th>NAME</th>
                  <th>Site</th>
                  <th>DEPARTMENT</th>
                  <th>PAYROLL TYPE</th>
                  <th>SALARY</th>
                  <th>NET SALARY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((emp, idx) => (
                  <tr key={idx}>
                    <td>
                      <Button
                        variant="outline-success"
                        className="px-3 py-1"
                        onClick={() => navigate(`/employees/${emp.rawId}`)}
                      >
                        {emp.id}
                      </Button>
                    </td>
                    <td>{emp.name}</td>
                    <td>{emp.branch}</td>
                    <td>{emp.department}</td>
                    <td>{emp.payrollType}</td>
                    <td>{emp.salary}</td>
                    <td>{emp.netSalary}</td>
                    <td>
                      <Button
                        size="sm"
                        variant={emp.status === "Paid" ? "success" : "warning"}
                      >
                        {emp.status}
                      </Button>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>View</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setViewPayslipModal(true);
                          }}
                        >
                          <i className="bi bi-file-earmark-text"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(emp.employee_id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
            <p className="text-muted">
              Showing 1 to {Math.min(entries, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} entries
            </p>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                {/* Left Arrow */}
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

                {/* Page Numbers */}
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}

                {/* Right Arrow */}
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
            </nav>
          </div>
        </div>
        <PayslipModal
          show={viewPayslipModal}
          onHide={() => setViewPayslipModal(false)}
          employee={selectedEmployee}
        />
      </Container>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Generate Payslip ?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{`${month} ${year}`}</h5>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button
            style={{ cursor: loading ? "default" : "pointer" }}
            className="btn btn-success bg-success"
            onClick={() => {
              handleGeneratePayslip();
              setLoading(true);
            }}
          >
            {loading ? (
              <div
                className="d-flex m-0 justify-content-center align-items-center"
                style={{ pointerEvents: loading ? "none" : "auto" }}
              >
                <Spinner animation="border" size="sm" />​
              </div>
            ) : (
              "Generating"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PayslipPage;
