import React from "react";
import TasksPanel from "../components/Tasks/Tasks";
import {Badge, Button, Card, Navbar, Nav, Table, Container, Row, Col, Form, OverlayTrigger, Tooltip,} from "react-bootstrap";
import {LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer, CartesianGrid,} from "recharts";

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

  // COLORS
  const pieColors = ["#17a2b8", "#dc3545", "#ffc107"];

  return (
      <Container fluid>
        {/* ==== CARDS SUPERIORES ==== */}
        <Row>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Number</p>
                      <Card.Title as="h4">150GB</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update Now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-light-3 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Revenue</p>
                      <Card.Title as="h4">$ 1,345</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  Last day
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Errors</p>
                      <Card.Title as="h4">23</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-clock-o mr-1"></i>
                  In the last hour
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-favourite-28 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Followers</p>
                      <Card.Title as="h4">+45K</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* ==== USERS BEHAVIOR ==== */}
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Users Behavior</Card.Title>
                <p className="card-category">24 Hours performance</p>
              </Card.Header>

              <Card.Body>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={usersBehavior}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />

                      <Line type="monotone" dataKey="a" stroke="#17a2b8" />
                      <Line type="monotone" dataKey="b" stroke="#dc3545" />
                      <Line type="monotone" dataKey="c" stroke="#ffc107" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>

              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* ==== EMAIL STATS ==== */}
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Email Statistics</Card.Title>
                <p className="card-category">Last Campaign Performance</p>
              </Card.Header>

              <Card.Body>
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
              </Card.Body>

              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> Campaign sent 2 days ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* ==== SALES ==== */}
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">2017 Sales</Card.Title>
                <p className="card-category">All products including Taxes</p>
              </Card.Header>

              <Card.Body>
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
              </Card.Body>

              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-check"></i> Data information certified
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* ==== TASKS ==== */}
          <Col md="6">
            <TasksPanel />
          </Col>

        </Row>
      </Container>
  );
};

export default Dashboard;
