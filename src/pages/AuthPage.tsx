import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <span className="text-white text-lg font-bold">R</span>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else setSuccess('Account created! Check your email to verify.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl gradient-card-blue flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Rony Enterprise</h1>
        <p className="text-sm text-muted-foreground mt-1">Business Ledger</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm glass-card-elevated rounded-3xl p-6 animate-slide-up">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="pl-10 h-12 rounded-xl" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-12 rounded-xl" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="pl-10 pr-10 h-12 rounded-xl"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          {success && <p className="text-xs text-success font-medium">{success}</p>}

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl gradient-primary text-white border-0 font-semibold text-base">
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-sm text-primary font-medium hover:underline">
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-6">Rony Enterprise Ledger v1.0</p>
    </div>
  );
}
