import { z } from 'zod';

// Allowed target inspection domains
export const DOMAINS = [
  'Manufacturing',
  'Manufacturing Quality Assurance',
  'Workplace Safety',
  'Workplace Safety & Compliance',
  'Document Intelligence',
  'Documents'
];

export const SENSITIVITIES = ['Low', 'Medium', 'High'];

// 1. User Registration Schema: Email (valid format), Password (min 8 chars, 1 number)
export const UserRegistrationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
});

// 2. User Login Schema: Email, Password
export const UserLoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

// 3. Analyze Request Schema: Image (required, valid base64 or file path), Domain (enum), Custom Instructions (optional)
export const AnalyzeRequestSchema = z.object({
  image: z
    .string({ required_error: 'Image is required' })
    .min(10, 'Image payload cannot be empty'),
  domain: z.enum(DOMAINS, {
    errorMap: () => ({ message: `Domain must be one of: ${DOMAINS.join(', ')}` })
  }),
  custom_instructions: z.string().optional().default(''),
  sensitivity: z.enum(SENSITIVITIES, {
    errorMap: () => ({ message: 'Sensitivity must be Low, Medium, or High' })
  }).optional().default('Medium')
});

// 4. Backend Environment Variables Schema
export const EnvSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

