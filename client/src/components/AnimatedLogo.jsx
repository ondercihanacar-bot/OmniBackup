import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function AnimatedLogo({ 
  size = 'md', 
  variant = 'cyber',
  showSoundToggle = true, 
  autoSound = false, 
  className = '' 
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(!autoSound);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
    xl: 'w-36 h-36 rounded-3xl',
    login: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
    'login-circle': 'w-24 h-24 sm:w-28 sm:h-28 rounded-full'
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        // Autoplay policy fallback: mute and retry
        if (!isMuted) {
          setIsMuted(true);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        }
      });
    }
  }, [isMuted]);

  const toggleSound = (e) => {
    e.stopPropagation();
    setHasInteracted(true);
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted === false) {
        videoRef.current.volume = 0.85;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleContainerClick = () => {
    if (!hasInteracted && isMuted) {
      toggleSound({ stopPropagation: () => {} });
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`relative group inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {/* Frame Container */}
      <div className={`relative overflow-hidden ${sizeClasses[size] || sizeClasses.md} ${
        variant === 'light' || variant === 'round-light'
          ? 'bg-slate-900 border border-slate-300 shadow-md ring-4 ring-slate-200/50'
          : 'bg-slate-950 border border-cyan-500/40 shadow-glow-cyan-sm group-hover:border-cyan-400 group-hover:shadow-glow-cyan'
      } transition-all duration-300`}>
        <video
          ref={videoRef}
          src="/logo.mp4"
          autoPlay
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover rounded-[inherit]"
          onError={(e) => {
            // Fallback to /logo/logo.mp4 if /logo.mp4 fails
            if (e.target.src.indexOf('/logo/logo.mp4') === -1) {
              e.target.src = '/logo/logo.mp4';
            }
          }}
        />

        {/* Ambient Gradient Overlay */}
        {variant !== 'light' && variant !== 'round-light' && (
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/30 to-transparent pointer-events-none" />
        )}

        {/* Sound Toggle Overlay Icon */}
        {showSoundToggle && (size === 'lg' || size === 'xl' || size === 'login' || size === 'login-circle') && (
          <button
            type="button"
            onClick={toggleSound}
            className={`absolute bottom-2 right-2 p-1.5 rounded-lg ${
              variant === 'light' || variant === 'round-light'
                ? 'bg-white/90 hover:bg-white border border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 shadow-md'
            } backdrop-blur-md transition-all duration-200 opacity-90 group-hover:opacity-100 z-10`}
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <div className="relative">
                <Volume2 className={`w-4 h-4 ${variant === 'light' || variant === 'round-light' ? 'text-teal-600' : 'text-cyan-400'}`} />
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${variant === 'light' || variant === 'round-light' ? 'bg-teal-500' : 'bg-cyan-400'} animate-ping`} />
              </div>
            )}
          </button>
        )}
      </div>

      {/* Mini Sound Indicator for Small Navbar Icons */}
      {showSoundToggle && (size === 'sm' || size === 'md') && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 shadow transition-colors"
          title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
        >
          {isMuted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5 text-cyan-400" />}
        </button>
      )}
    </div>
  );
}
