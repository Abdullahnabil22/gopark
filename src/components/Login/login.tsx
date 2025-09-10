import { useState } from "react";
import { FaSquareParking } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import Navbar from "../Headers/Navbar";
import { useToast } from "../../hooks/useToast";

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const { showError, ToastContainer } = useToast();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const response = await api.post("/auth/login", credentials) as {
        user?: { id: string; username: string; role: "admin" | "employee" };
        token?: string;
      };
      
      if (!response.token || !response.user) {
        throw new Error("Invalid response from server");
      }
      
      return response;
    },
    onSuccess: (data) => {
      login(data.user!, data.token!);
    },
    onError: (error) => {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please check your credentials and try again.";
      if (error && typeof error === "object" && "message" in error) {
        const serverMessage = (error as { message?: string }).message;
        if (serverMessage && serverMessage !== "Request failed with 401") {
          errorMessage = serverMessage;
        }
      }
      
      showError(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showError("Please enter both username and password");
      return;
    }

    loginMutation.mutate(formData);
  };

  return (
    <>
      <ToastContainer />
      <Navbar />
      <div className=" bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <FaSquareParking className="text-4xl text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to GoPark
            </h1>
            <p className="text-foreground/70">
              Sign in to access the parking reservation system
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Username"
                    disabled={loginMutation.isPending}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Password"
                    disabled={loginMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-foreground/50">
              Parking Reservation System - Gate & Checkpoint Access
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
