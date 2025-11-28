import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import {ProfileSchema} from "../validation/schema"

const User: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return <p>Cargando usuario...</p>;

  const initialValues = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    // Aquí enviarías los datos al backend
    console.log("Actualizar usuario:", values);
  };

  return (
    <Container fluid>
      <Row>
        {/* Formulario de edición */}
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Editar Perfil</Card.Title>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <FormikForm>
                    <Row>
                      <Col md="6">
                        <Form.Group>
                          <label>Primer Nombre</label>
                          <Field
                            name="first_name"
                            className={`form-control ${
                              touched.first_name && errors.first_name ? "is-invalid" : ""
                            }`}
                          />
                          <ErrorMessage
                            name="first_name"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <label>Apellidos</label>
                          <Field
                            name="last_name"
                            className={`form-control ${
                              touched.last_name && errors.last_name ? "is-invalid" : ""
                            }`}
                          />
                          <ErrorMessage
                            name="last_name"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <Form.Group>
                          <label>Correo</label>
                          <Field
                            name="email"
                            type="email"
                            className={`form-control ${
                              touched.email && errors.email ? "is-invalid" : ""
                            }`}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <label>Telefono</label>
                          <Field
                            name="phone"
                            className={`form-control ${
                              touched.phone && errors.phone ? "is-invalid" : ""
                            }`}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="invalid-feedback"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="info" className="btn-fill pull-right">
                      Actualizar Perfil
                    </Button>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        {/* Datos de la empresa (solo lectura) */}
        <Col md="4">
          <Card className="card-user">
            <Card.Body>
              <h5>Informacion Compañia</h5>
              <Form>
                <Form.Group className="mb-2">
                  <label>Compañia</label>
                  <Form.Control value={user.company?.name || ""} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <label>Rol</label>
                  <Form.Control value={user.roles?.name || ""} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <label>Codigo invitacion</label>
                  <Form.Control value={user.company?.invitation_code || ""} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <label>Tipo Empresa</label>
                  <Form.Control value={user.company?.type || ""} disabled />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default User;
