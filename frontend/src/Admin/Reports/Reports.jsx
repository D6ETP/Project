import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import {
  revenueData,
  weeklyData,
  dailyData,
  popularRoutes,
  formatRupees,
} from "../data/reportsData";

/* ── Export modal component ── */
function ExportModal({ type, onClose }) {
  const [period, setPeriod] = useState("monthly");

  // Returns the correct dataset + column labels based on selected period
  function getReportData() {
    if (period === "daily") {
      return {
        title: "Daily Revenue Report",
        columns: ["Day", "Bookings", "Revenue"],
        rows: dailyData.map((d) => [d.day, d.bookings, formatRupees(d.revenue)]),
        total: dailyData.reduce((s, d) => s + d.revenue, 0),
        totalBookings: dailyData.reduce((s, d) => s + d.bookings, 0),
      };
    }
    if (period === "weekly") {
      return {
        title: "Weekly Revenue Report",
        columns: ["Week", "Bookings", "Revenue"],
        rows: weeklyData.map((d) => [d.week, d.bookings, formatRupees(d.revenue)]),
        total: weeklyData.reduce((s, d) => s + d.revenue, 0),
        totalBookings: weeklyData.reduce((s, d) => s + d.bookings, 0),
      };
    }
    // monthly (default)
    return {
      title: "Monthly Revenue Report",
      columns: ["Month", "Bookings", "Revenue"],
      rows: revenueData.map((d) => [d.month, d.bookings, formatRupees(d.revenue)]),
      total: revenueData.reduce((s, d) => s + d.revenue, 0),
      totalBookings: revenueData.reduce((s, d) => s + d.bookings, 0),
    };
  }

  function generatePDF() {
    const report = getReportData();
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("BusAdmin — " + report.title, 14, 20);

    // Generated on
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Generated on: " + new Date().toLocaleDateString("en-IN"), 14, 28);

    // Revenue table
    autoTable(doc, {
      startY: 35,
      head: [report.columns],
      body: report.rows,
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Summary row
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Bookings: ${report.totalBookings}`, 14, finalY);
    doc.text(`Total Revenue: ${formatRupees(report.total)}`, 14, finalY + 7);

    // Popular routes table
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Popular Routes", 14, finalY + 20);

    autoTable(doc, {
      startY: finalY + 25,
      head: [["Route", "Bookings"]],
      body: popularRoutes.map((r) => [r.route, r.bookings]),
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`BusAdmin_${period}_report.pdf`);
    onClose();
  }

  function generateExcel() {
    const report = getReportData();

    // Build CSV string (opens in Excel)
    const header = report.columns.join(",");
    const bodyRows = report.rows.map((r) => r.join(",")).join("\n");
    const summary = `\nTotal Bookings,${report.totalBookings}\nTotal Revenue,${formatRupees(report.total)}`;
    const routeHeader = "\n\nRoute,Bookings";
    const routeRows = popularRoutes.map((r) => `${r.route},${r.bookings}`).join("\n");

    const csv = [header, bodyRows, summary, routeHeader, routeRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BusAdmin_${period}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${type === "pdf" ? "bi-file-earmark-pdf text-danger" : "bi-file-earmark-excel text-success"} me-2`} />
                Export {type === "pdf" ? "PDF" : "Excel"} Report
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Choose the time period for the report:
              </p>

              {/* Period selector */}
              <div className="d-flex gap-2 flex-wrap">
                {[
                  { value: "daily",   label: "Day Wise",   icon: "bi-calendar-day"   },
                  { value: "weekly",  label: "Week Wise",  icon: "bi-calendar-week"  },
                  { value: "monthly", label: "Month Wise", icon: "bi-calendar-month" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`btn ${period === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setPeriod(opt.value)}
                  >
                    <i className={`bi ${opt.icon} me-2`} />
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Preview of what will be generated */}
              <div className="mt-3 p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <p className="mb-1" style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Report Preview
                </p>
                <p className="mb-0" style={{ fontSize: "13px", color: "#1e293b" }}>
                  <strong>Period:</strong>&nbsp;
                  {period === "daily" ? "Last 7 Days" : period === "weekly" ? "Last 4 Weeks" : "Last 6 Months"}
                </p>
                <p className="mb-0" style={{ fontSize: "13px", color: "#1e293b" }}>
                  <strong>Includes:</strong> Revenue summary, bookings, popular routes
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className={`btn ${type === "pdf" ? "btn-danger" : "btn-success"}`}
                onClick={type === "pdf" ? generatePDF : generateExcel}
              >
                <i className={`bi ${type === "pdf" ? "bi-download" : "bi-download"} me-2`} />
                Download {type === "pdf" ? "PDF" : "Excel (.csv)"}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

/* ── Main Reports page ── */
function Reports() {
  const [showModal, setShowModal] = useState(null); // "pdf" | "excel" | null

  // Total revenue for display card
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalBookings = revenueData.reduce((s, d) => s + d.bookings, 0);

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Reports & Analytics" />
        <div className="page-body">

          {/* Page header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h5 className="mb-0 fw-bold">Reports Dashboard</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-danger" onClick={() => setShowModal("pdf")}>
                <i className="bi bi-file-earmark-pdf me-2" />Export PDF
              </button>
              <button className="btn btn-success" onClick={() => setShowModal("excel")}>
                <i className="bi bi-file-earmark-excel me-2" />Export Excel
              </button>
            </div>
          </div>

          {/* Total Revenue card */}
          <div className="page-card mb-4 p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Total Revenue (6 months)</p>
                <h2 className="fw-bold text-success mb-1">{formatRupees(totalRevenue)}</h2>
                <span className="text-success" style={{ fontSize: "13px" }}>▲ +18% compared to last month</span>
              </div>
              <i className="bi bi-cash-stack text-success" style={{ fontSize: "60px" }} />
            </div>
          </div>

          {/* Summary stat cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="page-card p-3 text-center">
                <p className="text-muted mb-1" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Bookings</p>
                <h3 className="fw-bold mb-0">{totalBookings.toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="page-card p-3 text-center">
                <p className="text-muted mb-1" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Routes</p>
                <h3 className="fw-bold mb-0">18</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="page-card p-3 text-center">
                <p className="text-muted mb-1" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Buses</p>
                <h3 className="fw-bold mb-0">45</h3>
              </div>
            </div>
          </div>

          {/* Monthly Revenue table */}
          <div className="page-card mb-4">
            <div className="page-card-header">
              <h5>Monthly Revenue</h5>
              <span className="badge bg-primary rounded-pill">{revenueData.length} months</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">Month</th>
                    <th>Total Bookings</th>
                    <th className="pe-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item, i) => (
                    <tr key={i}>
                      <td className="ps-4">{item.month}</td>
                      <td>{item.bookings}</td>
                      <td className="pe-4 fw-bold text-success">{formatRupees(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Routes table */}
          <div className="page-card">
            <div className="page-card-header">
              <h5>Popular Routes</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">Route</th>
                    <th className="pe-4">Total Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {popularRoutes.map((r, i) => (
                    <tr key={i}>
                      <td className="ps-4">{r.route}</td>
                      <td className="pe-4">{r.bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Export modal — shown when user clicks Export PDF or Export Excel */}
      {showModal && (
        <ExportModal type={showModal} onClose={() => setShowModal(null)} />
      )}
    </>
  );
}

export default Reports;