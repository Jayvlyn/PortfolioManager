import './globals.css';

export const metadata = {
  title: 'Portfolio Manager',
  description: 'Manage your portfolio projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
