import { z } from 'zod'

/**
 * Shared auth field validators. These MUST stay in sync with the backend DTOs
 * (backend/src/modules/auth/dto/auth.dto.ts) — a looser rule here means the
 * form submits and the server rejects with a 400 that the user can't act on.
 */

/** Backend: @IsEmail + @MaxLength(254) */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Enter a valid email address')

/**
 * Backend RegisterDto / ResetPasswordDto: min 8 chars, and RegisterDto also
 * requires upper + lower + number + special. We apply the full policy on both
 * (new passwords) so the rules are consistent and the server never surprises
 * the user.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Add a special character (e.g. ! @ # $)')

/** Login only compares against the stored hash, so no policy is enforced here. */
export const loginPasswordSchema = z.string().min(1, 'Password is required')

/** 6-digit numeric OTP — matches @Matches(/^\d{6}$/) on the backend. */
export const otpSchema = z
  .string()
  .length(6, 'Enter the 6-digit code')
  .regex(/^\d{6}$/, 'The code must be 6 digits')

/** The individual password rules, for rendering a live checklist under the field. */
export const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
]
