import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";

interface YouTubeAuthProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export default function YouTubeAuth({ onAuthChange = () => {} }: YouTubeAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    displayName: "YouTubeUser",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=youtubeuser",
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
            <Avatar className="h-8 w-8 border-2 border-red-500">
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
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Sign in with YouTube
        </Button>
      )}
    </div>
  );
}
