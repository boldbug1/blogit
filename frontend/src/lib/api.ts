// API Client for Blogit Go Backend

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
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
  author_id?: string;
  author_name: string;
  banner_image?: string;
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
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
  banner_image?: string;
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
}

export interface BlogComment {
  id: string;
  blog_id: string;
  author_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
}

export interface CreateBlogPayload {
  author_id?: string;
  title: string;
  body: string;
  banner_image?: string;
  tags?: string[];
}

export interface UpdateBlogPayload {
  title?: string;
  body?: string;
  banner_image?: string;
  tags?: string[];
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
    author_id: String(raw.AuthorID || raw.author_id || ""),
    author_name: String(raw.AuthorName || raw.author_name || "Author"),
    banner_image: String(raw.BannerImage || raw.banner_image || ""),
    tags: Array.isArray(raw.Tags)
      ? raw.Tags
      : Array.isArray(raw.tags)
      ? raw.tags
      : [],
    likes_count: Number(raw.LikesCount ?? raw.likes_count ?? 0),
    comments_count: Number(raw.CommentsCount ?? raw.comments_count ?? 0),
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
    banner_image: String(raw.BannerImage || raw.banner_image || ""),
    tags: Array.isArray(raw.Tags)
      ? raw.Tags
      : Array.isArray(raw.tags)
      ? raw.tags
      : [],
    likes_count: Number(raw.LikesCount ?? raw.likes_count ?? 0),
    comments_count: Number(raw.CommentsCount ?? raw.comments_count ?? 0),
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
    googleAuth: (credential: string) =>
      request<AuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      }),
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
    checkUsername: (name: string) =>
      request<{ available: boolean; message?: string }>(
        `/auth/check-username?name=${encodeURIComponent(name)}`
      ),
    me: () => request<Author>("/me"),
  },

  blogs: {
    list: async (
      params?: string | { tag?: string; author_id?: string }
    ): Promise<BlogSummary[]> => {
      let endpoint = "/blogs";
      if (typeof params === "string" && params) {
        endpoint = `/blogs?tag=${encodeURIComponent(params)}`;
      } else if (params && typeof params === "object") {
        const q = new URLSearchParams();
        if (params.tag) q.set("tag", params.tag);
        if (params.author_id) q.set("author_id", params.author_id);
        const qs = q.toString();
        if (qs) endpoint = `/blogs?${qs}`;
      }
      const raw = await request<any[]>(endpoint);
      if (!Array.isArray(raw)) return [];
      return raw.map(normalizeBlogSummary);
    },
    listTags: async (): Promise<string[]> => {
      const raw = await request<string[]>("/tags");
      return Array.isArray(raw) ? raw : [];
    },
    getBySlug: async (slug: string): Promise<BlogDetail> => {
      const raw = await request<any>(`/blogs/${slug}`);
      return normalizeBlogDetail(raw);
    },
    getById: async (id: string): Promise<BlogDetail> => {
      const raw = await request<any>(`/blogs/${id}`);
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
    delete: async (id: string): Promise<{ message: string }> => {
      return request<{ message: string }>(`/blogs/${id}`, {
        method: "DELETE",
      });
    },
    getLikes: async (id: string): Promise<{ liked: boolean; count: number }> => {
      return request<{ liked: boolean; count: number }>(`/blogs/${id}/likes`);
    },
    toggleLike: async (id: string): Promise<{ liked: boolean; count: number }> => {
      return request<{ liked: boolean; count: number }>(`/blogs/${id}/like`, {
        method: "POST",
      });
    },
    listComments: async (id: string): Promise<BlogComment[]> => {
      const raw = await request<any[]>(`/blogs/${id}/comments`);
      if (!Array.isArray(raw)) return [];
      return raw.map((c) => ({
        id: String(c.ID || c.id || ""),
        blog_id: String(c.BlogID || c.blog_id || ""),
        author_id: String(c.AuthorID || c.author_id || ""),
        parent_id: c.ParentID?.String || c.ParentID || c.parent_id || null,
        content: String(c.Content || c.content || ""),
        created_at: String(c.CreatedAt?.Time || c.CreatedAt || c.created_at || ""),
        updated_at: String(c.UpdatedAt?.Time || c.UpdatedAt || c.updated_at || ""),
        author_name: String(c.AuthorName || c.author_name || "Reader"),
        author_email: String(c.AuthorEmail || c.author_email || ""),
      }));
    },
    createComment: async (
      id: string,
      payload: { content: string; parent_id?: string }
    ): Promise<BlogComment> => {
      const c = await request<any>(`/blogs/${id}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return {
        id: String(c.ID || c.id || ""),
        blog_id: String(c.BlogID || c.blog_id || ""),
        author_id: String(c.AuthorID || c.author_id || ""),
        parent_id: c.ParentID?.String || c.ParentID || c.parent_id || null,
        content: String(c.Content || c.content || ""),
        created_at: String(c.CreatedAt?.Time || c.CreatedAt || c.created_at || ""),
        updated_at: String(c.UpdatedAt?.Time || c.UpdatedAt || c.updated_at || ""),
        author_name: String(c.AuthorName || c.author_name || "Reader"),
        author_email: String(c.AuthorEmail || c.author_email || ""),
      };
    },
  },

  newsletter: {
    subscribe: async (email: string): Promise<{ message: string }> => {
      return request<{ message: string }>("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
  },

  media: {
    upload: async (
      file: Blob | File,
      filename = "banner.jpg"
    ): Promise<{ url: string; id: string }> => {
      const baseUrl = getBaseUrl();
      const formData = new FormData();
      formData.append("file", file, filename);

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}/media/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Upload failed with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.error) errorMsg = errJson.error;
        } catch {
          // fallback
        }
        throw new Error(errorMsg);
      }

      return res.json() as Promise<{ url: string; id: string }>;
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

export function extractPostDescription(rawBody: string | null | undefined): {
  description: string | null;
  body: string;
} {
  if (!rawBody) return { description: null, body: "" };

  const trimmed = rawBody.trim();

  // Pattern 1: Markdown leading italics: *subtitle* or _subtitle_ followed by one or more newlines
  const mdMatch = trimmed.match(/^(\*{1,3}|_{1,3})([^\n\r]+?)\1(?:\r?\n)+/);
  if (mdMatch) {
    const desc = mdMatch[2].trim();
    const remaining = trimmed.slice(mdMatch[0].length).trim();
    if (desc.length > 0 && desc.length <= 350) {
      return { description: desc, body: remaining };
    }
  }

  // Pattern 2: HTML leading italic paragraph: <p><em>subtitle</em></p>
  const htmlMatch = trimmed.match(/^<p>\s*<(?:em|i)>(.*?)<\/(?:em|i)>\s*<\/p>(?:\r?\n)*/i);
  if (htmlMatch) {
    const desc = htmlMatch[1].replace(/<[^>]+>/g, "").trim();
    const remaining = trimmed.slice(htmlMatch[0].length).trim();
    if (desc.length > 0 && desc.length <= 350) {
      return { description: desc, body: remaining };
    }
  }

  return { description: null, body: trimmed };
}
