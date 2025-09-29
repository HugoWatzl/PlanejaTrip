// FIX: Add triple-slash directive to include Vite's client types, fixing errors with `import.meta.env`.
/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import { Trip, Activity, User } from '../types.ts';
import DailyPlan from './DailyPlan.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import Sidebar from './Sidebar.tsx';
import FinancialView from './FinancialView.tsx';
import { MapPinIcon, CalendarIcon, ArrowLeftIcon, SparklesIcon, MenuIcon, ChatBubbleLeftRightIcon, XCircleIcon, ChartPieIcon, GlobeIcon, UsersIcon } from './IconComponents.tsx';
import Logo from './Logo.tsx';
import { getTravelSuggestionsText } from '../services/geminiService.ts';
import ActivityFormModal from './ActivityFormModal.tsx';
// FIX: `import type` is prohibited by the coding guidelines. Using a standard, combined import for @google/genai.
import { GoogleGenAI, Chat } from "@google/genai";
import TravelAssistantChat from './TravelAssistantChat.tsx';

interface SuggestionsViewProps {
  tripDestination: string;
}

const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
    const processedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 class="text-xl font-bold mb-3 mt-5">$1</h3>')
        .replace(/^# (.*$)/gim, '<h2 class="text-2xl font-bold mb-4 mt-6">$1</h2>')
        .replace(/^\* (.*$)/gim, '<li class="mb-2 ml-5 list-disc">$1</li>')
        .replace(/<\/li>\n<li/g, '</li><li')
        .replace(/(<li[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/\n/g, '<br />')
        .replace(/<br \/><ul>/g, '<ul>')
        .replace(/<\/ul><br \/>/g, '</ul>');

    return <div className="prose prose-invert max-w-none text-brand-text leading-relaxed" dangerouslySetInnerHTML={{ __html: processedContent }} />;
};


const SuggestionsView: React.FC<SuggestionsViewProps> = ({ tripDestination }) => {
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getTravelSuggestionsText(tripDestination);
                setSuggestions(result);
            } catch (err) {
                setError("Não foi possível carregar as sugestões. Tente novamente.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [tripDestination]);

    return (
        <div className="bg-brand-light rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
                <SparklesIcon className="w-8 h-8 text-brand-accent" />
                <h2 className="text-3xl font-bold">Sugestões da IA para {tripDestination}</h2>
            </div>
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
                    <p className="text-brand-subtext">Gerando recomendações personalizadas para você...</p>
                </div>
            )}
            {error && <p className="text-center text-red-400 py-20">{error}</p>}
            {!isLoading && !error && (
                <div className="space-y-4">
                    <FormattedContent content={suggestions} />
                </div>
            )}
        </div>
    );
};

const LinksView: React.FC = () => {
    const travelLinks = [
        { name: 'Skyscanner', url: 'https://www.skyscanner.com.br', description: 'Pesquisa de voos, hotéis e aluguel de carros.' },
        { name: 'Decolar', url: 'https://www.decolar.com', description: 'Pacotes de viagens, passagens e hospedagens.' },
        { name: 'Civitatis', url: 'https://www.civitatis.com/br/', description: 'Excursões, visitas guiadas e atividades turísticas.' },
        { name: 'GetYourGuide', url: 'https://www.getyourguide.com.br', description: 'Tours e atrações em destinos pelo mundo.' },
        { name: 'TripAdvisor', url: 'https://www.tripadvisor.com.br', description: 'Avaliações e recomendações de viajantes.' },
        { name: 'Trivago', url: 'https://www.trivago.com.br', description: 'Compare preços de hotéis de vários sites.' }
    ];

    return (
         <div className="bg-brand-light rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 pb-4 border-b border-gray-700">Links Úteis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelLinks.map(link => (
                    <a 
                        key={link.name} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-gray-800 p-6 rounded-lg hover:bg-gray-700 hover:shadow-brand-primary/20 transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <h3 className="text-xl font-bold text-brand-primary">{link.name}</h3>
                        <p className="text-brand-subtext mt-2">{link.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
};


interface TripDashboardProps {
  trip: Trip;
  user: User;
  updateTrip: (updatedTrip: Trip) => void;
  onBackToProfile: () => void;
  onInvite: (trip: Trip, email: string, permission: 'EDIT' | 'VIEW_ONLY') => Promise<string | null>;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

type Tab = 'planning' | 'financials' | 'suggestions' | 'links';

const TripDashboard: React.FC<TripDashboardProps> = ({ trip, user, updateTrip, onBackToProfile, onInvite }) => {
  const [activityToConfirm, setActivityToConfirm] = useState<Activity | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('planning');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [editingState, setEditingState] = useState<{ dayIndex: number; activity: Activity | null } | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const currentUserPermission = trip.participants.find(p => p.email === user.email)?.permission || 'VIEW_ONLY';
  const canEdit = currentUserPermission === 'EDIT' && !trip.isCompleted;

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (trip.destination && apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `Você é um assistente de viagens prestativo para uma viagem a ${trip.destination}. Seu nome é PlanejaTrip Assistente. Forneça informações concisas e úteis, recomendações e responda a perguntas sobre a viagem. Use markdown para formatar suas respostas com títulos, negrito e listas quando apropriado.`,
            },
        });
        setChat(chatInstance);
        setChatMessages([]);
    }
  }, [trip.id, trip.destination]);

  const handleSendMessage = async (prompt: string) => {
    if (!chat || isAiThinking) return;

    setIsAiThinking(true);
    const userMessage: ChatMessage = { role: 'user', text: prompt };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const responseStream = await chat.sendMessageStream({ message: prompt });
      
      let modelMessage: ChatMessage = { role: 'model', text: '' };
      setChatMessages(prev => [...prev, modelMessage]);

      for await (const chunk of responseStream) {
          modelMessage.text += chunk.text;
          setChatMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { ...modelMessage };
              return newMessages;
          });
      }
    } catch(error) {
        console.error("Error sending message to Gemini:", error);
        const errorMessage: ChatMessage = { role: 'model', text: 'Desculpe, não consegui processar sua solicitação no momento.' };
        setChatMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsAiThinking(false);
    }
  };


  const handleSaveActivity = (dayIndex: number, activityData: Omit<Activity, 'isConfirmed' | 'realCost'>) => {
    const updatedTrip = { ...trip };
    const day = updatedTrip.days[dayIndex];
    
    const activityId = activityData.id || Date.now().toString();
    const existingActivityIndex = day.activities.findIndex(a => a.id === activityId);
    
    if (existingActivityIndex > -1) {
        const originalActivity = day.activities[existingActivityIndex];
        day.activities[existingActivityIndex] = {
            ...originalActivity,
            ...activityData,
            id: activityId,
        };
    } else {
        day.activities.push({
            ...activityData,
            id: activityId,
            isConfirmed: false,
        });
    }
    updateTrip(updatedTrip);
    setEditingState(null);
  };

  const handleUpdateActivity = (dayIndex: number, activity: Activity) => {
    const updatedTrip = { ...trip };
    updatedTrip.days[dayIndex].activities.push(activity);
    updateTrip(updatedTrip);
  };


  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    const updatedTrip = { ...trip };
    updatedTrip.days[dayIndex].activities = updatedTrip.days[dayIndex].activities.filter(a => a.id !== activityId);
    updateTrip(updatedTrip);
  };
  
  const handleConfirmActivity = (activityId: string, realCost: number, confirmedParticipants: string[]) => {
    const updatedTrip = { ...trip };
    for (const day of updatedTrip.days) {
      const activityIndex = day.activities.findIndex(a => a.id === activityId);
      if (activityIndex > -1) {
        day.activities[activityIndex].isConfirmed = true;
        day.activities[activityIndex].realCost = realCost;
        day.activities[activityIndex].participants = confirmedParticipants;
        updateTrip(updatedTrip);
        break;
      }
    }
    setActivityToConfirm(null);
  };
  
  const handleUpdateBudget = (newBudget: number) => {
    updateTrip({ ...trip, budget: newBudget });
  };

  const startDate = new Date(trip.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' });
  const endDate = new Date(trip.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' });

  return (
    <div className="flex h-screen bg-brand-dark text-brand-text font-sans">
      <Sidebar trip={trip} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onUpdateTrip={updateTrip} onBackToProfile={onBackToProfile} onInvite={onInvite} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-brand-light shadow-md z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <button onClick={onBackToProfile} className="mr-4 p-2 rounded-full text-brand-subtext hover:text-brand-text hover:bg-gray-700 transition-colors">
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                   <h1 className="text-xl font-bold truncate md:hidden">{trip.name}</h1>
                  <div className="hidden md:flex items-center text-base text-brand-text space-x-4">
                    <span className="flex items-center font-semibold"><MapPinIcon className="w-5 h-5 mr-2 text-brand-subtext" />{trip.destination}</span>
                    <span className="flex items-center font-semibold"><CalendarIcon className="w-5 h-5 mr-2 text-brand-subtext" />{startDate} - {endDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                  <button onClick={() => setIsSidebarOpen(true)} disabled={!canEdit} className="flex items-center space-x-2 text-brand-subtext hover:text-brand-text bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <MenuIcon className="w-5 h-5" />
                      <span className="text-sm font-semibold hidden sm:inline">Conf.</span>
                  </button>
                  <div className="hidden md:flex items-center space-x-1 bg-gray-800 p-1 rounded-lg ml-4">
                      <button onClick={() => { setActiveTab('planning'); setSelectedDayIndex(null); }} className={`px-3 py-1 text-sm rounded-md transition ${activeTab === 'planning' ? 'bg-brand-primary text-white' : 'text-brand-subtext'}`}>Planejamento</button>
                      <button onClick={() => setActiveTab('financials')} className={`px-3 py-1 text-sm rounded-md transition ${activeTab === 'financials' ? 'bg-brand-primary text-white' : 'text-brand-subtext'}`}>Financeiro</button>
                      <button onClick={() => setActiveTab('suggestions')} className={`px-3 py-1 text-sm rounded-md transition ${activeTab === 'suggestions' ? 'bg-brand-primary text-white' : 'text-brand-subtext'}`}>Sugestões IA</button>
                      <button onClick={() => setActiveTab('links')} className={`px-3 py-1 text-sm rounded-md transition ${activeTab === 'links' ? 'bg-brand-primary text-white' : 'text-brand-subtext'}`}>Links</button>
                  </div>
                  <Logo className="ml-6 hidden lg:flex" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {activeTab === 'planning' && (
            <div>
              {selectedDayIndex === null ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trip.days.map((day, index) => (
                    <button 
                      key={day.date}
                      onClick={() => setSelectedDayIndex(index)}
                      className="bg-brand-light p-6 rounded-xl shadow-lg text-left hover:bg-gray-700 hover:shadow-brand-primary/20 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <h3 className="text-xl font-bold text-brand-primary">Dia {day.dayNumber}</h3>
                      <p className="text-brand-subtext">{new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <DailyPlan
                  day={trip.days[selectedDayIndex]}
                  canEdit={canEdit}
                  tripDestination={trip.destination}
                  categories={trip.categories}
                  updateActivity={handleUpdateActivity}
                  deleteActivity={handleDeleteActivity}
                  onConfirmClick={setActivityToConfirm}
                  onBack={() => setSelectedDayIndex(null)}
                  onAddActivity={() => setEditingState({ dayIndex: selectedDayIndex, activity: null })}
                  onEditActivity={(activity) => setEditingState({ dayIndex: selectedDayIndex, activity })}
                />
              )}
            </div>
          )}
          {activeTab === 'financials' && <FinancialView trip={trip} onUpdateBudget={handleUpdateBudget} canEdit={canEdit} />}
          {activeTab === 'suggestions' && <SuggestionsView tripDestination={trip.destination} />}
          {activeTab === 'links' && <LinksView />}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-light border-t border-gray-700 flex justify-around p-2 z-20">
            <button onClick={() => { setActiveTab('planning'); setSelectedDayIndex(null); }} className={`flex flex-col items-center justify-center w-1/4 transition-colors ${activeTab === 'planning' ? 'text-brand-primary' : 'text-brand-subtext'}`}>
                <CalendarIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Planejar</span>
            </button>
             <button onClick={() => setActiveTab('financials')} className={`flex flex-col items-center justify-center w-1/4 transition-colors ${activeTab === 'financials' ? 'text-brand-primary' : 'text-brand-subtext'}`}>
                <ChartPieIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Financeiro</span>
            </button>
             <button onClick={() => setActiveTab('suggestions')} className={`flex flex-col items-center justify-center w-1/4 transition-colors ${activeTab === 'suggestions' ? 'text-brand-primary' : 'text-brand-subtext'}`}>
                <SparklesIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Sugestões</span>
            </button>
             <button onClick={() => setActiveTab('links')} className={`flex flex-col items-center justify-center w-1/4 transition-colors ${activeTab === 'links' ? 'text-brand-primary' : 'text-brand-subtext'}`}>
                <GlobeIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Links</span>
            </button>
        </div>

         <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-brand-secondary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition transform hover:scale-110 z-20"
            aria-label="Abrir Assistente de Viagem"
        >
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </button>
        {isChatOpen && (
            <TravelAssistantChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isAiThinking={isAiThinking}
                onClose={() => setIsChatOpen(false)}
            />
        )}
      </div>
      {activityToConfirm && (
        <ConfirmModal
          activity={activityToConfirm}
          participants={trip.participants.map(p => p.name)}
          onClose={() => setActivityToConfirm(null)}
          onConfirm={handleConfirmActivity}
        />
      )}
      {editingState && (
        <ActivityFormModal
            activity={editingState.activity}
            categories={trip.categories}
            tripParticipants={trip.participants}
            onClose={() => setEditingState(null)}
            onSave={(activityData) => handleSaveActivity(editingState.dayIndex, activityData)}
        />
      )}
    </div>
  );
};

export default TripDashboard;