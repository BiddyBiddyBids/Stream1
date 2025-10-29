import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = 'twitch' | 'kick' | 'youtube';

interface StreamCardProps {
  channelName?: string;
  platform?: Platform;
  showChat?: boolean;
  muted?: boolean;
  isDarkMode?: boolean;
  isPremium?: boolean;
  onChannelChange?: (newChannel: string) => void;
  onPlatformChange?: (newPlatform: Platform) => void;
  onRemove?: () => void;
}

export default function StreamCard({ 
  channelName = "xqc", 
  platform = "twitch",
  showChat = true,
  muted = false,
  isDarkMode = false,
  isPremium = false,
  onChannelChange,
  onPlatformChange,
  onRemove
}: StreamCardProps) {
  const [inputValue, setInputValue] = useState(channelName);
  const [currentChannel, setCurrentChannel] = useState(channelName);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>(platform);
  const [isLive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCurrentChannel(inputValue.trim());
      if (onChannelChange) {
        onChannelChange(inputValue.trim());
      }
    }
  };

  const handlePlatformChange = (newPlatform: Platform) => {
    setCurrentPlatform(newPlatform);
    if (onPlatformChange) {
      onPlatformChange(newPlatform);
    }
  };

  useEffect(() => {
    setInputValue(channelName);
    setCurrentChannel(channelName);
  }, [channelName]);

  useEffect(() => {
    setCurrentPlatform(platform);
  }, [platform]);

  // Automatically hide chat when premium
  const shouldShowChat = showChat && !isPremium;

  const getStreamEmbed = () => {
    const hostname = window.location.hostname;
    // Use the full hostname for Twitch parent parameter
    const parentDomain = hostname || 'localhost';
    
    switch (currentPlatform) {
      case 'twitch':
        return `https://player.twitch.tv/?channel=${currentChannel}&parent=${parentDomain}&muted=${muted}`;
      case 'kick':
        return `https://player.kick.com/${currentChannel}`;
      case 'youtube':
        return `https://www.youtube.com/embed/live_stream?channel=${currentChannel}&autoplay=1&mute=${muted ? 1 : 0}`;
    }
  };

  const getChatEmbed = () => {
    const hostname = window.location.hostname;
    const parentDomain = hostname || 'localhost';
    
    switch (currentPlatform) {
      case 'twitch':
        return `https://www.twitch.tv/embed/${currentChannel}/chat?parent=${parentDomain}${isDarkMode ? '&darkpopout' : ''}`;
      case 'kick':
        return `https://kick.com/${currentChannel}/chatroom`;
      case 'youtube':
        return `https://www.youtube.com/live_chat?v=${currentChannel}&embed_domain=${parentDomain}`;
    }
  };

  const getPlatformColor = () => {
    switch (currentPlatform) {
      case 'twitch': return 'bg-purple-600 hover:bg-purple-700';
      case 'kick': return 'bg-green-600 hover:bg-green-700';
      case 'youtube': return 'bg-red-600 hover:bg-red-700';
    }
  };

  const getPlaceholder = () => {
    switch (currentPlatform) {
      case 'twitch': return 'Enter Twitch username...';
      case 'kick': return 'Enter Kick username...';
      case 'youtube': return 'Enter YouTube channel/video ID...';
    }
  };

  return (
    <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="space-y-2">
        {/* Channel Input with Platform Selector */}
        <div className={`p-3 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          {isPremium && (
            <div className="flex gap-2 mb-2">
              <Button
                onClick={() => handlePlatformChange('twitch')}
                size="sm"
                variant={currentPlatform === 'twitch' ? 'default' : 'outline'}
                className={`p-2 ${currentPlatform === 'twitch' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                title="Twitch"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
              </Button>
              <Button
                onClick={() => handlePlatformChange('kick')}
                size="sm"
                variant={currentPlatform === 'kick' ? 'default' : 'outline'}
                className={`p-2 ${currentPlatform === 'kick' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                title="Kick"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.47l7 3.5v7.06l-7-3.5V9.47zm9 10.56v-7.06l7-3.5v7.06l-7 3.5z"/>
                </svg>
              </Button>
              <Button
                onClick={() => handlePlatformChange('youtube')}
                size="sm"
                variant={currentPlatform === 'youtube' ? 'default' : 'outline'}
                className={`p-2 ${currentPlatform === 'youtube' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                title="YouTube"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              className={`pl-9 h-9 text-sm focus:border-purple-500 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'border-gray-300'}`}
            />
          </form>
        </div>

        {/* Stream and Chat Container */}
        <div className="flex gap-2">
          {/* Stream Embed */}
          <div className="relative flex-[3] bg-black" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={getStreamEmbed()}
              height="100%"
              width="100%"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            {isLive && (
              <Badge className={`absolute top-2 left-2 ${getPlatformColor()} border-0 shadow-lg z-10 text-xs`}>
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                LIVE
              </Badge>
            )}
            {/* Buttons on the right side */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* Pop-out button */}
              <Button
                onClick={() => window.open(getStreamEmbed(), '_blank', 'width=1280,height=720')}
                size="sm"
                variant="secondary"
                className="bg-black/70 hover:bg-black/90 text-white border-0 shadow-lg"
                title="Pop out stream"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {/* Remove button (red X) - only show if onRemove is provided */}
              {onRemove && isPremium && (
                <Button
                  onClick={onRemove}
                  size="sm"
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg"
                  title="Remove stream"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          </div>

          {/* Chat Embed - only show if not premium */}
          {shouldShowChat && (
            <div className={`w-[280px] flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ aspectRatio: '280/500' }}>
              <iframe
                src={getChatEmbed()}
                height="100%"
                width="100%"
                className="border-0 w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}