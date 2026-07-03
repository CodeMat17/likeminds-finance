import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  members: defineTable({
    name: v.string(),
    pin: v.string(),
    dob: v.string(), // ISO date "YYYY-MM-DD"
    joinDate: v.optional(v.string()), // ISO date "YYYY-MM-DD"; undefined = legacy member, treat as joined before records began
    phone: v.optional(v.string()),
    umunna: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    banned: v.optional(v.boolean()),
  }).index("by_pin", ["pin"]),

  duesYears: defineTable({
    year: v.number(),
  }).index("by_year", ["year"]),

  monthlyDues: defineTable({
    memberId: v.id("members"),
    year: v.number(),
    month: v.number(), // 1-12
    paid: v.boolean(),
    datePaid: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_member_year", ["memberId", "year"])
    .index("by_year_month", ["year", "month"]),

  levyYears: defineTable({
    year: v.number(),
    minAmount: v.number(),
  }).index("by_year", ["year"]),

  projectLevy: defineTable({
    memberId: v.id("members"),
    year: v.number(),
    paid: v.boolean(),
    amount: v.optional(v.number()),
    datePaid: v.optional(v.string()),
  })
    .index("by_member_year", ["memberId", "year"])
    .index("by_year", ["year"]),

  paymentHistory: defineTable({
    memberId: v.id("members"),
    type: v.union(v.literal("dues"), v.literal("levy")),
    year: v.number(),
    month: v.optional(v.number()),
    amount: v.number(),
    date: v.string(),
  }).index("by_member", ["memberId"]),

  auditLog: defineTable({
    adminId: v.id("members"),
    action: v.string(),
    target: v.string(),
    details: v.string(),
    date: v.string(),
  }).index("by_date", ["date"]),
});
