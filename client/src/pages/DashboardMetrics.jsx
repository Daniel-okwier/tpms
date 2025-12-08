import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Container, Form } from 'react-bootstrap';
import { fetchDashboardData, fetchTrends } from '../slices/reportSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const LineChart = ({ data }) => <div style={{ height: '300px', border: '1px solid #eee', padding: '15px' }}>Line Chart: New Cases Trend Visualization</div>;
const PieChart = ({ data }) => <div style={{ height: '300px', border: '1px solid #eee', padding: '15px' }}>Pie Chart: Treatment Outcome Breakdown</div>;

// --- SUMMARY CARD COMPONENT ---
const SummaryCard = ({ title, value, variant = 'primary' }) => (
  <Card className={`text-center bg-${variant} text-white mb-4 shadow`}>
    <Card.Body>
      <Card.Title className="h5">{title}</Card.Title>
      <Card.Text className="h1">{value}</Card.Text>
    </Card.Body>
  </Card>
);

const DashboardMetrics = () => {
  const dispatch = useDispatch();
  const { dashboard, trends, loading, error } = useSelector((state) => state.reports);
  
  // State for filtering
  const [filters, setFilters] = useState({});
  const [period, setPeriod] = useState('month'); 

  // 1. Initial Data Fetch & Filter Handling
  useEffect(() => {
    // Fetch dashboard summary data
    dispatch(fetchDashboardData(filters));
    // Fetch trend data
    dispatch(fetchTrends({ period })); 
  }, [dispatch, filters, period]);
  
  // 2. Data Preparation for Visualization (Simplified)
  const outcomeData = dashboard?.treatments 
    ? [
        { label: 'Completed', count: dashboard.treatments.completedTreatments },
        { label: 'Ongoing', count: dashboard.treatments.ongoingTreatments },
        { label: 'Failed/Defaulted', count: dashboard.treatments.failedTreatments },
      ]
    : [];

  // Example of preparing data for Notification Trend Line Chart
  const trendData = trends?.newPatientsTrend 
    ? trends.newPatientsTrend.map(t => ({ 
        label: t._id, // Month or Week number
        count: t.count 
      }))
    : [];
      
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Operational Health Informatics Dashboard</h1>
        </Col>
      </Row>

      {/* Loading and Error Handling */}
      {loading === 'pending' && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}

      {dashboard && (
        <>
          {/* --- SUMMARY CARDS --- */}
          <Row>
            <Col md={3}>
              <SummaryCard title="Total Patients" value={dashboard.patients.totalPatients} variant="info" />
            </Col>
            <Col md={3}>
              <SummaryCard title="Active Treatment" value={dashboard.patients.activePatients} variant="success" />
            </Col>
            <Col md={3}>
              <SummaryCard title="Positive GeneXpert" value={dashboard.labTests.positiveGeneXpert} variant="warning" />
            </Col>
            <Col md={3}>
              <SummaryCard title="Total Treatments" value={dashboard.treatments.totalTreatments} variant="dark" />
            </Col>
          </Row>

          {/* --- TRENDS CHART --- */}
          <Card className="mb-4 shadow">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h5" className="mb-0">New Case Notification Trend</Card.Title>
                <Form.Group controlId="periodSelect" className="m-0">
                    <Form.Select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        size="sm"
                    >
                        <option value="month">Monthly</option>
                        <option value="week">Weekly</option>
                    </Form.Select>
                </Form.Group>
            </Card.Header>
            <Card.Body>
              {trends?.newPatientsTrend ? (
                <LineChart data={trendData} />
              ) : (
                <Message variant="info">Loading trend data...</Message>
              )}
            </Card.Body>
          </Card>

          {/* --- OUTCOME CHART & LAB SUMMARY --- */}
          <Row>
            <Col md={6}>
                <Card className="mb-4 shadow">
                    <Card.Header><Card.Title as="h5" className="mb-0">Treatment Outcomes</Card.Title></Card.Header>
                    <Card.Body>
                       {outcomeData.length > 0 ? (
                           <PieChart data={outcomeData} />
                       ) : (
                           <Message variant="info">Loading outcome data...</Message>
                       )}
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="mb-4 shadow">
                    <Card.Header><Card.Title as="h5" className="mb-0">Lab Test Summary</Card.Title></Card.Header>
                    <Card.Body>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between">
                                Total Lab Tests Done: <span>{dashboard.labTests.totalTests}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                Completed Tests: <span>{dashboard.labTests.completedTests}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                Positive GeneXpert: <span>{dashboard.labTests.positiveGeneXpert}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                Positive Smear: <span>{dashboard.labTests.positiveSmear}</span>
                            </li>
                        </ul>
                    </Card.Body>
                </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DashboardMetrics;