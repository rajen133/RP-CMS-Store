import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import logo from "@/assets/img/logo.jpg";
import { useState } from "react";

// Define Yup validation schema
const schema = yup
  .object({
    email: yup.string().email("Email is invalid").required("Email is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState("");

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-brand-600 rounded-lg flex items-center justify-center">
            <img
              src={logo}
              alt="logo"
              className="mx-auto h-12 w-12 bg-brand-600 rounded-lg flex items-center justify-center"
            />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            RP-CMS Store
          </h1>
          <h2 className="mt-2 text-lg text-gray-600">Reset your password</h2>
        </div>

        <div className="auth-card">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Check your email
                </h3>
                <p className="text-gray-600">
                  We've sent a password reset link to{" "}
                  <strong>{submittedEmail}</strong>. The link will expire in 1
                  hour.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="form-group">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="abc@gmail.com"
                      {...register("email")}
                      className={`pl-10 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} RP-CMS Store. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
