import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import incomeService from "../../../services/incomeService";
import branchService from "../../../services/branchService";

const Income = () => {
  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [viewBranchWise, setViewBranchWise] = useState(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const res = await incomeService.getAllIncome();
        setIncomeData(res.data);
      } catch (err) {
        toast.error(err.message || "Failed to load income data");
      } finally {
        setLoading(false);
      }
    };
    fetchIncome();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const allBranches = await branchService.getAll();
        setBranches(allBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, []);

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );

  if (!incomeData) return null;

  const totalIncome =
    (incomeData.total_work_order_income || 0) +
    (incomeData.total_purchase_order_income || 0);

  return (
    <div className="container-fluid py-3 my-4">
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Net Balance</h6>
              <h4
                className={
                  incomeData.net_income >= 0
                    ? "text-success fw-bold"
                    : "text-danger fw-bold"
                }
              >
                ₹{parseFloat(incomeData.net_income || 0).toFixed(2)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Total Work Order</h6>
              <h4 className="text-success">
                ₹{parseFloat(incomeData.total_work_order_income || 0).toFixed(2)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Total Purchase Order</h6>
              <h4 className="text-primary">
                ₹{parseFloat(incomeData.total_purchase_order_income || 0).toFixed(2)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Total Income</h6>
              <h4 className="text-dark fw-bold">
                ₹{parseFloat(totalIncome || 0).toFixed(2)}
              </h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toggle */}
      <div
        className="d-flex align-items-center justify-content-end mb-4"
        style={{ cursor: "pointer" }}
        onClick={() => setViewBranchWise(!viewBranchWise)}
      >
        {viewBranchWise ? (
          <i
            className="bi bi-toggle2-on"
            style={{ fontSize: "28px", color: "#02bd0cff" }}
          ></i>
        ) : (
          <i
            className="bi bi-toggle2-off"
            style={{ fontSize: "28px", color: "#6c757d" }}
          ></i>
        )}
        <span className="ms-2">View income by branch</span>
      </div>

      {/* Branch-wise Income */}
      {viewBranchWise && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light fw-bold">
            Branch-wise Income
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive className="text-center">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Work Order Income (₹)</th>
                  <th>Purchase Order Income (₹)</th>
                  <th>Total Branch Income (₹)</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.branch_wise_income &&
                  Object.entries(incomeData.branch_wise_income).map(
                    ([branchName, branch]) => (
                      <tr key={branch.branch_id}>
                        <td>{branchName}</td>
                        <td>₹{parseFloat(branch.work_order_income || 0).toFixed(2)}</td>
                        <td>₹{parseFloat(branch.purchase_order_income || 0).toFixed(2)}</td>
                        <td className="fw-bold text-success">
                          ₹{parseFloat(branch.total_branch_income || 0).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Non-Branch View */}
      {!viewBranchWise && (
        <>
          {/* Credit Purchases */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold">Credit Purchases</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="text-center">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.credit_purchases?.length > 0 ? (
                    incomeData.credit_purchases.map((credit, idx) => (
                      <tr key={idx}>
                        <td>{getBranchName(credit.branch_id)}</td>
                        <td>₹{parseFloat(credit.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center text-muted">
                        No credit purchases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Work Order Invoices */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold">Work Order Invoices</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="text-center">
                <thead>
                  <tr>
                    <th>WO Number</th>
                    <th>Title</th>
                    <th>Payment Amount</th>
                    <th>GST Amount</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.work_order_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.wo_number}</td>
                      <td>{inv.workOrder?.title}</td>
                      <td>₹{parseFloat(inv.payment_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.total_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.remaining_amount || 0).toFixed(2)}</td>
                      <td className="text-success text-capitalize">{inv.status}</td>
                    </tr>
                  ))}
                  {/* ✅ Total Row */}
                  {incomeData.work_order_invoices?.length > 0 && (
                    <tr className="fw-bold bg-light">
                      <td colSpan="2" className="text-end">
                        Totals:
                      </td>
                      <td>
                        ₹
                        {incomeData.work_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.payment_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.work_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.gst_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.work_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.work_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.remaining_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Purchase Order Invoices */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light fw-bold">Purchase Order Invoices</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="text-center">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>Payment Amount</th>
                    <th>GST Amount</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.purchase_order_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.po_number}</td>
                      <td>{inv.purchaseOrder?.vendor_name}</td>
                      <td>₹{parseFloat(inv.payment_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.total_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(inv.remaining_amount || 0).toFixed(2)}</td>
                      <td className="text-success text-capitalize">{inv.status}</td>
                    </tr>
                  ))}
                  {/* ✅ Total Row */}
                  {incomeData.purchase_order_invoices?.length > 0 && (
                    <tr className="fw-bold bg-light">
                      <td colSpan="2" className="text-end">
                        Totals:
                      </td>
                      <td>
                        ₹
                        {incomeData.purchase_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.payment_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.purchase_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.gst_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.purchase_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {incomeData.purchase_order_invoices
                          .reduce((sum, inv) => sum + parseFloat(inv.remaining_amount || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default Income;
