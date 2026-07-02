import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("auditLog").collect();
    return logs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100);
  },
});
