import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './TripDashboard';
import { PaperAirplaneIcon, XCircleIcon, SparklesIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from './IconComponents';

interface TravelAssistantChatProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isAiThinking: boolean;
  onClose: () => void;
}

const FormattedChatMessage: React.FC<{ text: string }> = ({ text }) => {
    const processedContent = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
        .replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold mt-5 mb-3">$1</h2>')
        .replace(/^\* (.*$)/gim, '<li class="mb-1 ml-4 list-disc">$1</li>')
        .replace(/<\/li>\n<li/g, '</li><li')
        .replace(/(<li[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/\n/g, '<br />')
        .replace(/<br \/><ul>/g, '<ul>')
        .replace(/<\/ul><br \/>/g, '</ul>');

    return <div className="text-sm break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: processedContent }} />;
};

const getInitialSize = () => {
    // On mobile, make the chat window responsive and smaller.
    if (window.innerWidth < 768) {
        // Use 90% of viewport width/height, with max values.
        const width = Math.min(400, window.innerWidth * 0.9);
        const height = Math.min(500, window.innerHeight * 0.7);
        return { width, height };
    }
    // Desktop default size.
    return { width: 400, height: 600 };
};

const getInitialPosition = (initialSize: {width: number, height: number}) => {
    // Center it on mobile.
    if (window.innerWidth < 768) {
        return { 
            x: (window.innerWidth - initialSize.width) / 2, 
            y: (window.innerHeight - initialSize.height) / 2
        };
    }
    // Bottom-right on desktop.
    return { 
        x: window.innerWidth - initialSize.width - 32, 
        y: window.innerHeight - initialSize.height - 96 
    };
};


const TravelAssistantChat: React.FC<TravelAssistantChatProps> = ({ messages, onSendMessage, isAiThinking, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [size, setSize] = useState(getInitialSize);
  const [position, setPosition] = useState(() => getInitialPosition(getInitialSize()));
  const [isMaximized, setIsMaximized] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; initialW: number; initialH: number } | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAiThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleDragMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (isMaximized) return;
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, initialX: position.x, initialY: position.y };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, initialW: size.width, initialH: size.height };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        // Clamp position to stay within viewport, with a small margin
        const newX = Math.max(8, Math.min(dragStartRef.current.initialX + dx, window.innerWidth - size.width - 8));
        const newY = Math.max(8, Math.min(dragStartRef.current.initialY + dy, window.innerHeight - size.height - 8));

        setPosition({ x: newX, y: newY });
    }
    if (resizeStartRef.current) {
        const dw = e.clientX - resizeStartRef.current.x;
        const dh = e.clientY - resizeStartRef.current.y;
        const newWidth = Math.max(300, resizeStartRef.current.initialW + dw);
        const newHeight = Math.max(350, resizeStartRef.current.initialH + dh);
        setSize({
            width: newWidth,
            height: newHeight
        });
    }
  }, [size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    dragStartRef.current = null;
    resizeStartRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  }

  const chatStyle: React.CSSProperties = isMaximized ? {
      top: '50%',
      left: '50%',
      width: '90vw',
      height: '80vh',
      transform: 'translate(-50%, -50%)',
      maxWidth: '1200px',
  } : {
      top: `${position.y}px`, 
      left: `${position.x}px`,
      width: `${size.width}px`, 
      height: `${size.height}px`,
  };

  return (
    <div 
      style={chatStyle}
      className="fixed bg-brand-light rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-out"
    >
      <header 
        onMouseDown={handleDragMouseDown}
        className={`flex items-center justify-between p-4 border-b border-gray-700 ${isMaximized ? 'cursor-default' : 'cursor-move'}`}
      >
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-brand-accent" />
            <h3 className="font-bold text-lg">Assistente de Viagem</h3>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={toggleMaximize} className="text-brand-subtext hover:text-brand-text cursor-pointer">
                {isMaximized ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}
            </button>
            <button onClick={onClose} className="text-brand-subtext hover:text-brand-text cursor-pointer">
                <XCircleIcon className="w-7 h-7" />
            </button>
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-gray-700 text-brand-text rounded-bl-lg'}`}>
              {msg.role === 'model' ? <FormattedChatMessage text={msg.text} /> : <p className="text-sm break-words">{msg.text}</p>}
            </div>
          </div>
        ))}
        {isAiThinking && messages[messages.length-1]?.role === 'user' && (
             <div className="flex justify-start">
                 <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-700 text-brand-text rounded-bl-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-subtext rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-brand-subtext rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-brand-subtext rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-800 rounded-lg p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre sua viagem..."
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
            disabled={isAiThinking}
          />
          <button type="submit" disabled={isAiThinking || !input.trim()} className="p-2 bg-brand-primary rounded-md text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
      {!isMaximized && (
        <div 
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
          title="Redimensionar"
        />
      )}
    </div>
  );
};

export default TravelAssistantChat;