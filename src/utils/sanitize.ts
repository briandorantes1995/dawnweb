export function stripUnitFields(data: any) {
  const allowed = [
    "type",
    "plates",
    "unit_identifier",
    "tonnage",
    "status",
  ];

  const clean: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) clean[key] = data[key];
  }
  return clean;
}

export function stripTrailerFields(data: any) {
  const allowed = [
    "type",
    "plates",
    "tonnage",
    "status",
    "volume",
    "box_number",
    "color",
  ];

  const clean: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) clean[key] = data[key];
  }
  return clean;
}
