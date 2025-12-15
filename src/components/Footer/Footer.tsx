import React, { Component } from "react";
import { Container } from "react-bootstrap";

const Footer: React.FC = () => {
    return (
      <footer className="footer px-0 px-lg-3">
        <Container fluid>
          <nav>
            <p className="copyright text-center" style={{ fontWeight: 'bold' }}>
              © {new Date().getFullYear()}{" "}
              <a>Fehura</a>, made with
              love for better tracking
            </p>
          </nav>
        </Container>
      </footer>
    );
}

export default Footer;
