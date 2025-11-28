// src/global.d.ts

// Para archivos CSS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Para imágenes
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.jpeg" {
  const value: string;
  export default value;
}
declare module "*.gif" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const content: string;
  export default content;
}

// Para archivos JSON si los importas como módulos
declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss?v=*";


