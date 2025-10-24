import React, { useState } from "react";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Container, Row, Col } from "react-bootstrap";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const [openMenus, setOpenMenus] = useState({
    dashboard: false,
    hrm: false,
    userManagement: false,
  });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Container fluid className="flex-grow-1">
        <Row className="h-100 g-0">
          {/* Sidebar */}
          <Col
            xs={sidebarOpen ? 12 : 0} // hide on small screens when closed
            md={sidebarOpen ? 4 : 0} // adjust width on tablets
            lg={2} // always visible on large screens
            className={`sidebar-container ${
              sidebarOpen ? "open" : "collapsed"
            }`}
            style={{
              display:
                sidebarOpen || window.innerWidth >= 992 ? "block" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <Sidebar
              isOpen={sidebarOpen}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              onClose={() => setSidebarOpen(false)} // ✅ pass close function
            />
          </Col>

          {/* Main Content */}
          <Col xs={12} md={12} lg={10} className="d-flex flex-column">
            {/* Sticky Header */}
            <div className="sticky-top bg-white shadow-sm z-3">
              <Header onToggleSidebar={toggleSidebar} />
            </div>

            <main className="flex-grow-1 overflow-auto">
              <Outlet />
            </main>

            <Footer />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainLayout;
