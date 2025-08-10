'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserCheck, Mail, Phone, Building, MapPin, ArrowLeft, Target, Users, Briefcase } from 'lucide-react'
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
  portfolio: {
    id: string
    name: string
    vehicle: string
    user: {
      id: string
      name: string
      email: string
    }
  }
}

export default function PortfolioClientsPage() {
  const params = useParams()
  const portfolioId = params.portfolioId as string
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser, logout, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }
    
    if (!currentUser) {
      setError('Nenhum usuário logado. Acesse um usuário primeiro.')
      setLoading(false)
      return
    }

    if (!portfolioId) {
      setError('ID da carteira não fornecido.')
      setLoading(false)
      return
    }

    fetchClients(portfolioId)
  }, [currentUser, authLoading, portfolioId])

  const fetchClients = async (portfolioId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/clients?portfolioId=${portfolioId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      
      const data = await response.json()
      setClients(data)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      setError('Erro ao carregar clientes. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'TV':
        return '📺'
      case 'RADIO':
        return '📻'
      case 'INTERNET':
        return '🌐'
      default:
        return '📁'
    }
  }

  const getVehicleColor = (vehicle: string) => {
    switch (vehicle) {
      case 'TV':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RADIO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INTERNET':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Erro</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link href="/dashboard/clients">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Carteiras
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const portfolio = clients[0]?.portfolio

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes da Carteira</h1>
          {portfolio && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl">{getVehicleIcon(portfolio.vehicle)}</span>
              <span className="text-lg font-medium">{portfolio.name}</span>
              <Badge variant="outline" className={getVehicleColor(portfolio.vehicle)}>
                {portfolio.vehicle}
              </Badge>
            </div>
          )}
          {currentUser && (
            <div className="flex items-center gap-2 mt-1">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Logado como: <strong>{currentUser.name || currentUser.email}</strong>
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/clients">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Carteiras
            </Button>
          </Link>
          {portfolio && (
            <Link href={`/dashboard/clients/${portfolioId}/goals`}>
              <Button className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Ver Metas
              </Button>
            </Link>
          )}
          <Button 
            variant="destructive" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Nesta carteira
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carteira</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{portfolio?.name || 'Carregando...'}</div>
            <p className="text-xs text-muted-foreground">
              Veículo: {portfolio?.vehicle || 'Carregando...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proprietário</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{portfolio?.user.name || 'Carregando...'}</div>
            <p className="text-xs text-muted-foreground">
              {portfolio?.user.email || 'Carregando...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      {clients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum cliente encontrado</CardTitle>
            <CardDescription>
              Esta carteira ainda não possui clientes cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchClients(portfolioId)}>
              Recarregar
            </Button>
          </CardContent>
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
                        Ver Metas do Cliente
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