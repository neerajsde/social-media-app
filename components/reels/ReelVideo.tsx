'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReelVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  isActive: boolean;
}

export default function ReelVideo({ src, isActive, className, ...props }: ReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(props.muted !== undefined ? props.muted : true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true, // Auto cap to prevent buffering on small screens
          startLevel: 1, // Start with a decent quality
        });
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
        });
      }
    } else {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
      });
    }
  }, [src]);

  // Handle active state
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Autoplay prevented:", error);
          setIsPlaying(false);
        });
      }
    } else {
      videoRef.current.pause();
      // Reset video to start when inactive so it plays from beginning next time
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      const prog = (currentTime / duration) * 100;
      setProgress(prog || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const { controls, children, ...videoProps } = props;

  return (
    <div 
      ref={containerRef}
      className={cn("relative group overflow-hidden bg-[#111111] h-full w-full", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video 
        ref={videoRef} 
        {...videoProps}
        className="w-full h-full object-contain bg-black cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        controls={false}
        loop
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        muted={isMuted}
      >
        {children}
      </video>

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
          <LoaderCircle className="w-8 h-8 text-white animate-spin opacity-80" />
        </div>
      )}

      {/* Play/Pause Overlay Icon (shows briefly on toggle) */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm">
            <Play className="w-12 h-12 text-white opacity-90 ml-1" />
          </div>
        </div>
      )}
      
      {/* Top Gradient for readability if controls are shown, otherwise clear */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 pointer-events-none z-10",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 z-20 flex justify-between items-start pointer-events-none",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <button 
          onClick={togglePlay} 
          className="text-white hover:text-[#00D084] transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md pointer-events-auto"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMute} 
            className="text-white hover:text-[#00D084] transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md pointer-events-auto"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={toggleFullscreen} 
            className="text-white hover:text-[#00D084] transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md pointer-events-auto"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto h-1.5 group/progress flex items-end">
        <div 
          className="w-full h-1 bg-white/20 cursor-pointer transition-all duration-200 group-hover/progress:h-1.5"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-white/90 relative"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
