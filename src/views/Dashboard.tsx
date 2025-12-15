import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { getUserCompanyType } from "../utils/routePermissions";
import { useDashboardService } from "../api/dashboard";
import {
  setSellerData,
  setTransporterData,
  setLoading,
  setError,
} from "../store/slices/dashboardSlice";
import TasksPanel from "../components/Tasks/Tasks";
import DashboardCard from "../components/Dashboard/DashboardCard";
import StatCard from "../components/Dashboard/StatCard";
import SectionTitle from "../components/Dashboard/SectionTitle";
import PanelContainer from "../components/Dashboard/PanelContainer";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import {LineChart,Line,PieChart,Pie,Cell,BarChart,Bar,XAxis,YAxis,Tooltip as ChartTooltip,Legend,ResponsiveContainer,CartesianGrid,} from "recharts";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sellerData, transporterData, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { fetchSellerDashboard, fetchTransporterDashboard } =
    useDashboardService();
  const companyType = getUserCompanyType(user);

  // Cargar datos solo si no están en caché
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!companyType) return;

      dispatch(setLoading(true));

      try {
        // Cargar dashboard según el tipo de empresa
        if (companyType === "SELLER" || companyType === "BOTH") {
          if (!sellerData) {
            const sellerDataResponse = await fetchSellerDashboard();
            dispatch(setSellerData(sellerDataResponse));
          }
        }

        if (companyType === "TRANSPORTER" || companyType === "BOTH") {
          if (!transporterData) {
            const transporterDataResponse = await fetchTransporterDashboard();
            dispatch(setTransporterData(transporterDataResponse));
          }
        }
      } catch (err: any) {
        const errorMessage = err.message || "Error al cargar datos del dashboard";
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyType, dispatch]); // Solo ejecutar cuando cambie el tipo de empresa

  // Colores para los gráficos de pie
  // Orden: Pendiente (amarillo), Aceptada/Completada (azul), Cancelada (rojo), Problema (naranja)
  const pieColors = ["#ffc107", "#17a2b8", "#dc3545", "#ff9500"];

  // Renderizar según el tipo de empresa
  if (isLoading) {
    return (
      <Container fluid>
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-white-50">Cargando datos del dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <div className="text-center p-5">
          <p className="text-danger">Error: {error}</p>
        </div>
      </Container>
    );
  }

  // Dashboard para SELLER
  const renderSellerDashboard = () => {
    if (!sellerData) return null;

    const loadsStatusData = [
      { name: "Pendiente", value: sellerData.loadsStatus.pendiente, color: "#ffc107" },
      { name: "Aceptada", value: sellerData.loadsStatus.aceptada, color: "#17a2b8" },
      { name: "Cancelada", value: sellerData.loadsStatus.cancelada, color: "#dc3545" },
    ];

    return (
      <>
        {/* Stat Cards para SELLER */}
        <Row>
          <Col lg="3" sm="6">
            <StatCard
              label="Cargas Pendientes"
              value={sellerData.loadsStatus.pendiente}
              icon={<i className="nc-icon nc-time-alarm text-warning"></i>}
              color="#ffc107"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Cargas Aceptadas"
              value={sellerData.loadsStatus.aceptada}
              icon={<i className="nc-icon nc-check-2 text-success"></i>}
              color="#28a745"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Cargas Canceladas"
              value={sellerData.loadsStatus.cancelada}
              icon={<i className="nc-icon nc-simple-remove text-danger"></i>}
              color="#dc3545"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Proveedores Activos"
              value={sellerData.acceptedByProvider.length}
              icon={<i className="nc-icon nc-delivery-fast text-primary"></i>}
              color="#007bff"
            />
          </Col>
        </Row>

        {/* Gráfico mensual de cargas */}
        <Row className="mt-4">
          <Col md="8">
            <PanelContainer>
              <SectionTitle>Cargas Mensuales (Últimos 12 meses)</SectionTitle>
              <p style={{ color: "#666666" }}>Datos trimestrales</p>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={sellerData.loadsMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: "#000000" }}
                      style={{ color: "#000000" }}
                    />
                    <YAxis 
                      tick={{ fill: "#000000" }}
                      style={{ color: "#000000" }}
                    />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(255,255,255,0.95)", 
                        border: "1px solid rgba(0,0,0,0.2)",
                        color: "#000000"
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#000000" }} />
                    <Line
                      dataKey="pendiente"
                      stroke="#ffc107"
                      name="Pendiente"
                    />
                    <Line dataKey="aceptada" stroke="#28a745" name="Aceptada" />
                    <Line dataKey="cancelada" stroke="#dc3545" name="Cancelada" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </PanelContainer>
          </Col>

          <Col md="4">
            <PanelContainer>
              <SectionTitle>Estado de Cargas</SectionTitle>
              <p style={{ color: "#666666" }}>Distribución actual</p>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={loadsStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {loadsStatusData.map((item: any, i) => (
                        <Cell key={i} fill={item.color || pieColors[i]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.9)", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#ffffff"
                      }}
                      itemStyle={{ color: "#ffffff" }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Legend wrapperStyle={{ color: "#000000" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PanelContainer>
          </Col>
        </Row>
      </>
    );
  };

  // Dashboard para TRANSPORTER
  const renderTransporterDashboard = () => {
    if (!transporterData) return null;

    const assignmentStatusData = [
      { name: "Pendiente", value: transporterData.assignmentStatus.pendiente, color: "#ffc107" },
      {
        name: "Completada",
        value: transporterData.assignmentStatus.completada,
        color: "#17a2b8"
      },
      {
        name: "Problema Reportado",
        value: transporterData.assignmentStatus.problema_reportado,
        color: "#ff9500"
      },
      {
        name: "Cancelada",
        value: transporterData.assignmentStatus.cancelada,
        color: "#dc3545"
      },
    ];

    return (
      <>
        {/* Stat Cards para TRANSPORTER */}
        <Row>
          <Col lg="3" sm="6">
            <StatCard
              label="Asignaciones Pendientes"
              value={transporterData.assignmentStatus.pendiente}
              icon={<i className="nc-icon nc-time-alarm text-warning"></i>}
              color="#ffc107"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Asignaciones Completadas"
              value={transporterData.assignmentStatus.completada}
              icon={<i className="nc-icon nc-check-2 text-success"></i>}
              color="#28a745"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Unidades Disponibles"
              value={transporterData.units.free}
              icon={<i className="nc-icon nc-bus-front-12 text-info"></i>}
              color="#17a2b8"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              label="Total Unidades"
              value={transporterData.units.total}
              icon={<i className="nc-icon nc-delivery-fast text-primary"></i>}
              color="#007bff"
            />
          </Col>
        </Row>

        {/* Gráfico mensual de asignaciones */}
        <Row className="mt-4">
          <Col md="8">
            <PanelContainer>
              <SectionTitle>
                Asignaciones Mensuales (Últimos 12 meses)
              </SectionTitle>
              <p style={{ color: "#666666" }}>Datos trimestrales</p>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={transporterData.monthlyAssignments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: "#000000" }}
                      style={{ color: "#000000" }}
                    />
                    <YAxis 
                      tick={{ fill: "#000000" }}
                      style={{ color: "#000000" }}
                    />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(255,255,255,0.95)", 
                        border: "1px solid rgba(0,0,0,0.2)",
                        color: "#000000"
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#000000" }} />
                    <Bar dataKey="count" fill="#17a2b8" name="Asignaciones" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PanelContainer>
          </Col>

          <Col md="4">
            <PanelContainer>
              <SectionTitle>Estado de Asignaciones</SectionTitle>
              <p style={{ color: "#666666" }}>Distribución actual</p>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={assignmentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {assignmentStatusData.map((item: any, i) => (
                        <Cell key={i} fill={item.color || pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.9)", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#ffffff"
                      }}
                      itemStyle={{ color: "#ffffff" }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Legend wrapperStyle={{ color: "#000000" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PanelContainer>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Container fluid>
      {companyType === "SELLER" && renderSellerDashboard()}
      {companyType === "TRANSPORTER" && renderTransporterDashboard()}
      {companyType === "BOTH" && (
        <>
          {sellerData && (
            <>
              <h3 className="text-white mb-3">Dashboard Vendedor</h3>
              {renderSellerDashboard()}
            </>
          )}
          {transporterData && (
            <>
              <h3 className="text-white mb-3 mt-5">Dashboard Transportista</h3>
              {renderTransporterDashboard()}
            </>
          )}
        </>
      )}

      {/* Tasks Panel siempre visible */}
      {(companyType === "SELLER" || companyType === "TRANSPORTER" || companyType === "BOTH") && (
        <Row className="mt-4">
          <Col md="12">
            <PanelContainer>
              <SectionTitle>Tasks</SectionTitle>
              <TasksPanel />
            </PanelContainer>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;

