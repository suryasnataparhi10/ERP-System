import React, { useEffect, useState } from "react";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";
import { Cash, Wallet2, PeopleFill, Truck, Clipboard, CurrencyDollar } from "react-bootstrap-icons";
import incomeService from "../../../services/incomeService"; // import your service

const DashboardSummary = ({ expenseSummary, totalVendors, totalEmployees, totalInvoiceAmount, branches }) => {
  const [incomeSummary, setIncomeSummary] = useState({ today: 0, month: 0 });

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await incomeService.getAllIncome();
        // Assuming "total_work_order_income" + "total_purchase_order_income" is total income
        const totalToday = res.data.total_work_order_income + res.data.total_purchase_order_income; // you can adjust logic for "today"
        const totalMonth = res.data.total_work_order_income + res.data.total_purchase_order_income; // same as above, you can customize for month if API supports
        setIncomeSummary({ today: totalToday, month: totalMonth });
      } catch (err) {
        console.error("Error fetching income:", err);
      }
    };
    fetchIncome();
  }, []);

  return (
    <Row className="g-4">
      <Col md={5}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Header className="fw-bold bg-white border-0 pt-3 pb-2">
            <h5 className="mb-0">Income Vs Expense</h5>
          </Card.Header>
          <Card.Body className="pt-4">
            <Row>
              <Col xs={6}>
                {/* Income Today */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ backgroundColor: "#b8f5b8", width: "50px", height: "50px" }}
                    >
                      <Cash size={18} className="text-success" />
                    </div>
                    <span className="fw-bold text-dark">Income Today</span>
                  </div>
                  <h4 className="fw-bold">₹ {incomeSummary.today.toLocaleString()}</h4>
                  <ProgressBar now={30} variant="success" className="mt-2" style={{ height: "4px" }} />
                </div>

                {/* Income This Month */}
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ backgroundColor: "#ffe3a3", width: "50px", height: "50px" }}
                    >
                      <Cash size={18} className="text-warning" />
                    </div>
                    <span className="fw-bold text-dark">Income This Month</span>
                  </div>
                  <h4 className="fw-bold">₹ {incomeSummary.month.toLocaleString()}</h4>
                  <ProgressBar now={40} variant="warning" className="mt-2" style={{ height: "4px" }} />
                </div>
              </Col>

              {/* Expense Section */}
              <Col xs={6}>
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ backgroundColor: "#a6e9f7", width: "50px", height: "50px" }}
                    >
                      <Wallet2 size={18} className="text-info" />
                    </div>
                    <span className="fw-bold text-dark">Expense Today</span>
                  </div>
                  <h4 className="fw-bold">₹ {expenseSummary.today?.toFixed(2) || "0.00"}</h4>
                  <ProgressBar now={20} variant="info" className="mt-2" style={{ height: "4px" }} />
                </div>

                <div>
                  <div className="d-flex align-items-center mb-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ backgroundColor: "#ffb3c7", width: "50px", height: "50px" }}
                    >
                      <Wallet2 size={18} className="text-danger" />
                    </div>
                    <span className="fw-bold text-dark">Expense This Month</span>
                  </div>
                  <h4 className="fw-bold">₹ {expenseSummary.month?.toFixed(2) || "0.00"}</h4>
                  <ProgressBar now={50} variant="danger" className="mt-2" style={{ height: "4px" }} />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
            <Col md={7}>
          <Row className="g-3">
            <Col md={6}>
              <div className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative" style={{ background: "#ffe5ec" }}>
                <svg className="position-absolute" width="83" height="79" viewBox="0 0 83 79" fill="none" style={{top: "10px",right: "10px",opacity: "0.4",}}>
                  <path d="M59.0537 26.924C44.68 38.2757 42.7394 43.5902 45.6923 63.5089C34.0866 47.0541 29.0147 44.5469 10.7783 46.2497C25.1511 34.8957 27.0918 29.5812 24.1367 9.66327C35.7446 26.1172 40.8164 28.6245 59.0537 26.924Z"
                    fill="#ff4d6d"></path>
                  <path d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#ff4d6d"></path>
                </svg>

                <svg className="position-absolute" width="135" height="30" viewBox="0 0 135 30" fill="none" style={{   bottom: "0",   left: "0",   width: "100%", }}>
                  <path d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z" fill="#ff4d6d"></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <PeopleFill size={24} className="text-danger" />
                      </div>
                      <h3 className="mb-0">{Object.keys(branches).length}</h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Branches</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Vendors Card */}
            <Col md={6}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#e6fff2" }}
              >
                <svg
                  className="position-absolute"
                  width="83"
                  height="79"
                  viewBox="0 0 83 79"
                  fill="none"
                  style={{
                    top: "10px",
                    right: "10px",
                    opacity: "0.4",
                  }}
                >
                  <path
                    d="M59.0537 26.924C44.68 38.2757 42.7394 43.5902 45.6923 63.5089C34.0866 47.0541 29.0147 44.5469 10.7783 46.2497C25.1511 34.8957 27.0918 29.5812 24.1367 9.66327C35.7446 26.1172 40.8164 28.6245 59.0537 26.924Z"
                    fill="#38b000"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#38b000"
                  ></path>
                </svg>

                <svg
                  className="position-absolute"
                  width="135"
                  height="30"
                  viewBox="0 0 135 30"
                  fill="none"
                  style={{
                    bottom: "0",
                    left: "0",
                    width: "100%",
                  }}
                >
                  <path d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z" fill="#38b000"></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <Truck size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0">{totalVendors}</h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Vendors</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mt-3">
            <Col md={6}>
              <div className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative" style={{ background: "#fff3e0" }}>
                <svg className="position-absolute" width="83" height="79" viewBox="0 0 83 79" fill="none" style={{   top: "10px",   right: "10px",   opacity: "0.4", }}>
                  <path d="M59.0537 26.924C44.68 38.2757 42.7394 43.5902 45.6923 63.5089C34.0866 47.0541 29.0147 44.5469 10.7783 46.2497C25.1511 34.8957 27.0918 29.5812 24.1367 9.66327C35.7446 26.1172 40.8164 28.6245 59.0537 26.924Z" fill="#ff9500"></path>
                  <path d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z" fill="#ff9500"></path>
                </svg>
                <svg className="position-absolute" width="135" height="30" viewBox="0 0 135 30" fill="none" style={{   bottom: "0",   left: "0",   width: "100%", }}>
                  <path d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z" fill="#ff9500"></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <CurrencyDollar size={24} className="text-warning" />
                      </div>
                      <h5>₹ {totalInvoiceAmount.toFixed(2)}</h5>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Invoices</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Bills Card */}
            <Col md={6}>
              <div className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative" style={{ background: "#e0f7fa" }}>
                <svg className="position-absolute" width="83" height="79" viewBox="0 0 83 79" fill="none" style={{   top: "10px",   right: "10px",   opacity: "0.4", }}>
                  <path d="M59.0537 26.924C44.68 38.2757 42.7394 43.5902 45.6923 63.5089C34.0866 47.0541 29.0147 44.5469 10.7783 46.2497C25.1511 34.8957 27.0918 29.5812 24.1367 9.66327C35.7446 26.1172 40.8164 28.6245 59.0537 26.924Z" fill="#00b4d8"></path>
                  <path d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z" fill="#00b4d8"></path>
                </svg>

                <svg className="position-absolute" width="135" height="30" viewBox="0 0 135 30" fill="none" style={{   bottom: "0",   left: "0",   width: "100%", }}>
                  <path d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z" fill="#00b4d8"></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded"><Clipboard size={24} className="text-info" /></div>
                      <h3 className="mb-0">{totalEmployees}</h3>
                    </div>
                    <div className="mt-auto"><h5 className="mb-0">Total Employees</h5></div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
  );
};

export default DashboardSummary;
