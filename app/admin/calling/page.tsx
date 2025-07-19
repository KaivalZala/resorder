"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Clock, CheckCircle, RefreshCw } from "lucide-react"

interface WaiterCall {
  id: string
  table_number: number
  status: string
  created_at: string
  attended_at?: string | null
}

export default function WaiterCallingPage() {
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  const fetchCalls = async () => {
    setRefreshing(true)
    const { data, error } = await supabase
      .from("waiter_calls")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
    if (!error) setCalls(data || [])
    setRefreshing(false)
    setLoading(false)
  }

  useEffect(() => {
    fetchCalls()
    // Optionally, set up polling for near real-time updates
    const interval = setInterval(fetchCalls, 10000)
    return () => clearInterval(interval)
  }, [])

  const markAttended = async (id: string) => {
    await supabase
      .from("waiter_calls")
      .update({ status: "attended", attended_at: new Date().toISOString() })
      .eq("id", id)
    fetchCalls()
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Clock className="text-orange-500" /> Waiter Calls
        <Button variant="ghost" size="icon" onClick={fetchCalls} disabled={refreshing} className="ml-2">
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
        </Button>
      </h1>
      {loading ? (
        <div>Loading...</div>
      ) : calls.length === 0 ? (
        <div className="text-gray-500">No active waiter calls.</div>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <Card key={call.id} className="flex items-center justify-between p-6 border-l-4 border-orange-500 shadow">
              <div>
                <div className="text-xl font-bold">Table #{call.table_number}</div>
                <div className="text-gray-500 text-sm">Called at: {new Date(call.created_at).toLocaleTimeString()}</div>
              </div>
              <Button
                onClick={() => markAttended(call.id)}
                variant="success"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full"
              >
                <CheckCircle className="h-5 w-5" /> Attended
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}