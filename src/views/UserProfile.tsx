import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {updateUser} from "../store/slices/authSlice";
import { RootState } from "../store/store";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import { ProfileSchema } from "../validation/schema";
import { useUserService } from "../api/users";
import toast from "react-hot-toast";
import { ContactType } from "../types/Contact";



const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { updateMe } = useUserService();

  if (!user) return <p>Cargando usuario...</p>;

  const initialValues = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    contact: (user.contact || "sms") as ContactType,
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const res = await updateMe(values);

      toast.success("Perfil actualizado correctamente");

      dispatch(updateUser(res.user));
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar perfil");
    }
  };

  return (
      <Container fluid>
        <Row>
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
                  {({ errors, touched, isSubmitting }) => (
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
                              <ErrorMessage name="first_name" component="div" className="invalid-feedback" />
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
                              <ErrorMessage name="last_name" component="div" className="invalid-feedback" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="6">
                            <Form.Group>
                              <label>Correo</label>
                              <Form.Control value={user.email} disabled readOnly />
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
                              <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="6">
                            <Form.Group>
                              <label>Método de Contacto</label>
                              <Field
                                  name="contact"
                                  as="select"
                                  className="form-control"
                              >
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                              </Field>
                              <ErrorMessage name="contact" component="div" className="invalid-feedback" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Button
                            type="submit"
                            variant="info"
                            className="btn-fill pull-right mt-3"
                            disabled={isSubmitting}
                        >
                          {isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
                        </Button>
                      </FormikForm>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>

          {/* Datos de la empresa */}
          <Col md="4">
            <Card className="card-user">
              <Card.Body>
                <h5>Información de la Compañía</h5>
                <Form>
                  <Form.Group className="mb-2">
                    <label>Compañía</label>
                    <Form.Control value={user.company?.name || ""} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <label>Rol</label>
                    <Form.Control value={user.roles?.[0]?.name || ""} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <label>Código de invitación</label>
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

export default UserProfile;


