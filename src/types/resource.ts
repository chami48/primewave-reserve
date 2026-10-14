export type ResourceStatus = "available" | "maintenance";

export type Resource = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  capacity: number | null;
  status: ResourceStatus;
  created_at: string;
};

export type ResourceInput = {
  name: string;
  type: string;
  description?: string | null;
  image_url?: string | null;
  capacity?: number | null;
  status: ResourceStatus;
};

export type ResourceUpdateInput = Partial<ResourceInput>;

export type ResourceActionResult<T = null> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
