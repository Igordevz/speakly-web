"use client";

import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoSpeakLy from "../../../public/speakly.png";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { contextApi } from "@/context/auth";

const MagicLinkSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

type MagicLinkFormData = z.infer<typeof MagicLinkSchema>;

interface MagicLinkLoginProps {
  className?: string;
}

export default function MagicLinkLogin({ className }: MagicLinkLoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(MagicLinkSchema),
  });

  const { LoginToMagicLink, isLoading, isEmailSent, setIsEmailSent, email } =
    useContext(contextApi);

  const handleLogin = async (data: MagicLinkFormData) => {
    try {
      await LoginToMagicLink(data.email);
    } catch {
      setError("root.serverError", {
        type: "manual",
        message: "Ocorreu um erro ao enviar o email. Tente novamente.",
      });
    }
  };

  const handleBackToLogin = () => {
    setIsEmailSent(false);
    reset({ email: "" });
  };

  if (isEmailSent) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Link enviado!</CardTitle>
          <CardDescription className="text-center">
            Enviamos um link mágico para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <Mail className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e clique no link para fazer login.
              O link expira em 15 minutos.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground py-2">
            Não recebeu o email? Verifique sua pasta de spam ou{" "}
            <button
              onClick={handleBackToLogin}
              className="text-primary hover:underline font-medium mt-2 cursor-pointer"
            >
              tente novamente
            </button>
          </div>

          <Button
            variant="outline"
            onClick={handleBackToLogin}
            className="w-full bg-transparent cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex flex-row items-center gap-6 justify-between w-full">
          <h1 className="text-2xl font-bold">Speakly</h1>
          <Image
            src={logoSpeakLy}
            width={70}
            height={70}
            alt="Speakly Logo"
            className="rounded-sm"
          />
        </div>
        <p className="text-sm text-muted-foreground 1 animate-pulse ">
          Speakly é uma plataforma de comunicação instantânea para
          desenvolvedores.
        </p>
      </div>
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Entrar com Magic Link
          </CardTitle>
          <CardDescription>
            Digite seu email e enviaremos um link para fazer login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              {errors.root?.serverError && (
                <p className="text-sm text-destructive">
                  {errors.root.serverError.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-primary hover:underline">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidade
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
