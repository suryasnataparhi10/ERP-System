import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";
import { PeopleFill, Clipboard } from "react-bootstrap-icons";

import { selectEmployees, fetchEmployees } from "../../redux/slices/hrmSlice";

import { getEmployees } from "../../services/hrmService";
import attendanceService from "../../services/attendanceService";
import { fetchLeaves } from "../../services/hrmService";
import { getAnnouncements } from "../../services/hrmService";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { CalendarEvent, Clock } from "react-bootstrap-icons";

const HrmDashbordPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [employeeCount, setEmployeeCount] = useState(0);
  const employees = useSelector(selectEmployees) || [];
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [dailyLeaves, setDailyLeaves] = useState([]);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [todaysAttendanceCount, setTodaysAttendanceCount] = useState(0); // Add this line

  const [announcements, setAnnouncements] = useState([]);
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState([]);

  // Calculate active/inactive employees
  const employeeStatus = {
    is_active: employees.filter((emp) => emp.is_active === true).length,
    inactive: employees.filter((emp) => emp.is_active === false).length,
    total: employees.length,
  };

  // useEffect(() => {
  //   const fetchEmployees = async () => {
  //     try {
  //       const employees = await getEmployees();
  //       setEmployeeCount(employees.length);
  //     } catch (error) {
  //       console.error("Error fetching employees:", error);
  //     }
  //   };
  //   fetchEmployees();
  // }, []);
  useEffect(() => {
    setEmployeeCount(employees.length);
  }, [employees]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    const fetchTodaysAttendance = async () => {
      try {
        const { data } = await attendanceService.getAll();
        const attendanceList = data?.data || [];

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        console.log("Today's date:", today);
        console.log("All attendance records:", attendanceList);

        // Filter today's attendance records
        const todaysRecords = attendanceList.filter((record) => {
          return record.date === today && record.status === "Present";
        });

        // Count unique employees present today
        const uniqueEmployeesToday = new Set();
        todaysRecords.forEach((record) => {
          if (record.employee && record.employee.employee_id) {
            uniqueEmployeesToday.add(record.employee.employee_id);
          }
        });

        const todaysCount = uniqueEmployeesToday.size;
        console.log(`Today's unique employees present: ${todaysCount}`);
        console.log(`Today's records count: ${todaysRecords.length}`);

        setTodaysAttendanceCount(todaysCount);
      } catch (error) {
        console.error("Failed to fetch today's attendance:", error);
        setTodaysAttendanceCount(0);
      }
    };

    fetchTodaysAttendance();
  }, []);

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      try {
        const { data } = await attendanceService.getAll();
        const attendanceList = data?.data || [];

        console.log("Raw attendance data:", attendanceList); // Debug log

        // Group attendance by month
        const monthlyGrouped = attendanceList.reduce((acc, record) => {
          if (!record.date) return acc;

          try {
            const date = new Date(record.date);
            if (isNaN(date.getTime())) return acc; // Invalid date check

            const month = date.toLocaleString("default", { month: "short" });
            const monthIndex = date.getMonth(); // 0-11 for Jan-Dec

            if (!acc[monthIndex]) {
              acc[monthIndex] = {
                month: month,
                attendance: 0,
              };
            }
            acc[monthIndex].attendance += 1;
          } catch (error) {
            console.error("Error processing date:", record.date, error);
          }
          return acc;
        }, {});

        console.log("Monthly grouped data:", monthlyGrouped); // Debug log

        // Convert to array and ensure all months are present
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthlyData = months.map((month, index) => {
          return monthlyGrouped[index] || { month, attendance: 0 };
        });

        console.log("Final monthly data:", monthlyData); // Debug log
        setMonthlyAttendanceData(monthlyData);
      } catch (error) {
        console.error("Failed to fetch monthly attendance:", error);
        // Fallback to empty data if API fails
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        setMonthlyAttendanceData(
          months.map((month) => ({ month, attendance: 0 }))
        );
      }
    };

    fetchMonthlyAttendance();
  }, []);

  useEffect(() => {
    const loadLeaves = async () => {
      const leaves = await fetchLeaves();

      const groupedByDate = leaves.reduce((acc, leave) => {
        const date = leave.leave_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dailyLeaves = Object.entries(groupedByDate).map(
        ([date, total]) => ({
          date,
          total,
        })
      );

      setDailyLeaves(dailyLeaves);

      const totalLeaves = dailyLeaves.reduce(
        (sum, item) => sum + item.total,
        0
      );
      setTotalLeaves(totalLeaves);

      const pendingLeaves = leaves.filter(
        (l) =>
          l.status?.toLowerCase() === "pending" ||
          l.leave_status?.toLowerCase() === "pending" ||
          l.approval_status?.toLowerCase() === "pending"
      );

      setPendingLeaves(pendingLeaves.length); // <— create this state
    };

    loadLeaves();
  }, []);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await getAnnouncements();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAnnouncements(sorted);
      } catch (error) {
        console.error("Error loading announcements:", error);
      }
    };

    loadAnnouncements();
  }, []);

  const totalAttendance = dailyAttendance.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const permanentEmployees = employees.filter(
    (e) =>
      e.employment_type?.toLowerCase() === "permanent" ||
      e.employee_type?.toLowerCase() === "permanent" ||
      e.type?.toLowerCase() === "permanent"
  );

  const contractualEmployees = employees.filter(
    (e) =>
      e.employment_type?.toLowerCase() === "contractual" ||
      e.employee_type?.toLowerCase() === "contractual" ||
      e.type?.toLowerCase() === "contractual"
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">HRM Dashboard</h2>
        <small className="text-muted">Dashboard </small>
      </div>

      <Row className="g-4">
        {/* Status Cards - 3 cards per row */}
        <Col md={12}>
          {/* First Row - 3 cards */}
          <Row className="g-3">
            {/* Total Employee Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#ffe5ec" }}
              >
                {/* Star SVG at top */}
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
                    fill="#ff4d6d"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#ff4d6d"
                  ></path>
                </svg>

                {/* Wave SVG at bottom */}
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
                  <path
                    d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z"
                    fill="#ff4d6d"
                  ></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <PeopleFill size={24} className="text-danger" />
                      </div>
                      <h3 className="mb-0">{employeeCount}</h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Employee</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Contractual Employee Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#e6f7ff" }}
              >
                {/* Star SVG at top */}
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
                    fill="#1890ff"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#1890ff"
                  ></path>
                </svg>

                {/* Wave SVG at bottom */}
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
                  <path
                    d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z"
                    fill="#1890ff"
                  ></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <PeopleFill size={24} className="text-primary" />
                      </div>
                      <h3 className="text-success mb-0">
                        {contractualEmployees.length}
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Contractual Employee</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Parmanent Employee Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#f0f8e8" }}
              >
                {/* Star SVG at top */}
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
                    fill="#52c41a"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#52c41a"
                  ></path>
                </svg>

                {/* Wave SVG at bottom */}
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
                  <path
                    d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z"
                    fill="#52c41a"
                  ></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <PeopleFill size={24} className="text-success" />
                      </div>
                      <h3 className="text-primary mb-0">
                        {permanentEmployees.length}
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Permanent Employee</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          </Row>

          {/* Second Row - 3 cards */}
          <Row className="g-3 mt-3">
            {/* Total Attendance Card */}
            {/* Total Attendance Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#fff2e8" }}
              >
                {/* ... SVG code remains the same ... */}
                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <Clipboard size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0">{todaysAttendanceCount}</h3>{" "}
                      {/* CHANGE THIS LINE */}
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Today's Attendance</h5>
                      {/* CHANGE THIS LINE */}
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Total Leave Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#f9f0ff" }}
              >
                {/* Star SVG at top */}
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
                    fill="#722ed1"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#722ed1"
                  ></path>
                </svg>

                {/* Wave SVG at bottom */}
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
                  <path
                    d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z"
                    fill="#722ed1"
                  ></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <CalendarEvent size={24} className="text-purple" />
                      </div>
                      <h3 className="mb-0">{totalLeaves}</h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Leave</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>

            {/* Total Pending Leave Card */}
            <Col md={4}>
              <div
                className="info-card-inner card shadow-sm border-0 h-100 mb-0 overflow-hidden position-relative"
                style={{ background: "#e6fffb" }}
              >
                {/* Star SVG at top */}
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
                    fill="#13c2c2"
                  ></path>
                  <path
                    d="M78.2765 61.7004C73.0978 65.7903 72.3986 67.705 73.4625 74.8815C69.2811 68.953 67.4538 68.0497 60.8834 68.6632C66.0618 64.5725 66.761 62.6577 65.6963 55.4815C69.8785 61.4097 71.7058 62.3131 78.2765 61.7004Z"
                    fill="#13c2c2"
                  ></path>
                </svg>

                {/* Wave SVG at bottom */}
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
                  <path
                    d="M0 15C15 15 30 5 45 10C60 15 75 25 90 20C105 15 120 5 135 10V30H0V15Z"
                    fill="#13c2c2"
                  ></path>
                </svg>

                <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="bg-white p-2 rounded">
                        <Clock size={24} className="text-info" />
                      </div>
                      <h3 className="text-warning mb-0">{pendingLeaves}</h3>
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-0">Total Pending Leave</h5>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Income vs Expense and Announcement List Row */}
      <Row className="mt-4">
        {/* Active vs Inactive Card */}
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{ minHeight: "268px" }}>
            <Card.Header className="bg-white border-0">
              <h5 className="mt-0 fw-bold">Active vs Inactive</h5>
            </Card.Header>

            <Card.Body>
              <Row>
                {/* Left side (Active) */}
                <Col md={6} className="border-end">
                  {/* Active Today */}
                  <div className="mb-0">
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#E6F8E9",
                        }}
                      >
                        <i className="bi bi-person-check text-success"></i>
                      </div>
                      <h6 className="mt-0 fw-semibold ">Active Employee</h6>
                    </div>
                    <h4 className="fw-bold">{employeeStatus.is_active}</h4>
                    <div
                      style={{
                        height: "5px",
                        backgroundColor: "#E6F8E9",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            (employeeStatus.is_active /
                              (employeeStatus.total || 1)) *
                            100
                          }%`,
                          height: "5px",
                          backgroundColor: "#56C273",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </div>
                </Col>

                {/* Right side (Inactive) */}
                <Col md={6}>
                  {/* Inactive Today */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f0c0c2ff",
                        }}
                      >
                        <i className="bi bi-person-x text-danger"></i>
                      </div>
                      <h6 className="mb-0 fw-semibold ">Inactive Employee</h6>
                    </div>
                    <h4 className="fw-bold">{employeeStatus.inactive}</h4>
                    <div
                      style={{
                        height: "5px",
                        backgroundColor: "#E0F7FA",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            (employeeStatus.inactive /
                              (employeeStatus.total || 1)) *
                            100
                          }%`,
                          height: "5px",
                          backgroundColor: "#e14d6bff",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Announcement List Card */}
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-4 fw-bold">Announcement List</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div
                className="table-responsive"
                style={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  marginLeft: 0,
                  padding: "0px 10px",
                  maxHeight: "200px",
                }}
              >
                <table
                  className="table table-hover mb-0 table-striped"
                  style={{ minWidth: "600px" }}
                >
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-3 py-3 text-uppercase font-weight-bold sticky-top">
                        TITLE
                      </th>
                      <th className="border-0 px-3 py-3 text-uppercase font-weight-bold sticky-top">
                        START DATE
                      </th>
                      <th className="border-0 px-3 py-3 text-uppercase font-weight-bold sticky-top">
                        END DATE
                      </th>
                      <th className="border-0 px-3 py-3 text-uppercase font-weight-bold sticky-top">
                        DESCRIPTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.length > 0 ? (
                      announcements.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-3">{item.title || "—"}</td>
                          <td className="px-3 py-3">
                            {item.start_date
                              ? new Date(item.start_date).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>
                          <td className="px-3 py-3">
                            {item.end_date
                              ? new Date(item.end_date).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              maxWidth: "250px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.description || "No description"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center px-4 py-5 text-muted"
                        >
                          There is no Announcement List
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Attendance Graph */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Monthly Attendance</h5>
              <small className="text-muted">
                Total Records:{" "}
                {monthlyAttendanceData.reduce(
                  (sum, item) => sum + item.attendance,
                  0
                )}
              </small>
            </Card.Header>
            {/* <Card.Body>
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyAttendanceData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#333" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#333" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="attendance"
                      fill="#82ca9d"
                      name="Attendance Count"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body> */}
            <Card.Body
              style={{
                height: "380px",
                background: "linear-gradient(180deg, #f8fff9 0%, #ffffff 100%)",
                borderRadius: "0 0 16px 16px",
                padding: "20px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyAttendanceData}
                  margin={{ top: 25, right: 20, left: 10, bottom: 10 }}
                  barGap={8}
                  barCategoryGap="25%"
                >
                  <defs>
                    <linearGradient
                      id="greenGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#00b35a"
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor="#a8f0c6"
                        stopOpacity={0.5}
                      />
                    </linearGradient>

                    <filter id="glowShadow" height="130%">
                      <feDropShadow
                        dx="0"
                        dy="3"
                        stdDeviation="5"
                        floodColor="#b2e8b7"
                        floodOpacity="0.6"
                      />
                    </filter>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e4f2e5"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#2f6230", fontSize: 13, fontWeight: 600 }}
                    axisLine={{ stroke: "#b3e6b5" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#2f6230", fontSize: 13, fontWeight: 600 }}
                    axisLine={{ stroke: "#b3e6b5" }}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(91, 229, 128, 0.24)" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #c3e6cb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ color: "#155724", fontWeight: 600 }}
                    itemStyle={{ color: "#28a745", fontWeight: 500 }}
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      paddingBottom: "10px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#2f6230",
                    }}
                  />

                  <Bar
                    dataKey="attendance"
                    name="Attendance"
                    fill="url(#greenGradient)"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={45}
                    animationDuration={1400}
                    style={{ filter: "url(#glowShadow)", cursor: "pointer" }}
                  >
                    <LabelList
                      dataKey="attendance"
                      position="top"
                      formatter={(value) => value}
                      style={{ fill: "#1b5e20", fontSize: 12, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HrmDashbordPage;
