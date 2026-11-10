import type { Config } from '@netlify/functions'
import { and, asc, eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js'

export const config: Config = {
  path: '/api/tasks',
}

const allowedStatuses = ['To do', 'In progress', 'Completed']
const allowedPriorities = ['High', 'Medium', 'Low']
const allowedTypes = ['Assignment', 'Lab work', 'Exam', 'Project', 'Personal']
const allowedCourses = [
  'Data Structures',
  'Engineering Mathematics',
  'Database Management',
  'Digital Electronics',
  'Computer Networks',
  'General',
]

const readWorkspace = (request: Request) => {
  const url = new URL(request.url)
  return (
    url.searchParams.get('workspace') ??
    request.headers.get('x-workspace') ??
    'default-workspace'
  )
}

const parseBody = async (request: Request) => {
  try {
    return await request.json()
  } catch {
    return null
  }
}

const ensureDate = (value: string | undefined) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export default async function handler(request: Request) {
  const workspace = readWorkspace(request)
  const scope = eq(tasks.workspace, workspace)

  if (request.method === 'GET') {
    try {
      const rows = await db
        .select()
        .from(tasks)
        .where(scope)
        .orderBy(asc(tasks.due))

      return Response.json(rows, {
        headers: { 'Cache-Control': 'no-store' },
      })
    } catch (error) {
      console.error('Task load failure', error)
      return Response.json(
        { error: 'Your tasks could not be loaded. Please try again.' },
        { status: 500 },
      )
    }
  }

  if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await parseBody(request)

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json(
      { error: 'Please send valid task details.' },
      { status: 400 },
    )
  }

  if (request.method === 'DELETE') {
    if (!Number.isInteger(body.id)) {
      return Response.json({ error: 'Invalid task' }, { status: 400 })
    }

    try {
      const deleted = await db
        .delete(tasks)
        .where(and(scope, eq(tasks.id, body.id)))
        .returning({ id: tasks.id })

      if (!deleted.length) {
        return Response.json({ error: 'Task not found' }, { status: 404 })
      }

      return Response.json({ ok: true })
    } catch (error) {
      console.error('Task delete failure', error)
      return Response.json(
        { error: 'Your task could not be deleted. Please try again.' },
        { status: 500 },
      )
    }
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const course = typeof body.course === 'string' ? body.course.trim() : ''
  const branch = typeof body.branch === 'string' ? body.branch.trim() : ''
  const section = typeof body.section === 'string' ? body.section.trim() : ''
  const semester = typeof body.semester === 'string' ? body.semester : ''
  const due = typeof body.due === 'string' ? body.due : ''

  if (
    !title ||
    title.length > 200 ||
    !course ||
    !allowedCourses.includes(course) ||
    course.length > 100 ||
    (body.branch !== undefined && (typeof body.branch !== 'string' || body.branch.length > 100)) ||
    (body.semester !== undefined && !['', '1', '2', '3', '4', '5', '6', '7', '8'].includes(semester)) ||
    (body.section !== undefined && (typeof body.section !== 'string' || body.section.length > 20)) ||
    typeof body.status !== 'string' ||
    !allowedStatuses.includes(body.status) ||
    typeof body.priority !== 'string' ||
    !allowedPriorities.includes(body.priority) ||
    typeof body.type !== 'string' ||
    !allowedTypes.includes(body.type) ||
    !ensureDate(due)
  ) {
    return Response.json({ error: 'Please check your task details.' }, { status: 400 })
  }

  const values = {
    workspace,
    title,
    course,
    branch: body.branch !== undefined || request.method === 'POST' ? branch : undefined,
    semester: body.semester !== undefined || request.method === 'POST' ? semester : undefined,
    section: body.section !== undefined || request.method === 'POST' ? section : undefined,
    type: body.type,
    priority: body.priority,
    status: body.status,
    due,
    notes: typeof body.notes === 'string' ? body.notes : '',
  }

  try {
    if (request.method === 'POST') {
      const [task] = await db.insert(tasks).values(values).returning()
      return Response.json(task, { status: 201 })
    }

    if (!Number.isInteger(body.id)) {
      return Response.json({ error: 'Invalid task' }, { status: 400 })
    }

    const [task] = await db
      .update(tasks)
      .set(values)
      .where(and(scope, eq(tasks.id, body.id)))
      .returning()

    return task ? Response.json(task) : Response.json({ error: 'Task not found' }, { status: 404 })
  } catch (error) {
    console.error('Task backend failure', error)
    return Response.json(
      { error: 'Your tasks could not be saved or loaded. Please try again.' },
      { status: 500 },
    )
  }
}
