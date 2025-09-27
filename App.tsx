import React, { useState, useEffect } from 'react';
import { Trip, User, Invite, Participant } from './types';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import TripForm from './components/TripForm';
import TripDashboard from './components/TripDashboard';

type View = 'LOGIN' | 'PROFILE' | 'TRIP_FORM' | 'TRIP_DASHBOARD';

interface AppState {
  user: User | null;
  trips: Trip[];
  invites: Invite[];
}

const getInitialState = (): AppState => ({ user: null, trips: [], invites: [] });

// Helper para obter dados do localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getInitialState());
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    // Migra o formato antigo de convites (aninhado por email) para o novo formato global
    const oldInvitesRaw = localStorage.getItem('planejaTrip_invites');
    if (oldInvitesRaw) {
        try {
            const parsedOld = JSON.parse(oldInvitesRaw);
            const firstKey = Object.keys(parsedOld)[0];
            if (firstKey && Array.isArray(parsedOld[firstKey])) {
                console.log("Migrando formato de convites...");
                const newInvites: Record<string, Invite> = {};
                Object.values(parsedOld).forEach((inviteArray: any) => {
                    if(Array.isArray(inviteArray)) {
                        inviteArray.forEach((invite: Invite) => {
                            newInvites[invite.id] = { ...invite, status: 'PENDING' };
                        });
                    }
                });
                localStorage.setItem('planejaTrip_invites', JSON.stringify(newInvites));
            }
        } catch(e) {
            console.error("Falha ao migrar convites, pode já estar no novo formato.", e);
        }
    }

    const lastUserEmail = localStorage.getItem('planejaTrip_lastUser');
    if (lastUserEmail) {
      const users = getFromStorage<Record<string, User>>('planejaTrip_users', {});
      const user = users[lastUserEmail];
      if (user) {
        loadUserData(user);
        setCurrentView('PROFILE');
      }
    }
  }, []);

  const loadUserData = (user: User) => {
    const allTrips = getFromStorage<Record<string, Trip>>('planejaTrip_trips', {});
    const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
    
    const userTrips = Object.values(allTrips).filter(trip => 
        trip.participants.some(p => p.email === user.email)
    );
    
    const userInvites = Object.values(allInvites).filter(inv => 
      (inv.guestEmail === user.email && inv.status === 'PENDING') ||
      (inv.hostEmail === user.email && inv.status === 'REJECTED')
    );

    setAppState({ user, trips: userTrips, invites: userInvites });
  };
  
  const handleLogin = (name: string, email: string, password: string): string | null => {
      const users = getFromStorage<Record<string, User>>('planejaTrip_users', {});
      const existingUser = users[email];

      if (existingUser) { // Login
          if (existingUser.password === password) {
              localStorage.setItem('planejaTrip_lastUser', email);
              loadUserData(existingUser);
              setCurrentView('PROFILE');
              return null;
          } else {
              return "Senha incorreta.";
          }
      } else { // Register
          const newUser: User = { id: email, name, email, password };
          users[email] = newUser;
          localStorage.setItem('planejaTrip_users', JSON.stringify(users));
          localStorage.setItem('planejaTrip_lastUser', email);
          loadUserData(newUser);
          setCurrentView('PROFILE');
          return null;
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('planejaTrip_lastUser');
    setAppState(getInitialState());
    setCurrentView('LOGIN');
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (!appState.user) return;
    const users = getFromStorage<Record<string, User>>('planejaTrip_users', {});
    users[appState.user.email] = { ...users[appState.user.email], ...updatedUser };
    localStorage.setItem('planejaTrip_users', JSON.stringify(users));
    setAppState(prev => ({ ...prev, user: updatedUser }));
  };
  
  const handleSaveTrip = (trip: Trip) => {
    const allTrips = getFromStorage<Record<string, Trip>>('planejaTrip_trips', {});
    allTrips[trip.id] = trip;
    localStorage.setItem('planejaTrip_trips', JSON.stringify(allTrips));

    setAppState(prev => ({ ...prev, trips: [...prev.trips, trip]}));
    setSelectedTripId(trip.id);
    setCurrentView('TRIP_DASHBOARD');
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    const allTrips = getFromStorage<Record<string, Trip>>('planejaTrip_trips', {});
    allTrips[updatedTrip.id] = updatedTrip;
    localStorage.setItem('planejaTrip_trips', JSON.stringify(allTrips));
    
    setAppState(prev => ({ ...prev, trips: prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t) }));
  };

  const handleConcludeTrip = (tripId: string) => {
    const allTrips = getFromStorage<Record<string, Trip>>('planejaTrip_trips', {});
    if (allTrips[tripId]) {
      allTrips[tripId].isCompleted = true;
      localStorage.setItem('planejaTrip_trips', JSON.stringify(allTrips));
      setAppState(prev => ({...prev, trips: prev.trips.map(t => t.id === tripId ? {...t, isCompleted: true} : t)}));
    }
  };
  
  const handleInvite = (trip: Trip, guestEmail: string, permission: 'EDIT' | 'VIEW_ONLY'): string | null => {
      if (!appState.user) return "Usuário não logado.";
      const users = getFromStorage<Record<string, User>>('planejaTrip_users', {});
      if (!users[guestEmail]) return "Nenhuma conta encontrada com este e-mail.";
      if (trip.participants.some(p => p.email === guestEmail)) return "Este usuário já participa da viagem.";
      
      const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
      const existingInvite = Object.values(allInvites).find(inv => inv.tripId === trip.id && inv.guestEmail === guestEmail);
      if (existingInvite) return "Um convite para esta viagem já foi enviado a este usuário.";

      const newInvite: Invite = {
          id: Date.now().toString(),
          tripId: trip.id,
          tripName: trip.name,
          hostEmail: appState.user.email,
          hostName: appState.user.name,
          guestEmail: guestEmail,
          permission: permission,
          status: 'PENDING'
      };
      allInvites[newInvite.id] = newInvite;
      localStorage.setItem('planejaTrip_invites', JSON.stringify(allInvites));
      return null; // Success
  };
  
  const handleAcceptInvite = (invite: Invite) => {
    if (!appState.user) return;
    const allTrips = getFromStorage<Record<string, Trip>>('planejaTrip_trips', {});
    const trip = allTrips[invite.tripId];
    if (trip) {
        const newParticipant: Participant = {
            name: appState.user.name,
            email: appState.user.email,
            permission: invite.permission
        };
        trip.participants.push(newParticipant);
        localStorage.setItem('planejaTrip_trips', JSON.stringify(allTrips));
        setAppState(prev => ({ ...prev, trips: [...prev.trips, trip] }));
    }
    // Remove invite after processing
    const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
    delete allInvites[invite.id];
    localStorage.setItem('planejaTrip_invites', JSON.stringify(allInvites));
    setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== invite.id) }));
  };

  const handleDeclineInvite = (invite: Invite) => {
    if (!appState.user) return;
    const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
    if(allInvites[invite.id]) {
      allInvites[invite.id].status = 'REJECTED';
      localStorage.setItem('planejaTrip_invites', JSON.stringify(allInvites));
      setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== invite.id) }));
    }
  };

  const handleResendInvite = (inviteId: string) => {
    const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
    if (allInvites[inviteId]) {
        allInvites[inviteId].status = 'PENDING';
        localStorage.setItem('planejaTrip_invites', JSON.stringify(allInvites));
        setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
    }
  };

  const handleDismissRejection = (inviteId: string) => {
      const allInvites = getFromStorage<Record<string, Invite>>('planejaTrip_invites', {});
      delete allInvites[inviteId];
      localStorage.setItem('planejaTrip_invites', JSON.stringify(allInvites));
      setAppState(prev => ({ ...prev, invites: prev.invites.filter(i => i.id !== inviteId) }));
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
    switch (currentView) {
      case 'LOGIN':
        return <LoginScreen onLogin={handleLogin} />;
      case 'PROFILE':
        if (!appState.user) return <LoginScreen onLogin={handleLogin} />;
        return <ProfileScreen user={appState.user} trips={appState.trips} invites={appState.invites} onLogout={handleLogout} onNewTrip={() => setCurrentView('TRIP_FORM')} onSelectTrip={handleSelectTrip} onUpdateUser={handleUpdateUser} onConcludeTrip={handleConcludeTrip} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onResendInvite={handleResendInvite} onDismissRejection={handleDismissRejection} />;
      case 'TRIP_FORM':
        if (!appState.user) return <LoginScreen onLogin={handleLogin} />;
        return <TripForm user={appState.user} onSave={handleSaveTrip} onCancel={() => setCurrentView('PROFILE')} />;
      case 'TRIP_DASHBOARD':
        const selectedTrip = appState.trips.find(t => t.id === selectedTripId);
        if (!selectedTrip || !appState.user) { // Removed isCompleted check to allow viewing completed trips
            navigateToProfile();
            return null;
        }
        return <TripDashboard user={appState.user} trip={selectedTrip} updateTrip={handleUpdateTrip} onBackToProfile={navigateToProfile} onInvite={handleInvite} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;