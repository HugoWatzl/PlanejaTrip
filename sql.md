CREATE TABLE public.profiles (
    id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_owner_id ON public.trips(owner_id);

-- Drop dependent objects first to allow re-running the script
DROP TABLE IF EXISTS public.invites;
DROP TABLE IF EXISTS public.trip_participants;

DROP TYPE IF EXISTS permission_level;
DROP TYPE IF EXISTS invite_status;


CREATE TYPE permission_level AS ENUM ('EDIT', 'VIEW_ONLY');

CREATE TABLE public.trip_participants (
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission permission_level NOT NULL DEFAULT 'VIEW_ONLY',
    PRIMARY KEY (trip_id, user_id)
);

CREATE TYPE invite_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    tripName VARCHAR(255),
    host_email VARCHAR(255) NOT NULL,
    hostName VARCHAR(255),
    guest_email VARCHAR(255) NOT NULL,
    permission permission_level NOT NULL,
    status invite_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (trip_id, guest_email)
);

CREATE INDEX idx_invites_guest_email ON public.invites(guest_email);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Allow authenticated users to view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Allow trip owner to manage their trip" ON public.trips;


CREATE POLICY "Allow authenticated users to view their own trips"
ON public.trips
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM trip_participants WHERE trip_id = id
  )
);

CREATE POLICY "Allow trip owner to manage their trip"
ON public.trips
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);