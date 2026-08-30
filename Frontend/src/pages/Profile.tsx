import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { ApiError, resolveImageUrl } from "@/lib/api";
import { passwordSchema } from "@/lib/passwordPolicy";
import { PasswordChecklist } from "@/components/PasswordChecklist";
import type { User } from "@/types/user";

const profileSchema = z.object({
  name: z.string().min(3, "Nome com no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const EMAIL_CHECK_DELAY = 500;

function ProfileContent({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = passwordForm.watch("newPassword");
  const profileEmail = profileForm.watch("email");

  useEffect(() => {
    if (profileEmail === user.email || !z.string().email().safeParse(profileEmail).success) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const timeout = setTimeout(() => {
      authService
        .checkEmailAvailable(profileEmail)
        .then((available) => setEmailStatus(available ? "available" : "taken"))
        .catch(() => setEmailStatus("idle"));
    }, EMAIL_CHECK_DELAY);
    return () => clearTimeout(timeout);
  }, [profileEmail, user.email]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await userService.uploadAvatar(file);
      setAvatar(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao enviar imagem", description: message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (v: z.infer<typeof profileSchema>) => {
    try {
      const updated = await userService.updateProfile({ name: v.name, email: v.email, avatar: avatar || undefined });
      updateUser(updated);
      toast({ title: "Perfil atualizado!" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        profileForm.setError("email", { message: "E-mail já cadastrado" });
        return;
      }
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao salvar perfil", description: message, variant: "destructive" });
    }
  };

  const handlePasswordSubmit = async (v: z.infer<typeof passwordFormSchema>) => {
    try {
      await userService.changePassword(v.currentPassword, v.newPassword);
      toast({ title: "Senha alterada!" });
      passwordForm.reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        passwordForm.setError("currentPassword", { message: "Senha atual incorreta" });
        return;
      }
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao trocar senha", description: message, variant: "destructive" });
    }
  };

  const profileBlocked =
    profileForm.formState.isSubmitting || emailStatus === "taken" || emailStatus === "checking";

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={avatar ? resolveImageUrl(avatar) : undefined} />
              <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
              <Upload className="h-4 w-4" />
              {uploadingAvatar ? "Enviando..." : "Trocar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
            </label>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
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
              <Button type="submit" disabled={profileBlocked} className="bg-gradient-gamer hover:opacity-90 shadow-glow-primary">
                {profileForm.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle>Alterar senha</CardTitle></CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  {newPassword.length > 0 && <PasswordChecklist password={newPassword} />}
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting || !passwordForm.formState.isValid}
                className="bg-gradient-gamer hover:opacity-90 shadow-glow-primary"
              >
                {passwordForm.formState.isSubmitting ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-4xl font-bold mb-8">
          Minha <span className="text-primary">Conta</span>
        </h1>

        {authLoading || !user ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <ProfileContent user={user} />
        )}
      </div>
    </div>
  );
};

export default Profile;
