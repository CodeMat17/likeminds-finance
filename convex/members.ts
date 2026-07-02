import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const login = query({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_pin", (q) => q.eq("pin", pin))
      .unique();
    return member ?? null;
  },
});

export const get = query({
  args: { id: v.id("members") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    return members.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listPins = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    return members.map((m) => m.pin);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
    dob: v.string(),
    joinDate: v.optional(v.string()),
    phone: v.optional(v.string()),
    umunna: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    adminId: v.id("members"),
  },
  handler: async (ctx, { adminId, ...data }) => {
    const existing = await ctx.db
      .query("members")
      .withIndex("by_pin", (q) => q.eq("pin", data.pin))
      .unique();
    if (existing) throw new Error("PIN already in use by another member.");

    const id = await ctx.db.insert("members", data);
    await ctx.db.insert("auditLog", {
      adminId,
      action: "create_member",
      target: data.name,
      details: `Created member ${data.name}`,
      date: new Date().toISOString(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    name: v.string(),
    pin: v.string(),
    dob: v.string(),
    joinDate: v.optional(v.string()),
    phone: v.optional(v.string()),
    umunna: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    adminId: v.id("members"),
  },
  handler: async (ctx, { id, adminId, ...data }) => {
    const existing = await ctx.db
      .query("members")
      .withIndex("by_pin", (q) => q.eq("pin", data.pin))
      .unique();
    if (existing && existing._id !== id)
      throw new Error("PIN already in use by another member.");

    await ctx.db.patch(id, data);
    await ctx.db.insert("auditLog", {
      adminId,
      action: "update_member",
      target: data.name,
      details: `Updated member ${data.name}`,
      date: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("members"), adminId: v.id("members") },
  handler: async (ctx, { id, adminId }) => {
    const member = await ctx.db.get(id);
    if (!member) return;
    await ctx.db.delete(id);
    await ctx.db.insert("auditLog", {
      adminId,
      action: "delete_member",
      target: member.name,
      details: `Deleted member ${member.name}`,
      date: new Date().toISOString(),
    });
  },
});
