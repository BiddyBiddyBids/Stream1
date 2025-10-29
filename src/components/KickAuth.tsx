import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";

interface KickAuthProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export default function KickAuth({ onAuthChange = () => {} }: KickAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    displayName: "KickUser",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=kickuser",
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
            <Avatar className="h-8 w-8 border-2 border-green-500">
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
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.47l7 3.5v7.06l-7-3.5V9.47zm9 10.56v-7.06l7-3.5v7.06l-7 3.5z"/>
          </svg>
          Sign in with Kick
        </Button>
      )}
    </div>
  );
}
