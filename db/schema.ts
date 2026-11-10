import { date, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  workspace: text('workspace').notNull(),
  title: text('title').notNull(),
  course: text('course').notNull(),
  branch: text('branch').notNull().default(''),
  semester: text('semester').notNull().default(''),
  section: text('section').notNull().default(''),
  type: text('type').notNull().default('Assignment'),
  priority: text('priority').notNull().default('Medium'),
  status: text('status').notNull().default('To do'),
  due: date('due').notNull(),
  notes: text('notes').notNull().default(''),
  created_at: timestamp('created_at').defaultNow(),
})
