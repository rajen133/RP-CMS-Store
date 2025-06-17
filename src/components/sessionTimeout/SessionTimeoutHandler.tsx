import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
// Session timeout watcher
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const SessionTimeoutWatcher = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
      navigate("/login"); // or your login route
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    resetTimer(); // on mount

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
};
export default SessionTimeoutWatcher;
