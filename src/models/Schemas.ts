import { z } from 'zod';

export const OwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
  village: z.string().optional(),
  notes: z.string().optional(),
});

export type OwnerFormData = z.infer<typeof OwnerSchema>;

export const VehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  registrationNumber: z.string().optional(),
  type: z.enum(['Tractor', 'Tipper', 'Cultivator', 'Trailer']),
  defaultPaymentMethod: z.enum(['per_day', 'per_hour', 'half_day']),
  defaultRate: z.coerce.number().min(0, 'Rate must be positive'),
});

export type VehicleFormData = z.infer<typeof VehicleSchema>;
