
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function SupabaseTest() {
    const [todos, setTodos] = useState<any[]>([])
    const [status, setStatus] = useState<string>('Loading...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function getTodos() {
            try {
                setStatus('Fetching...')
                // Try fetching specific table 'todos' as requested, but also fallback or check connection
                const { data, error } = await supabase.from('todos').select('*').limit(5)

                if (error) {
                    // If 'todos' table doesn't exist, this will error, but that proves connection works (404/PGRST error)
                    console.warn('Supabase fetch error:', error)
                    setError(error.message)
                    setStatus('Error')
                } else {
                    setTodos(data || [])
                    setStatus('Connected (Found ' + (data?.length || 0) + ' items)')
                }
            } catch (err: any) {
                setError(err.message || 'Unknown error')
                setStatus('Connection Failed')
            }
        }

        getTodos()
    }, [])

    return (
        <div className="p-4 m-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md">
            <h3 className="font-bold text-lg mb-2">Supabase Connection Test</h3>
            <div className="mb-2">
                <span className="font-semibold">Status: </span>
                <span className={status.includes('Error') || status.includes('Failed') ? 'text-red-500' : 'text-green-600'}>
                    {status}
                </span>
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <h4 className="font-semibold mt-2">Data (Table: todos):</h4>
            <ul className="list-disc pl-5 mt-1">
                {todos.length === 0 ? (
                    <li className="text-slate-500 italic">No items found (or table empty)</li>
                ) : (
                    todos.map((todo, idx) => (
                        <li key={todo.id || idx}>{JSON.stringify(todo)}</li>
                    ))
                )}
            </ul>
            <div className="mt-2 text-xs text-slate-400">
                Checking: {import.meta.env.VITE_SUPABASE_URL}
            </div>
        </div>
    )
}
