import fs from "fs";

const env = `
window.__ENV__ = {
  VITE_API_URL: "${process.env.VITE_API_URL}",
  VITE_SSE_URL: "${process.env.VITE_SSE_URL}"
};
`;

fs.writeFileSync("public/env.js", env);
console.log("Archivo public/env.js generado ✅");

