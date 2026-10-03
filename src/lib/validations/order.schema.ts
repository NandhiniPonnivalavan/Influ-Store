import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal / ZIP code is required"),
  country: z.string().default("India"),
  paymentMethod: z.enum(["CARD", "UPI", "COD"]).default("CARD"),
  promoCode: z.string().optional(),
});
