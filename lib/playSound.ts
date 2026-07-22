export const playNotificationSound = () => {
  try {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Create oscillator (sound generator) and gain node (volume control)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // A pleasant "pop/bell" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Start at A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05); // Ramp up to A6
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // Settle back

    // Volume envelope (quick attack, smooth decay)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.error("Failed to play notification sound", error);
  }
};
