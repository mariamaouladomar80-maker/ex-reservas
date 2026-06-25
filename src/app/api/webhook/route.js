import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase con service_role para operaciones del servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Leer el body como texto (NUNCA usar req.json() en webhooks)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // Verificar la firma del webhook
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (error) {
      console.error('Error de firma del webhook:', error)
      return NextResponse.json(
        { error: 'Firma inválida' },
        { status: 400 }
      )
    }

    // Manejar evento de pago completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const reserva_id = session.metadata.reserva_id

      // Actualizar reserva: pagado y confirmada, generar QR token
      const { error } = await supabase
        .from('reservas')
        .update({
          estado_pago: 'pagado',
          estado: 'confirmada',
          qr_token: crypto.randomUUID(),
        })
        .eq('id', reserva_id)
        .eq('estado_pago', 'pendiente') // Protección contra duplicados

      if (error) {
        console.error('Error al actualizar reserva:', error)
      }
    }

    // Manejar evento de sesión expirada
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const reserva_id = session.metadata.reserva_id

      // Actualizar reserva: cancelado y cancelada
      const { error } = await supabase
        .from('reservas')
        .update({
          estado_pago: 'cancelado',
          estado: 'cancelada',
        })
        .eq('id', reserva_id)
        .eq('estado_pago', 'pendiente')

      if (error) {
        console.error('Error al actualizar reserva:', error)
      }
    }

    // Siempre devolver 200 para confirmar recepción
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook:', error)
    // Devolver 200 incluso con error para evitar reintentos de Stripe
    return NextResponse.json({ received: true })
  }
}