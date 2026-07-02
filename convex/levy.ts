import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listYears = query({
  args: {},
  handler: async (ctx) => {
    const years = await ctx.db.query("levyYears").collect();
    return years
      .map((y) => ({ year: y.year, minAmount: y.minAmount }))
      .sort((a, b) => b.year - a.year);
  },
});

export const addYear = mutation({
  args: { year: v.number(), minAmount: v.optional(v.number()) },
  handler: async (ctx, { year, minAmount }) => {
    const existing = await ctx.db
      .query("levyYears")
      .withIndex("by_year", (q) => q.eq("year", year))
      .unique();
    if (existing) return existing._id;
    return ctx.db.insert("levyYears", { year, minAmount: minAmount ?? 50000 });
  },
});

export const getForYear = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    return ctx.db
      .query("projectLevy")
      .withIndex("by_year", (q) => q.eq("year", year))
      .collect();
  },
});

export const setPaid = mutation({
  args: {
    memberId: v.id("members"),
    year: v.number(),
    paid: v.boolean(),
    amount: v.optional(v.number()),
    adminId: v.id("members"),
  },
  handler: async (ctx, { memberId, year, paid, amount, adminId }) => {
    const existing = await ctx.db
      .query("projectLevy")
      .withIndex("by_member_year", (q) =>
        q.eq("memberId", memberId).eq("year", year)
      )
      .unique();

    const today = new Date().toISOString();
    const datePaid = paid ? today : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, { paid, datePaid, amount });
    } else {
      await ctx.db.insert("projectLevy", {
        memberId,
        year,
        paid,
        datePaid,
        amount,
      });
    }

    const member = await ctx.db.get(memberId);
    if (paid) {
      await ctx.db.insert("paymentHistory", {
        memberId,
        type: "levy",
        year,
        amount: amount ?? 0,
        date: today,
      });
    }
    await ctx.db.insert("auditLog", {
      adminId,
      action: paid ? "mark_levy_paid" : "mark_levy_unpaid",
      target: member?.name ?? "member",
      details: `${paid ? "Marked" : "Unmarked"} ${year} levy for ${member?.name}`,
      date: today,
    });
  },
});
