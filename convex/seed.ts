import { mutation } from "./_generated/server";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("members").collect();
    if (existing.length > 0) return "Already seeded.";

    const today = new Date();
    const todayIso = `${today.getFullYear() - 30}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const adminId = await ctx.db.insert("members", {
      name: "Chidi Okafor",
      pin: "000000",
      dob: "1990-03-14",
      phone: "+2348012345678",
      umunna: "Umuada",
      role: "admin",
    });

    await ctx.db.insert("members", {
      name: "Amaka Nwosu",
      pin: "111111",
      dob: todayIso,
      phone: "+2348023456789",
      umunna: "Umuokpu",
      role: "member",
    });

    await ctx.db.insert("members", {
      name: "Emeka Eze",
      pin: "222222",
      dob: "1992-11-02",
      umunna: "Umuada",
      role: "member",
    });

    await ctx.db.insert("duesYears", { year: 2023 });
    await ctx.db.insert("duesYears", { year: 2024 });
    await ctx.db.insert("duesYears", { year: 2025 });
    await ctx.db.insert("duesYears", { year: 2026 });
    await ctx.db.insert("levyYears", { year: 2026, minAmount: 50000 });

    return `Seeded. Admin PIN: 000000, Member PINs: 111111, 222222. Admin id: ${adminId}`;
  },
});
