'use client'

import Sidebar from '../../src/components/Layout/Sidebar'

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-24 p-6">
        {children}
      </main>
    </div>
  )
}