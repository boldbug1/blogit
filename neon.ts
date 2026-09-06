import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      uploads: { access: "public_read" },
    },
  },
});

