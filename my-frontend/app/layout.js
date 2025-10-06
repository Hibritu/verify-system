import "./globals.css";
import { AuthProvider } from "../hooks/use-auth.js";
import { ThemeProvider } from "../components/theme-provider";

export const metadata = {
  title: "Exam Verification System",
  description: "Secure digital certificate management and verification platform",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
