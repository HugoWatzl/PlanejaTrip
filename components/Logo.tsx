import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <svg width="240" height="50" viewBox="0 0 240 50">
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#0052D4', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#65C7F7', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <text 
                    x="120" 
                    y="35" 
                    fontFamily="Inter, sans-serif" 
                    fontSize="34" 
                    fontWeight="800" 
                    fill="url(#logoGradient)" 
                    textAnchor="middle"
                    letterSpacing="-1.5"
                >
                    PlanejaTrip
                </text>
            </svg>
        </div>
    );
};

export default Logo;