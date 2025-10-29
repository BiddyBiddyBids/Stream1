import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";

interface TwitchAuthProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export default function TwitchAuth({ onAuthChange = () => {} }: TwitchAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    displayName: "TwitchUser",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=twitchuser",
  });

  const handleAuth = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      onAuthChange(false);
    } else {
      setIsAuthenticated(true);
      onAuthChange(true);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <Avatar className="h-8 w-8 border-2 border-purple-500">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="bg-gray-200 text-gray-900">{user.displayName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-gray-900 hidden sm:inline">
              {user.displayName}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAuth}
            className="border-gray-300 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </>
      ) : (
        <Button
          onClick={handleAuth}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign in with Twitch
        </Button>
      )}
    </div>
  );
}