'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserCheck, Mail, Phone, Building, MapPin, ArrowLeft, Target, Briefcase, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface Portfolio {
  id: string
  name: string
  vehicle: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  _count: {
    clients: number
  }
}

interface User {
  id: string
  name: string
  email: string
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
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

    // Buscar carteiras do usuário logado
    fetchPortfolios(currentUser.id)
  }, [currentUser, authLoading])

  const fetchPortfolios = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/portfolios?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar carteiras')
      }
      
      const data = await response.json()
      setPortfolios(data)
    } catch (err) {
      console.error('Erro ao buscar carteiras:', err)
      setError('Erro ao carregar carteiras. Tente novamente.')
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

  // Agrupar carteiras por veículo
  const portfoliosByVehicle = portfolios.reduce((acc, portfolio) => {
    if (!acc[portfolio.vehicle]) {
      acc[portfolio.vehicle] = []
    }
    acc[portfolio.vehicle].push(portfolio)
    return acc
  }, {} as Record<string, Portfolio[]>)

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
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Dashboard
              </Button>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteiras de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie suas carteiras por veículo de mídia
          </p>
          {currentUser && (
            <div className="flex items-center gap-2 mt-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Logado como: <strong>{currentUser.name || currentUser.email}</strong>
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
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
            <CardTitle className="text-sm font-medium">Total de Carteiras</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolios.length}</div>
            <p className="text-xs text-muted-foreground">
              Distribuídas em {Object.keys(portfoliosByVehicle).length} veículos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolios.reduce((total, portfolio) => total + portfolio._count.clients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuídos nas carteiras
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Carteira</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolios.length > 0 
                ? Math.round(portfolios.reduce((total, portfolio) => total + portfolio._count.clients, 0) / portfolios.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes por carteira
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Carteiras por Veículo */}
      {Object.entries(portfoliosByVehicle).map(([vehicle, vehiclePortfolios]) => (
        <div key={vehicle} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getVehicleIcon(vehicle)}</span>
            <h2 className="text-2xl font-semibold">{vehicle}</h2>
            <Badge variant="secondary" className={getVehicleColor(vehicle)}>
              {vehiclePortfolios.length} carteiras
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehiclePortfolios.map((portfolio) => (
              <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                    <Badge variant="outline" className={getVehicleColor(portfolio.vehicle)}>
                      {portfolio.vehicle}
                    </Badge>
                  </div>
                  <CardDescription>
                    {portfolio._count.clients} cliente{portfolio._count.clients !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{portfolio._count.clients} clientes nesta carteira</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/dashboard/clients/${portfolio.id}/clients`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Ver Clientes
                        </Button>
                      </Link>
                      <Link href={`/dashboard/clients/${portfolio.id}/goals`}>
                        <Button className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Ver Metas
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {portfolios.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma carteira encontrada</CardTitle>
            <CardDescription>
              Não há carteiras cadastradas para este usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchPortfolios(currentUser?.id || '')}>
              Recarregar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}