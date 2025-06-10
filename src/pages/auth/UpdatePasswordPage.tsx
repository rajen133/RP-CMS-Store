import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UpdatePasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Important: Parse the token from the URL
    const handleRecovery = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      ); // this restores the session
      if (error) {
        toast({
          variant: "destructive",
          title: "Session recovery failed",
          description: error.message,
        });
      }
    };

    handleRecovery();
  }, []);

  const handleUpdatePassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Reset Your Password</h1>
      <Input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button onClick={handleUpdatePassword} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </div>
  );
};
export default UpdatePasswordPage;
