"use client";

import Link from "next/link";
import { CalendarCheck, Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { Resource, ResourceStatus } from "@/types/resource";

type Props = {
  resources: Resource[];
};

const statusLabels: Record<ResourceStatus, string> = {
  available: "Available",
  maintenance: "Maintenance",
};

export function ResourceCatalog({ resources }: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState<"all" | ResourceStatus>("all");

  const types = useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.type))).sort(),
    [resources]
  );

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.name.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        (resource.description ?? "").toLowerCase().includes(query);
      const matchesType = type === "all" || resource.type === type;
      const matchesStatus = status === "all" || resource.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [resources, search, type, status]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
          <SlidersHorizontal className="size-4 text-emerald-600" />
          Find a space
        </div>
        <div className="mt-5 space-y-4">
          <label className="relative block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </span>
            <Search className="pointer-events-none absolute left-3 top-[39px] size-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Room, lab, vehicle..."
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resource type
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">All types</option>
              {types.map((resourceType) => (
                <option key={resourceType} value={resourceType}>
                  {resourceType}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Availability
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | ResourceStatus)
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
        </div>
      </aside>

      {filteredResources.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <SlidersHorizontal className="size-10 text-emerald-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No resources found
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Adjust your search or filters to find a reservable resource.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="h-44 bg-slate-100 bg-cover bg-center"
                style={{
                  backgroundImage: resource.image_url
                    ? `url(${resource.image_url})`
                    : "linear-gradient(135deg, #ecfdf5, #e2e8f0)",
                }}
                aria-label={`${resource.name} image`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">
                      {resource.type}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      {resource.name}
                    </h2>
                  </div>
                  <StatusBadge status={resource.status} />
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
                  {resource.description || "No description provided."}
                </p>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="size-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {resource.capacity ? `${resource.capacity} seats` : "Flexible capacity"}
                    </span>
                  </div>
                  <Link
                    href={`/reservations/new?resource=${resource.id}`}
                    aria-disabled={resource.status !== "available"}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                      resource.status === "available"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "pointer-events-none bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CalendarCheck className="size-4" />
                    {resource.status === "available" ? "Book" : statusLabels[resource.status]}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
