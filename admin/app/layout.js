import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Clubpro MFG - Admin Dashboard",
  description: "Clubpro MFG Main Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        {children}
        <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
