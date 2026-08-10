import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, 
  Button, Alert, LinearProgress, Paper
} from '@mui/material';
import { 
  ConfirmationNumber, MonetizationOn, Cancel, DirectionsBus, Refresh
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

export default function AdminReports() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDays, setSelectedDays] = useState(0);

    useEffect(() => {
        fetchReports(selectedDays);
    }, [selectedDays]);

    const fetchReports = async (days = selectedDays) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/admin/reports?days=${days}`);
            setReportData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={4}>
                <Alert severity="error">{error}</Alert>
                <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => fetchReports(selectedDays)}>Retry</Button>
            </Box>
        );
    }

    if (!reportData) return null;

    return (
        <Box>
            {/* Header */}
            <div className="page-header">
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold mb-1 text-white">System Reports</h3>
                        <p className="text-white-50 small mb-0">Overview of platform performance and booking statistics</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }} startIcon={<Refresh />} onClick={() => fetchReports(selectedDays)}>
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <Box className="container py-4">
                {/* Date Filter Pills */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold" sx={{ mr: 1 }}>
                        Time Period:
                    </Typography>
                    {[
                        { label: 'All Time', days: 0 },
                        { label: 'Last 30 Days', days: 30 },
                        { label: 'Last 7 Days', days: 7 },
                        { label: 'Today (24h)', days: 1 }
                    ].map(item => (
                        <Button
                            key={item.days}
                            onClick={() => setSelectedDays(item.days)}
                            variant={selectedDays === item.days ? 'contained' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 600 }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
            {/* Top Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid xs={12} sm={6} md={3} display="flex">
                    <Card sx={{ borderLeft: 6, borderColor: 'primary.main', width: '100%', height: 140, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">TOTAL BOOKINGS</Typography>
                                    <Typography variant="h4" fontWeight="bold">{reportData.totalBookings}</Typography>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                                    <ConfirmationNumber />
                                </Box>
                            </Box>
                            <Typography variant="body2" mt={2} color="textSecondary">
                                <span style={{ color: 'green', fontWeight: 'bold' }}>{reportData.confirmedCount}</span> Confirmed
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid xs={12} sm={6} md={3} display="flex">
                    <Card sx={{ borderLeft: 6, borderColor: 'success.main', width: '100%', height: 140, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">TOTAL REVENUE</Typography>
                                    <Typography variant="h4" fontWeight="bold">₹{reportData.totalRevenue.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                                    <MonetizationOn />
                                </Box>
                            </Box>
                            <Typography variant="body2" mt={2} color="textSecondary">Across all confirmed bookings</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3} display="flex">
                    <Card sx={{ borderLeft: 6, borderColor: 'error.main', width: '100%', height: 140, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">CANCELLATIONS</Typography>
                                    <Typography variant="h4" fontWeight="bold">{reportData.cancelledCount}</Typography>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: 'error.light', borderRadius: 2, color: 'white' }}>
                                    <Cancel />
                                </Box>
                            </Box>
                            <Typography variant="body2" mt={2} color="textSecondary">Tickets cancelled by users</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3} display="flex">
                    <Card sx={{ borderLeft: 6, borderColor: 'secondary.main', width: '100%', height: 140, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">ACTIVE FLEET</Typography>
                                    <Typography variant="h4" fontWeight="bold">{reportData.totalBuses}</Typography>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: 'secondary.light', borderRadius: 2, color: 'black' }}>
                                    <DirectionsBus />
                                </Box>
                            </Box>
                            <Typography variant="body2" mt={2} color="textSecondary">{reportData.totalSchedules} active schedules</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recharts Bar Chart */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>Top Routes Performance</Typography>
                    {reportData.topRoutes.length > 0 ? (
                        <Box sx={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={reportData.topRoutes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="route" tick={{ fill: '#666', fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} />
                                    <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="bookings" fill="#328CC1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    ) : (
                        <Typography color="textSecondary" align="center" py={4}>No routes data available yet.</Typography>
                    )}
                </CardContent>
            </Card>

            {/* Linear Progress List (Optional, for redundancy or if chart fails) */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>Top 5 Popular Routes (List View)</Typography>
                    {reportData.topRoutes.length > 0 ? (
                        <Box>
                            {reportData.topRoutes.map((route, index) => {
                                const maxBookings = reportData.topRoutes[0].bookings;
                                const percent = maxBookings > 0 ? (route.bookings / maxBookings) * 100 : 0;
                                return (
                                    <Box key={index} sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography fontWeight="bold">{index + 1}. {route.route}</Typography>
                                            <Typography fontWeight="bold" color="primary">{route.bookings} bookings</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(50, 140, 193, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.light' } }} />
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography color="textSecondary" align="center" py={4}>No routes data available yet.</Typography>
                    )}
                </CardContent>
            </Card>
            </Box>
        </Box>
    );
}
