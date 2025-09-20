/**
 * Charity Tracker - Database Schema
 * Using Drizzle ORM with Cloudflare D1
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table with subscription tracking
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  subscriptionTier: text('subscription_tier').default('free'), // free, standard
  subscriptionStatus: text('subscription_status').default('active'),
  subscriptionStartDate: text('subscription_start_date'),
  subscriptionEndDate: text('subscription_end_date'),
  donationCount: integer('donation_count').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Master charity database (IRS verified)
export const charities = sqliteTable('charities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ein: text('ein').unique(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  category: text('category'),
  description: text('description'),
  website: text('website'),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// User's personal charities
export const userCharities = sqliteTable('user_charities', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  ein: text('ein'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Donations tracking
export const donations = sqliteTable('donations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  charityId: text('charity_id'),
  charityName: text('charity_name').notNull(),
  amount: real('amount').notNull(),
  taxDeductibleAmount: real('tax_deductible_amount').notNull(),
  type: text('type').notNull(), // money, items, mileage, stock, crypto
  description: text('description'),
  date: text('date').notNull(),
  items: text('items'), // JSON string for multi-item donations
  receiptUrl: text('receipt_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// User sessions for authentication
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Tax settings for users
export const taxSettings = sqliteTable('tax_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  filingStatus: text('filing_status').default('single'), // single, married_joint, married_separate, head_of_household
  incomeBracket: text('income_bracket').default('bracket-2'), // Tax bracket
  taxRate: real('tax_rate').default(0.22), // Default 22% tax rate
  taxYear: integer('tax_year').default(2025),
  standardDeduction: real('standard_deduction').default(14600), // 2025 single standard deduction
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Charity = typeof charities.$inferSelect;
export type NewCharity = typeof charities.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
export type UserCharity = typeof userCharities.$inferSelect;
export type NewUserCharity = typeof userCharities.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type TaxSetting = typeof taxSettings.$inferSelect;
export type NewTaxSetting = typeof taxSettings.$inferInsert;