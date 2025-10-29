import { useState, useRef, useEffect } from "react";

import StreamCard from "./StreamCard";
import PremiumStreamCard from "./PremiumStreamCard";
import TwitchAuth from "./TwitchAuth";
import KickAuth from "./KickAuth";
import YouTubeAuth from "./YouTubeAuth";
import { MonitorPlay, MessageSquare, MessageSquareOff, Sparkles, Volume2, VolumeX, Moon, Sun, Maximize2, Minimize2, MoveVertical, X, Plus, GripVertical, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// More live stream options
const liveStreamOptions = [
  { name: "xqc", displayName: "xQc", viewers: "78K" },
  { name: "shroud", displayName: "shroud", viewers: "32K" },
  { name: "pokimane", displayName: "Pokimane", viewers: "25K" },
  { name: "summit1g", displayName: "summit1g", viewers: "28K" },
  { name: "lirik", displayName: "LIRIK", viewers: "22K" },
  { name: "timthetatman", displayName: "TimTheTatman", viewers: "41K" },
  { name: "ninja", displayName: "Ninja", viewers: "45K" },
  { name: "tfue", displayName: "Tfue", viewers: "18K" },
  { name: "sodapoppin", displayName: "Sodapoppin", viewers: "15K" },
  { name: "asmongold", displayName: "Asmongold", viewers: "52K" },
];

const kickStreamOptions = [
  { name: "trainwreckstv", displayName: "Trainwreckstv", viewers: "42K" },
  { name: "adin_ross", displayName: "Adin Ross", viewers: "38K" },
  { name: "xposed", displayName: "xPosed", viewers: "15K" },
  { name: "jasontheween", displayName: "JasonTheWeen", viewers: "12K" },
  { name: "destiny", displayName: "Destiny", viewers: "18K" },
  { name: "gmhikaru", displayName: "GMHikaru", viewers: "22K" },
  { name: "ice_poseidon", displayName: "Ice Poseidon", viewers: "28K" },
  { name: "suspendas", displayName: "Suspendas", viewers: "9K" },
];

const youtubeStreamOptions = [
  { name: "UCX6OQ3DkcsbYNE6H8uQQuVA", displayName: "MrBeast Gaming", viewers: "125K" },
  { name: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", displayName: "PewDiePie", viewers: "89K" },
  { name: "UCq-Fj5jknLsUf-MWSy4_brA", displayName: "T-Series", viewers: "156K" },
  { name: "UCbCmjCuTUZos6Inko4u57UQ", displayName: "Cocomelon", viewers: "98K" },
  { name: "UCYfdidRxbB8Qhf0Nx7ioOYw", displayName: "News Live", viewers: "45K" },
  { name: "UCpEhnqL0y41EpW2TvWAHD7Q", displayName: "Lofi Girl", viewers: "67K" },
];

type StreamSize = 'small' | 'medium' | 'large';
type StreamLayout = 'grid' | 'top-bottom' | 'freeform';
type Platform = 'twitch' | 'kick' | 'youtube';

interface StreamConfig {
  channel: string;
  platform: Platform;
  size: StreamSize;
  row?: 'top' | 'bottom';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface ChatWindow {
  channel: string;
  platform: Platform;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isKickAuthenticated, setIsKickAuthenticated] = useState(false);
  const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);
  const [showChats, setShowChats] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [activeStreams, setActiveStreams] = useState(["xqc", "shroud"]);
  const [premiumStreams, setPremiumStreams] = useState(["pokimane", "summit1g", "lirik", "timthetatman"]);
  const [draggedStream, setDraggedStream] = useState<string | null>(null);
  const [openChats, setOpenChats] = useState<ChatWindow[]>([]);
  const [draggingChatIndex, setDraggingChatIndex] = useState<number | null>(null);
  const [chatDragOffset, setChatDragOffset] = useState({ x: 0, y: 0 });
  const [resizingChatIndex, setResizingChatIndex] = useState<number | null>(null);
  const [chatResizeStart, setChatResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [streamLayout, setStreamLayout] = useState<StreamLayout>('grid');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [streamConfigs, setStreamConfigs] = useState<StreamConfig[]>([
    { channel: "xqc", platform: 'twitch', size: 'medium', row: 'top', x: 0, y: 0, width: 600, height: 400 },
    { channel: "shroud", platform: 'twitch', size: 'medium', row: 'top', x: 620, y: 0, width: 600, height: 400 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [resizeCorner, setResizeCorner] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');
  const [showPaymentOptions, setShowPaymentOptions] = useState(true);
  const [freeTrialTimeLeft, setFreeTrialTimeLeft] = useState<number | null>(null);
  const [showTrialEndedDialog, setShowTrialEndedDialog] = useState(false);

  // Timer effect for free premium
  useEffect(() => {
    if (freeTrialTimeLeft !== null && freeTrialTimeLeft > 0) {
      const timer = setInterval(() => {
        setFreeTrialTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            setIsPremium(false);
            setShowPaymentOptions(true);
            setShowTrialEndedDialog(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [freeTrialTimeLeft]);

  // Format time left as MM:SS
  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDownDrag = (e: React.MouseEvent, index: number) => {
    if (!isPremium) return;
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;
    
    const config = streamConfigs[index];
    const containerRect = container.getBoundingClientRect();
    
    setDraggingIndex(index);
    setDragOffset({
      x: e.clientX - containerRect.left - (config.x || 0),
      y: e.clientY - containerRect.top - (config.y || 0)
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent, index: number, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!isPremium) return;
    e.preventDefault();
    e.stopPropagation();
    const config = streamConfigs[index];
    setResizingIndex(index);
    setResizeCorner(corner);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: config.width || 600,
      height: config.height || 400
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex !== null && streamLayout === 'freeform') {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      
      setStreamConfigs(prev => prev.map((config, i) => 
        i === draggingIndex 
          ? { ...config, x: Math.max(0, newX), y: Math.max(0, newY) }
          : config
      ));
    } else if (resizingIndex !== null && resizeCorner) {
      const config = streamConfigs[resizingIndex];
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = config.x || 0;
      let newY = config.y || 0;
      
      switch (resizeCorner) {
        case 'se':
          newWidth = Math.max(300, resizeStart.width + deltaX);
          newHeight = Math.max(200, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newHeight = Math.max(200, resizeStart.height + deltaY);
          newX = config.x! + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(300, resizeStart.width + deltaX);
          newHeight = Math.max(200, resizeStart.height - deltaY);
          newY = config.y! + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newHeight = Math.max(200, resizeStart.height - deltaY);
          newX = config.x! + deltaX;
          newY = config.y! + deltaY;
          break;
      }
      
      setStreamConfigs(prev => prev.map((c, i) => 
        i === resizingIndex 
          ? { ...c, width: newWidth, height: newHeight, x: newX, y: newY }
          : c
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setResizingIndex(null);
    setResizeCorner(null);
  };

  const openChatWindow = (channel: string, platform: Platform) => {
    // Check if chat already exists
    const existingChat = openChats.find(chat => chat.channel === channel && chat.platform === platform);
    if (existingChat) return;

    // Create new chat window with offset position
    const newChat: ChatWindow = {
      channel,
      platform,
      position: { x: 100 + (openChats.length * 30), y: 100 + (openChats.length * 30) },
      size: { width: 400, height: 500 }
    };

    setOpenChats(prev => [...prev, newChat]);
  };

  const closeChatWindow = (index: number) => {
    setOpenChats(prev => prev.filter((_, i) => i !== index));
  };

  const handleChatMouseDown = (e: React.MouseEvent, index: number) => {
    if ((e.target as HTMLElement).closest('.chat-header')) {
      e.preventDefault();
      setDraggingChatIndex(index);
      setChatDragOffset({
        x: e.clientX - openChats[index].position.x,
        y: e.clientY - openChats[index].position.y
      });
    }
  };

  const handleChatResizeMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingChatIndex(index);
    setChatResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: openChats[index].size.width,
      height: openChats[index].size.height
    });
  };

  const handleChatMouseMove = (e: React.MouseEvent) => {
    if (draggingChatIndex !== null) {
      const newX = e.clientX - chatDragOffset.x;
      const newY = e.clientY - chatDragOffset.y;
      
      setOpenChats(prev => prev.map((chat, i) => 
        i === draggingChatIndex 
          ? { ...chat, position: { x: newX, y: newY } }
          : chat
      ));
    } else if (resizingChatIndex !== null) {
      const deltaX = e.clientX - chatResizeStart.x;
      const deltaY = e.clientY - chatResizeStart.y;
      const newWidth = Math.max(300, chatResizeStart.width + deltaX);
      const newHeight = Math.max(300, chatResizeStart.height + deltaY);
      
      setOpenChats(prev => prev.map((chat, i) => 
        i === resizingChatIndex 
          ? { ...chat, size: { width: newWidth, height: newHeight } }
          : chat
      ));
    }
  };

  const handleChatMouseUp = () => {
    setDraggingChatIndex(null);
    setResizingChatIndex(null);
  };

  const getChatEmbed = (channel: string, platform: Platform) => {
    switch (platform) {
      case 'twitch':
        return `https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.hostname}${isDarkMode ? '&darkpopout' : ''}`;
      case 'kick':
        return `https://kick.com/${channel}/chatroom`;
      case 'youtube':
        return `https://www.youtube.com/live_chat?v=${channel}&embed_domain=${window.location.hostname}`;
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitch':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
        );
      case 'kick':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.47l7 3.5v7.06l-7-3.5V9.47zm9 10.56v-7.06l7-3.5v7.06l-7 3.5z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'twitch': return 'text-purple-600';
      case 'kick': return 'text-green-600';
      case 'youtube': return 'text-red-600';
    }
  };

  const cycleLayout = () => {
    const layouts: StreamLayout[] = ['grid', 'freeform'];
    const currentIndex = layouts.indexOf(streamLayout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    setStreamLayout(nextLayout);
  };

  const getLayoutButtonText = () => {
    switch (streamLayout) {
      case 'grid': return 'Top/Bottom Layout';
      case 'top-bottom': return 'Freeform Layout';
      case 'freeform': return 'Grid Layout';
    }
  };

  const toggleStreamSize = (channel: string) => {
    if (!isPremium) return;
    setStreamConfigs(prev => prev.map(config => {
      if (config.channel === channel) {
        const sizes: StreamSize[] = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(config.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...config, size: nextSize };
      }
      return config;
    }));
  };

  const toggleStreamRow = (channel: string) => {
    if (!isPremium || streamLayout !== 'top-bottom') return;
    setStreamConfigs(prev => prev.map(config => {
      if (config.channel === channel) {
        return { ...config, row: config.row === 'top' ? 'bottom' : 'top' };
      }
      return config;
    }));
  };

  const getSizeClasses = (size: StreamSize) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
    }
  };

  const handleDragStart = (streamName: string) => {
    if (!isPremium) return; // Only allow drag if premium
    setDraggedStream(streamName);
  };

  const handleDragEnd = () => {
    setDraggedStream(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isPremium) return; // Only allow drop if premium
    e.preventDefault();
  };

  const handleDrop = (index: number, isPremiumSlot: boolean) => {
    if (!isPremium || !draggedStream) return;

    const allStreams = [...activeStreams, ...premiumStreams];
    const newConfigs = [...streamConfigs];
    
    if (index < newConfigs.length) {
      newConfigs[index] = { ...newConfigs[index], channel: draggedStream };
      setStreamConfigs(newConfigs);
    }

    setDraggedStream(null);
  };

  const handleUpgrade = async () => {
    console.log(`Redirecting to Stripe Checkout for ${selectedPlan} plan...`);
    
    setTimeout(() => {
      setIsPremium(true);
      // Automatically populate all 6 streams when user subscribes
      const defaultStreams: StreamConfig[] = [
        { channel: "xqc", platform: 'twitch', size: 'medium', row: 'top', x: 0, y: 0, width: 600, height: 400 },
        { channel: "shroud", platform: 'twitch', size: 'medium', row: 'top', x: 620, y: 0, width: 600, height: 400 },
        { channel: "pokimane", platform: 'twitch', size: 'medium', row: 'bottom', x: 0, y: 420, width: 600, height: 400 },
        { channel: "summit1g", platform: 'twitch', size: 'medium', row: 'bottom', x: 620, y: 420, width: 600, height: 400 },
        { channel: "lirik", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 420, width: 600, height: 400 },
        { channel: "timthetatman", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 0, width: 600, height: 400 },
      ];
      setStreamConfigs(defaultStreams);
      alert(`Premium ${selectedPlan} upgrade successful! You now have access to all streams.`);
    }, 1000);
  };

  const handleFreePremium = () => {
    setIsPremium(true);
    setShowPaymentOptions(false);
    setFreeTrialTimeLeft(15 * 60); // 15 minutes in seconds
    const defaultStreams: StreamConfig[] = [
      { channel: "xqc", platform: 'twitch', size: 'medium', row: 'top', x: 0, y: 0, width: 600, height: 400 },
      { channel: "shroud", platform: 'twitch', size: 'medium', row: 'top', x: 620, y: 0, width: 600, height: 400 },
      { channel: "pokimane", platform: 'twitch', size: 'medium', row: 'bottom', x: 0, y: 420, width: 600, height: 400 },
      { channel: "summit1g", platform: 'twitch', size: 'medium', row: 'bottom', x: 620, y: 420, width: 600, height: 400 },
      { channel: "lirik", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 420, width: 600, height: 400 },
      { channel: "timthetatman", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 0, width: 600, height: 400 },
    ];
    setStreamConfigs(defaultStreams);
  };

  const removeStream = (index: number) => {
    if (!isPremium) return;
    setStreamConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const restoreAllStreams = () => {
    if (!isPremium) return;
    const defaultStreams: StreamConfig[] = [
      { channel: "xqc", platform: 'twitch', size: 'medium', row: 'top', x: 0, y: 0, width: 600, height: 400 },
      { channel: "shroud", platform: 'twitch', size: 'medium', row: 'top', x: 620, y: 0, width: 600, height: 400 },
      { channel: "pokimane", platform: 'twitch', size: 'medium', row: 'bottom', x: 0, y: 420, width: 600, height: 400 },
      { channel: "summit1g", platform: 'twitch', size: 'medium', row: 'bottom', x: 620, y: 420, width: 600, height: 400 },
      { channel: "lirik", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 420, width: 600, height: 400 },
      { channel: "timthetatman", platform: 'twitch', size: 'medium', row: 'bottom', x: 1240, y: 0, width: 600, height: 400 },
    ];
    setStreamConfigs(defaultStreams);
  };

  const addStream = (channel: string) => {
    if (!isPremium || streamConfigs.length >= 6) return;
    
    const newConfig: StreamConfig = {
      channel,
      platform: 'twitch',
      size: 'medium',
      row: 'bottom',
      x: streamConfigs.length * 620,
      y: 0,
      width: 600,
      height: 400
    };
    
    setStreamConfigs(prev => [...prev, newConfig]);
  };

  const availableStreams = liveStreamOptions.filter(
    stream => !streamConfigs.some(config => config.channel === stream.name)
  );

  const handleChannelChange = (oldChannel: string, newChannel: string) => {
    setStreamConfigs(prev => prev.map(config => 
      config.channel === oldChannel 
        ? { ...config, channel: newChannel }
        : config
    ));
  };

  const handlePlatformChange = (channel: string, newPlatform: Platform) => {
    if (!isPremium) return;
    setStreamConfigs(prev => prev.map(config => 
      config.channel === channel 
        ? { ...config, platform: newPlatform }
        : config
    ));
  };

  const handleSlotSelection = (slotIndex: number) => {
    setSelectedSlot(selectedSlot === slotIndex ? null : slotIndex);
  };

  const assignStreamToSlot = (streamName: string, platform: Platform) => {
    if (selectedSlot === null) return;
    
    setStreamConfigs(prev => prev.map((config, index) => 
      index === selectedSlot 
        ? { ...config, channel: streamName, platform }
        : config
    ));
    
    setSelectedSlot(null);
  };

  // Helper function to get slot number for a stream
  const getSlotNumber = (streamName: string, platform: Platform): number | null => {
    const index = streamConfigs.findIndex(
      config => config.channel === streamName && config.platform === platform
    );
    return index !== -1 ? index + 1 : null;
  };

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-b from-red-50 via-red-100 to-red-800'} relative overflow-hidden`}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleChatMouseMove(e);
      }}
      onMouseUp={() => {
        handleMouseUp();
        handleChatMouseUp();
      }}
    >
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b sticky top-0 z-50`}>
        <div className="max-w-[95vw] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-full w-9 h-9 flex items-center justify-center">
              <span className="text-white text-xs font-bold">MSW</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                MultiStreamWatch
              </h1>
              {freeTrialTimeLeft !== null && freeTrialTimeLeft > 0 && (
                <p className="text-xs text-red-600 font-semibold">
                  Free Trial: {formatTimeLeft(freeTrialTimeLeft)} remaining
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle - Visible but locked for non-premium */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isPremium) {
                    setIsDarkMode(!isDarkMode);
                  } else {
                    alert('Dark mode is a premium feature! Subscribe to unlock.');
                  }
                }}
                className={`${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'} ${!isPremium ? 'opacity-60' : ''}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {!isPremium && (
                <Lock className="h-3 w-3 text-red-600 absolute -top-1 -right-1" />
              )}
            </div>
            
            <TwitchAuth onAuthChange={setIsAuthenticated} />
            <KickAuth onAuthChange={setIsKickAuthenticated} />
            <YouTubeAuth onAuthChange={setIsYouTubeAuthenticated} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[95vw] mx-auto px-6 py-8 space-y-6 relative z-10">
        {/* Live Stream Options */}
        {isAuthenticated && (
          <div className="space-y-3">
            {/* Stream Slot Selector */}
            <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Select Stream Slot
                  </h3>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    • 1. Select a number • 2. Click a streamer • 3. Your favorite streamer auto populates in the Stream number below!
                  </span>
                </div>
                {selectedSlot !== null && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click a streamer below to populate slot {selectedSlot + 1}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Button
                    key={index}
                    onClick={() => handleSlotSelection(index)}
                    variant={selectedSlot === index ? "default" : "outline"}
                    disabled={!isPremium && index >= 2}
                    className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 relative ${
                      selectedSlot === index 
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                        : isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-800 text-white' 
                          : 'border-gray-300 hover:bg-gray-50'
                    } ${!isPremium && index >= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`text-2xl font-bold ${!isPremium && index >= 2 ? 'blur-sm' : ''}`}>
                      {index + 1}
                    </span>
                    {!isPremium && index >= 2 && (
                      <Lock className="h-4 w-4 absolute" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Streams</h2>
                  <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>/</span>
                  <span className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isPremium ? `${streamConfigs.length}/6 streams active` : 'Never have to choose again!'}
                  </span>
                </div>
                {!isPremium && (
                  <Button
                    onClick={handleUpgrade}
                    variant="outline"
                    size="sm"
                    className="border-red-300 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 font-semibold"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Unlock Layout Controls
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isPremium && streamConfigs.length < 6 && (
                  <Button
                    onClick={restoreAllStreams}
                    variant="outline"
                    size="sm"
                    className="border-green-300 bg-green-50 hover:bg-green-100 text-green-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore All 6 Streams
                  </Button>
                )}
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="outline"
                  size="sm"
                  className="border-red-300 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isMuted ? (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Unmute All
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Mute All
                    </>
                  )}
                </Button>
                {!isPremium && (
                  <Button
                    onClick={() => setShowChats(!showChats)}
                    variant="outline"
                    size="sm"
                    className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
                  >
                    {showChats ? (
                      <>
                        <MessageSquareOff className="h-4 w-4 mr-2" />
                        Hide Chats
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Show Chats
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Twitch Live Streams */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Twitch</h3>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {liveStreamOptions.map((stream, streamIndex) => {
                    const isActive = streamConfigs.some(config => config.channel === stream.name && config.platform === 'twitch');
                    const slotNumber = getSlotNumber(stream.name, 'twitch');
                    const canAdd = isPremium && !isActive && streamConfigs.length < 6;
                    const shouldBlur = !isPremium && streamIndex >= 2;
                    const canAssign = selectedSlot !== null;
                    
                    return (
                      <div
                        key={stream.name}
                        draggable={isPremium && isActive}
                        onDragStart={() => handleDragStart(stream.name)}
                        onDragEnd={handleDragEnd}
                        className={isPremium && isActive ? "cursor-grab active:cursor-grabbing" : ""}
                      >
                        <Button
                          onClick={() => {
                            if (canAssign) {
                              assignStreamToSlot(stream.name, 'twitch');
                            } else if (canAdd) {
                              addStream(stream.name);
                            }
                          }}
                          variant="outline"
                          disabled={!canAdd && !isActive && !canAssign}
                          className={`flex-shrink-0 flex items-center gap-2 h-auto px-4 py-2 border-gray-300 rounded-lg transition-all ${
                            isActive ? 'border-green-500 bg-green-50' : 
                            canAssign ? 'hover:border-red-500 hover:bg-red-50 cursor-pointer border-red-300' :
                            canAdd ? 'hover:border-purple-500 hover:bg-purple-50 cursor-pointer' : 
                            'opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            </div>
                            <span className={`text-sm font-medium text-gray-900 ${shouldBlur ? 'blur-sm' : ''}`}>
                              {slotNumber && <span className="font-bold text-red-600 mr-1">{slotNumber}</span>}
                              {stream.displayName}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {stream.viewers}
                            </Badge>
                            {canAdd && !canAssign && <Plus className="h-3 w-3 text-purple-600" />}
                          </div>
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Kick Live Streams */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.47l7 3.5v7.06l-7-3.5V9.47zm9 10.56v-7.06l7-3.5v7.06l-7 3.5z"/>
                </svg>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Kick</h3>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {kickStreamOptions.map((stream, streamIndex) => {
                    const isActive = streamConfigs.some(config => config.channel === stream.name && config.platform === 'kick');
                    const slotNumber = getSlotNumber(stream.name, 'kick');
                    const canAdd = isPremium && !isActive && streamConfigs.length < 6;
                    const shouldBlur = !isPremium && streamIndex >= 2;
                    const canAssign = selectedSlot !== null;
                    
                    return (
                      <div
                        key={stream.name}
                        draggable={isPremium && isActive}
                        onDragStart={() => handleDragStart(stream.name)}
                        onDragEnd={handleDragEnd}
                        className={isPremium && isActive ? "cursor-grab active:cursor-grabbing" : ""}
                      >
                        <Button
                          onClick={() => {
                            if (canAssign) {
                              assignStreamToSlot(stream.name, 'kick');
                            } else if (canAdd) {
                              const newConfig: StreamConfig = {
                                channel: stream.name,
                                platform: 'kick',
                                size: 'medium',
                                row: 'bottom',
                                x: streamConfigs.length * 620,
                                y: 0,
                                width: 600,
                                height: 400
                              };
                              setStreamConfigs(prev => [...prev, newConfig]);
                            }
                          }}
                          variant="outline"
                          disabled={!canAdd && !isActive && !canAssign}
                          className={`flex-shrink-0 flex items-center gap-2 h-auto px-4 py-2 border-gray-300 rounded-lg transition-all ${
                            isActive ? 'border-green-500 bg-green-50' : 
                            canAssign ? 'hover:border-red-500 hover:bg-red-50 cursor-pointer border-red-300' :
                            canAdd ? 'hover:border-green-500 hover:bg-green-50 cursor-pointer' : 
                            'opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <span className={`text-sm font-medium text-gray-900 ${shouldBlur ? 'blur-sm' : ''}`}>
                              {slotNumber && <span className="font-bold text-red-600 mr-1">{slotNumber}</span>}
                              {stream.displayName}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {stream.viewers}
                            </Badge>
                            {canAdd && !canAssign && <Plus className="h-3 w-3 text-green-600" />}
                          </div>
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* YouTube Live Streams */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>YouTube</h3>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {youtubeStreamOptions.map((stream, streamIndex) => {
                    const isActive = streamConfigs.some(config => config.channel === stream.name && config.platform === 'youtube');
                    const slotNumber = getSlotNumber(stream.name, 'youtube');
                    const canAdd = isPremium && !isActive && streamConfigs.length < 6;
                    const shouldBlur = !isPremium && streamIndex >= 2;
                    const canAssign = selectedSlot !== null;
                    
                    return (
                      <div
                        key={stream.name}
                        draggable={isPremium && isActive}
                        onDragStart={() => handleDragStart(stream.name)}
                        onDragEnd={handleDragEnd}
                        className={isPremium && isActive ? "cursor-grab active:cursor-grabbing" : ""}
                      >
                        <Button
                          onClick={() => {
                            if (canAssign) {
                              assignStreamToSlot(stream.name, 'youtube');
                            } else if (canAdd) {
                              const newConfig: StreamConfig = {
                                channel: stream.name,
                                platform: 'youtube',
                                size: 'medium',
                                row: 'bottom',
                                x: streamConfigs.length * 620,
                                y: 0,
                                width: 600,
                                height: 400
                              };
                              setStreamConfigs(prev => [...prev, newConfig]);
                            }
                          }}
                          variant="outline"
                          disabled={!canAdd && !isActive && !canAssign}
                          className={`flex-shrink-0 flex items-center gap-2 h-auto px-4 py-2 border-gray-300 rounded-lg transition-all ${
                            isActive ? 'border-green-500 bg-green-50' : 
                            canAssign ? 'hover:border-red-500 hover:bg-red-50 cursor-pointer border-red-300' :
                            canAdd ? 'hover:border-red-500 hover:bg-red-50 cursor-pointer' : 
                            'opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            </div>
                            <span className={`text-sm font-medium text-gray-900 ${shouldBlur ? 'blur-sm' : ''}`}>
                              {slotNumber && <span className="font-bold text-red-600 mr-1">{slotNumber}</span>}
                              {stream.displayName}
                            </span>
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {stream.viewers}
                            </Badge>
                            {canAdd && !canAssign && <Plus className="h-3 w-3 text-red-600" />}
                          </div>
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Premium Layout Preview for Free Users */}
        {!isPremium && (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} border-2 rounded-2xl p-6 shadow-xl`}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center justify-center gap-3 mb-2`}>
                  <Sparkles className="h-7 w-7 text-red-600" />
                  Unlock Premium Features
                </h3>
                <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose the perfect plan for your streaming needs
                </p>
              </div>

              {showPaymentOptions && (
                <>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {/* Monthly Plan */}
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedPlan === 'monthly'
                          ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'monthly' && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          SELECTED
                        </div>
                      )}
                      <div className="absolute -top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        MOST POPULAR CHOICE!
                      </div>
                      <div className="text-center">
                        <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Monthly
                        </h4>
                        <div className="mb-2">
                          <span className={`text-3xl font-bold ${selectedPlan === 'monthly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            $6.00
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Perfect for trying out premium features
                        </p>
                      </div>
                    </button>

                    {/* Quarterly Plan */}
                    <button
                      onClick={() => setSelectedPlan('quarterly')}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedPlan === 'quarterly'
                          ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'quarterly' && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          SELECTED
                        </div>
                      )}
                      <div className="absolute -top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        BEST SAVINGS
                      </div>
                      <div className="text-center">
                        <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Quarterly
                        </h4>
                        <div className="mb-2">
                          <span className={`text-3xl font-bold ${selectedPlan === 'quarterly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            $12.00
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/3 months</span>
                        </div>
                      </div>
                    </button>

                    {/* Yearly Plan */}
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedPlan === 'yearly'
                          ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'yearly' && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          SELECTED
                        </div>
                      )}
                      <div className="text-center">
                        <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Yearly
                        </h4>
                        <div className="mb-2">
                          <span className={`text-3xl font-bold ${selectedPlan === 'yearly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            $30.00
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/year</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
                <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Premium Features Include:
                </h4>
                <ul className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1.5`}>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Watch Streams From Any Service - YouTube, KICK, Twitch!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Unlock up to 6 simultaneous streams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Dark mode theme for comfortable viewing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Auto-populate followed streamers when logged in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Skip ads seamlessly - switch between streams during ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Pop-out chat feature with resizable windows</span>
                  </li>
                </ul>
              </div>

              <div className="text-center space-y-2">
                {showPaymentOptions && (
                  <Button
                    onClick={handleUpgrade}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Subscribe Now - {selectedPlan === 'monthly' ? '$6.00/mo' : selectedPlan === 'quarterly' ? '$12.00/3mo' : '$30.00/yr'}
                  </Button>
                )}
                
                <Button
                  onClick={handleFreePremium}
                  size="lg"
                  variant="outline"
                  className={`${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-900 hover:bg-gray-100'} font-bold text-base px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all`}
                >
                  Try Free Premium
                </Button>
                
                {showPaymentOptions && (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                    Cancel anytime • Secure payment • Instant access
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Trial Ended Dialog */}
      <Dialog open={showTrialEndedDialog} onOpenChange={setShowTrialEndedDialog}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'} max-w-4xl`}>
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Sparkles className="h-6 w-6 text-red-600" />
              Your Free Trial Has Ended
            </DialogTitle>
            <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Continue enjoying premium features by choosing a plan below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Monthly Plan */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {selectedPlan === 'monthly' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                <div className="absolute -top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  MOST POPULAR CHOICE!
                </div>
                <div className="text-center">
                  <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Monthly
                  </h4>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${selectedPlan === 'monthly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      $6.00
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Perfect for trying out premium features
                  </p>
                </div>
              </button>

              {/* Quarterly Plan */}
              <button
                onClick={() => setSelectedPlan('quarterly')}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === 'quarterly'
                    ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {selectedPlan === 'quarterly' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                <div className="absolute -top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  BEST SAVINGS
                </div>
                <div className="text-center">
                  <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Quarterly
                  </h4>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${selectedPlan === 'quarterly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      $12.00
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/3 months</span>
                  </div>
                </div>
              </button>

              {/* Yearly Plan */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === 'yearly'
                    ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {selectedPlan === 'yearly' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                <div className="absolute -top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  SAVE 58%
                </div>
                <div className="text-center">
                  <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Yearly
                  </h4>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${selectedPlan === 'yearly' ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      $30.00
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/year</span>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={() => {
                handleUpgrade();
                setShowTrialEndedDialog(false);
              }}
              size="lg"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Subscribe Now - {selectedPlan === 'monthly' ? '$6.00/mo' : selectedPlan === 'quarterly' ? '$12.00/3mo' : '$30.00/yr'}
            </Button>

            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-center`}>
              Cancel anytime • Secure payment • Instant access
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draggable Chat Popups for Premium Users */}
      {isPremium && openChats.map((chat, index) => (
        <div
          key={`chat-${chat.channel}-${chat.platform}-${index}`}
          className={`fixed ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-lg shadow-2xl z-50`}
          style={{
            left: chat.position.x,
            top: chat.position.y,
            width: chat.size.width,
            height: chat.size.height,
            cursor: draggingChatIndex === index ? 'grabbing' : 'default'
          }}
          onMouseDown={(e) => handleChatMouseDown(e, index)}
        >
          <div className="h-full flex flex-col relative">
            <div 
              className={`chat-header flex items-center justify-between px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b cursor-grab active:cursor-grabbing rounded-t-lg`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className={getPlatformColor(chat.platform)}>
                  {getPlatformIcon(chat.platform)}
                </div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {chat.channel} Chat
                </h3>
              </div>
              <Button
                onClick={() => closeChatWindow(index)}
                variant="ghost"
                size="sm"
                className="hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={getChatEmbed(chat.channel, chat.platform)}
                className="w-full h-full"
                title={`${chat.channel} chat`}
              />
            </div>
            {/* Resize handle */}
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} cursor-nwse-resize rounded-bl-lg flex items-center justify-center group`}
              onMouseDown={(e) => handleChatResizeMouseDown(e, index)}
            >
              <div className="w-3 h-3 border-r-2 border-b-2 border-white" />
            </div>
          </div>
        </div>
      ))}

      {/* Main Stream Layout */}
      {streamLayout === 'freeform' ? (
        <div 
          ref={containerRef}
          className="relative min-h-[1200px] border-2 border-dashed border-gray-300 rounded-lg max-w-[90vw] mx-auto px-6"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {streamConfigs.map((config, index) => (
            <div
              key={`${config.channel}-${index}`}
              className="absolute"
              style={{
                left: config.x,
                top: config.y,
                width: config.width,
                height: config.height,
                cursor: draggingIndex === index ? 'grabbing' : 'default'
              }}
            >
              <div className="relative h-full">
                {/* Stream Number Badge */}
                <div className="absolute top-2 left-2 z-20 bg-gray-900/90 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {index + 1}
                </div>

                {/* Drag handle */}
                <div
                  className="absolute top-2 left-14 z-20 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleMouseDownDrag(e, index)}
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Pop Out Chat button */}
                <Button
                  onClick={() => openChatWindow(config.channel, config.platform)}
                  size="sm"
                  className="absolute top-2 left-28 z-20 h-8 px-3 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Pop Out
                </Button>

                {/* Delete button - top right only */}
                <Button
                  onClick={() => removeStream(index)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 z-20 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Resize handles */}
                <div
                  className="absolute top-0 left-0 w-3 h-3 bg-blue-500 cursor-nw-resize z-20"
                  onMouseDown={(e) => handleMouseDownResize(e, index, 'nw')}
                />
                <div
                  className="absolute top-0 right-0 w-3 h-3 bg-blue-500 cursor-ne-resize z-20"
                  onMouseDown={(e) => handleMouseDownResize(e, index, 'ne')}
                />
                <div
                  className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-sw-resize z-20"
                  onMouseDown={(e) => handleMouseDownResize(e, index, 'sw')}
                />
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize z-20"
                  onMouseDown={(e) => handleMouseDownResize(e, index, 'se')}
                />

                <StreamCard
                  channelName={config.channel}
                  platform={config.platform}
                  showChat={showChats}
                  muted={isMuted}
                  isDarkMode={isDarkMode}
                  isPremium={isPremium}
                  onChannelChange={(newChannel) => handleChannelChange(config.channel, newChannel)}
                  onPlatformChange={(newPlatform) => handlePlatformChange(config.channel, newPlatform)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-[90vw] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Streams - only first 2 */}
            {streamConfigs.slice(0, 2).map((config, index) => (
              <div key={`stream-${index}`} className="relative">
                {/* Stream Number Badge */}
                <div className="absolute top-2 left-2 z-20 bg-gray-900/90 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {index + 1}
                </div>

                {isPremium && (
                  <>
                    <Button
                      onClick={() => openChatWindow(config.channel, config.platform)}
                      size="sm"
                      className="absolute top-2 left-14 z-20 h-8 px-3 bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Pop Out
                    </Button>
                    
                    {/* Delete button */}
                    <Button
                      onClick={() => removeStream(index)}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 z-20 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <StreamCard
                  channelName={config.channel}
                  platform={config.platform}
                  showChat={showChats}
                  muted={isMuted}
                  isDarkMode={isDarkMode}
                  isPremium={isPremium}
                  onChannelChange={(newChannel) => handleChannelChange(config.channel, newChannel)}
                  onPlatformChange={(newPlatform) => handlePlatformChange(config.channel, newPlatform)}
                />
              </div>
            ))}
            
            {/* Premium Locked Slots - streams 3-6 always locked for non-premium */}
            {!isPremium && [3, 4, 5, 6].map((position) => (
              <PremiumStreamCard
                key={`premium-locked-${position}`}
                position={position}
                onUpgrade={handleUpgrade}
              />
            ))}

            {/* If premium, show remaining streams */}
            {isPremium && streamConfigs.slice(2).map((config, index) => (
              <div key={`stream-${index + 2}`} className="relative">
                {/* Stream Number Badge */}
                <div className="absolute top-2 left-2 z-20 bg-gray-900/90 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {index + 3}
                </div>

                <Button
                  onClick={() => openChatWindow(config.channel, config.platform)}
                  size="sm"
                  className="absolute top-2 left-14 z-20 h-8 px-3 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Pop Out
                </Button>
                
                {/* Delete button */}
                <Button
                  onClick={() => removeStream(index + 2)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 z-20 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <StreamCard
                  channelName={config.channel}
                  platform={config.platform}
                  showChat={showChats}
                  muted={isMuted}
                  isDarkMode={isDarkMode}
                  isPremium={isPremium}
                  onChannelChange={(newChannel) => handleChannelChange(config.channel, newChannel)}
                  onPlatformChange={(newPlatform) => handlePlatformChange(config.channel, newPlatform)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}