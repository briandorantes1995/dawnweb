// src/utils/googleMapsUtils.ts

/**
 * Verifica si un URL necesita ser expandido (es un link corto)
 */
export const needsExpansion = (url: string): boolean => {
  if (!url) return false;
  return /(goo\.gl|bit\.ly|maps\.app\.goo\.gl|tinyurl\.com|short\.ly)/i.test(url);
};

/**
 * Resuelve un link corto a su URL completa
 */
export const resolveShortLink = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url, { redirect: "manual" });
    // Si hay una redirección, obtener la URL de Location header
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("Location");
      if (location) return location;
    }
    return res.url || url;
  } catch (error) {
    console.error("Error resolviendo link corto:", error);
    return url; // Si falla, devolver el original
  }
};

/**
 * Extrae coordenadas (lat, lng) de un link de Google Maps
 */
export const extractCoordsFromGoogleLink = (url: string): { lat: string; lng: string } | null => {
  if (!url) return null;
  const decodedUrl = decodeURIComponent(url);

  // Prioridad 1: Formato /place/.../@lat,lng,zoomz
  const placePattern = /\/place\/[^/]+\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
  const placeMatch = decodedUrl.match(placePattern);
  if (placeMatch && placeMatch[1] && placeMatch[2]) {
    return { lat: placeMatch[1], lng: placeMatch[2] };
  }

  // Prioridad 2: Formato @lat,lng (genérico)
  const atPattern = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
  const atMatch = decodedUrl.match(atPattern);
  if (atMatch && atMatch[1] && atMatch[2]) {
    return { lat: atMatch[1], lng: atMatch[2] };
  }

  // Prioridad 3: Formato !3d[lat]!4d[lng]
  const exclamationPattern = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;
  const exclamationMatch = decodedUrl.match(exclamationPattern);
  if (exclamationMatch && exclamationMatch[1] && exclamationMatch[2]) {
    return { lat: exclamationMatch[1], lng: exclamationMatch[2] };
  }

  // Prioridad 4: Formato ?q=lat,lng
  const queryPattern = /[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
  const queryMatch = decodedUrl.match(queryPattern);
  if (queryMatch && queryMatch[1] && queryMatch[2]) {
    return { lat: queryMatch[1], lng: queryMatch[2] };
  }

  // Prioridad 5: Buscar cualquier patrón lat,lng genérico
  const genericMatch = decodedUrl.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (genericMatch && genericMatch[1] && genericMatch[2]) {
    return { lat: genericMatch[1], lng: genericMatch[2] };
  }

  return null;
};

/**
 * Normaliza un link de Google Maps al formato estándar
 */
export const normalizeGoogleMapsLink = async (url: string): Promise<string> => {
  if (!url) return "";
  let finalUrl = url.trim();

  // Si es un link corto, expandirlo primero
  if (needsExpansion(finalUrl)) {
    finalUrl = await resolveShortLink(finalUrl);
  }

  // Verificar si ya está en el formato correcto
  const hasCorrectFormat = /\/place\/[^/]+\/@-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,\d+z/i.test(finalUrl);
  if (hasCorrectFormat) {
    return finalUrl;
  }

  // Extraer coordenadas del link
  const coords = extractCoordsFromGoogleLink(finalUrl);

  if (coords) {
    // Extraer el nombre del lugar si existe
    let placeName = "Ubicación";
    const placeNameMatch = finalUrl.match(/\/place\/([^/@]+)/);
    if (placeNameMatch && placeNameMatch[1]) {
      placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));
      if (placeName.includes(",")) {
        placeName = placeName.split(",")[0].trim();
      }
      if (placeName.length > 50) {
        placeName = placeName.substring(0, 50).trim();
      }
    }

    return `https://www.google.com/maps/place/${encodeURIComponent(placeName)}/@${coords.lat},${coords.lng},18z`;
  }

  // Si no se pueden extraer coordenadas, devolver el link tal cual
  return finalUrl;
};

