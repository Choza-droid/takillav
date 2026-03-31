import Navbar from '@/components/navbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#12111a' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}