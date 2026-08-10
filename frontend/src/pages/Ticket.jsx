import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Ticket() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const ticketRef = useRef();

    if (!state?.bookings) { navigate('/search'); return null; }

    const { bookings, schedule, contact } = state;
    const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

    const totalPaid = bookings.reduce((sum, b) => sum + (b.amountPaid || schedule.price), 0);
    const seatNumbers = bookings.map(b => b.seatNumber).join(', ');
    const bookingIds = bookings.map(b => b.bookingReference || b.bookingId).join('-');

    const downloadPDF = async () => {
        const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`EasyTravel_Ticket_${bookingIds}.pdf`);
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">
                <div className="text-center mb-4">
                    <span className="badge text-white fw-bold px-3 py-2 rounded-pill" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>
                        {bookings[0]?.status === 'CANCELLED' ? (
                            <><i className="bi bi-x-circle-fill me-2 text-danger"></i>Booking Cancelled</>
                        ) : (
                            <><i className="bi bi-check-circle-fill me-2 text-success"></i>Booking Confirmed!</>
                        )}
                    </span>
                    <div className="text-white mt-3 small">
                        <i className="bi bi-envelope-check-fill me-2"></i>
                        A copy of this ticket has been sent to <strong>{contact?.email}</strong>
                    </div>
                </div>

                {/* Ticket card */}
                <div ref={ticketRef} className="ticket-card mx-auto">
                    {/* Header */}
                    <div className="ticket-header">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>🚌 EasyTravel</h3>
                                <small className="opacity-75">E-Ticket / Booking Confirmation</small>
                            </div>
                            <QRCodeSVG
                                value={`EASYTRAVEL:BOOKINGS:${bookingIds}`}
                                size={70}
                                bgColor="transparent"
                                fgColor="#ffffff"
                            />
                        </div>

                        <div className="mt-3 d-flex justify-content-between align-items-end">
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{schedule.source}</div>
                                <div className="opacity-75 small">{formatTime(schedule.departureTime)}</div>
                            </div>
                            <div className="text-center px-3">
                                <i className="bi bi-arrow-right fs-4"></i>
                                <div className="opacity-75" style={{ fontSize: '0.7rem' }}>DIRECT</div>
                            </div>
                            <div className="text-end">
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{schedule.destination}</div>
                                <div className="opacity-75 small">{formatTime(schedule.arrivalTime)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Perforated edge */}
                    <div style={{ borderTop: '2px dashed #E5E7EB', margin: '0 -1px' }}></div>

                    {/* Body */}
                    <div className="ticket-body">
                        <div className="row mb-3">
                            <div className="col-6">
                                <div className="ticket-label">Travel Date</div>
                                <div className="ticket-value">{formatDate(schedule.departureTime)}</div>
                            </div>
                            <div className="col-6 text-end">
                                <div className="ticket-label">Bus No.</div>
                                <div className="ticket-value">{schedule.busNumber}</div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-6">
                                <div className="ticket-label">Boarding Point</div>
                                <div className="ticket-value">{bookings[0]?.boardingPoint || schedule.source}</div>
                            </div>
                            <div className="col-6 text-end">
                                <div className="ticket-label">Dropping Point</div>
                                <div className="ticket-value">{bookings[0]?.droppingPoint || schedule.destination}</div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-6">
                                <div className="ticket-label">Contact Email</div>
                                <div className="ticket-value">{contact?.email}</div>
                            </div>
                            <div className="col-6 text-end">
                                <div className="ticket-label">Seats ({bookings.length})</div>
                                <div className="ticket-value fs-5" style={{ color: '#27AE60' }}>{seatNumbers}</div>
                            </div>
                        </div>

                        <h6 className="fw-bold text-muted border-bottom pb-2 mb-3">Passenger Details</h6>
                        <div className="table-responsive">
                            <table className="table table-borderless table-sm mb-0">
                                <thead className="ticket-label text-muted border-bottom">
                                    <tr>
                                        <th>Seat</th>
                                        <th>Passenger Name</th>
                                        <th>Age/Gender</th>
                                        <th>Booking ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.bookingId}>
                                            <td className="fw-bold" style={{ color: '#27AE60' }}>{b.seatNumber}</td>
                                            <td className="fw-bold text-dark">{b.passengerName}</td>
                                            <td className="text-muted">{b.passengerAge} / {b.passengerGender}</td>
                                            <td className="text-muted small">#{b.bookingReference || b.bookingId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="ticket-row border-top mt-3 pt-3">
                            <div>
                                <div className="ticket-label">Status</div>
                                <div className={`badge-${bookings[0]?.status === 'CANCELLED' ? 'cancelled text-danger fw-bold' : 'confirmed'} d-inline-block mt-1`}>
                                    {bookings[0]?.status || 'CONFIRMED'}
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="ticket-label">Total Amount Paid</div>
                                <div className="ticket-value" style={{ color: '#E07B39', fontSize: '1.3rem' }}>₹{totalPaid}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
                    <button onClick={downloadPDF} className="btn-sw-success" style={{ border: 'none', cursor: 'pointer' }}>
                        <i className="bi bi-download me-2"></i>Download PDF Ticket
                    </button>
                    <button onClick={() => navigate('/search')} className="btn btn-light rounded-3 px-4 py-2 fw-semibold">
                        <i className="bi bi-search me-2"></i>Book Another
                    </button>
                </div>
            </div>
        </div>
    );
}