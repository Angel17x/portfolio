import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicTheme } from "@/components/DynamicTheme";
import { DynamicSiteConfig } from "@/components/DynamicSiteConfig";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Angel Lugo | Desarrollador Full Stack",
    template: "%s | Angel Lugo",
  },
  description:
    "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
  keywords: [
    "Desarrollador Full Stack",
    "JavaScript",
    "React",
    "Node.js",
    "Next.js",
    "Angular",
    "Flutter",
    "Microservicios",
    "Portfolio",
    "Desarrollador Web",
    "Desarrollador Móvil",
  ],
  authors: [{ name: "Angel Lugo" }],
  creator: "Angel Lugo",
  publisher: "Angel Lugo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tudominio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tudominio.com",
    siteName: "Angel Lugo - Portfolio",
    title: "Angel Lugo | Desarrollador Full Stack",
    description:
      "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Angel Lugo | Desarrollador Full Stack",
    description:
      "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Agregar aquí tus códigos de verificación cuando los tengas
    // google: "tu-codigo-google",
    // yandex: "tu-codigo-yandex",
    // yahoo: "tu-codigo-yahoo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <DynamicTheme />
          <DynamicSiteConfig />
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
