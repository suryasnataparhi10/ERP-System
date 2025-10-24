import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCog,
  FaUserTie,
  FaChevronDown,
  FaChevronRight,
  FaBalanceScale,
  FaBriefcase,
  FaBell,
  FaSlidersH,
  FaTimes,
  FaTools,
  FaWarehouse,
  FaChartBar,
} from "react-icons/fa";
import PermissionWith from "../hooks/PermissionWith";
import "./Sidebar.css";
import axios from "axios";
import { useSelector } from "react-redux";

const Sidebar = ({ isOpen, openMenus, toggleMenu, onClose }) => {
  const [images, setImages] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/homescreen`);
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch home images:", err);
      }
    };
    fetchImages();
  }, [BASE_URL]);
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center sticky-top bg-white" style={{
            top: 0,
            zIndex: 1020, // stays above other sidebar content
            borderBottom: "1px solid #ddd",
          }}>
          <div className="logo-container">
            <img
              style={{ width: "170px", paddingLeft: "20px" }}
              src={images ? `${BASE_URL}/${images.logo}` : "/default-logo.png"}
              alt="VISITAL"
            />

            {/* <span className="logo-text">VISITAL</span> */}
          </div>
          <button className="btn btn-light border d-lg-none" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <PermissionWith permission="show hrm dashboard">
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.dashboard ? "selected" : ""}`}
                onClick={() => toggleMenu("dashboard")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaTachometerAlt className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Dashboard</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.dashboard ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>

              {openMenus.dashboard && (
                <div className="submenu">
                  {/* <PermissionWith permission="show hrm dashboard">
                    <NavLink
                      to="/dashboard/hrm"
                      className={`submenu-item ${
                        isActive("/dashboard/hrm") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      HRM Dashboard
                    </NavLink>
                  </PermissionWith> */}
                  <PermissionWith permission="show hrm dashboard">
                    <NavLink
                      to="/hrmdashboard"
                      className={`submenu-item ${
                        isActive("/dashboard/hrm") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      HRM Dashboard
                    </NavLink>
                  </PermissionWith>
                  {/* <PermissionWith permission="show account dashboard">
                    <NavLink
                      to="/dashboard/accounting"
                      className={`submenu-item ${
                        isActive("/dashboard/accounting") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      Accounting Overview
                    </NavLink>
                  </PermissionWith> */}
                  {/* <PermissionWith permission="show pos dashboard">
                    <NavLink
                      to="/dashboard/pos"
                      className={`submenu-item ${
                        isActive("/dashboard/pos") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      POS Dashboard
                    </NavLink>
                  </PermissionWith> */}
                  {/* <PermissionWith permission="show crm dashboard">
                    <NavLink
                      to="/dashboard/crm"
                      className={`submenu-item ${
                        isActive("/dashboard/crm") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      CRM Dashboard
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="show project dashboard">
                    <NavLink
                      to="/dashboard/project"
                      className={`submenu-item ${
                        isActive("/dashboard/project") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      Project Dashboard
                    </NavLink>
                  </PermissionWith> */}

                  <PermissionWith permission="manage report">
                        <NavLink
                        to="/dashboard"
                        className={`submenu-item ${isActive("dashboard") ? "active" : ""}`}
                        onClick={onClose}
                      >
                        Accounting Dashboard
                      </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* HRM System */}
          <PermissionWith permission="manage employee">
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.hrm ? "selected" : ""}`}
                onClick={() => toggleMenu("hrm")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon">
                    <div className="menu-item-icon-parent">
                      <FaUserTie className="menu-item-icon" />
                    </div>
                  </div>
                  <span className="menu-item-text">HRM System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.hrm ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>

              {openMenus.hrm && (
                <div className="submenu">
                  <PermissionWith permission="manage employee">
                    <NavLink
                      to="/employees"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Employee Setup
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage set salary">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.payroll ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("payroll")}
                    >
                      Payroll Setup
                      <span className="arrow-icon">
                        {openMenus.payroll ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.payroll && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage set salary">
                        <NavLink
                          to="/payroll/set-salary"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Set Salary
                        </NavLink>
                      </PermissionWith>
                      {/* <PermissionWith permission="manage pay slip">
                        <NavLink
                          to="/hrm/payroll-setup/payslip"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Payslip
                        </NavLink>
                      </PermissionWith> */}
                      <PermissionWith permission="manage pay slip">
                        <NavLink
                          to="/payroll-setup/payslip"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          {" "}
                          Payslip
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )}
                  <PermissionWith permission="manage leave">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.leave ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("leave")}
                    >
                      Leave Management
                      <span className="arrow-icon">
                        {openMenus.leave ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.leave && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage leave">
                        <NavLink
                          to="/leaves"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Manage Leave
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage attendance">
                        <div
                          className={`submenu-item has-nested ${
                            openMenus.attendance ? "selected" : ""
                          }`}
                          onClick={() => toggleMenu("attendance")}
                        >
                          Attendance
                          <span className="arrow-icon">
                            {openMenus.attendance ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </span>
                        </div>
                      </PermissionWith>
                      {openMenus.attendance && (
                        <div className="nested-submenu">
                          <PermissionWith permission="create attendance">
                            <NavLink
                              to="/attendance"
                              className="submenu-item"
                              onClick={onClose}
                            >
                              Mark Attendance
                            </NavLink>
                          </PermissionWith>
                          <PermissionWith permission="manage biometric attendance">
                            {/* <NavLink
                              to="/hrm/attendance/bulk"
                              className="submenu-item"
                              onClick={onClose}
                            >
                              Bulk Attendance
                            </NavLink> */}
                          </PermissionWith>
                        </div>
                      )}
                    </div>
                  )}
                  {/* <PermissionWith permission="manage appraisal">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.performance ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("performance")}
                    >
                      Performance Setup
                      <span className="arrow-icon">
                        {openMenus.performance ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith> */}
                  {/* {openMenus.performance && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage indicator">
                        <NavLink
                          to="/indicator"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Indicator
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage appraisal">
                        <NavLink
                          to="/appraisal"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Appraisal
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage goal tracking">
                        <NavLink
                          to="/goaltracking"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Goal Tracking
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )} */}
                  <PermissionWith permission="manage award">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.admin ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("admin")}
                    >
                      HR Admin Setup
                      <span className="arrow-icon">
                        {openMenus.admin ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.admin && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage award">
                        <NavLink
                          to="/hrm/hradminsetup/award"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Award
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage transfer">
                        <NavLink
                          to="/hrm/hradminsetup/transfer"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Transfer
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage resignation">
                        <NavLink
                          to="/hrm/hradminsetup/resignation"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Resignation
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage promotion">
                        <NavLink
                          to="/hrm/hradminsetup/promotion"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Promotion
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage complaint">
                        <NavLink
                          to="/hrm/hradminsetup/complaint"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Complaints
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage warning">
                        <NavLink
                          to="/hrm/hradminsetup/warning"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Warning
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage termination">
                        <NavLink
                          to="/hrm/hradminsetup/termination"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Termination
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage announcement">
                        <NavLink
                          to="/hrm/hradminsetup/announcement"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Announcement
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage holiday">
                        <NavLink
                          to="/hrm/hradminsetup/holidays"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Holidays
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )}
                  {/* <PermissionWith permission="manage document">
                    <NavLink
                      to="/document-setup"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Document Setup
                    </NavLink>
                  </PermissionWith> */}
                  <PermissionWith permission="manage company policy">
                    <NavLink
                      to="/company-policy"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Company Policy
                    </NavLink>
                  </PermissionWith>
                  {/* <PermissionWith permission="manage assets">
                    <NavLink
                      to="/employee-assets"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Employees Asset Setup
                    </NavLink>
                  </PermissionWith> */}
                  <PermissionWith permission="manage branch">
                    <NavLink
                      to="/hrmsystemsetup/branch"
                      // className={`submenu-item ${
                      //   location.pathname.includes("/") ? "active" : ""
                      // }`}
                      // onClick={onClose}
                      className={({ isActive, isPending }) => {
                        const active =
                          location.pathname.startsWith("/hrmsystemsetup");
                        return "submenu-item" + (active ? " active" : "");
                      }}
                      onClick={onClose}
                    >
                      HRM System Setup
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>
                   <PermissionWith permission="show account dashboard">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.accounting ? "selected" : ""
                }`}
                onClick={() => toggleMenu("accounting")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaBalanceScale className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Accounting System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.accounting ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>
{openMenus.accounting && (
  <div className="submenu">
    <NavLink
      to={
        user?.type === "Branch Manager "
          ? "/accounting/branch-wallets/all/details"
          : "/accounting/branch-wallets"
      }
      className="submenu-item"
      onClick={onClose}
    >
      {/* {user?.type === "Branch Manager " ? "Branch Wallet" : "Expenses"} */}
      Wallet
    </NavLink>

    {/* ✅ Show Expenses for Everyone including Accountant & Company */}
    <div>
      {/* Main Expenses Link */}
      <div
        className={`submenu-item has-nested ${
          openMenus.expenses ? "selected" : ""
        }`}
        onClick={() => toggleMenu("expenses")}
      >
        Expenses
        <span className="arrow-icon">
          {openMenus.expenses ? <FaChevronDown /> : <FaChevronRight />}
        </span>
      </div>

      {/* Nested Submenu */}
      {openMenus.expenses && (
        <div className="nested-submenu">
          {/* <PermissionWith permission="manage cash purchase"> */}
          <NavLink
          to={
        user?.type === "Branch Manager "
          ? "/accounting/expenses/all/details"
          : "/accounting/expenses"
      }
            // to="/accounting/expenses/all/details"
            className="submenu-item"
            onClick={onClose}
          >
            Cash Purchase
          </NavLink>
          {/* </PermissionWith> */}

          {/* ✅ Always show Credit Purchase now */}
          {/* <PermissionWith permission="manage credit purchase"> */}
          <NavLink
            to="/accounting/expenses/credit-purchase"
            className="submenu-item"
            onClick={onClose}
          >
            Credit Purchase
          </NavLink>
          {/* </PermissionWith> */}
        </div>
      )}
    </div>

    {/* <permissionWith permission="manage income"> */}
    <NavLink
      to="/accounting/income"
      className="submenu-item"
      onClick={onClose}
    >
      Incomes
    </NavLink>
    {/* </permissionWith> */}

    <PermissionWith permission="manage purchase order">
      <NavLink
        to="/purchases/orders"
        className="submenu-item"
        onClick={onClose}
      >
        Purchase Orders
      </NavLink>
    </PermissionWith>

    <PermissionWith permission="manage work order">
      <NavLink
        to="/works/orders"
        className="submenu-item"
        onClick={onClose}
      >
        Work Orders
      </NavLink>
    </PermissionWith>

    <PermissionWith permission="manage vendor">
      <NavLink
        to="/accounting/accountingsetup/tax"
        className="submenu-item"
        onClick={onClose}
      >
        Accounting setup
      </NavLink>
    </PermissionWith>
  </div>
)}

            </div>
          </PermissionWith>

          {/* User Management */}
          <PermissionWith permission="manage user">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.userManagement ? "selected" : ""
                }`}
                onClick={() => toggleMenu("userManagement")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaUserCog className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">User Management</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.userManagement ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>
              {openMenus.userManagement && (
                <div className="submenu">
                  <PermissionWith permission="manage user">
                    <NavLink
                      to="/users"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      User
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage role">
                    <NavLink
                      to="/users/roles"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Role
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* Products System */}
          {/* <PermissionWith permission="manage product & service">
            <NavLink to="/products" className="menu-item" onClick={onClose}>
              <div className="menu-item-content">
                <div className="menu-item-icon-parent">

                  <FaBriefcase className="menu-item-icon" />
                </div>
                <span className="menu-item-text">Products System</span>
              </div>
            </NavLink>
          </PermissionWith> */}

          <PermissionWith permission="manage product & service">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.productSystem ? "selected" : ""
                }`}
                onClick={() => toggleMenu("productSystem")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaUserCog className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Products System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.productSystem ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>

              {openMenus.productSystem && (
                <div className="submenu">
                  {/* <PermissionWith permission="manage product"> */}
                  <NavLink
                    to="/products"
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Product
                  </NavLink>
                  {/* </PermissionWith> */}

                  {/* <PermissionWith permission="manage stock"> */}
                  <NavLink
                    to="/stock"
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Stock
                  </NavLink>
                  {/* </PermissionWith> */}
                </div>
              )}
            </div>
          </PermissionWith>

          {/* Notification Template */}
          <PermissionWith permission="manage notification">
            <NavLink
              to="/notification-template"
              className="menu-item"
              onClick={onClose}
            >
              <div className="menu-item-content">
                <FaBell className="menu-item-icon" />
                <span className="menu-item-text">Notification Template</span>
              </div>
            </NavLink>
          </PermissionWith>

          {/* System Setup */}
          {/* <PermissionWith permission="manage system settings">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.systemSetup ? "selected" : ""
                }`}
                onClick={() => toggleMenu("systemSetup")}
              >
                <div className="menu-item-content">
                  <FaSlidersH className="menu-item-icon" />
                  <span className="menu-item-text">System Setup</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.systemSetup ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>
              {openMenus.systemSetup && (
                <div className="submenu">
                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/system/company"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Company Settings
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage business settings">
                    <NavLink
                      to="/system/business"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Business Settings
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage print settings">
                    <NavLink
                      to="/system/print"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Print Settings
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith> */}

          <PermissionWith permission="manage assets">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.assetsSystem ? "selected" : ""
                }`}
                onClick={() => toggleMenu("assetsSystem")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaWarehouse className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Assets System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.assetsSystem ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>

              {openMenus.assetsSystem && (
                <div className="submenu">
                  <PermissionWith permission="manage assets">
                    <NavLink
                      to="/assets"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Assets
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* Settings */}
          <PermissionWith permission="manage company settings">
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.settings ? "selected" : ""}`}
                onClick={() => toggleMenu("settings")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaTools className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Settings</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.settings ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>
              {openMenus.settings && (
                <div className="submenu">
                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/aboutus"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      AboutUs
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/terms_and_conditions"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Terms & Condition
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/Privacy_policy"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      PrivacyPolicy
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

                <PermissionWith permission="manage work order">
          <div className="menu-group">
            <div
              className={`menu-item ${openMenus.report ? "selected" : ""}`}
              onClick={() => toggleMenu("report")}
            >
              <div className="menu-item-content">
                <div className="menu-item-icon-parent">
                  <FaChartBar className="menu-item-icon" />{" "}
                  {/* Use any icon you like */}
                </div>
                <span className="menu-item-text">Report</span>
              </div>
              <span className="arrow-icon">
                {openMenus.report ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </div>

            {openMenus.report && (
              <div className="submenu">
                  <NavLink
                    to="/reports/tax-summary"
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Accounting Report
                  </NavLink>
              </div>
            )}
          </div>
          </PermissionWith>
        </nav>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={onClose}></div>
      )}
    </>
  );
};

export default Sidebar;
