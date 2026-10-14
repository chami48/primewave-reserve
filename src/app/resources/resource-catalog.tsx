"use client";

import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  Search,
  Tag,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Resource, ResourceStatus } from "@/types/resource";

type Props = {
  resources: Resource[];
  initialType?: string;
};

const statusLabels: Record<ResourceStatus, string> = {
  available: "Available",
  maintenance: "Maintenance",
};

export function ResourceCatalog({ resources, initialType = "all" }: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState<"all" | ResourceStatus>("all");
  const [detailsResource, setDetailsResource] = useState<Resource | null>(null);

  const types = useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.type))).sort(),
    [resources]
  );
  const countFor = (resourceType: string) =>
    resources.filter((resource) => resource.type === resourceType).length;

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
    <div className="space-y-5">
      <section className="grid gap-3 lg:grid-cols-[1fr_190px_190px_220px_auto]">
        <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
        </label>

        <label className="block">
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
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
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | ResourceStatus)
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
        </label>

        <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
          <option>All locations</option>
        </select>

      </section>

      <section className="flex gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setType("all")}
          className={`inline-flex h-10 shrink-0 items-center gap-3 rounded-2xl border px-5 text-sm font-semibold ${
            type === "all"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          All Resources
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700">
            {resources.length}
          </span>
        </button>
        {types.map((resourceType) => (
          <button
            key={resourceType}
            onClick={() => setType(resourceType)}
            className={`inline-flex h-10 shrink-0 items-center gap-3 rounded-2xl border px-5 text-sm font-semibold ${
              type === resourceType
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {resourceType}
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {countFor(resourceType)}
            </span>
          </button>
        ))}
      </section>

      {filteredResources.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No resources found
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Adjust your search or filters to find a reservable resource.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative">
                <div
                  className="h-36 bg-slate-100 bg-cover bg-center"
                  style={{
                    backgroundImage: resource.image_url
                      ? `url(${resource.image_url})`
                      : "linear-gradient(135deg, #dbeafe, #e0f2fe)",
                  }}
                  aria-label={`${resource.name} image`}
                />
                <span
                  className={`absolute bottom-2 right-2 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${
                    resource.status === "available"
                      ? "bg-emerald-500"
                      : "bg-slate-500"
                  }`}
                >
                  {statusLabels[resource.status]}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-slate-950">
                  {resource.name}
                </h2>

                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="size-4 text-blue-700" />
                    <span>
                      {resource.capacity
                        ? `Capacity: ${resource.capacity} people`
                        : resource.description || "Flexible capacity"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-blue-700" />
                    <span>Main Building</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-blue-700" />
                    <span>{resource.type}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(resource.description?.split(",").slice(0, 2) ?? [
                    "TV Display",
                    "Video Conferencing",
                  ]).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                    >
                      {feature.trim()}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDetailsResource(resource)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-600 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    View Details
                  </button>
                  <Link
                    href={`/reservations/new?resource=${resource.id}`}
                    aria-disabled={resource.status !== "available"}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                      resource.status === "available"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
                        : "pointer-events-none bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CalendarCheck className="size-4" />
                    Book Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {detailsResource ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsResource(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-details-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div
              className="h-48 bg-slate-100 bg-cover bg-center"
              style={{
                backgroundImage: detailsResource.image_url
                  ? `url(${detailsResource.image_url})`
                  : "linear-gradient(135deg, #dbeafe, #e0f2fe)",
              }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    {detailsResource.type}
                  </p>
                  <h2 id="resource-details-title" className="mt-1 text-2xl font-bold text-slate-950">
                    {detailsResource.name}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {statusLabels[detailsResource.status]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {detailsResource.description || "A flexible PrimeWave resource ready for your next booking."}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Capacity</dt><dd className="mt-1 font-semibold text-slate-950">{detailsResource.capacity ?? "Flexible"}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Location</dt><dd className="mt-1 font-semibold text-slate-950">Main Building</dd></div>
              </dl>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDetailsResource(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <Link href={`/reservations/new?resource=${detailsResource.id}`} className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Book this resource</Link>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
