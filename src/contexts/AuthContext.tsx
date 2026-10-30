import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  emailVerified: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  isAdmin: boolean;
  isCoordinator: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) await fetchProfile(currentUser.id);
  }, [fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/verificar-correo`,
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        return { error: 'Este correo ya está registrado. Intenta ingresar o recuperar tu contraseña.', needsVerification: false };
      }
      if (msg.includes('password') && msg.includes('weak')) {
        return { error: 'La contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.', needsVerification: false };
      }
      return { error: 'Ocurrió un error al crear tu cuenta. Intenta de nuevo.', needsVerification: false };
    }
    if (data.user) {
      const profileData = {
        id: data.user.id,
        email,
        full_name: fullName,
      };
      const { error: profileError } = await supabase.from('profiles').insert(profileData);
      if (profileError) {
        const needsVerif = !data.session;
        return {
          error: 'Tu cuenta fue creada pero hubo un problema al guardar tu perfil. Intenta iniciar sesión; si no funciona, contacta soporte.',
          needsVerification: needsVerif,
        };
      }
      await fetchProfile(data.user.id);
    }
    const needsVerification = data.user && !data.session;
    return { error: null, needsVerification: !!needsVerification };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('email not confirmed')) {
        return { error: null, needsVerification: true };
      }
      if (msg.includes('rate limit') || msg.includes('too many')) {
        return { error: 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.', needsVerification: false };
      }
      if (msg.includes('invalid') || msg.includes('credentials')) {
        return { error: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.', needsVerification: false };
      }
      return { error: 'No pudimos iniciar sesión. Verifica tus datos e intenta de nuevo.', needsVerification: false };
    }
    if (data.user) await fetchProfile(data.user.id);
    return { error: null, needsVerification: false };
  }

  async function resendVerification(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/verificar-correo` },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        return { error: 'Demasiados envíos. Espera unos minutos antes de solicitar otro correo.' };
      }
      return { error: 'No pudimos reenviar el correo. Intenta de nuevo en unos minutos.' };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signOutAll() {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) return { error: 'No pudimos cerrar todas las sesiones. Intenta de nuevo.' };
    return { error: null };
  }

  async function updateEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        return { error: 'Ese correo ya está en uso por otra cuenta.', needsVerification: false };
      }
      if (msg.includes('rate limit')) {
        return { error: 'Demasiados cambios. Espera unos minutos antes de intentar de nuevo.', needsVerification: false };
      }
      return { error: 'No pudimos actualizar tu correo. Intenta de nuevo.', needsVerification: false };
    }
    const needsVerification = !user?.email_confirmed_at || newEmail !== user?.email;
    return { error: null, needsVerification };
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPassword,
    });
    if (reauthError) {
      return { error: 'Tu contraseña actual es incorrecta.' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('weak') || msg.includes('password')) {
        return { error: 'La nueva contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.' };
      }
      return { error: 'No pudimos actualizar tu contraseña. Intenta de nuevo.' };
    }
    return { error: null };
  }

  const emailVerified = !!user?.email_confirmed_at || !!user?.confirmed_at;
  const isAdmin = profile?.role === 'admin';
  const isCoordinator = profile?.role === 'coordinator' || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, emailVerified,
      signUp, signIn, resendVerification, signOut, signOutAll,
      refreshProfile, updateEmail, updatePassword, isAdmin, isCoordinator,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
