import { User } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  const handleLogout = () => {
    localStorage.removeItem('phrase-canvas-user');
    onLogout();
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Title and hamburger menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                Home
              </DropdownMenuItem>
              <DropdownMenuItem>
                Gallery
              </DropdownMenuItem>
              <DropdownMenuItem>
                Templates
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Help & Instructions
              </DropdownMenuItem>
              <DropdownMenuItem>
                About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>
            <h1 className="text-xl font-bold text-foreground">Phrase Canvas</h1>
            <p className="text-xs text-muted-foreground">Create beautiful phrase arrangements</p>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <UserIcon size={16} />
                <span className="hidden sm:inline">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <UserIcon size={16} />
                <div className="flex flex-col">
                  <span className="text-sm">{user.email}</span>
                  <span className="text-xs text-muted-foreground">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                <LogOut size={16} />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};