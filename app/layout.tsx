import './globals.css';
const inter = { className: 'font-sans' };

export const metadata = {
  title: 'RestQR - QR Menu Platform',
  description: 'Modern QR menu system with analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}