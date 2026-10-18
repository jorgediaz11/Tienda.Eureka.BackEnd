import { z } from 'zod';

// Esquema para el Login (alineado con contracts.md del frontend)
export const loginDto = z.object({
  email: z.string().email('El formato del correo no es válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  fullName: z.string().optional(), // Opcional según el contrato del frontend
  phone: z.string().optional(),    // Opcional según el contrato del frontend
});

// Esquema para actualizar el perfil
export const updateProfileDto = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phone: z.string().optional(),
});

// Inferir los tipos de TypeScript a partir de los esquemas de Zod
export type LoginDto = z.infer<typeof loginDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;