import { Bell, User, Upload, Menu, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth-new";

interface HeaderProps {
  onMenuToggle: () => void;
  userPlan?: "basic" | "premium";
}

const Header = ({ onMenuToggle, userPlan = "basic" }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const profileRole = user?.role as "basic" | "premium" | null;

  const effectivePlan: "basic" | "premium" = profileRole ?? userPlan;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center px-4 md:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 mr-6 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">EduShare</h1>
        </Link>

        {/* Actions */}
        <div className="ml-auto flex items-center space-x-2 justify-end">
          {user ? (
            <>
              {/* Upload button - only show for authenticated users */}
              <Button asChild className="hidden sm:flex bg-gradient-to-r from-primary to-purple-600">
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 hover:shadow-sm text-foreground hover:!text-foreground"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {getUserInitials(user.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user.full_name || user.email?.split("@")[0]}
                      </span>
                      <Badge
                        variant={effectivePlan === "premium" ? "default" : "secondary"}
                        className={
                          effectivePlan === "premium"
                            ? "bg-premium text-premium-foreground text-xs hover:bg-premium group-hover:text-premium-foreground hover:!text-premium-foreground !text-premium-foreground"
                            : "text-xs bg-muted text-foreground hover:bg-muted group-hover:text-foreground hover:!text-foreground !text-foreground"
                        }
                      >
                        {effectivePlan === "premium" ? "PREMIUM" : "BASIC"}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link to="/auth?tab=signup">Đăng ký</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Đăng nhập</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;