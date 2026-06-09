require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(8)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

const env = {
  port: parsed.data.PORT,
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabaseAnonKey: parsed.data.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  cloudinaryCloudName: parsed.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.data.CLOUDINARY_API_SECRET,
  adminPassword: parsed.data.ADMIN_PASSWORD,
  jwtSecret: parsed.data.JWT_SECRET
};

module.exports = { env };