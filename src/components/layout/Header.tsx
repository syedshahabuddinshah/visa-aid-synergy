import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

const Header = ({ isAuthenticated, userEmail, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = () => {
    navigate("/login", { state: { mode: 'signin' } });
  };

  const handleSignUp = () => {
    navigate("/login", { state: { mode: 'signup' } });
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">Immigration Assistant</h1>
        <p className="text-lg text-gray-600">
          Find your perfect immigration path with our AI-powered recommendation system
        </p>
      </div>
      <div className="flex gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <Button onClick={onSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            <Button onClick={handleSignIn} variant="outline">
              Sign In
            </Button>
            <Button onClick={handleSignUp}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;