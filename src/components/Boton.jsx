 "use client"

import { useState } from "react"

export default function Boton(){
  const [loading, setLoading] = useState(false)  // Cuando es setLoaging(true) => muesta "Rudirigiendo" / Cuando termina la petición  setLoading(false) =>  vuelve "Comprar Ahora"

  const handleBuy = async () => {   // la funcion se ejecuta cunado el usuario pulsa el boton 


    setLoading(true)
    try {
      // Hace una petición HTTP   a la url  api/pagos
      const res = await fetch('/api/pagos', {
        method: 'POST', // tipo de petición: enviamos datos, no pedimos.


        headers: { 'Content-Type': 'application/json' }, // le Le decimos al servidor que enviamos JSON
      })

      const data = await res.json() //Convierte la respuesta del servidor (que viene en formato JSON) a un objeto JavaScript
      
      if (data.url) {
        window.location.href = data.url // Si el servidor devolvió una URL, redirige al usuario a esa página (Stripe Checkout). Si no, muestra un mensaje de error.
      } else {
        alert('Error al crear la sesión de pago')
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

    return(
       <div className="flex gap-2">
        <button 
        onClick={handleBuy}
          disabled={loading}
        
          className="flex-1 bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500 font-semibold w-50 text-sm"


        >
             {loading ? 'Redirigiendo a Stripe...' : 'Reserva Ahora'}
          ⭐ Reservar
        </button>
        
      </div>
    )
}