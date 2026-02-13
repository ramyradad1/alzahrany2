
import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function TodoPage() {
  const [todos, setTodos] = useState<any[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos, error } = await supabase.from('todos').select()

      if (error) {
        console.error('Error fetching todos:', error)
      } else if (todos && todos.length > 0) {
        setTodos(todos)
      }
    }

    getTodos()
  }, [])

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <ul className="list-disc pl-5">
        {todos.map((todo) => (
          <li key={todo.id || JSON.stringify(todo)} className="mb-2">
            {JSON.stringify(todo)}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default TodoPage
