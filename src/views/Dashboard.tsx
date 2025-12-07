import React from "react";
import TasksPanel from "../components/Tasks/Tasks";
import DashboardCard from "../components/Dashboard/DashboardCard";
import StatCard from "../components/Dashboard/StatCard";
import SectionTitle from "../components/Dashboard/SectionTitle";
import PanelContainer from "../components/Dashboard/PanelContainer";
import {Container, Row, Col,} from "react-bootstrap";
import {LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer,
  CartesianGrid,} from "recharts";


const Dashboard: React.FC = () => {
  // DATASETS
  const usersBehavior = [
    { name: "9 AM", a: 287, b: 67, c: 23 },
    { name: "12 AM", a: 385, b: 152, c: 113 },
    { name: "3 PM", a: 490, b: 143, c: 67 },
    { name: "6 PM", a: 492, b: 240, c: 108 },
    { name: "9 PM", a: 554, b: 287, c: 190 },
    { name: "12 PM", a: 586, b: 335, c: 239 },
    { name: "3 AM", a: 698, b: 435, c: 307 },
    { name: "6 AM", a: 695, b: 437, c: 308 },
  ];

  const emailStats = [
    { name: "Open", value: 40 },
    { name: "Bounce", value: 20 },
    { name: "Unsubscribe", value: 40 },
  ];

  const salesData = [
    { name: "Jan", a: 542, b: 412 },
    { name: "Feb", a: 443, b: 243 },
    { name: "Mar", a: 320, b: 280 },
    { name: "Apr", a: 780, b: 580 },
    { name: "May", a: 553, b: 453 },
    { name: "Jun", a: 453, b: 353 },
    { name: "Jul", a: 326, b: 300 },
    { name: "Aug", a: 434, b: 364 },
    { name: "Sep", a: 568, b: 368 },
    { name: "Oct", a: 610, b: 410 },
    { name: "Nov", a: 756, b: 636 },
    { name: "Dec", a: 895, b: 695 },
  ];

  const pieColors = ["#17a2b8", "#dc3545", "#ffc107"];

  return (
      <Container fluid>

        {/* ======================================================
          TOP STAT CARDS
      ====================================================== */}
        <Row>
          <Col lg="3" sm="6">
            <StatCard
                label="Number"
                value="150GB"
                icon={<i className="nc-icon nc-chart text-warning"></i>}
                color="#ffc107"
            />
          </Col>

          <Col lg="3" sm="6">
            <StatCard
                label="Revenue"
                value="$ 1,345"
                icon={<i className="nc-icon nc-light-3 text-success"></i>}
                color="#28a745"
            />
          </Col>

          <Col lg="3" sm="6">
            <StatCard
                label="Errors"
                value="23"
                icon={<i className="nc-icon nc-vector text-danger"></i>}
                color="#dc3545"
            />
          </Col>

          <Col lg="3" sm="6">
            <StatCard
                label="Followers"
                value="+45K"
                icon={<i className="nc-icon nc-favourite-28 text-primary"></i>}
                color="#007bff"
            />
          </Col>
        </Row>


        {/* ======================================================
          USERS BEHAVIOR + EMAIL STATS
      ====================================================== */}
        <Row>
          <Col md="8">
            <PanelContainer>
              <SectionTitle>Users Behavior</SectionTitle>
              <p className="text-white-50">24 Hours performance</p>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={usersBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />

                    <Line dataKey="a" stroke="#17a2b8" />
                    <Line dataKey="b" stroke="#dc3545" />
                    <Line dataKey="c" stroke="#ffc107" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-white-50">
                <i className="fas fa-history"></i> Updated 3 minutes ago
              </div>
            </PanelContainer>
          </Col>

          <Col md="4">
            <PanelContainer>
              <SectionTitle>Email Statistics</SectionTitle>
              <p className="text-white-50">Last Campaign Performance</p>

              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                        data={emailStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                    >
                      {emailStats.map((_, i) => (
                          <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-white-50">
                <i className="far fa-clock"></i> Campaign sent 2 days ago
              </div>
            </PanelContainer>
          </Col>
        </Row>


        {/* ======================================================
          SALES + TASKS PANEL
      ====================================================== */}
        <Row>
          <Col md="6">
            <PanelContainer>
              <SectionTitle>2017 Sales</SectionTitle>
              <p className="text-white-50">All products including Taxes</p>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />

                    <Bar dataKey="a" name="Tesla Model S" fill="#17a2b8" />
                    <Bar dataKey="b" name="BMW 5 Series" fill="#dc3545" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-white-50">
                <i className="fas fa-check"></i> Data information certified
              </div>
            </PanelContainer>
          </Col>

          <Col md="6">
            <PanelContainer>
              <SectionTitle>Tasks</SectionTitle>
              <TasksPanel />
            </PanelContainer>
          </Col>
        </Row>
      </Container>
  );
};

export default Dashboard;

