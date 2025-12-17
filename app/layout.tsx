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

// 🔴 Corrigido: removido espaços extras
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
    title: "Mimo Meu e Seu | Presentes que criam memórias inesquecíveis",
    description:
      "Transforme seus gestos de carinho em lembranças inesquecíveis. Crie, compartilhe e celebre com o Mimo Meu e Seu.",
    url: siteUrl,
    siteName: "Mimo Meu e Seu",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        {/* 👇 Favicon padrão */}
        <link rel="icon" href="/favicon.ico" />

        {/* 👇 Ícones Apple (iOS) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* 👇 Ícones Android / Chrome */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* 👇 Manifest para PWA */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* 👇 Meta tags para iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mimo Meu e Seu" />

        {/* 👇 Theme color */}
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