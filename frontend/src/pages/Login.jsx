import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthContext from "../context/AuthContext";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

function LoginForm({ className, ...props }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:8001/api/login", data);
      console.log(response);
      const userData = await login(response.data.token)
      console.log(userData)
      setSuccess("Login successful! Redirecting...");
      setError(null);
          // Redirect user based on role
        // Add a small delay to ensure context is updated
        setTimeout(() => {
          // Now check user role and navigate
          if (userData.role === "student") {
            navigate("/studentDashboard");
          } else if(userData.role === "guide") {
            navigate("/guideDashboard");
          }
        }, 500);
      // Handle redirect or store token here
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      setSuccess(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-blue-500 underline">
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Login
              </Button>

              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link className="text-blue-500 underline" to="/signup">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;




