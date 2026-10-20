import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dataset Lab | Encuesta sintética",
  description:
    "Generador local de datos sintéticos para pruebas de una encuesta académica.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
