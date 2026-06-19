import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  LOGIN_EXIT_HANDOFF_MS,
  loginFormEnterTransition,
  loginFormExitTransition,
} from "@/lib/motion-layout"

function LumeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z"
        fill="#a8d5ba"
      />
      <path
        d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z"
        fill="#ffffff"
        opacity="0.28"
      />
    </svg>
  )
}

type LoginFormContentProps = {
  onLogin: () => void
  onExitStart?: () => void
}

export function LoginFormContent({
  onLogin,
  onExitStart,
}: LoginFormContentProps) {
  const [email, setEmail] = useState("jonathan.guerini@example.com")
  const [password, setPassword] = useState("demo1234")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)

  function finishLogin() {
    setExiting(true)
    onExitStart?.()
    window.setTimeout(onLogin, LOGIN_EXIT_HANDOFF_MS)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      finishLogin()
    }, 700)
  }

  function handleSocialLogin() {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      finishLogin()
    }, 400)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-foreground sm:p-10">
      <motion.div
        className="flex w-full max-w-sm flex-col gap-8"
        initial={{ opacity: 0, y: 10 }}
        animate={
          exiting
            ? { opacity: 0, y: -10, scale: 0.98 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          exiting ? loginFormExitTransition : loginFormEnterTransition
        }
      >
        <div className="flex flex-col items-center gap-3 text-center lg:hidden">
          <LumeMark className="size-12" />
          <span className="font-heading text-2xl font-semibold">Lume</span>
        </div>

        <Card className="w-full shadow-sm ring-1 ring-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre na sua conta para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="border-border bg-background/40 pl-9 hover:bg-accent/50 focus-visible:bg-card"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Senha</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-border bg-background/40 px-9 hover:bg-accent/50 focus-visible:bg-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="login-remember"
                  checked={remember}
                  onCheckedChange={setRemember}
                />
                <Label
                  htmlFor="login-remember"
                  className="text-sm font-normal text-muted-foreground"
                >
                  Manter conectado
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight />
                  </>
                )}
              </Button>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">ou</span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border bg-background/40 hover:bg-accent/50"
                disabled={loading}
                onClick={handleSocialLogin}
              >
                <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
                  />
                </svg>
                Entrar com Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Criar conta
          </button>
        </p>
      </motion.div>
    </div>
  )
}
