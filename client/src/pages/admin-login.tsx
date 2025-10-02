import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCheck, Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@maputoimporthub.mz",
      password: "",
      remember: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Pick<LoginForm, 'email' | 'password'>) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Store admin info in localStorage
        localStorage.setItem('admin', JSON.stringify(data.admin));
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.admin.name}`,
        });
        setLocation("/admin/dashboard");
      }
    },
    onError: () => {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-maputo-primary to-blue-900 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-maputo-primary text-white rounded-full p-4 mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900" data-testid="admin-login-title">
                  Painel Administrativo
                </h2>
                <p className="text-gray-600 mt-2">Acesso restrito aos administradores</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="pl-12"
                      placeholder="admin@maputoimporthub.mz"
                      data-testid="admin-email-input"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      className="pl-12"
                      placeholder="••••••••"
                      data-testid="admin-password-input"
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={form.watch("remember")}
                      onCheckedChange={(checked) => form.setValue("remember", !!checked)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Lembrar-me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-maputo-primary hover:text-maputo-primary-dark">
                    Esqueceu a senha?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-maputo-primary hover:bg-maputo-primary-dark text-white py-3 font-semibold"
                  data-testid="admin-login-button"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/">
                  <a className="text-sm text-gray-600 hover:text-maputo-primary inline-flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao site
                  </a>
                </Link>
              </div>

              {/* Demo Credentials Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 font-medium mb-2">Credenciais de Demonstração:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Email:</strong> admin@maputoimporthub.mz</p>
                  <p><strong>Senha:</strong> admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
