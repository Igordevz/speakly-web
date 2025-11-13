import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { instance } from "@/lib/axios";
import { AlertTriangle, XCircle } from "lucide-react";

interface TokenPageProps {
  params: {
    id: string;
  };
}

async function validateToken(id: string) {
  try {
    const response = await instance.get(`/token/${id}`);
    const token = response?.data?.token;

    if (token) {
      cookies().set("@jwt", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return { success: true, error: null };
    } else {
      return { success: false, error: "Token inválido ou expirado." };
    }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        "Não foi possível validar seu acesso.",
    };
  }
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { id } = params;

  if (!id) {
    redirect("/login");
  }

  const result = await validateToken(id);

  if (result.success) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg border-t-4 border-red-500">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">
              Falha na Autenticação
            </CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              {result.error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Verifique se o link de acesso não expirou.</span>
            </div>
            <Button asChild className="w-full max-w-xs">
              <Link href="/login">Voltar para o Login</Link>
            </Button>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>Se o problema persistir, entre em contato com o suporte.</p>
        </footer>
      </div>
    </div>
  );
}
