// API Client for Blogit Go Backend

export interface Author {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  author: Author;
}

export interface BlogSummary {
  id: string;
  title: string;
  slug: string;
  body?: string;
  created_at: string;
  author_name: string;
}

export interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name: string;
  author_email: string;
}

export interface CreateBlogPayload {
  author_id?: string;
  title: string;
  body: string;
}

export interface UpdateBlogPayload {
  title?: string;
  body?: string;
}

export function normalizeBlogSummary(raw: any): BlogSummary {
  return {
    id: String(raw.ID || raw.id || ""),
    title: String(raw.Title || raw.title || "Untitled"),
    slug: String(raw.Slug || raw.slug || ""),
    body: String(raw.Body || raw.body || ""),
    created_at: String(
      raw.CreatedAt?.Time || raw.CreatedAt || raw.created_at?.Time || raw.created_at || ""
    ),
    author_name: String(raw.AuthorName || raw.author_name || "Author"),
  };
}

export function normalizeBlogDetail(raw: any): BlogDetail {
  return {
    id: String(raw.ID || raw.id || ""),
    title: String(raw.Title || raw.title || "Untitled"),
    slug: String(raw.Slug || raw.slug || ""),
    body: String(raw.Body || raw.body || ""),
    created_at: String(
      raw.CreatedAt?.Time || raw.CreatedAt || raw.created_at?.Time || raw.created_at || ""
    ),
    updated_at: String(
      raw.UpdatedAt?.Time || raw.UpdatedAt || raw.updated_at?.Time || raw.updated_at || ""
    ),
    author_id: String(raw.AuthorID || raw.author_id || ""),
    author_name: String(raw.AuthorName || raw.author_name || "Author"),
    author_email: String(raw.AuthorEmail || raw.author_email || ""),
  };
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:8080`;
  }
  return "http://localhost:8080";
};

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("blogit_token");
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (payload: { name: string; email: string; password: string }) =>
      request<Author>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () => request<Author>("/me"),
  },

  blogs: {
    list: async (): Promise<BlogSummary[]> => {
      const raw = await request<any[]>("/blogs");
      if (!Array.isArray(raw)) return [];
      return raw.map(normalizeBlogSummary);
    },
    getBySlug: async (slug: string): Promise<BlogDetail> => {
      const raw = await request<any>(`/blogs/${slug}`);
      return normalizeBlogDetail(raw);
    },
    create: async (payload: CreateBlogPayload): Promise<BlogDetail> => {
      const raw = await request<any>("/blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return normalizeBlogDetail(raw);
    },
    update: async (id: string, payload: UpdateBlogPayload): Promise<BlogDetail> => {
      const raw = await request<any>(`/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return normalizeBlogDetail(raw);
    },
  },

  health: () => request<{ status: string; uptime: string }>("/health"),
};

export function formatUtcDate(dateInput: any): string {
  if (!dateInput) return "Recently";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Recently";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function extractCoverImage(body: string | null | undefined): string | null {
  if (!body) return null;
  // Look for markdown image syntax: ![alt](url)
  const mdMatch = body.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch && mdMatch[1]) return mdMatch[1];
  // Look for direct image URL in text
  const directMatch = body.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|webp|gif|svg))/i);
  if (directMatch && directMatch[1]) return directMatch[1];
  return null;
}

export function extractExcerpt(body: string | null | undefined, maxLength = 120): string {
  if (!body) return "";
  const cleaned = body
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // replace links with text
    .replace(/[#*`_~>]/g, "") // remove formatting symbols
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + "…";
}
