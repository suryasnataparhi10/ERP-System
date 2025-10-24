// src/components/PayslipModal.jsx
import React from "react";
import { Modal, Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./payslip.css";

const PayslipModal = ({ show, onHide, employee }) => {
  if (!employee) return null;

  // Add date formatting utility function
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
      return "N/A";
    }
  };

  const downloadPayslipPDF = async () => {
    const input = document.getElementById("payslipModalContent");

    // Hide buttons before taking screenshot
    document
      .querySelectorAll(".no-print")
      .forEach((el) => (el.style.visibility = "hidden"));

    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Restore buttons
    document
      .querySelectorAll(".no-print")
      .forEach((el) => (el.style.visibility = "visible"));

    pdf.save(`${employee.employee?.name || employee.name}_Payslip.pdf`);
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Use backend calculation data instead of manual calculation
  const calculation = employee.calculation_breakdown || {};
  const deductions = calculation.deductions || {};
  const additions = calculation.additions || {};

  const totalEarning = additions.total_additions || 0;
  const totalDeduction = deductions.total_deductions || 0;
  const grossSalary = calculation.gross_salary || 0;
  const netSalary = calculation.net_payable || employee.net_payble || 0;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="p-0">
        <Modal.Title>Employee Payslip</Modal.Title>
      </Modal.Header>

      <Modal.Body id="payslipModalContent" className="p-0">
        <div className="p-3">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <img
              src="/logo192.png"
              alt="ERP Logo"
              height="50"
              className="me-2"
            />
            <div className="no-print">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Download</Tooltip>}
              >
                <Button
                  variant="success"
                  size="sm"
                  className="me-2"
                  onClick={downloadPayslipPDF}
                >
                  <i className="bi bi-download"></i>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Share</Tooltip>}
              >
                <Button variant="warning" size="sm">
                  <i className="bi bi-send"></i>
                </Button>
              </OverlayTrigger>
            </div>
          </div>

          {/* Employee Info - UPDATED WITH JOINING DATE */}
          <div className="mb-3">
            <p className="mb-1">
              <strong>Name :</strong> {employee.employee?.name || employee.name}
            </p>
            <p className="mb-1">
              <strong>Position :</strong>{" "}
              {employee.employee?.designation?.name || "-"}
            </p>
            <p className="mb-1">
              <strong>Date of Joining :</strong>{" "}
              {formatDate(employee.joining_date)}
            </p>
            <p className="mb-1">
              <strong>Salary Date :</strong>{" "}
              {employee.salary_month || "Oct 11, 2025"}
            </p>
            <p className="mb-1 text-end">
              <strong>Salary Slip :</strong>{" "}
              {employee.salary_month || "2025-10"}
            </p>
          </div>

          {/* Earnings & Deductions Table */}
          <table className="align-middle mb-0 table-payslip-modal">
            <thead className="table-light">
              <tr>
                <th>Earning</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Earnings Breakdown */}
              <tr>
                <td>Basic Salary</td>
                <td>{formatCurrency(employee.basic_salary)}</td>
              </tr>
              <tr>
                <td>Allowance</td>
                <td>{formatCurrency(employee.allowance)}</td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{formatCurrency(employee.commission)}</td>
              </tr>
              <tr>
                <td>Other Payment</td>
                <td>{formatCurrency(employee.other_payment)}</td>
              </tr>
              <tr>
                <td>Overtime</td>
                <td>{formatCurrency(employee.overtime)}</td>
              </tr>
              {/* Gross Salary */}
              <tr>
                <td className="fw-bold">Gross Salary</td>
                <td className="fw-bold">{formatCurrency(grossSalary)}</td>
              </tr>

              {/* Deduction Breakdown Header */}
              <tr className="payslip-table-header-tr">
                <th className="payslip-table-header-th">Deduction</th>
                <th className="payslip-table-header-th">Amount</th>
              </tr>

              {/* Main Deduction Fields */}
              {employee.loan > 0 && (
                <tr>
                  <td>Loan</td>
                  <td>{formatCurrency(employee.loan)}</td>
                </tr>
              )}

              {employee.advance_payment > 0 && (
                <tr>
                  <td>Advance Payment</td>
                  <td>{formatCurrency(employee.advance_payment)}</td>
                </tr>
              )}

              {employee.leave_deduction > 0 && (
                <tr>
                  <td>Leave Deduction</td>
                  <td>{formatCurrency(employee.leave_deduction)}</td>
                </tr>
              )}

              {/* Dynamic deductions from backend breakdown */}
              {deductions.breakdown?.length > 0
                ? deductions.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                : // Only show "No deduction breakdown" if there are no deductions at all
                  !employee.loan &&
                  !employee.saturation_deduction &&
                  !employee.advance_payment &&
                  !employee.leave_deduction && (
                    <tr>
                      <td
                        colSpan={2}
                        style={{ textAlign: "center", color: "gray" }}
                      >
                        No deductions
                      </td>
                    </tr>
                  )}

              {/* Total deductions row */}
              <tr>
                <td className="fw-bold">Total Deduction</td>
                <td className="fw-bold">{formatCurrency(totalDeduction)}</td>
              </tr>

              {/* Net Salary */}
              <tr>
                <td className="fw-bold">Net Salary</td>
                <td className="fw-bold">{formatCurrency(netSalary)}</td>
              </tr>
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="mt-4">
            <div className="row">
              <div className="col-6">
                <p className="mb-1">Employee Signature</p>
              </div>
              <div className="col-6 text-end">
                <p className="mb-1">Paid By</p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PayslipModal;
