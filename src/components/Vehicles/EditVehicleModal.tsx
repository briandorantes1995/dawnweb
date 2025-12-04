import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Formik } from "formik";
import { UnitSchema, TrailerSchema } from "../../validation/schema";

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (payload: any) => void;
  initial: any;
  action: "Editar" | "Crear";
  type: "unit" | "trailer"; // ← se agrega aquí
}

const EditVehicleModal: React.FC<Props> = ({
  show,
  onHide,
  onSubmit,
  initial,
  action,
  type,
}) => {
  const isTrailer = type === "trailer";

  const validationSchema = isTrailer ? TrailerSchema : UnitSchema;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{`${action} vehículo`}</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          const payload = {
            ...values,
            tonnage:
              values.tonnage === "" || values.tonnage === undefined
                ? null
                : Number(values.tonnage),
            volume:
              values.volume === "" || values.volume === undefined
                ? null
                : Number(values.volume),
          };

          onSubmit(payload);
        }}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            <Modal.Body>
              <Form>
                {/* TYPE */}
                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Control
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    isInvalid={touched.type && !!errors.type}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.type as string}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* PLATES */}
                <Form.Group className="mt-2">
                  <Form.Label>Placas</Form.Label>
                  <Form.Control
                    name="plates"
                    value={values.plates || ""}
                    onChange={handleChange}
                    isInvalid={touched.plates && !!errors.plates}
                  />
                </Form.Group>

                {/* UNIT IDENTIFIER (solo para unidades) */}
                {!isTrailer && (
                  <Form.Group className="mt-2">
                    <Form.Label>Identificador de unidad</Form.Label>
                    <Form.Control
                      name="unit_identifier"
                      value={values.unit_identifier || ""}
                      onChange={handleChange}
                      isInvalid={
                        touched.unit_identifier && !!errors.unit_identifier
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.unit_identifier as string}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {/* TONNAGE (ambos lo usan) */}
                {"tonnage" in values && (
                  <Form.Group className="mt-2">
                    <Form.Label>Tonelaje</Form.Label>
                    <Form.Control
                      type="number"
                      name="tonnage"
                      value={values.tonnage || ""}
                      onChange={handleChange}
                      isInvalid={touched.tonnage && !!errors.tonnage}
                    />
                  </Form.Group>
                )}

                {/* TRAILER FIELDS */}
                {isTrailer && (
                  <>
                    <Form.Group className="mt-2">
                      <Form.Label>Volumen</Form.Label>
                      <Form.Control
                        type="number"
                        name="volume"
                        value={values.volume || ""}
                        onChange={handleChange}
                        isInvalid={touched.volume && !!errors.volume}
                      />
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>Número de caja</Form.Label>
                      <Form.Control
                        name="box_number"
                        value={values.box_number || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        name="color"
                        value={values.color || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </>
                )}
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => handleSubmit()}>
                Guardar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default EditVehicleModal;
