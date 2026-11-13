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

type Activity = {
  id: number
  message: string
  taskTitle: string
  createdAt: string
}

type View = 'dashboard' | 'tasks'
type TaskDraft = Omit<Task, 'id'> & { id?: number }
type IconName = 'grid' | 'list' | 'plus' | 'search' | 'check' | 'clock' | 'alert' | 'activity' | 'calendar' | 'cap' | 'arrow' | 'close'

const STORAGE_KEY = 'taskstatus.tasks'
const ACTIVITY_KEY = 'taskstatus.activity'

const branches = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Electronics & Communication',
  'First-year / Common Engineering',
]

const defaultDraft = (): TaskDraft => ({
  title: '',
  course: '',
  branch: '',
  semester: '',
  section: '',
  type: 'Assignment',
  priority: 'Medium',
  status: 'To do',
  due: getLocalDate(),
  notes: '',
})

function getLocalDate() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as Task[]) : []
  } catch {
    return []
  }
}

function loadActivity(): Activity[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as Activity[]) : []
  } catch {
    return []
  }
}

function formatDate(value: string) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`))
}

function formatTimeAgo(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Recently'
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  return (
    <svg {...common}>
      {name === 'grid' && <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>}
      {name === 'list' && <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>}
      {name === 'plus' && <><path d="M12 5v14M5 12h14" /></>}
      {name === 'search' && <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>}
      {name === 'check' && <><path d="m5 12 4.2 4.2L19 6.5" /></>}
      {name === 'clock' && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>}
      {name === 'alert' && <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 16.5h.01" /></>}
      {name === 'activity' && <><path d="M3 12h4l2.5-7 5 14 2.5-7H21" /></>}
      {name === 'calendar' && <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>}
      {name === 'cap' && <><path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" /><path d="M6 11v5c3.5 3 8.5 3 12 0v-5M21.5 9v6" /></>}
      {name === 'arrow' && <><path d="M5 12h14M13 6l6 6-6 6" /></>}
      {name === 'close' && <><path d="m6 6 12 12M18 6 6 18" /></>}
    </svg>
  )
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string
  value: number
  detail: string
  icon: IconName
  tone: string
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon name={icon} size={19} /></div>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        <span className="stat-detail">{detail}</span>
      </div>
    </article>
  )
}

export function Home() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [activity, setActivity] = useState<Activity[]>(loadActivity)
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All tasks')
  const [branchFilter, setBranchFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [draft, setDraft] = useState<TaskDraft | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity))
  }, [activity])

  const branchOptions = useMemo(
    () => [...new Set([...branches, ...tasks.map((task) => task.branch).filter(Boolean)])],
    [tasks],
  )

  const today = getLocalDate()
  const total = tasks.length
  const completed = tasks.filter((task) => task.status === 'Completed').length
  const inProgress = tasks.filter((task) => task.status === 'In progress').length
  const overdue = tasks.filter((task) => task.status !== 'Completed' && task.due < today).length
  const completionRate = total ? Math.round((completed / total) * 100) : 0

  const visibleTasks = tasks
    .filter((task) => statusFilter === 'All tasks' || task.status === statusFilter)
    .filter((task) => !branchFilter || task.branch === branchFilter)
    .filter((task) => !semesterFilter || task.semester === semesterFilter)
    .filter((task) => `${task.title} ${task.course} ${task.branch}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.due.localeCompare(b.due))

  const upcomingTasks = [...tasks]
    .filter((task) => task.status !== 'Completed')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4)

  const recentTasks = [...tasks].sort((a, b) => b.id - a.id).slice(0, 5)

  function addActivity(message: string, taskTitle: string) {
    setActivity((current) => [
      { id: Date.now(), message, taskTitle, createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 12))
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return

    const isEditing = Boolean(draft.id)
    const task: Task = {
      ...draft,
      id: draft.id ?? Date.now(),
      title: draft.title.trim(),
      course: draft.course.trim(),
    }

    setTasks((current) =>
      isEditing
        ? current.map((item) => (item.id === draft.id ? task : item))
        : [task, ...current],
    )
    addActivity(isEditing ? 'Updated task' : 'Created task', task.title)
    setDraft(null)
  }

  function toggleTask(task: Task) {
    const isCompleted = task.status !== 'Completed'
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: isCompleted ? 'Completed' : 'To do' }
          : item,
      ),
    )
    addActivity(isCompleted ? 'Completed task' : 'Reopened task', task.title)
  }

  function deleteTask(id: number) {
    const task = tasks.find((item) => item.id === id)
    if (task && window.confirm('Delete this task?')) {
      setTasks((current) => current.filter((item) => item.id !== id))
      addActivity('Deleted task', task.title)
      setDraft(null)
    }
  }

  function openTasks(filter = 'All tasks') {
    setStatusFilter(filter)
    setActiveView('tasks')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setActiveView('dashboard') }}>
          <span className="brand-mark"><Icon name="check" size={22} /></span>
          <span className="brand-name">TaskStatus<span>STUDENT WORKSPACE</span></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={activeView === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('dashboard')}>
            <Icon name="grid" /><span>Overview</span>
          </button>
          <button className={activeView === 'tasks' && statusFilter === 'All tasks' ? 'nav-link active' : 'nav-link'} onClick={() => openTasks()}>
            <Icon name="list" /><span>My tasks</span><span className="nav-count">{total}</span>
          </button>
        </nav>

        <div className="sidebar-label status-label">TASK STATUS</div>
        <nav className="side-nav" aria-label="Task status filters">
          <button className="nav-link" onClick={() => openTasks('To do')}><span className="status-dot todo-dot" /><span>To do</span><span className="nav-count">{tasks.filter((task) => task.status === 'To do').length}</span></button>
          <button className="nav-link" onClick={() => openTasks('In progress')}><span className="status-dot progress-dot" /><span>In progress</span><span className="nav-count">{inProgress}</span></button>
          <button className="nav-link" onClick={() => openTasks('Completed')}><span className="status-dot done-dot" /><span>Completed</span><span className="nav-count">{completed}</span></button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <span className="tip-icon"><Icon name="cap" size={18} /></span>
          <strong>Small steps add up.</strong>
          <p>Keep your tasks organised and make room for focused work.</p>
          <button onClick={() => setDraft(defaultDraft())}>Add a task <Icon name="arrow" size={15} /></button>
        </div>
        <div className="sidebar-user">
          <div className="avatar">IT</div>
          <div><strong>My workspace</strong><span>Personal account</span></div>
          <span className="online-dot" />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-separator">/</span><strong>{activeView === 'dashboard' ? 'Overview' : 'My tasks'}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input
                aria-label="Search tasks"
                value={query}
                onFocus={() => setActiveView('tasks')}
                onChange={(event) => { setQuery(event.target.value); setActiveView('tasks') }}
                placeholder="Search your tasks..."
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="header-add" onClick={() => setDraft(defaultDraft())}><Icon name="plus" size={17} /><span>New task</span></button>
            <div className="header-avatar" aria-label="My workspace">IT</div>
          </div>
        </header>

        <div className="page-content">
          {activeView === 'dashboard' ? (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
                  <h1>Good to see you <span>👋</span></h1>
                  <p className="page-subtitle">Here's what's happening with your tasks today.</p>
                </div>
                <button className="primary-button" onClick={() => setDraft(defaultDraft())}><Icon name="plus" size={17} /> Create task</button>
              </section>

              <section className="stats-grid" aria-label="Task summary">
                <StatCard label="Total tasks" value={total} detail="Across your workspace" icon="list" tone="blue" />
                <StatCard label="In progress" value={inProgress} detail="Currently being worked on" icon="clock" tone="purple" />
                <StatCard label="Completed" value={completed} detail="Tasks finished" icon="check" tone="green" />
                <StatCard label="Overdue" value={overdue} detail="Past their due date" icon="alert" tone="orange" />
              </section>

              <section className="dashboard-grid">
                <article className="panel progress-panel">
                  <div className="panel-heading"><div><p className="eyebrow">YOUR PROGRESS</p><h2>Task overview</h2></div><span className="panel-icon"><Icon name="activity" /></span></div>
                  <div className="progress-summary"><strong>{completionRate}%</strong><span>completion rate</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${completionRate}%` }} /></div>
                  <div className="progress-legend">
                    <span><i className="legend-dot completed-dot" />Completed <strong>{completed}</strong></span>
                    <span><i className="legend-dot active-dot" />In progress <strong>{inProgress}</strong></span>
                    <span><i className="legend-dot pending-dot" />To do <strong>{tasks.filter((task) => task.status === 'To do').length}</strong></span>
                  </div>
                  <button className="text-link" onClick={() => openTasks()}>View all tasks <Icon name="arrow" size={15} /></button>
                </article>

                <article className="panel activity-panel">
                  <div className="panel-heading"><div><p className="eyebrow">LATEST UPDATES</p><h2>Recent activity</h2></div><span className="panel-icon"><Icon name="activity" /></span></div>
                  {activity.length ? (
                    <div className="activity-list">
                      {activity.slice(0, 5).map((item) => (
                        <div className="activity-item" key={item.id}>
                          <span className="activity-icon"><Icon name={item.message === 'Completed task' ? 'check' : item.message === 'Deleted task' ? 'close' : 'list'} size={15} /></span>
                          <div className="activity-copy"><strong>{item.message}</strong><span>{item.taskTitle}</span></div>
                          <time>{formatTimeAgo(item.createdAt)}</time>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="activity-empty"><span className="activity-empty-icon"><Icon name="activity" size={22} /></span><strong>No activity yet</strong><p>Your task updates will show up here.</p></div>
                  )}
                </article>
              </section>

              <section className="panel upcoming-panel">
                <div className="panel-heading"><div><p className="eyebrow">STAY ON TRACK</p><h2>Upcoming tasks</h2></div><button className="text-link" onClick={() => openTasks()}>See all <Icon name="arrow" size={15} /></button></div>
                {upcomingTasks.length ? (
                  <div className="upcoming-list">
                    {upcomingTasks.map((task) => (
                      <div className="upcoming-item" key={task.id}>
                        <button className="check-button" onClick={() => toggleTask(task)} aria-label={`Complete ${task.title}`}><Icon name="check" size={14} /></button>
                        <div className="upcoming-copy"><strong>{task.title}</strong><span>{task.course || task.type}</span></div>
                        <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <time className={task.due < today ? 'due-date overdue-date' : 'due-date'}><Icon name="calendar" size={14} />{formatDate(task.due)}</time>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="simple-empty"><span>You're all caught up.</span><button className="text-link" onClick={() => setDraft(defaultDraft())}>Create your first task <Icon name="arrow" size={15} /></button></div>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="welcome-row tasks-heading">
                <div><p className="eyebrow">STAY ORGANISED</p><h1>My tasks</h1><p className="page-subtitle">Manage your assignments, projects and deadlines.</p></div>
                <button className="primary-button" onClick={() => setDraft(defaultDraft())}><Icon name="plus" size={17} /> Create task</button>
              </section>

              <section className="task-stats-strip">
                <span><strong>{total}</strong> total</span><span><strong>{inProgress}</strong> in progress</span><span><strong>{completed}</strong> completed</span><span><strong>{overdue}</strong> overdue</span>
              </section>

              <section className="filters-panel" aria-label="Filter tasks">
                <label>Branch<select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}><option value="">All branches</option>{branchOptions.map((branch) => <option key={branch}>{branch}</option>)}</select></label>
                <label>Semester<select value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)}><option value="">All semesters</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}</select></label>
                <button className="clear-filters" onClick={() => { setBranchFilter(''); setSemesterFilter(''); setStatusFilter('All tasks'); setQuery('') }}>Clear filters</button>
              </section>

              <nav className="task-tabs" aria-label="Task status">
                {['All tasks', 'To do', 'In progress', 'Completed'].map((status) => (
                  <button key={status} className={statusFilter === status ? 'task-tab active' : 'task-tab'} onClick={() => setStatusFilter(status)}>{status}<span>{status === 'All tasks' ? total : tasks.filter((task) => task.status === status).length}</span></button>
                ))}
              </nav>

              {visibleTasks.length ? (
                <section className="task-list" aria-label="Tasks">
                  {visibleTasks.map((task) => (
                    <article key={task.id} className="task-row">
                      <button className={`check-button ${task.status === 'Completed' ? 'is-checked' : ''}`} onClick={() => toggleTask(task)} aria-label={`${task.status === 'Completed' ? 'Reopen' : 'Complete'} ${task.title}`}><Icon name="check" size={14} /></button>
                      <button className="task-main" onClick={() => setDraft({ ...task })}>
                        <strong className={task.status === 'Completed' ? 'task-done' : ''}>{task.title}</strong>
                        <span>{task.course} · {task.type}</span>
                        <small>{[task.branch, task.semester && `Semester ${task.semester}`, task.section && `Section ${task.section}`].filter(Boolean).join(' · ')}</small>
                      </button>
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <div className="task-row-meta"><span className={`status-pill ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span><time>{formatDate(task.due)}</time></div>
                    </article>
                  ))}
                </section>
              ) : (
                <section className="empty-state"><span className="empty-icon"><Icon name="list" size={24} /></span><h2>{tasks.length ? 'No matching tasks' : 'Your task list is empty'}</h2><p>{tasks.length ? 'Try adjusting your search or filters.' : 'Create your first task and keep everything in one place.'}</p>{!tasks.length && <button className="primary-button" onClick={() => setDraft(defaultDraft())}><Icon name="plus" size={16} /> Create task</button>}</section>
              )}
            </>
          )}
        </div>
      </main>

      {draft && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}>
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <header className="dialog-header"><div><p className="eyebrow">TASK DETAILS</p><h2 id="dialog-title">{draft.id ? 'Edit task' : 'Create a task'}</h2></div><button className="close-button" type="button" onClick={() => setDraft(null)} aria-label="Close"><Icon name="close" /></button></header>
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
              <label>Notes<textarea rows={3} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Add any useful details..." /></label>
              <footer className="dialog-actions">
                {draft.id && <button className="delete-button" type="button" onClick={() => deleteTask(draft.id!)}>Delete task</button>}
                <button className="secondary-button" type="button" onClick={() => setDraft(null)}>Cancel</button>
                <button className="primary-button" type="submit">{draft.id ? 'Save changes' : 'Create task'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
