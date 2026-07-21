import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const owners = sqliteTable('owners', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number'),
  village: text('village'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at').notNull(),
});

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  registrationNumber: text('registration_number'),
  type: text('type').notNull(),
  defaultPaymentMethod: text('default_payment_method').notNull(),
  defaultRate: real('default_rate').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const salaryRates = sqliteTable('salary_rates', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => owners.id),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  paymentType: text('payment_type').notNull(),
  rate: real('rate').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const workEntries = sqliteTable('work_entries', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  ownerId: text('owner_id').notNull().references(() => owners.id),
  vehicleId: text('vehicle_id').notNull().references(() => vehicles.id),
  paymentType: text('payment_type').notNull(),
  rate: real('rate').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  hours: real('hours'),
  pickupLocation: text('pickup_location'),
  dropLocation: text('drop_location'),
  notes: text('notes'),
  tripCount: integer('trip_count').default(0),
  status: text('status'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  expectedSalary: real('expected_salary').default(0),
  receivedSalary: real('received_salary').default(0),
  pendingSalary: real('pending_salary').default(0),
  salaryStatus: text('salary_status').default('pending'),
  createdAt: integer('created_at').notNull(),
});

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  workEntryId: text('work_entry_id').notNull().references(() => workEntries.id),
  tripNumber: integer('trip_number').notNull(),
  pickupLocation: text('pickup_location'),
  dropLocation: text('drop_location'),
  createdAt: integer('created_at').notNull(),
});

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  workEntryId: text('work_entry_id').notNull().references(() => workEntries.id),
  localUri: text('local_uri').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const salaryPayments = sqliteTable('salary_payments', {
  id: text('id').primaryKey(),
  workEntryId: text('work_entry_id').notNull().references(() => workEntries.id),
  amount: real('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});
