import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Dropdown, Modal, Form } from "react-bootstrap";
import { FileEarmarkTextFill, HourglassSplit } from "react-bootstrap-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import reportService from "../../../services/reportService";
import PurchaseReport from "./PurchaseReport";
import WorkOrderReport from "./WorkOrderReport";

const TaxSummary = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [totalExpenseTax, setTotalExpenseTax] = useState(0);
  const [totalIncomeTax, setTotalIncomeTax] = useState(0);
  const [totalTaxToPay, setTotalTaxToPay] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Filter state
  const [filterType, setFilterType] = useState("Monthly");
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState([0, 2]);
  const [selectedFY, setSelectedFY] = useState(2024);

  const months = [
    "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
    "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseSummary = await reportService.getExpenseSummary();
        const incomeSummary = await reportService.getIncomeSummary();

        if (expenseSummary && incomeSummary) {
          const expenseTax = calculateExpenseData(expenseSummary);
          const incomeTax = calculateIncomeData(incomeSummary);

          setMonthlyData(expenseTax.monthly);
          setIncomeData(incomeTax.monthly);
          setTotalExpenseTax(expenseTax.totalTaxSum);
          setTotalIncomeTax(incomeTax.totalGSTSum);
          setTotalExpense(expenseTax.totalExpenseSum);
          setTotalIncome(incomeTax.totalIncomeSum);
          setTotalTaxToPay(incomeTax.totalGSTSum - expenseTax.totalTaxSum);
        }
      } catch (err) {
        console.error("Error fetching tax summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateExpenseData = (data) => {
    const monthExpenseTotals = Array(12).fill(0);
    const monthTaxTotals = Array(12).fill(0);
    let totalExpenseSum = 0;
    let totalTaxSum = 0;

    if (data?.branch_details) {
      data.branch_details.forEach((branch) => {
        branch.months.forEach((monthData) => {
          const monthIndex = new Date(`${monthData.month} 1, ${data.year}`).getMonth();
          let total_amount = 0;
          let tax = 0;
          monthData.records?.forEach((rec) => {
            total_amount += parseFloat(rec.total_amount || 0);
            tax += parseFloat(rec.tax_total || 0);
          });
          monthExpenseTotals[monthIndex] += total_amount;
          monthTaxTotals[monthIndex] += tax;
          totalExpenseSum += total_amount;
          totalTaxSum += tax;
        });
      });
    }

    const monthly = months.map((m, i) => ({
      month: m.substring(0, 3),
      expense: monthExpenseTotals[i],
      tax: monthTaxTotals[i],
    }));

    return { monthly, totalExpenseSum, totalTaxSum };
  };

  const calculateIncomeData = (data) => {
    const monthIncomeTotals = Array(12).fill(0);
    const monthGSTTotals = Array(12).fill(0);
    let totalIncomeSum = 0;
    let totalGSTSum = 0;

    const processInvoices = (invoices = []) => {
      invoices.forEach((inv) => {
        const month = new Date().getMonth();
        const amount = parseFloat(inv.total_amount || 0);
        const gstAmount =
          parseFloat(inv.gst_amount) ||
          (parseFloat(inv.cgst || 0) +
            parseFloat(inv.sgst || 0) +
            parseFloat(inv.igst || 0)) ||
          0;

        monthIncomeTotals[month] += amount;
        monthGSTTotals[month] += gstAmount;
        totalIncomeSum += amount;
        totalGSTSum += gstAmount;
      });
    };

    processInvoices(data.work_order_invoices);
    processInvoices(data.purchase_order_invoices);

    const monthly = months.map((m, i) => ({
      month: m.substring(0, 3),
      income: monthIncomeTotals[i],
      gst: monthGSTTotals[i],
    }));

    return { monthly, totalIncomeSum, totalGSTSum };
  };

  const currentMonthIndex = new Date().getMonth();
  const monthlyExpense = monthlyData[currentMonthIndex]?.expense || 0;
  const monthlyExpenseTax = monthlyData[currentMonthIndex]?.tax || 0;
  const monthlyIncomeGST = incomeData[currentMonthIndex]?.gst || 0;
  const monthlyNetTax = monthlyIncomeGST - monthlyExpenseTax;
  const monthlyIncome = incomeData[currentMonthIndex]?.income || 0;

  const handleFilterClick = (type) => {
    setFilterType(type);
    setShowModal(true);
  };

  return (
    <div className="container-fluid mt-4 mb-5">
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="p-4 shadow-sm d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-period"
                  className="bg-success bg-opacity-10 rounded-circle p-3 me-3 border-0"
                >
                  <HourglassSplit size={28} className="text-success" />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {["Monthly", "Quarterly", "Financial Year"].map((type) => (
                    <Dropdown.Item key={type} onClick={() => handleFilterClick(type)}>
                      {type}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <div>
                <h6 className="text-muted mb-0">Period :</h6>
                <h5 className="fw-bold mb-0">{filterType}</h5>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4 shadow-sm d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <FileEarmarkTextFill size={28} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-0">Report :</h6>
                <h5 className="fw-bold mb-0">Monthly Expense & Tax Summary</h5>
              </div>
            </div>
            <Button variant="success" className="btn success btn-sm fw-semibold">
              <i className="bi bi-download me-1"></i> Download
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Modal for selecting period */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select {filterType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {filterType === "Monthly" && (
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </Form.Select>
          )}

          {filterType === "Quarterly" && (
            <div className="d-flex gap-2">
              <Form.Select
                value={selectedQuarter[0]}
                onChange={(e) =>
                  setSelectedQuarter([parseInt(e.target.value), selectedQuarter[1]])
                }
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </Form.Select>
              <Form.Select
                value={selectedQuarter[1]}
                onChange={(e) =>
                  setSelectedQuarter([selectedQuarter[0], parseInt(e.target.value)])
                }
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </Form.Select>
            </div>
          )}

          {filterType === "Financial Year" && (
            <Form.Select
              value={selectedFY}
              onChange={(e) => setSelectedFY(parseInt(e.target.value))}
            >
              {[2022, 2023, 2024, 2025, 2026].map((yr) => (
                <option key={yr} value={yr}>{yr}-{yr+1}</option>
              ))}
            </Form.Select>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>Apply</Button>
        </Modal.Footer>
      </Modal>

      {/* Total Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">Monthly Expense</h6>
            <h4 className="fw-bold text-primary">₹{monthlyExpense.toFixed(2)}</h4>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">Monthly Tax</h6>
            <h4 className="fw-bold text-warning">₹{monthlyNetTax.toFixed(2)}</h4>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">Monthly Income</h6>
            <h4 className="fw-bold text-success">₹{monthlyIncome.toFixed(2)}</h4>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Monthly Expense vs Tax Trend</h5>
              {loading ? (
                <p className="text-center text-muted">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line type="monotone" dataKey="expense" stroke="#0077b6" strokeWidth={2} dot={false} name="Expense" />
                    <Line type="monotone" dataKey="tax" stroke="#ff9f1c" strokeWidth={2} dot={false} name="Tax" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Monthly Income vs GST Trend</h5>
              {loading ? (
                <p className="text-center text-muted">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={incomeData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line type="monotone" dataKey="income" stroke="#28a745" strokeWidth={2} dot={false} name="Income" />
                    <Line type="monotone" dataKey="gst" stroke="#ff9f1c" strokeWidth={2} dot={false} name="GST" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Purchase & Work Order Reports */}
      <div className="mt-5">
        <h4 className="fw-bold mb-4 text-center text-primary">
          Purchase & Work Order Reports
        </h4>
        <Row className="g-4">
          <Col md={6}>
            <h5 className="fw-bold mb-3 text-primary">Purchase Order Report</h5>
            <PurchaseReport />
          </Col>
          <Col md={6}>
            <h5 className="fw-bold mb-3 text-success">Work Order Report</h5>
            <WorkOrderReport />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TaxSummary;











// import React, { useEffect, useState } from "react";
// import { Card, Row, Col, Button, Dropdown } from "react-bootstrap";
// import { FileEarmarkTextFill, HourglassSplit } from "react-bootstrap-icons";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import reportService from "../../../services/reportService";
// import PurchaseReport from "./PurchaseReport";
// import WorkOrderReport from "./WorkOrderReport";
// import * as XLSX from 'xlsx';


// const TaxSummary = () => {
//   const [loading, setLoading] = useState(true);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [incomeData, setIncomeData] = useState([]);
//   const [totalExpenseTax, setTotalExpenseTax] = useState(0);
//   const [totalIncomeTax, setTotalIncomeTax] = useState(0);
//   const [totalTaxToPay, setTotalTaxToPay] = useState(0);
//   const [totalIncome, setTotalIncome] = useState(0);
//   const [totalExpense, setTotalExpense] = useState(0);
//   const [periodType, setPeriodType] = useState('Monthly'); // Monthly, Quarterly, Financial Year
// const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
// const [selectedQuarter, setSelectedQuarter] = useState('Q4');
// const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   const months = [
//     "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
//     "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const expenseSummary = await reportService.getExpenseSummary();
//         const incomeSummary = await reportService.getIncomeSummary();

//         if (expenseSummary && incomeSummary) {
//           // Calculate total expense tax & income tax
//           const expenseTax = calculateExpenseData(expenseSummary);
//           const incomeTax = calculateIncomeData(incomeSummary);

//           setMonthlyData(expenseTax.monthly);
//           setIncomeData(incomeTax.monthly);
//           setTotalExpenseTax(expenseTax.totalTaxSum);
//           setTotalIncomeTax(incomeTax.totalGSTSum);
//           setTotalExpense(expenseTax.totalExpenseSum);
//           setTotalIncome(incomeTax.totalIncomeSum);

//           // final tax = income GST - expense GST
//           setTotalTaxToPay(incomeTax.totalGSTSum - expenseTax.totalTaxSum);
//         }
//       } catch (err) {
//         console.error("Error fetching tax summary:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Expense Summary Parser
//   const calculateExpenseData = (data) => {
//     const monthExpenseTotals = Array(12).fill(0);
//     const monthTaxTotals = Array(12).fill(0);
//     let totalExpenseSum = 0;
//     let totalTaxSum = 0;

//     if (data?.branch_details) {
//       data.branch_details.forEach((branch) => {
//         branch.months.forEach((monthData) => {
//           const monthIndex = new Date(`${monthData.month} 1, ${data.year}`).getMonth();
//           let total_amount = 0;
//           let tax = 0;
//           monthData.records?.forEach((rec) => {
//             total_amount += parseFloat(rec.total_amount || 0);
//             tax += parseFloat(rec.tax_total || 0);
//           });
//           monthExpenseTotals[monthIndex] += total_amount;
//           monthTaxTotals[monthIndex] += tax;
//           totalExpenseSum += total_amount;
//           totalTaxSum += tax;
//         });
//       });
//     }

//     const monthly = months.map((m, i) => ({
//       month: m.substring(0, 3),
//       expense: monthExpenseTotals[i],
//       tax: monthTaxTotals[i],
//     }));

//     return { monthly, totalExpenseSum, totalTaxSum };
//   };

//   // Income Summary Parser
//   const calculateIncomeData = (data) => {
//     const monthIncomeTotals = Array(12).fill(0);
//     const monthGSTTotals = Array(12).fill(0);
//     let totalIncomeSum = 0;
//     let totalGSTSum = 0;

//     const processInvoices = (invoices = []) => {
//       invoices.forEach((inv) => {
//         const month = new Date().getMonth(); // or based on your backend if month info exists
//         const amount = parseFloat(inv.total_amount || 0);
//         const gstAmount =
//           parseFloat(inv.gst_amount) ||
//           (parseFloat(inv.cgst || 0) +
//             parseFloat(inv.sgst || 0) +
//             parseFloat(inv.igst || 0)) ||
//           0;

//         monthIncomeTotals[month] += amount;
//         monthGSTTotals[month] += gstAmount;
//         totalIncomeSum += amount;
//         totalGSTSum += gstAmount;
//       });
//     };

//     processInvoices(data.work_order_invoices);
//     processInvoices(data.purchase_order_invoices);

//     const monthly = months.map((m, i) => ({
//       month: m.substring(0, 3),
//       income: monthIncomeTotals[i],
//       gst: monthGSTTotals[i],
//     }));

//     return { monthly, totalIncomeSum, totalGSTSum };
//   };

//   const currentMonthIndex = new Date().getMonth();
//   const monthlyExpense = monthlyData[currentMonthIndex]?.expense || 0;
//   const monthlyExpenseTax = monthlyData[currentMonthIndex]?.tax || 0;
//   const monthlyIncomeGST = incomeData[currentMonthIndex]?.gst || 0;
//   const monthlyNetTax = monthlyIncomeGST - monthlyExpenseTax;
//   const monthlyIncome = incomeData[currentMonthIndex]?.income || 0;
//   const getFilteredData = () => {
//   if(periodType === 'Monthly') {
//     return {
//       expenseData: monthlyData[selectedMonth],
//       incomeData: incomeData[selectedMonth],
//     }
//   } else if(periodType === 'Quarterly') {
//     // Sum data for the selected quarter
//     const quarterMonths = {
//       Q1: [0,1,2], Q2: [3,4,5], Q3: [6,7,8], Q4: [9,10,11]
//     }[selectedQuarter];

//     const expense = quarterMonths.reduce((sum, m) => sum + (monthlyData[m]?.expense || 0),0);
//     const tax = quarterMonths.reduce((sum, m) => sum + (monthlyData[m]?.tax || 0),0);
//     const income = quarterMonths.reduce((sum, m) => sum + (incomeData[m]?.income || 0),0);
//     const gst = quarterMonths.reduce((sum, m) => sum + (incomeData[m]?.gst || 0),0);

//     return { expenseData: {expense, tax}, incomeData: {income, gst} }
//   } else {
//     // Financial year
//     const expense = monthlyData.reduce((sum, m) => sum + (m.expense || 0),0);
//     const tax = monthlyData.reduce((sum, m) => sum + (m.tax || 0),0);
//     const income = incomeData.reduce((sum, m) => sum + (m.income || 0),0);
//     const gst = incomeData.reduce((sum, m) => sum + (m.gst || 0),0);

//     return { expenseData: {expense, tax}, incomeData: {income, gst} }
//   }
// }
// const handleDownload = () => {
//   const { expenseData, incomeData } = getFilteredData();
//   const rows = [];

//   // Add Income Section
//   rows.push({ Section: 'Income' });
//   rows.push({
//     'Work Order Income': incomeData.work_order_total || 0,
//     'Purchase Order Income': incomeData.purchase_order_total || 0,
//     'Total Income Before Expense': incomeData.total_income || 0
//   });

//   // Add Expense Section
//   rows.push({});
//   rows.push({ Section: 'Expenses' });
//   rows.push({
//     'Wallet Expenses': expenseData.total_expense || 0,
//     'Total Expense Tax': expenseData.total_tax || 0
//   });

//   // Add Tax Difference Section
//   rows.push({});
//   rows.push({ Section: 'Tax Difference' });
//   rows.push({
//     'Income GST': incomeData.totalGSTSum || 0,
//     'Expense Tax': expenseData.totalTaxSum || 0,
//     'Net Tax To Pay': totalTaxToPay
//   });

//   // Add Profit / Loss Section
//   rows.push({});
//   rows.push({ Section: 'Profit / Loss' });
//   rows.push({
//     'Net Income': totalIncome - totalExpense,
//     'Status': totalIncome - totalExpense >= 0 ? 'Profit' : 'Loss'
//   });

//   // Create Excel Sheet
//   const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Summary');
//   XLSX.writeFile(workbook, `Tax_Summary_${periodType}_${selectedMonth + 1}.xlsx`);
// };

//   return (
//     <div className="container-fluid mt-4 mb-5">
//       {/* Header Section */}
//       <Row className="g-3 mb-4">
//         <Col md={6}>
//           <Card className="p-3 shadow-sm d-flex flex-row align-items-center justify-content-between">
//             <div className="d-flex flex-row align-items-center">
//               <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
//                 <FileEarmarkTextFill size={28} className="text-success" />
//               </div>
//               <div>
//                 <h6 className="text-muted mb-0">Report :</h6>
//                 <h5 className="fw-bold mb-0">Monthly Expense & Tax Summary</h5>
//               </div>
//             </div>

// <Button variant="success" onClick={handleDownload}>
//   <i className="bi bi-download me-1"></i> Download
// </Button>
//           </Card>
//         </Col>

//         <Col md={6}>
//           <Card className="p-3 shadow-sm d-flex flex-row align-items-center">
//             <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
//               <HourglassSplit size={28} className="text-success" />
//             </div>
//             <div>
//               <h6 className="text-muted mb-0">Month :</h6>
//               <h5 className="fw-bold mb-0">{months[currentMonthIndex]}</h5>
//             </div>
//           </Card>
//           <Dropdown>
//   <Dropdown.Toggle variant="success">
//     {periodType}
//   </Dropdown.Toggle>
//   <Dropdown.Menu>
//     {['Monthly', 'Quarterly', 'Financial Year'].map(pt => (
//       <Dropdown.Item key={pt} onClick={() => setPeriodType(pt)}>
//         {pt}
//       </Dropdown.Item>
//     ))}
//   </Dropdown.Menu>
// </Dropdown>

// {/* Conditional input */}
// {periodType === 'Monthly' && (
//   <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
//     {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
//   </select>
// )}
// {periodType === 'Quarterly' && (
//   <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
//     {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q}>{q}</option>)}
//   </select>
// )}
// {periodType === 'Financial Year' && (
//   <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
//     {[2021,2022,2023,2024,2025].map(y => <option key={y}>{y}</option>)}
//   </select>
// )}

//         </Col>
//       </Row>

//       {/* Total Summary Cards */}
//       <Row className="g-3 mb-4">
//         <Col md={4}>
//           <Card className="p-5 shadow-sm text-center">
//             <h6 className="text-muted mb-1">Monthly Expense</h6>
//             <h4 className="fw-bold text-primary">₹{monthlyExpense.toFixed(2)}</h4>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="p-5 shadow-sm text-center">
//             <h6 className="text-muted mb-1">Monthly Tax</h6>
//             <h4 className="fw-bold text-warning">₹{monthlyNetTax.toFixed(2)}</h4>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="p-5 shadow-sm text-center">
//             <h6 className="text-muted mb-1">Monthly Income</h6>
//             <h4 className="fw-bold text-success">₹{monthlyIncome.toFixed(2)}</h4>
//           </Card>
//         </Col>
//       </Row>

//       {/* Charts Section */}
//       <Row>
//         <Col md={6}>
//           <Card className="shadow-sm border-0 mb-4">
//             <Card.Body>
//               <h5 className="mb-3 fw-bold">Monthly Expense vs Tax Trend</h5>
//               {loading ? (
//                 <p className="text-center text-muted">Loading chart...</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={350}>
//                   <LineChart data={monthlyData}>
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend verticalAlign="top" align="right" />
//                     <Line type="monotone" dataKey="expense" stroke="#0077b6" strokeWidth={2} dot={false} name="Expense" />
//                     <Line type="monotone" dataKey="tax" stroke="#ff9f1c" strokeWidth={2} dot={false} name="Tax" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={6}>
//           <Card className="shadow-sm border-0 mb-4">
//             <Card.Body>
//               <h5 className="mb-3 fw-bold">Monthly Income vs GST Trend</h5>
//               {loading ? (
//                 <p className="text-center text-muted">Loading chart...</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={350}>
//                   <LineChart data={incomeData}>
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend verticalAlign="top" align="right" />
//                     <Line type="monotone" dataKey="income" stroke="#28a745" strokeWidth={2} dot={false} name="Income" />
//                     <Line type="monotone" dataKey="gst" stroke="#ff9f1c" strokeWidth={2} dot={false} name="GST" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Purchase & Work Order Reports */}
//       <div className="mt-5">
//         <h4 className="fw-bold mb-4 text-center text-primary">
//           Purchase & Work Order Reports
//         </h4>
//         <Row className="g-4">
//           <Col md={6}>
//             <h5 className="fw-bold mb-3 text-primary">Purchase Order Report</h5>
//             <PurchaseReport />
//           </Col>
//           <Col md={6}>
//             <h5 className="fw-bold mb-3 text-success">Work Order Report</h5>
//             <WorkOrderReport />
//           </Col>
//         </Row>
//       </div>
//     </div>
//   );
// };

// export default TaxSummary;
