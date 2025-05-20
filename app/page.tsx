import FarmSimulator from "@/components/farm-simulator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-6">Симулятор Фермы</h1>
        <FarmSimulator />
      </div>
    </main>
  )
}
