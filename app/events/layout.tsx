import Navbar from '@/components/navbar'

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      {children}
    </div>
  )
}