import React, { useState, useEffect } from 'react';
import { Trip, User, Invite, Participant } from './types';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import TripForm from './components/TripForm';
import TripDashboard from './components/TripDashboard';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

type View = 'LOGIN' | 'PROFILE' | 'TRIP_FORM' | 'TRIP_DASHBOARD';

interface AppState {
  user: User | null;
  trips: Trip[];
  invites: Invite[];
}

const getInitialState = (): AppState => ({ user: null, trips: [], invites: [] });

// Helper to reconstruct the Trip object from the database response
const reconstructTrip = (dbTrip: any): Trip => {
    return {
        id: dbTrip.id,
        ...dbTrip.data
    };
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getInitialState());
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadInitialData(session);
      } else {
        setAppState(getInitialState());
        setCurrentView('LOGIN');
      }
      setLoading(false);
    });

    // Check for initial session on mount
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await loadInitialData(session);
        }
        setLoading(false);
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const loadInitialData = async (session: Session) => {
      const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

      if (profile) {
          await loadUserData(profile);
          setCurrentView('PROFILE');
      } else if (error) {
          console.error("Error fetching profile:", error.message);
      }
  };

  const loadUserData = async (user: User) => {
    const { data: tripsData, error: tripsError } = await supabase.from('trips').select('*');
    const { data: invitesData, error: invitesError } = await supabase.from('invites').select('*').or(`guest_email.eq.${user.email},and(status.eq.REJECTED,host_email.eq.${user.email})`);

    if(tripsError) console.error("Error fetching trips:", tripsError.message);
    if(invitesError) console.error("Error fetching invites:", invitesError.message);
    
    const userTrips = tripsData ? tripsData.map(reconstructTrip) : [];
    const userInvites = invitesData || [];

    setAppState({ user, trips: userTrips, invites: userInvites });
  };
  
  const handleLogin = async (email: string, password: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
          throw error;
      }
      // onAuthStateChange will handle successful login
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<void> => {
      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: { name } // This will be used by the database trigger
          }
      });
      if (error) {
          throw error;
      }
      // onAuthStateChange will handle successful signup
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAppState(getInitialState());
    setCurrentView('LOGIN');
  };

  const handleUpdateUser = async (updatedUser: User, passwordData?: { currentPassword: string; newPassword: string }): Promise<string | null> => {
    if (!appState.user) return "Usuário não autenticado.";
  
    // Update password if provided
    if (passwordData && passwordData.newPassword && passwordData.currentPassword) {
      // To verify the current password, we try to sign in with it.
      // This will issue a new session token but won't disrupt the UX if successful.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: appState.user.email,
        password: passwordData.currentPassword,
      });
  
      if (signInError) {
        return "A senha atual está incorreta.";
      }
  
      // If password is correct, update to the new one.
      const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (updateError) {
        console.error("Error updating password:", updateError.message);
        return `Erro ao atualizar a senha: ${updateError.message}`;
      }
    }
  
    // Update profile name if it has changed
    if (updatedUser.name !== appState.user.name) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name: updatedUser.name })
        .eq('id', updatedUser.id)
        .select()
        .single();
  
      if (error) {
        console.error("Error updating user name:", error.message);
        return `Erro ao atualizar o nome: ${error.message}`;
      }
      if (data) {
        setAppState(prev => ({ ...prev, user: data }));
      }
    }
  
    return null; // Success
  };
  
  const handleSaveTrip = async (trip: Trip) => {
    if (!appState.user) return;
    
    const { id, ...tripData } = trip;

    const { data: newTripDb, error: tripError } = await supabase
        .from('trips')
        .insert({ owner_id: appState.user.id, data: tripData })
        .select()
        .single();
    
    if (tripError || !newTripDb) {
      console.error("Error creating trip:", tripError?.message);
      return;
    }

    const { error: participantError } = await supabase
        .from('trip_participants')
        .insert({ trip_id: newTripDb.id, user_id: appState.user.id, permission: 'EDIT' });
    
    if (participantError) {
        console.error("Error adding owner as participant:", participantError.message);
        // Consider rolling back the trip creation
        return;
    }
    
    const newTrip = reconstructTrip(newTripDb);
    setAppState(prev => ({ ...prev, trips: [...prev.trips, newTrip]}));
    setSelectedTripId(newTrip.id);
    setCurrentView('TRIP_DASHBOARD');
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
      const { id, ...tripData } = updatedTrip;
      const { data, error } = await supabase
          .from('trips')
          .update({ data: tripData })
          .eq('id', id)
          .select()
          .single();

      if (error) {
          console.error("Error updating trip:", error.message);
          return;
      }
      if (data) {
          const newTrip = reconstructTrip(data);
          setAppState(prev => ({ ...prev, trips: prev.trips.map(t => t.id === newTrip.id ? newTrip : t) }));
      }
  };

  const handleConcludeTrip = async (tripId: string) => {
    const tripToUpdate = appState.trips.find(t => t.id === tripId);
    if (!tripToUpdate) return;
    
    const updatedTripData = { ...tripToUpdate, isCompleted: true };
    const { id, ...dataToSave } = updatedTripData;

    const { error } = await supabase
        .from('trips')
        .update({ data: dataToSave })
        .eq('id', tripId);
    
    if (!error) {
      setAppState(prev => ({...prev, trips: prev.trips.map(t => t.id === tripId ? updatedTripData : t)}));
    } else {
        console.error("Error concluding trip:", error.message);
    }
  };
  
  const handleInvite = async (trip: Trip, guestEmail: string, permission: 'EDIT' | 'VIEW_ONLY'): Promise<string | null> => {
      if (!appState.user) return "Usuário não logado.";

      const { data: guestProfile } = await supabase.from('profiles').select('id').eq('email', guestEmail).single();
      if (!guestProfile) return "Nenhuma conta encontrada com este e-mail.";
      if (trip.participants.some(p => p.email === guestEmail)) return "Este usuário já participa da viagem.";
      
      const { error } = await supabase.from('invites').insert({
          trip_id: trip.id,
          tripName: trip.name,
          host_email: appState.user.email,
          hostName: appState.user.name,
          guest_email: guestEmail,
          permission: permission
      });
      
      if (error) {
          if (error.code === '23505') return "Um convite para esta viagem já foi enviado a este usuário.";
          console.error("Error sending invite:", error);
          return error.message;
      }

      return null; // Success
  };
  
  const handleAcceptInvite = async (invite: Invite) => {
    if (!appState.user) return;
    
    const newParticipant: Participant = {
        name: appState.user.name,
        email: appState.user.email,
        permission: invite.permission
    };
    
    // 1. Fetch the trip to update its participant list
    const { data: tripDb, error: fetchError } = await supabase.from('trips').select('*').eq('id', invite.tripId).single();
    if (fetchError || !tripDb) {
        console.error("Trip not found for invite:", fetchError?.message);
        return;
    }
    const trip = reconstructTrip(tripDb);
    trip.participants.push(newParticipant);

    // 2. Add to trip_participants table
    const { error: participantError } = await supabase.from('trip_participants').insert({
        trip_id: invite.tripId,
        user_id: appState.user.id,
        permission: invite.permission
    });
    if (participantError) {
        console.error("Error adding participant:", participantError.message);
        return;
    }

    // 3. Update the trip's data jsonb
    const { id, ...tripData } = trip;
    await supabase.from('trips').update({ data: tripData }).eq('id', invite.tripId);
    
    // 4. Delete the invite
    await supabase.from('invites').delete().eq('id', invite.id);

    // 5. Update local state
    setAppState(prev => ({
        ...prev,
        trips: [...prev.trips, trip],
        invites: prev.invites.filter(i => i.id !== invite.id)
    }));
  };

  const handleDeclineInvite = async (invite: Invite) => {
    const { error } = await supabase.from('invites').update({ status: 'REJECTED' }).eq('id', invite.id);
    if (!error) {
        setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== invite.id) }));
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    const { error } = await supabase.from('invites').update({ status: 'PENDING' }).eq('id', inviteId);
    if (!error) {
        setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
    }
  };

  const handleDismissRejection = async (inviteId: string) => {
    const { error } = await supabase.from('invites').delete().eq('id', inviteId);
    if (!error) {
        setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
    }
  };


  const handleSelectTrip = (trip: Trip) => {
    setSelectedTripId(trip.id);
    setCurrentView('TRIP_DASHBOARD');
  };
  
  const navigateToProfile = () => {
    if (appState.user) loadUserData(appState.user); // Recarregar dados ao voltar pro perfil
    setSelectedTripId(null);
    setCurrentView('PROFILE');
  };

  const renderContent = () => {
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    switch (currentView) {
      case 'LOGIN':
        return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
      case 'PROFILE':
        if (!appState.user) return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
        return <ProfileScreen user={appState.user} trips={appState.trips} invites={appState.invites} onLogout={handleLogout} onNewTrip={() => setCurrentView('TRIP_FORM')} onSelectTrip={handleSelectTrip} onUpdateUser={handleUpdateUser} onConcludeTrip={handleConcludeTrip} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onResendInvite={handleResendInvite} onDismissRejection={handleDismissRejection} />;
      case 'TRIP_FORM':
        if (!appState.user) return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
        return <TripForm user={appState.user} onSave={handleSaveTrip} onCancel={() => setCurrentView('PROFILE')} />;
      case 'TRIP_DASHBOARD':
        const selectedTrip = appState.trips.find(t => t.id === selectedTripId);
        if (!selectedTrip || !appState.user) {
            navigateToProfile();
            return null;
        }
// FIX: The 'onInvite' prop now correctly matches the async 'handleInvite' function signature.
        return <TripDashboard user={appState.user} trip={selectedTrip} updateTrip={handleUpdateTrip} onBackToProfile={navigateToProfile} onInvite={handleInvite} />;
      default:
        return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;
