import type { Metadata } from "next";
import localFont from "next/font/local";
import "./../styles/globals.css";

const circularStd = localFont({
  src: [
    { path: "../fonts/Circular-Std-Book.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Circular-Std-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-circular",
  display: "swap",
});

const siteUrl = "https://cartasdamimo.com";

export const metadata: Metadata = {
  title: "Mimo Meu e Seu | Cestas e Cartões de Presente Personalizados",
  description:
    "Crie listas de presentes e cartões personalizados para surpreender quem você ama. Compartilhe carinho, memórias e momentos especiais de forma única.",
  authors: [{ name: "Marco Morais" }],
  keywords: [
    "presentes personalizados",
    "listas de presentes",
    "cartões de presente",
    "romance",
    "família",
    "amizade",
    "surpresas",
    "mimos criativos",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    // Título personalizado para a prévia do WhatsApp
    title: "Você recebeu um carinho da Mimo. Clique para abrir.",
    description:
      "Alguém preparou uma surpresa especial para você! Clique para visualizar seu presente no Mimo Meu e Seu.",
    url: siteUrl,
    siteName: "Mimo Meu e Seu",
    locale: "pt_BR",
    type: "website",
    images: [
          {
            url: "/android-chrome-512x512.png", // ou o nome que sua imagem tiver
            width: 512,
            height: 512,
            alt: "Um carinho da Mimo para você",
          },
        ],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Opcional: Adiciona suporte ao card do Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Você recebeu um carinho da Mimo.",
    description: "Abra para ver a surpresa que preparamos para você.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={circularStd.variable}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mimo Meu e Seu" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111827" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}