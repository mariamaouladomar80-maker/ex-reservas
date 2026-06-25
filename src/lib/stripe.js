// Cliente de Stripe para el servidor
// Solo se importa en API routes (app/api/)
import Stripe from 'stripe'

// Usa la clave secreta que está en el servidor (nunca en el frontend)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)