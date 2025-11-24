import { ChatbotWrapper } from '@/components/ChatbotWrapper'

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-navy-900">
      {children}
      <ChatbotWrapper />
    </div>
  )
}
