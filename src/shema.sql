-- Extension para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla salas
CREATE TABLE public.salas (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  capacidad   INTEGER DEFAULT 10,
  precio_hora NUMERIC(8,2) NOT NULL,
  imagen_url  TEXT,
  activa      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tabla reservas
CREATE TABLE public.reservas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  sala_id         INTEGER REFERENCES public.salas(id),
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL,
  stripe_session_id TEXT UNIQUE,
  estado          TEXT DEFAULT 'pendiente' 
                  CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  estado_pago     TEXT DEFAULT 'pendiente'
                  CHECK (estado_pago IN ('pendiente', 'pagado', 'cancelado')),
  total           INTEGER,
  qr_token        TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Activar RLS
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Salas: visibles para todos
CREATE POLICY "salas: publicas"
  ON public.salas FOR SELECT
  USING (true);

-- Reservas: cada usuario solo ve las suyas
CREATE POLICY "reservas: usuario ver propias"
  ON public.reservas FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reservas: usuario crear propias"
  ON public.reservas FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Datos de ejemplo
INSERT INTO public.salas (nombre, descripcion, capacidad, precio_hora, imagen_url) VALUES
  ('Sala Roja', 'Ambiente íntimo con equipo de sonido', 8, 25.00, 'https://placehold.co/300x300/dc2626/FFFFFF?text=Sala+Roja'),
  ('Sala negra', 'Espacio amplio con proyector', 15, 35.00, 'https://placehold.co/300x300/2563eb/FFFFFF?text=Sala+Azul'),
  ('Sala Verde', 'Sala pequeña para reuniones', 6, 20.00, 'https://placehold.co/300x300/16a34a/FFFFFF?text=Sala+Verde');

-- Activar Realtime para reservas
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservas;