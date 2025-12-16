import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, CheckCircle, Circle, Sparkles, BarChart3, Zap, AlertTriangle, Clock, CheckCheck } from 'lucide-react'
import './index.css'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, percentage: 0, priority_breakdown: {} })
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPrioritized, setShowPrioritized] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`)
      setTasks(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPrioritized = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks/prioritize`)
      setTasks([...response.data.prioritized, ...response.data.completed])
      setSuggestion(response.data.suggestion)
      setShowPrioritized(true)
    } catch (error) {
      console.error('Error fetching prioritized tasks:', error)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await axios.post(`${API_BASE}/tasks`, { title: newTask })
      setTasks([...tasks, response.data])
      setNewTask('')
      fetchStats()
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ))
      fetchStats()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`)
      setTasks(tasks.filter(task => task.id !== taskId))
      fetchStats()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Zap },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      normal: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCheck }
    }
    const badge = badges[priority.level] || badges.normal
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {priority.level}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-300" />
            Smart Task Board
            <Sparkles className="text-yellow-300" />
          </h1>
          <p className="text-white/80">AI-powered task prioritization for maximum productivity</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-white/70 text-sm">Total</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-300">{stats.completed}</div>
              <div className="text-white/70 text-sm">Done</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-300">{stats.pending}</div>
              <div className="text-white/70 text-sm">Pending</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">{stats.percentage}%</div>
              <div className="text-white/70 text-sm">Progress</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>Progress</span>
              <span>{stats.percentage}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={addTask} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task... (try 'urgent: review proposal')"
              className="flex-1 px-4 py-3 rounded-xl bg-white/90 backdrop-blur border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 size={24} />
            Your Tasks
          </h2>
          <button
            onClick={fetchPrioritized}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-300 transition-all flex items-center gap-2 text-sm"
          >
            <Sparkles size={16} />
            Smart Prioritize
          </button>
        </div>

        {showPrioritized && suggestion && (
          <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <Sparkles className="text-yellow-300 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-white text-sm">{suggestion}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No tasks yet. Add one to get started!</p>
              <p className="text-sm mt-2">Tip: Use words like "urgent" or "important" for smart prioritization</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`task-enter p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors priority-${task.priority?.level || 'normal'}`}
                >
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className="flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </p>
                    {task.priority && !task.completed && (
                      <div className="mt-1">
                        {getPriorityBadge(task.priority)}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center text-white/60 text-sm">
          <p>Smart Task Board with AI-powered prioritization</p>
        </div>
      </div>
    </div>
  )
}

export default App
