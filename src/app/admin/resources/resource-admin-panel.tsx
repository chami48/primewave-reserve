"use client";

import { Edit3, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  createResource,
  deleteResource,
  updateResource,
} from "@/app/actions/resources";
import { createClient } from "@/lib/supabase/client";
import type {
  Resource,
  ResourceInput,
  ResourceStatus,
} from "@/types/resource";

type FormState = ResourceInput;

type Props = {
  resources: Resource[];
};

const emptyForm: FormState = {
  name: "",
  type: "",
  description: "",
  image_url: "",
  capacity: null,
  status: "available",
};

function toFormState(resource: Resource): FormState {
  return {
    name: resource.name,
    type: resource.type,
    description: resource.description ?? "",
    image_url: resource.image_url ?? "",
    capacity: resource.capacity,
    status: resource.status,
  };
}

function inputFromForm(form: FormState): ResourceInput {
  return {
    ...form,
    description: form.description?.trim() ? form.description : null,
    image_url: form.image_url?.trim() ? form.image_url : null,
    capacity: form.capacity || null,
  };
}

export function ResourceAdminPanel({ resources }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resourceTypes = useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.type))).sort(),
    [resources]
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function uploadResourceImage(file: File) {
    setMessage(null);
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be 3MB or smaller.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `resources/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("resource-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[resources] image upload failed", {
        message: uploadError.message,
      });
      setError("Image upload failed. Check the storage bucket policy.");
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("resource-images")
      .getPublicUrl(path);

    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    setMessage("Image uploaded.");
    setIsUploading(false);
  }

  function submitResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateResource(editingId, inputFromForm(form))
        : await createResource(inputFromForm(form));

      if (result.success) {
        setMessage(result.message ?? "Resource saved.");
        resetForm();
      } else {
        setError(result.error);
      }
    });
  }

  function removeResource(resource: Resource) {
    const confirmed = window.confirm(
      `Delete ${resource.name}? This is only allowed when no reservations reference it.`
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteResource(resource.id);

      if (result.success) {
        setMessage(result.message ?? "Resource deleted.");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <section className="premium-panel rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {editingId ? "Edit resource" : "Add resource"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Changes are authorized again on the server.
            </p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              aria-label="Cancel editing"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <form onSubmit={submitResource} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="premium-field mt-2 h-11 w-full rounded-xl px-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <input
              required
              list="resource-types"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
              className="premium-field mt-2 h-11 w-full rounded-xl px-3 text-sm"
            />
            <datalist id="resource-types">
              {resourceTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="premium-field mt-2 w-full rounded-xl px-3 py-3 text-sm"
            />
          </label>

          <div className="block">
            <span className="text-sm font-medium text-slate-700">
              Resource Image
            </span>
            {form.image_url ? (
              <div
                className="mt-2 h-36 rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${form.image_url})` }}
                aria-label="Selected resource image"
              />
            ) : null}
            <label className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isUploading ? "Uploading..." : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadResourceImage(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            {form.image_url ? (
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({ ...current, image_url: null }))
                }
                className="mt-2 text-sm font-semibold text-red-600"
              >
                Remove image
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Capacity
              </span>
              <input
                min={1}
                type="number"
                value={form.capacity ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacity: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }))
                }
                className="premium-field mt-2 h-11 w-full rounded-xl px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as ResourceStatus,
                  }))
                }
                className="premium-field mt-2 h-11 w-full rounded-xl px-3 text-sm"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending || isUploading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editingId ? <Save className="size-4" /> : <Plus className="size-4" />}
            {isPending ? "Saving..." : editingId ? "Save changes" : "Add resource"}
          </button>
        </form>
      </section>

      <section className="premium-panel rounded-2xl">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Managed resources
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {resources.length} resources configured.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {resources.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">
              No resources have been added yet.
            </div>
          ) : (
            resources.map((resource) => (
              <article
                key={resource.id}
                className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
              >
                <div>
                  {resource.image_url ? (
                    <div
                      className="mb-4 h-32 rounded-xl bg-slate-100 bg-cover bg-center"
                      style={{ backgroundImage: `url(${resource.image_url})` }}
                      aria-label={`${resource.name} image`}
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">
                      {resource.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {resource.type}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        resource.status === "available"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {resource.description || "No description provided."}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Capacity: {resource.capacity ?? "Not applicable"}
                  </p>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(resource.id);
                      setForm(toFormState(resource));
                      setError(null);
                      setMessage(null);
                    }}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                    aria-label={`Edit ${resource.name}`}
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeResource(resource)}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:text-red-700"
                    aria-label={`Delete ${resource.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
