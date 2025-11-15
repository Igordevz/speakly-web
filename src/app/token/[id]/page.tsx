"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { instance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TokenPage() {
  const params = useParams();
  const id = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!id) {
      return;
    }

    async function validateToken() {
      setIsLoading(true);
      try {
        const response = await instance.get(`/token/${id}`);
        const token = response?.data?.token;

        if (token) {
          Cookies.set("@jwt", token, { expires: 7 });
          router.push("/");
          setIsTokenSet(true);
        } else {
          setError("Token não foi retornado pela API.");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error?.response?.data?.message ||
            "Ocorreu um erro ao validar o token.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    validateToken();
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLoading
              ? "Validando Token"
              : isTokenSet
                ? "Acesso Autorizado"
                : "Erro de Validação"}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Verificando suas credenciais..."
              : isTokenSet
                ? "Redirecionando você para o sistema..."
                : "Não foi possível validar seu token de acesso"}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto validamos seu token...
              </p>
            </div>
          )}

          {isTokenSet && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Token validado com sucesso!
                </p>
                <p className="text-xs text-muted-foreground">
                  Você será redirecionado automaticamente...
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-600" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {error}
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    Verifique se o link está correto ou solicite um novo
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Tentar Novamente
                </Button>
                <Button size="sm" onClick={() => router.push("/login")}>
                  Voltar ao Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
