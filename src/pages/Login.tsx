import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthentication } from "@/hooks/useAuthentication";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { isLoading, isAuthenticated, handleSignIn, handleSignUp, handleSignOut } = useAuthentication();

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-background rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isAuthenticated ? 'Account' : mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>
        {isAuthenticated ? (
          <div className="space-y-4">
            <Button 
              onClick={handleSignOut}
              className="w-full"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>
        ) : mode === 'signin' ? (
          <SignInForm
            onSubmit={handleSignIn}
            isLoading={isLoading}
            onToggleMode={toggleMode}
          />
        ) : (
          <SignUpForm
            onSubmit={handleSignUp}
            isLoading={isLoading}
            onToggleMode={toggleMode}
          />
        )}
      </div>
    </div>
  );
};

export default Login;