import React from "react";
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";
// react-bootstrap components
import {Alert,Badge,Button,Card,Modal,Navbar,Nav,Container,Row,Col,} from "react-bootstrap";

const Notifications: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);
  const notificationAlertRef = React.useRef<NotificationAlert | null>(null);
 const notify = (place: "tl" | "tc" | "tr" | "bl" | "bc" | "br") => {
  let color = Math.floor(Math.random() * 5 + 1);
  let type: "primary" | "success" | "danger" | "warning" | "info" = "primary";

  switch (color) {
    case 1: type = "primary"; break;
    case 2: type = "success"; break;
    case 3: type = "danger"; break;
    case 4: type = "warning"; break;
    case 5: type = "info"; break;
  }

  const options: any  = {
    place,
    message: (
      <div>
        <div>
          Welcome to <b>Light Bootstrap Dashboard React</b> - a beautiful freebie for every web developer.
        </div>
      </div>
    ),
    type,
    icon: "nc-icon nc-bell-55",
    autoDismiss: 7,
  };

  notificationAlertRef.current?.notificationAlert(options);
};

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <Container fluid>
        <Card>
          <Card.Header>
            <Card.Title as="h4">Notifications</Card.Title>
            <p className="card-category">
              Handcrafted by our friend and colleague{" "}
              <a
                href="https://github.com/EINazare"
                rel="noopener noreferrer"
                target="_blank"
              >
                Nazare Emanuel-Ioan
              </a>
              . Please checkout the{" "}
              <a
                href="https://github.com/creativetimofficial/react-notification-alert"
                rel="noopener noreferrer"
                target="_blank"
              >
                full documentation.
              </a>
            </p>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="6">
                <h5>
                  <small>Notifications Style</small>
                </h5>
                <Alert variant="info">
                  <span>This is a plain notification</span>
                </Alert>
                <Alert variant="info">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>This is a notification with close button.</span>
                </Alert>
                <Alert className="alert-with-icon" variant="info">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span
                    data-notify="icon"
                    className="nc-icon nc-bell-55"
                  ></span>
                  <span>
                    This is a notification with close button and icon.
                  </span>
                </Alert>
                <Alert className="alert-with-icon" variant="info">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span
                    data-notify="icon"
                    className="nc-icon nc-bell-55"
                  ></span>
                  <span>
                    This is a notification with close button and icon and have
                    many lines. You can see that the icon and the close button
                    are always vertically aligned. This is a beautiful
                    notification. So you don't have to worry about the style.
                  </span>
                </Alert>
              </Col>
              <Col md="6">
                <h5>
                  <small>Notification States</small>
                </h5>
                <Alert variant="primary">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>
                    <b>Primary -</b>
                    This is a regular notification made with ".alert-primary"
                  </span>
                </Alert>
                <Alert variant="info">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>
                    <b>Info -</b>
                    This is a regular notification made with ".alert-info"
                  </span>
                </Alert>
                <Alert variant="success">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>
                    <b>Success -</b>
                    This is a regular notification made with ".alert-success"
                  </span>
                </Alert>
                <Alert variant="warning">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>
                    <b>Warning -</b>
                    This is a regular notification made with ".alert-warning"
                  </span>
                </Alert>
                <Alert variant="danger">
                  <button
                    aria-hidden={true}
                    className="close"
                    data-dismiss="alert"
                    type="button"
                  >
                    <i className="nc-icon nc-simple-remove"></i>
                  </button>
                  <span>
                    <b>Danger -</b>
                    This is a regular notification made with ".alert-danger"
                  </span>
                </Alert>
              </Col>
            </Row>
            <br></br>
            <br></br>
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
                  <Button className="d-block w-100" onClick={() => notify("tl")} variant="secondary">
                    Top Left
                  </Button>
                </Col>
                <Col lg="3" md="3">
                 <Button className="d-block w-100" onClick={() => notify("tc")} variant="secondary">
                    Top Center
                </Button>
                </Col>
                <Col lg="3" md="3">
                 <Button className="d-block w-100" onClick={() => notify("tr")} variant="secondary">
                    Top Right
                </Button>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col lg="3" md="3">
                  <Button className="d-block w-100" onClick={() => notify("bl")} variant="secondary">
                    Bottom Left
                  </Button>
                </Col>
                <Col lg="3" md="3">
                  <Button className="d-block w-100" onClick={() => notify("bc")} variant="secondary">
                    Bottom Center
                  </Button>
                </Col>
                <Col lg="3" md="3">
                  <Button className="d-block w-100" onClick={() => notify("br")} variant="secondary">
                    Bottom Right
                  </Button>
                </Col>
              </Row>
            </div>
            <Row>
              <Col className="text-center" md="12">
                <h4 className="title">Modal</h4>
                <Button
                  className="btn-fill btn-wd"
                  variant="info"
                  onClick={() => setShowModal(true)}
                >
                  Launch Modal Mini
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {/* Mini Modal */}
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
            <p>Always have an access to your profile</p>
          </Modal.Body>
          <div className="modal-footer">
            <Button
              className="btn-simple"
              type="button"
              variant="link"
              onClick={() => setShowModal(false)}
            >
              Back
            </Button>
            <Button
              className="btn-simple"
              type="button"
              variant="link"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
        {/* End Modal */}
      </Container>
    </>
  );
}

export default Notifications;
