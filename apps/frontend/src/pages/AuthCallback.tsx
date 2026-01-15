/**
 * OAuth Callback handler component.
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet } from "lucide-react";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      handleOAuthCallback(token);
      navigate("/");
    } else {
      navigate("/login?error=No token received");
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <p className="text-[var(--color-text-muted)]">Completing sign in...</p>
      </div>
    </div>
  );
}
