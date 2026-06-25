 
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'
import { stripe } from '@/lib/stripe'
 

// Cliente Supabase con service_role para operaciones del servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { sala_id, fecha, hora_inicio, hora_fin, userId, userEmail } = await request.json()

    // Obtener datos de la sala
    const { data: sala, error: salaError } = await supabase
      .from('salas')
      .select('*')
      .eq('id', sala_id)
      .single()

    if (salaError || !sala) {
      return NextResponse.json(
        { error: 'Sala no encontrada' },
        { status: 404 }
      )
    }

    // Calcular duración en horas y total en céntimos
    const inicio = new Date(`2000-01-01T${hora_inicio}`)
    const fin = new Date(`2000-01-01T${hora_fin}`)
    const duracionHoras = (fin - inicio) / (1000 * 60 * 60)
    const total = Math.round(sala.precio_hora * duracionHoras * 100)

    // Insertar reserva en la base de datos
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        user_id: userId,
        sala_id: sala_id,
        fecha: fecha,
        hora_inicio: hora_inicio,
        hora_fin: hora_fin,
        estado: 'pendiente',
        estado_pago: 'pendiente',
        total: total,
      })
      .select()
      .single()

    if (reservaError) {
      console.error('Error al crear reserva:', reservaError)
      return NextResponse.json(
        { error: 'Error al crear la reserva' },
        { status: 500 }
      )
    }

    // Crear sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: total,
            product_data: {
              name: `Reserva ${sala.nombre} - ${fecha}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/reserva/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      metadata: {
        reserva_id: reserva.id,
        user_id: userId,
      },
    })

    // Actualizar reserva con el ID de sesión de Stripe
    await supabase
      .from('reservas')
      .update({ stripe_session_id: session.id })
      .eq('id', reserva.id)

    // Devolver la URL de checkout
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error en API pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}