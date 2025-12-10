import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useUnitsService } from "../../api/unit";
import { useTrailersService } from "../../api/trailers";
import { useDriversService } from "../../api/drivers";
import "./AssignDriverModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  userId: string;
  onSubmit: (data: {
    licenseNumber: string;
    licenseType: string | null;
    vehicleId: string | null;
    trailerId: string | null;
    driverId?: string | null;
    isEdit?: boolean;
  }) => void;
}

const AssignDriverModal: React.FC<Props> = ({ show, onHide, userId, onSubmit }) => {
  const { fetchUnits } = useUnitsService();
  const { fetchTrailers } = useTrailersService();
  const { fetchDrivers } = useDriversService();

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedTrailerId, setSelectedTrailerId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [existingDriverId, setExistingDriverId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const canSelectTrailer = selectedVehicle?.type === "Tráiler (Transporte nacional)";

  useEffect(() => {
    if (show) {
      // Primero cargar vehículos y trailers, luego cargar datos del conductor
      loadData().then(() => {
        loadDriverData();
      });
    } else {
      // Reset form when modal closes
      setLicenseNumber("");
      setLicenseType("");
      setSelectedVehicleId(null);
      setSelectedTrailerId(null);
      setExistingDriverId(null);
      setIsEditMode(false);
    }
  }, [show, userId]);

  // Clear trailer selection if vehicle is not a trailer type
  useEffect(() => {
    if (!canSelectTrailer && selectedTrailerId) {
      setSelectedTrailerId(null);
    }
  }, [canSelectTrailer, selectedTrailerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitsResponse, trailersResponse] = await Promise.all([
        fetchUnits(),
        fetchTrailers(),
      ]);

      // Get all active vehicles
      const allVehicles = [
        ...(unitsResponse.active || []),
        ...(unitsResponse.inactive || []),
      ];
      setVehicles(allVehicles);

      // Get all active trailers
      const allTrailers = [
        ...(trailersResponse.active || []),
        ...(trailersResponse.inactive || []),
      ];
      setTrailers(allTrailers);
    } catch (err) {
      console.error("Error loading vehicles/trailers:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverData = async () => {
    if (!userId) return;
    
    try {
      setLoadingDriver(true);
      const driversResponse = await fetchDrivers();
      const allDrivers = [...(driversResponse.active || []), ...(driversResponse.inactive || [])];
      
      // Buscar si el usuario ya es conductor
      const existingDriver = allDrivers.find((d: any) => d.member_id === userId || d.member?.id === userId);
      
      if (existingDriver) {
        // El usuario ya es conductor, cargar sus datos
        setExistingDriverId(existingDriver.id);
        setIsEditMode(true);
        
        setLicenseNumber(existingDriver.license_number || "");
        setLicenseType(existingDriver.license_type || "");
        
        // Obtener los IDs del vehículo y trailer
        const vehicleId = existingDriver.default_unit?.id || null;
        const trailerId = existingDriver.default_trailer?.id || null;
        
        setSelectedVehicleId(vehicleId);
        setSelectedTrailerId(trailerId);
      } else {
        // El usuario no es conductor, limpiar formulario
        setExistingDriverId(null);
        setIsEditMode(false);
        setLicenseNumber("");
        setLicenseType("");
        setSelectedVehicleId(null);
        setSelectedTrailerId(null);
      }
    } catch (err) {
      console.error("Error loading driver data:", err);
    } finally {
      setLoadingDriver(false);
    }
  };

  const handleSubmit = () => {
    if (!licenseNumber.trim()) {
      alert("Por favor ingresa el número de licencia");
      return;
    }

    onSubmit({
      licenseNumber: licenseNumber.trim(),
      licenseType: licenseType.trim() || null,
      vehicleId: selectedVehicleId,
      trailerId: canSelectTrailer ? selectedTrailerId : null,
      driverId: existingDriverId,
      isEdit: isEditMode,
    });
    
    // Reset form
    setLicenseNumber("");
    setLicenseType("");
    setSelectedVehicleId(null);
    setSelectedTrailerId(null);
    setExistingDriverId(null);
    setIsEditMode(false);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      dialogClassName="assign-driver-modal-dialog"
      onEntered={() => {
        const modalDialog = document.querySelector('.assign-driver-modal-dialog') as HTMLElement;
        if (modalDialog) {
          modalDialog.style.setProperty('transform', 'none', 'important');
          modalDialog.style.setProperty('-webkit-transform', 'none', 'important');
          modalDialog.style.setProperty('-o-transform', 'none', 'important');
          modalDialog.style.setProperty('margin-top', '15px', 'important');
        }
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? "Editar Conductor" : "Asignar como Conductor"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(loading || loadingDriver) ? (
          <div className="text-center p-3">
            <Spinner animation="border" />
            <p className="mt-2">{loadingDriver ? "Cargando datos del conductor..." : "Cargando vehículos..."}</p>
          </div>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>
                Número de licencia <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. ABC123456"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                autoCapitalize="characters"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de licencia</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Tipo A, Tipo B"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vehículo asignado</Form.Label>
              <Form.Select
                value={selectedVehicleId || ""}
                onChange={(e) => {
                  const value = e.target.value || null;
                  setSelectedVehicleId(value);
                  if (!value || vehicles.find((v) => v.id === value)?.type !== "Tráiler (Transporte nacional)") {
                    setSelectedTrailerId(null);
                  }
                }}
              >
                <option value="">Sin asignar</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plates || vehicle.unit_identifier || vehicle.id} - {vehicle.type || "Sin tipo"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Caja/Tráiler asignado</Form.Label>
              {!canSelectTrailer ? (
                <Form.Control
                  type="text"
                  value="Solo disponible cuando el vehículo seleccionado es 'Tráiler (Transporte nacional)'"
                  disabled
                  className="bg-light"
                />
              ) : (
                <Form.Select
                  value={selectedTrailerId || ""}
                  onChange={(e) => setSelectedTrailerId(e.target.value || null)}
                >
                  <option value="">Sin asignar</option>
                  {trailers.map((trailer) => (
                    <option key={trailer.id} value={trailer.id}>
                      {trailer.plates || trailer.box_number || trailer.id} - {trailer.type || "Sin tipo"}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || loadingDriver || !licenseNumber.trim()}
        >
          {isEditMode ? "Guardar Cambios" : "Asignar Conductor"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignDriverModal;
