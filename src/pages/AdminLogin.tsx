import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { signIn, signUp, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast({
          title: 'Logged in successfully',
          description: 'Checking admin permissions...',
        });
      } else {
        await signUp(email, password);
        toast({
          title: 'Account created',
          description: 'Please contact the site owner to grant admin access.',
        });
      }
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (error) {
      toast({
        title: mode === 'login' ? 'Login failed' : 'Signup failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg to-game-grid-darker flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-2xl p-8 border border-game-grid-border shadow-2xl">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-game-text-muted hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <Shield className="w-16 h-16 text-game-accent mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Admin Login' : 'Admin Sign Up'}
            </h1>
            <p className="text-game-text-muted text-sm">
              {mode === 'login' 
                ? 'Enter your credentials to access the moderation dashboard'
                : 'Create an account to request admin access'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-game-text-muted mb-2">
                <Mail className="w-4 h-4 inline-block mr-1" />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-game-grid-darker/50 border-game-grid-border text-white placeholder:text-game-text-muted/50 focus:border-game-accent focus:ring-game-accent"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-game-text-muted mb-2">
                <Lock className="w-4 h-4 inline-block mr-1" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-game-grid-darker/50 border-game-grid-border text-white placeholder:text-game-text-muted/50 focus:border-game-accent focus:ring-game-accent"
                disabled={isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full bg-gradient-to-r from-game-accent to-game-accent-hover hover:from-game-accent-hover hover:to-game-accent text-white font-bold py-3 rounded-xl shadow-lg shadow-game-accent/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-game-accent hover:text-game-accent-hover text-sm transition-colors"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-game-text-muted/60 text-xs text-center mt-4">
            {mode === 'signup' 
              ? 'After signing up, admin access must be granted by the site owner.'
              : 'Admin access only. Contact the site owner for credentials.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
