import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Channel {
  id: string;
  name: string;
  displayName: string;
  avatarUrl: string;
  isLive: boolean;
  viewerCount?: number;
}

interface FollowedChannelsProps {
  channels?: Channel[];
  onChannelSelect?: (channel: Channel) => void;
}

const defaultChannels: Channel[] = [
  {
    id: "1",
    name: "ninja",
    displayName: "Ninja",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ninja",
    isLive: true,
    viewerCount: 45000,
  },
  {
    id: "2",
    name: "shroud",
    displayName: "shroud",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=shroud",
    isLive: true,
    viewerCount: 32000,
  },
  {
    id: "3",
    name: "pokimane",
    displayName: "Pokimane",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pokimane",
    isLive: false,
  },
  {
    id: "4",
    name: "xqc",
    displayName: "xQc",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=xqc",
    isLive: true,
    viewerCount: 78000,
  },
  {
    id: "5",
    name: "summit1g",
    displayName: "summit1g",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=summit1g",
    isLive: true,
    viewerCount: 28000,
  },
  {
    id: "6",
    name: "tfue",
    displayName: "Tfue",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tfue",
    isLive: false,
  },
  {
    id: "7",
    name: "timthetatman",
    displayName: "TimTheTatman",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=timthetatman",
    isLive: true,
    viewerCount: 41000,
  },
  {
    id: "8",
    name: "lirik",
    displayName: "LIRIK",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lirik",
    isLive: false,
  },
];

export default function FollowedChannels({
  channels = defaultChannels,
  onChannelSelect = () => {},
}: FollowedChannelsProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-2">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className="flex-shrink-0 flex flex-col items-center gap-3 h-auto p-4 hover:bg-zinc-800/50 rounded-xl transition-all group"
              onClick={() => onChannelSelect(channel)}
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-zinc-700 group-hover:border-purple-500 transition-colors ring-2 ring-transparent group-hover:ring-purple-500/20">
                  <AvatarImage src={channel.avatarUrl} alt={channel.displayName} />
                  <AvatarFallback className="bg-zinc-800 text-white">{channel.displayName[0]}</AvatarFallback>
                </Avatar>
                {channel.isLive && (
                  <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full px-2 py-0.5 border-2 border-zinc-900">
                    <span className="text-[10px] font-bold text-white">LIVE</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {channel.displayName}
                </p>
                {channel.isLive && channel.viewerCount && (
                  <p className="text-xs text-zinc-400">
                    {(channel.viewerCount / 1000).toFixed(1)}K
                  </p>
                )}
              </div>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-zinc-800" />
      </ScrollArea>
    </div>
  );
}