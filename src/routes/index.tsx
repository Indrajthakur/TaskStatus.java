import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Task = {
  id: number
  title: string
  course: string
  branch: string
  semester: string
  section: string
  type: string
  priority: string
  status: string
  due: string
  notes: string
}

const STORAGE_KEY = 'taskstatus.tasks'
const branches = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Electronics & Communication',
  'First-year / Common Engineering',
]
const defaultDraft = (): Omit<Task, 'id'> => ({
  title: '',
  course: '',
  branch: '',
  semester: '',
  section: '',
  type: 'Assignment',
  priority: 'Medium',
  status: 'To do',
  due: new Date().toISOString().slice(0, 10),
  notes: '',
})

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Task[]) : []
  } catch {
    return []
  }
}

export function Home() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All tasks')
  const [branchFilter, setBranchFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [draft, setDraft] = useState<(Omit<Task, 'id'> & { id?: number }) | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const branchOptions = useMemo(
    () => [...new Set([...branches, ...tasks.map((task) => task.branch).filter(Boolean)])],
    [tasks],
  )

  const visibleTasks = tasks
    .filter((task) => statusFilter === 'All tasks' || task.status === statusFilter)
    .filter((task) => !branchFilter || task.branch === branchFilter)
    .filter((task) => !semesterFilter || task.semester === semesterFilter)
    .filter((task) => `${task.title} ${task.course} ${task.branch}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.due.localeCompare(b.due))

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return

    const task: Task = {
      ...draft,
      id: draft.id ?? Date.now(),
      title: draft.title.trim(),
      course: draft.course.trim(),
    }

    setTasks((current) =>
      draft.id ? current.map((item) => (item.id === draft.id ? task : item)) : [task, ...current],
    )
    setDraft(null)
  }

  function toggleTask(task: Task) {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: item.status === 'Completed' ? 'To do' : 'Completed' }
          : item,
      ),
    )
  }

  function deleteTask(id: number) {
    if (window.confirm('Delete this task?')) {
      setTasks((current) => current.filter((task) => task.id !== id))
      setDraft(null)
    }
  }

  const completed = tasks.filter((task) => task.status === 'Completed').length

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">A little more focus, every day</p>
          <h1>My tasks</h1>
        </div>
        <button className="primary-button" onClick={() => setDraft(defaultDraft())}>+ Create task</button>
      </header>

      <section className="stats" aria-label="Task summary">
        <article className="stat-card"><span>Total tasks</span><strong>{tasks.length}</strong></article>
        <article className="stat-card"><span>To do</span><strong>{tasks.filter((task) => task.status === 'To do').length}</strong></article>
        <article className="stat-card"><span>Completed</span><strong>{completed}</strong></article>
      </section>

      <section className="filters" aria-label="Filter tasks">
        <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks or courses" /></label>
        <label>Branch<select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}><option value="">All branches</option>{branchOptions.map((branch) => <option key={branch}>{branch}</option>)}</select></label>
        <label>Semester<select value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)}><option value="">All semesters</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}</select></label>
      </section>

      <nav className="tabs" aria-label="Task status">
        {['All tasks', 'To do', 'In progress', 'Completed'].map((status) => (
          <button key={status} className={statusFilter === status ? 'tab active' : 'tab'} onClick={() => setStatusFilter(status)}>{status}</button>
        ))}
      </nav>

      {visibleTasks.length ? (
        <section className="task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <article key={task.id} className="task-card">
              <button className={`check ${task.status === 'Completed' ? 'checked' : ''}`} onClick={() => toggleTask(task)} aria-label={`${task.status === 'Completed' ? 'Reopen' : 'Complete'} ${task.title}`}>{task.status === 'Completed' ? '✓' : ''}</button>
              <button className="task-content" onClick={() => setDraft({ ...task })}>
                <span className="task-title">{task.title}</span>
                <span className="task-subtitle">{task.course} · {task.type}</span>
                <span className="task-academic">{[task.branch, task.semester && `Semester ${task.semester}`, task.section && `Section ${task.section}`].filter(Boolean).join(' · ')}</span>
              </button>
              <div className="task-side"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><time dateTime={task.due}>{task.due}</time></div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state"><h2>{tasks.length ? 'No matching tasks' : 'Nothing on your list yet'}</h2><p>{tasks.length ? 'Try changing your filters.' : 'Add a task to get started. Your tasks are saved in this browser.'}</p></section>
      )}

      {draft && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}>
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <header className="dialog-header"><h2 id="dialog-title">{draft.id ? 'Edit task' : 'Create task'}</h2><button className="close-button" type="button" onClick={() => setDraft(null)} aria-label="Close">×</button></header>
            <form onSubmit={saveTask}>
              <label>Task name<input autoFocus required maxLength={200} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Prepare lab record" /></label>
              <div className="form-grid">
                <label>Subject / course<input required maxLength={100} value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} placeholder="e.g. Data Structures" /></label>
                <label>Due date<input required type="date" value={draft.due} onChange={(event) => setDraft({ ...draft, due: event.target.value })} /></label>
              </div>
              <fieldset><legend>Academic details <span>Optional</span></legend>
                <label>Branch name<input list="branch-options" maxLength={100} value={draft.branch} onChange={(event) => setDraft({ ...draft, branch: event.target.value })} placeholder="Choose or type your branch" /><datalist id="branch-options">{branchOptions.map((branch) => <option key={branch} value={branch} />)}</datalist></label>
                <div className="form-grid">
                  <label>Semester<select value={draft.semester} onChange={(event) => setDraft({ ...draft, semester: event.target.value })}><option value="">Not specified</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}</select></label>
                  <label>Section / batch<input maxLength={20} value={draft.section} onChange={(event) => setDraft({ ...draft, section: event.target.value })} placeholder="e.g. A" /></label>
                </div>
              </fieldset>
              <div className="form-grid">
                <label>Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{['Assignment', 'Lab work', 'Exam', 'Project', 'Personal'].map((type) => <option key={type}>{type}</option>)}</select></label>
                <label>Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>{['High', 'Medium', 'Low'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
              </div>
              <label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{['To do', 'In progress', 'Completed'].map((status) => <option key={status}>{status}</option>)}</select></label>
              <label>Notes<textarea rows={3} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
              <footer className="dialog-actions">
                {draft.id && <button className="delete-button" type="button" onClick={() => deleteTask(draft.id!)}>Delete</button>}
                <button className="primary-button" type="submit">{draft.id ? 'Save changes' : 'Create task'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
