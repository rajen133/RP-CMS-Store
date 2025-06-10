import supabase from "@/lib/supabase";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/use-toast";

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "seller";
} | null;

// Define context type
type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  resetPassword: async () => {},
});

// Mock users for demo

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is logged
  const getUser = async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (sessionUser) {
      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name ?? "",
        email: sessionUser.email ?? "",
        role: sessionUser.user_metadata?.role ?? "customer",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user;
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            name: sessionUser.user_metadata?.name ?? "",
            email: sessionUser.email ?? "",
            role: sessionUser.user_metadata?.role ?? "customer",
          });
        } else {
          setUser(null);
        }
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const sessionUser = data.user;
      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name ?? "",
        email: sessionUser.email ?? "",
        role: sessionUser.user_metadata?.role ?? "customer",
      });
      toast({
        title: "Login successful",
        description: `Welcome back, ${
          sessionUser.user_metadata?.name ?? "User"
        }!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message ?? "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "customer", // Default role for new users
          },
        },
      });
      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message ?? "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check inbox to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message ?? "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
