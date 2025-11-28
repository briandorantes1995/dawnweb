import React from "react";
import {Alert, Badge, Button, Card, Modal, Container, Row, Col,} from "react-bootstrap";
import toast, { Toaster, ToastPosition } from "react-hot-toast";

const Notifications: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  const notify = (place: "tl" | "tc" | "tr" | "bl" | "bc" | "br") => {
    const positions: Record<typeof place, ToastPosition> = {
      tl: "top-left",
      tc: "top-center",
      tr: "top-right",
      bl: "bottom-left",
      bc: "bottom-center",
      br: "bottom-right",
    };

    const colors = ["primary", "success", "danger", "warning", "info"];
    const type = colors[Math.floor(Math.random() * colors.length)];

    toast(
        <div>
          <b>Light Bootstrap Dashboard React</b> notification example.
        </div>,
        {
          position: positions[place],
          duration: 3000,
          icon: "🔔",
        }
    );
  };

  return (
      <>
        {/* NOTIFICATION HOST */}
        <Toaster />

        <Container fluid>
          <Card>
            <Card.Header>
              <Card.Title as="h4">Notifications</Card.Title>
              <p className="card-category">Using react-hot-toast</p>
            </Card.Header>

            <Card.Body>
              <Row>
                <Col md="6">
                  <h5>
                    <small>Notification Styles</small>
                  </h5>

                  <Alert variant="info">This is a plain notification</Alert>

                  <Alert variant="info" dismissible>
                    This is a notification with close button.
                  </Alert>

                  <Alert variant="info" dismissible className="alert-with-icon">
                    <span className="nc-icon nc-bell-55 me-2"></span>
                    This is a notification with icon.
                  </Alert>

                  <Alert variant="info" dismissible className="alert-with-icon">
                    <span className="nc-icon nc-bell-55 me-2"></span>
                    This one has multiple lines. Everything stays aligned
                    correctly.
                  </Alert>
                </Col>

                <Col md="6">
                  <h5>
                    <small>Notification States</small>
                  </h5>

                  {["primary", "info", "success", "warning", "danger"].map(
                      (variant) => (
                          <Alert key={variant} variant={variant} dismissible>
                            <b>{variant} — </b> This is a ".alert-{variant}" example.
                          </Alert>
                      )
                  )}
                </Col>
              </Row>

              <br />
              <br />

              {/* BUTTONS FOR NOTIFICATION POSITIONS */}
              <div className="places-buttons">
                <Row>
                  <Col className="offset-md-3 text-center" md="6">
                    <Card.Title as="h4">Notifications Places</Card.Title>
                    <p className="card-category">
                      <small>Click to view notifications</small>
                    </p>
                  </Col>
                </Row>

                <Row className="justify-content-center">
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("tl")}
                        variant="secondary"
                    >
                      Top Left
                    </Button>
                  </Col>
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("tc")}
                        variant="secondary"
                    >
                      Top Center
                    </Button>
                  </Col>
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("tr")}
                        variant="secondary"
                    >
                      Top Right
                    </Button>
                  </Col>
                </Row>

                <Row className="justify-content-center mt-3">
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("bl")}
                        variant="secondary"
                    >
                      Bottom Left
                    </Button>
                  </Col>
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("bc")}
                        variant="secondary"
                    >
                      Bottom Center
                    </Button>
                  </Col>
                  <Col lg="3" md="3">
                    <Button
                        className="w-100"
                        onClick={() => notify("br")}
                        variant="secondary"
                    >
                      Bottom Right
                    </Button>
                  </Col>
                </Row>
              </div>

              <Row className="mt-5">
                <Col className="text-center" md="12">
                  <h4 className="title">Modal</h4>
                  <Button variant="info" onClick={() => setShowModal(true)}>
                    Launch Modal Mini
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* MINI MODAL */}
          <Modal
              className="modal-mini modal-primary"
              show={showModal}
              onHide={() => setShowModal(false)}
          >
            <Modal.Header className="justify-content-center">
              <div className="modal-profile">
                <i className="nc-icon nc-bulb-63"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="text-center">
              <p>Always have access to your profile</p>
            </Modal.Body>

            <div className="modal-footer">
              <Button variant="link" onClick={() => setShowModal(false)}>
                Back
              </Button>
              <Button variant="link" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </Modal>
        </Container>
      </>
  );
};

export default Notifications;

