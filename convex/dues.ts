import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listYears = query({
  args: {},
  handler: async (ctx) => {
    const years = await ctx.db.query("duesYears").collect();
    return years.map((y) => y.year).sort((a, b) => b - a);
  },
});

export const addYear = mutation({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    const existing = await ctx.db
      .query("duesYears")
      .withIndex("by_year", (q) => q.eq("year", year))
      .unique();
    if (existing) return existing._id;
    return ctx.db.insert("duesYears", { year });
  },
});

export const getForYear = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    return ctx.db
      .query("monthlyDues")
      .withIndex("by_year_month", (q) => q.eq("year", year))
      .collect();
  },
});

export const getHistoryForMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, { memberId }) => {
    const history = await ctx.db
      .query("paymentHistory")
      .withIndex("by_member", (q) => q.eq("memberId", memberId))
      .collect();
    return history.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const setPaid = mutation({
  args: {
    memberId: v.id("members"),
    year: v.number(),
    month: v.number(),
    paid: v.boolean(),
    amount: v.optional(v.number()),
    adminId: v.id("members"),
  },
  handler: async (ctx, { memberId, year, month, paid, amount, adminId }) => {
    const existing = await ctx.db
      .query("monthlyDues")
      .withIndex("by_member_year", (q) =>
        q.eq("memberId", memberId).eq("year", year)
      )
      .filter((q) => q.eq(q.field("month"), month))
      .unique();

    const today = new Date().toISOString();
    const datePaid = paid ? today : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, { paid, datePaid, amount });
    } else {
      await ctx.db.insert("monthlyDues", {
        memberId,
        year,
        month,
        paid,
        datePaid,
        amount,
      });
    }

    const member = await ctx.db.get(memberId);
    if (paid) {
      await ctx.db.insert("paymentHistory", {
        memberId,
        type: "dues",
        year,
        month,
        amount: amount ?? 0,
        date: today,
      });
    }
    await ctx.db.insert("auditLog", {
      adminId,
      action: paid ? "mark_dues_paid" : "mark_dues_unpaid",
      target: member?.name ?? "member",
      details: `${paid ? "Marked" : "Unmarked"} ${year}-${month} dues for ${member?.name}`,
      date: today,
    });
  },
});
