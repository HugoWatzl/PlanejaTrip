import React, { useState, useEffect, useCallback } from 'react';
import { Trip, User, Invite } from './types.ts';
import LoginScreen from './components/LoginScreen.tsx';
import ProfileScreen from './components/ProfileScreen.tsx';
import TripForm from './components/TripForm.tsx';
import TripDashboard from './components/TripDashboard.tsx';
import { supabase } from './services/supabase.ts';

// We define a type for the Supabase user object, as we cannot import the type from the UMD bundle.
// We'll include the properties needed for our logic.
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata: {
    [key: string]: any;
    name?: string;
  }
};

type View = 'LOGIN' | 'PROFILE' | 'TRIP_FORM' | 'TRIP_DASHBOARD';

interface AppState {
  user: User | null;
  trips: Trip[];
  invites: Invite[];
}

const getInitialState = (): AppState => ({
  user: null,
  trips: [],
  invites: [],
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getInitialState());
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (supabaseUser: SupabaseUser) => {
    setIsLoading(true);

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    // PGRST116 is the error code for "The result contains 0 rows"
    // This handles the case where a user exists in auth.users but not in public.profiles
    if ((profileError && profileError.code === 'PGRST116') || !profile) {
        console.warn('Profile not found, attempting to create one as a fallback.');
        
        const userName = supabaseUser.user_metadata?.name || 'Novo Usuário';
        const userEmail = supabaseUser.email;

        if (!userEmail) {
            console.error('Critical error: Cannot create profile because user email is missing from session. Signing out.');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
        }

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: supabaseUser.id, name: userName, email: userEmail })
            .select()
            .single();

        if (insertError) {
            console.error('Failed to create fallback profile:', insertError);
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
        }
        profile = newProfile; // Use the newly created profile
        profileError = null; // Clear the previous error
    }

    // If there was an error that wasn't the "not found" error, or if profile is still null
    if (profileError || !profile) {
      console.error('Error fetching profile and could not recover:', profileError);
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    const currentUser: User = { id: profile.id, name: profile.name, email: profile.email };

    const { data: tripParticipants, error: participantsError } = await supabase
      .from('trip_participants')
      .select('trip_id')
      .eq('user_id', currentUser.id);

    if (participantsError) {
      console.error('Error fetching trip participants:', participantsError);
      setIsLoading(false);
      return;
    }
    const tripIds = tripParticipants.map(p => p.trip_id);

    let userTrips: Trip[] = [];
    if (tripIds.length > 0) {
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id, data')
        .in('id', tripIds);

      if (tripsError) {
        console.error('Error fetching trips:', tripsError);
      } else {
        userTrips = tripsData.map(t => ({ ...(t.data as Omit<Trip, 'id'>), id: t.id }));
      }
    }

    const { data: userInvites, error: invitesError } = await supabase
      .from('invites')
      .select('*')
      .or(`guest_email.eq.${currentUser.email},and(host_email.eq.${currentUser.email},status.eq.REJECTED)`)
      .neq('status', 'ACCEPTED');

    if (invitesError) {
      console.error('Error fetching invites:', invitesError);
    }

    setAppState({ user: currentUser, trips: userTrips, invites: userInvites || [] });
    setCurrentView('PROFILE');
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user as SupabaseUser);
      } else {
        setAppState(getInitialState());
        setCurrentView('LOGIN');
        setSelectedTripId(null);
        setIsLoading(false);
      }
    });
    
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await loadUserData(session.user as SupabaseUser);
        } else {
            setIsLoading(false);
        }
    };
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, [loadUserData]);

 const handleAuth = async (name: string, email: string, password: string): Promise<void> => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (name.trim()) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });
        
        if (signUpError) {
          throw signUpError;
        }
      } else {
        throw signInError;
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateUser = async (updatedUser: User) => {
    if (!appState.user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: updatedUser.name })
      .eq('id', appState.user.id);
      
    if (error) {
        console.error("Error updating user:", error);
        return;
    }
    if(updatedUser.password){
        const { error: passwordError } = await supabase.auth.updateUser({ password: updatedUser.password });
        if(passwordError) console.error("Error updating password:", passwordError);
    }
    setAppState(prev => ({ ...prev, user: { ...prev.user!, name: updatedUser.name } }));
  };
  
  const handleSaveTrip = async (trip: Trip) => {
    if(!appState.user) return;

    const { participants, ...tripData } = trip;
    
    const { data: newTrip, error: tripError } = await supabase
        .from('trips')
        .insert({ id: trip.id, data: tripData, owner_id: appState.user.id })
        .select('id')
        .single();
    
    if (tripError || !newTrip) {
        console.error("Error creating trip", tripError);
        return;
    }
    
    const participantData = [{
        trip_id: newTrip.id,
        user_id: appState.user.id,
        permission: 'EDIT' as const
    }];

    const { error: participantError } = await supabase
      .from('trip_participants')
      .insert(participantData);

    if (participantError) {
        console.error("Error adding participants", participantError);
        return;
    }

    setAppState(prev => ({ ...prev, trips: [...prev.trips, trip]}));
    setSelectedTripId(trip.id);
    setCurrentView('TRIP_DASHBOARD');
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
    const { participants, ...tripData } = updatedTrip;
    
    const { error } = await supabase
      .from('trips')
      .update({ data: tripData })
      .eq('id', updatedTrip.id);
      
    if(error) {
        console.error("Error updating trip data", error);
        return;
    }
    setAppState(prev => ({ ...prev, trips: prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t) }));
  };

  const handleConcludeTrip = async (tripId: string) => {
     const tripToUpdate = appState.trips.find(t => t.id === tripId);
     if(!tripToUpdate) return;
     
     const updatedTripData = { ...tripToUpdate, isCompleted: true };
     await handleUpdateTrip(updatedTripData);
  };
  
 const handleInvite = async (trip: Trip, guestEmail: string, permission: 'EDIT' | 'VIEW_ONLY'): Promise<string | null> => {
      if (!appState.user) return "Usuário não logado.";
      
      const { data: guestUser, error: guestError } = await supabase.from('profiles').select('id').eq('email', guestEmail).single();
      if (guestError || !guestUser) return "Nenhuma conta encontrada com este e-mail.";

      if (trip.participants.some(p => p.email === guestEmail)) return "Este usuário já participa da viagem.";
      
      const { data: existingInvite } = await supabase.from('invites').select('id').eq('trip_id', trip.id).eq('guest_email', guestEmail).single();
      if (existingInvite) return "Um convite para esta viagem já foi enviado a este usuário.";

      const { error: inviteError } = await supabase.from('invites').insert({
          trip_id: trip.id,
          tripName: trip.name,
          host_email: appState.user.email,
          hostName: appState.user.name,
          guest_email: guestEmail,
          permission: permission
      });

      if (inviteError) {
          console.error("Error sending invite:", inviteError);
          return "Erro ao enviar o convite.";
      }
      return null;
  };
  
  const handleAcceptInvite = async (invite: Invite) => {
    if (!appState.user) return;
    
    const { error: participantError } = await supabase.from('trip_participants').insert({
        trip_id: invite.tripId,
        user_id: appState.user.id,
        permission: invite.permission
    });

    if (participantError) {
        console.error("Error accepting invite:", participantError);
        return;
    }

    const { error: updateError } = await supabase.from('invites').update({ status: 'ACCEPTED' }).eq('id', invite.id);
    if(updateError) console.error("Error updating invite status:", updateError);

    // FIX: The `appState.user` object is of type `User`, which cannot be cast to `SupabaseUser`.
    // To refresh user data, we fetch the current user session from Supabase auth, which provides the correct object type for `loadUserData`.
    // We await this to ensure the UI reflects the accepted invite.
    if (appState.user) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserData(user as SupabaseUser);
      }
    }
  };

  const handleDeclineInvite = async (invite: Invite) => {
    const { error } = await supabase.from('invites').update({ status: 'REJECTED' }).eq('id', invite.id);
    if(error) console.error("Error declining invite:", error);
    setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== invite.id) }));
  };

  const handleResendInvite = async (inviteId: string) => {
    const { error } = await supabase.from('invites').update({ status: 'PENDING' }).eq('id', inviteId);
    if(error) console.error("Error resending invite:", error);
    setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
  };

  const handleDismissRejection = async (inviteId: string) => {
      const { error } = await supabase.from('invites').delete().eq('id', inviteId);
      if(error) console.error("Error dismissing rejection:", error);
      setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTripId(trip.id);
    setCurrentView('TRIP_DASHBOARD');
  };
  
  const navigateToProfile = () => {
    // FIX: The `appState.user` object is of type `User`, which cannot be cast to `SupabaseUser`.
    // To refresh user data, we fetch the current user session from Supabase auth, which provides the correct object type for `loadUserData`.
    // This is a fire-and-forget call to avoid blocking navigation.
    if (appState.user) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          loadUserData(user as SupabaseUser);
        }
      });
    }
    setSelectedTripId(null);
    setCurrentView('PROFILE');
  };

  const renderContent = () => {
    if (isLoading) {
        return <div className="min-h-screen bg-brand-dark flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div></div>;
    }
    switch (currentView) {
      case 'LOGIN':
        return <LoginScreen onAuth={handleAuth} />;
      case 'PROFILE':
        if (!appState.user) return <LoginScreen onAuth={handleAuth} />;
        return <ProfileScreen user={appState.user} trips={appState.trips} invites={appState.invites} onLogout={handleLogout} onNewTrip={() => setCurrentView('TRIP_FORM')} onSelectTrip={handleSelectTrip} onUpdateUser={handleUpdateUser} onConcludeTrip={handleConcludeTrip} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onResendInvite={handleResendInvite} onDismissRejection={handleDismissRejection} />;
      case 'TRIP_FORM':
        if (!appState.user) return <LoginScreen onAuth={handleAuth} />;
        return <TripForm user={appState.user} onSave={handleSaveTrip} onCancel={() => setCurrentView('PROFILE')} />;
      case 'TRIP_DASHBOARD':
        const selectedTrip = appState.trips.find(t => t.id === selectedTripId);
        if (!selectedTrip || !appState.user) {
            navigateToProfile();
            return null;
        }
        return <TripDashboard user={appState.user} trip={selectedTrip} updateTrip={handleUpdateTrip} onBackToProfile={navigateToProfile} onInvite={handleInvite} />;
      default:
        return <LoginScreen onAuth={handleAuth} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;