'use client'

import { useAuth } from '@/contexts/auth-context'

export default function Page() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user ? `Bem-vindo ${user.name} ao Metas 2.6 Dashboard` : 'Metas 2.6 Dashboard'}
        </h1>
        {user && (
          <p className="text-muted-foreground">
            Logado como: {user.email}
          </p>
        )}
      </div>
      
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Estatísticas</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Gráficos</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Relatórios</p>
        </div>
      </div>
      
      <div className="bg-muted/50 min-h-[400px] flex-1 rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Conteúdo principal do dashboard</p>
      </div>
    </div>
  )
}
