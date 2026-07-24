'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, Rewind, FastForward, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HlsVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  autoPlayOnScroll?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export default function HlsVideoPlayer({ src, className, autoPlayOnScroll, objectFit = 'contain', ...props }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(props.muted || false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<{ height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isBuffering, setIsBuffering] = useState(false);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true, // Auto cap to prevent buffering on small screens
        });
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          // Store available qualities (levels)
          setLevels(data.levels);
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentLevel(data.level);
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }
  }, [src]);

  // Autoplay on scroll logic using IntersectionObserver
  useEffect(() => {
    if (!autoPlayOnScroll || !containerRef.current || !videoRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Mute before autoplay to satisfy browser policies
            videoRef.current!.muted = true;
            setIsMuted(true);
            videoRef.current!.play().catch(console.error);
          } else {
            videoRef.current!.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoPlayOnScroll]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
    if (!showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 2500);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime: current, duration: total } = videoRef.current;
      const prog = (current / total) * 100;
      setProgress(prog || 0);
      setCurrentTime(current);
      if (total && !isNaN(total)) {
        setDuration(total);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      // -1 means auto
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch((err) => console.log(err));
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          // iOS Safari fallback
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    }
  };

  // Remove native controls to use our custom ones
  const { controls, children, ...videoProps } = props;

  return (
    <div 
      ref={containerRef}
      className={`relative group overflow-hidden bg-black ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video 
        ref={videoRef} 
        {...videoProps}
        className={`w-full h-full cursor-pointer object-${objectFit}`}
        onClick={toggleControls}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => { setIsPlaying(true); setIsBuffering(false); }}
        controls={false}
      >
        {children}
      </video>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-md" />
        </div>
      )}
      
      {/* Controls Overlay */}
      <div 
        className={`video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div 
          className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer group/progress relative"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-brand-medium rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transform translate-x-1/2" />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => handleSkip(-5)} className="text-white hover:text-brand-medium transition-colors" title="Rewind 5s">
              <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={togglePlay} className="text-white hover:text-brand-medium transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={() => handleSkip(5)} className="text-white hover:text-brand-medium transition-colors" title="Forward 5s">
              <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={toggleMute} className="text-white hover:text-brand-medium transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div className="text-white/90 text-xs font-semibold font-mono tracking-wider">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {levels.length > 0 && (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-white hover:text-brand-medium transition-colors outline-none flex items-center gap-1.5 text-sm font-medium bg-black/40 px-2 py-1 rounded">
                    <Settings className="w-4 h-4" />
                    {currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height}p`}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#111111] text-white border-white/10 mb-2">
                    <DropdownMenuItem 
                      onClick={() => handleQualityChange(-1)}
                      className={`cursor-pointer ${currentLevel === -1 ? 'text-brand-medium font-bold' : ''}`}
                    >
                      Auto
                    </DropdownMenuItem>
                    {levels.map((level, index) => (
                      <DropdownMenuItem 
                        key={index} 
                        onClick={() => handleQualityChange(index)}
                        className={`cursor-pointer ${currentLevel === index ? 'text-brand-medium font-bold' : ''}`}
                      >
                        {level.height}p
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <button onClick={toggleFullscreen} className="text-white hover:text-brand-medium transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
