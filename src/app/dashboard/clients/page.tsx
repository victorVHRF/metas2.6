'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserCheck, Mail, Phone, Building, MapPin, ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser, logout, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return // Aguarda o contexto carregar
    }
    
    if (!currentUser) {
      setError('Nenhum usuário logado. Acesse um usuário primeiro.')
      setLoading(false)
      return
    }

    // Buscar clientes do usuário logado
    fetchClients(currentUser.id)
  }, [currentUser, authLoading])

  const fetchClients = async (userId: string) => {
    try {
      const response = await fetch(`/api/clients?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Falha ao carregar clientes')
      }
      const data = await response.json()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setClients([])
    setError('Usuário deslogado. Faça login novamente.')
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Usuários
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerenciando clientes de {currentUser?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </div>
        </div>
        
        {currentUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Usuário Logado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                <Badge variant="secondary">{clients.length} clientes</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum cliente encontrado</CardTitle>
            <CardDescription>
              Este usuário ainda não possui clientes cadastrados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {client.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  )}
                  {client.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4" />
                      {client.company}
                    </div>
                  )}
                  {(client.city || client.state) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {[client.city, client.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    <Badge variant="outline">
                      Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </Badge>
                    <Link href={`/dashboard/clients/${client.id}/goals`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Target className="mr-2 h-4 w-4" />
                        Ver Metas
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}