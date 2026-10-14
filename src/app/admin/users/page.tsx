import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

async function requireAdmin() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return supabase;
}

async function AdminUsersContent() {
  const supabase = await requireAdmin();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  const rows = users ?? [];
  const admins = rows.filter((user) => user.role === "admin").length;
  const employees = rows.filter((user) => user.role === "employee").length;

  return (
    <AppShell title="Users" eyebrow="PrimeWave Reserve Admin">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header>
          <p className="text-sm font-medium text-slate-500">
            Dashboard <span className="mx-2">›</span> Users
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            User Management
          </h1>
          <p className="mt-1 text-base text-slate-600">
            Review registered employees and admins from the application profile table.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Employees</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{employees}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{admins}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">Users</h2>
            <p className="mt-1 text-sm text-slate-600">
              Role changes require a secure admin-only server operation and are not exposed here.
            </p>
          </div>
          {error ? (
            <div className="p-8 text-center text-sm text-red-700">
              Users could not be loaded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {user.full_name ?? "Unnamed user"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {user.created_at
                          ? new Intl.DateTimeFormat("en", {
                              dateStyle: "medium",
                            }).format(new Date(user.created_at))
                          : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <AdminUsersContent />
    </Suspense>
  );
}
