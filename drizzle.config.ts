import dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_nixyEHhPSq52@ep-aged-bush-a8ksbeck-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  },
});