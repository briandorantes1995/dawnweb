export function stripVehicleFields(vehicle: any) {
  const allowed = [
    "type",
    "plates",
    "unit_identifier",
    "tonnage",
    "status",
    "volume",
    "box_number",
    "color",
  ];

  const clean: any = {};
  for (const key of allowed) {
    if (vehicle[key] !== undefined) clean[key] = vehicle[key];
  }
  return clean;
}
