import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Check, X, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { passwordRules, passwordSchema } from "@/lib/passwordPolicy";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

const signupSchema = z.object({
  name: z.string().min(3, "Nome com no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const EMAIL_CHECK_DELAY = 500;

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="space-y-1 pt-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs ${passed ? "text-green-500" : "text-destructive"}`}
          >
            {passed ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

const Auth = () => {
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signupPassword = signupForm.watch("password");
  const signupEmail = signupForm.watch("email");

  useEffect(() => {
    if (!z.string().email().safeParse(signupEmail).success) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const timeout = setTimeout(() => {
      authService
        .checkEmailAvailable(signupEmail)
        .then((available) => setEmailStatus(available ? "available" : "taken"))
        .catch(() => setEmailStatus("idle"));
    }, EMAIL_CHECK_DELAY);
    return () => clearTimeout(timeout);
  }, [signupEmail]);

  const handleLogin = async (v: z.infer<typeof loginSchema>) => {
    try {
      await login(v.email, v.password);
      toast({ title: "Bem-vindo de volta!" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erro no login", description: e.message, variant: "destructive" });
    }
  };

  const handleSignup = async (v: z.infer<typeof signupSchema>) => {
    try {
      await register(v.name, v.email, v.password);
      toast({ title: "Conta criada!" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erro no cadastro", description: e.message, variant: "destructive" });
    }
  };

  const signupBlocked =
    signupForm.formState.isSubmitting ||
    !signupForm.formState.isValid ||
    emailStatus === "taken" ||
    emailStatus === "checking";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-gamer opacity-10" />
      <div className="w-full max-w-md relative z-10">
        <Link to="/">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>

        <Card className="border-border bg-gradient-card shadow-glow-primary animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-gamer flex items-center justify-center shadow-glow-primary">
                <Zap className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">GamerZone</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={loginForm.formState.isSubmitting}
                      className="w-full bg-gradient-gamer hover:opacity-90 shadow-glow-primary">
                      {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField control={signupForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input placeholder="Seu nome" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={signupForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                        <FormMessage />
                        {emailStatus === "checking" && (
                          <p className="text-xs text-muted-foreground">Verificando disponibilidade...</p>
                        )}
                        {emailStatus === "taken" && (
                          <p className="text-xs text-destructive">Este e-mail já está cadastrado.</p>
                        )}
                        {emailStatus === "available" && (
                          <p className="text-xs text-green-500">E-mail disponível.</p>
                        )}
                      </FormItem>
                    )} />
                    <FormField control={signupForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        {signupPassword.length > 0 && <PasswordChecklist password={signupPassword} />}
                      </FormItem>
                    )} />
                    <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={signupBlocked}
                      className="w-full bg-gradient-gamer hover:opacity-90 shadow-glow-primary">
                      {signupForm.formState.isSubmitting ? "Criando..." : "Criar conta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
