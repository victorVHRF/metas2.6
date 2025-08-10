'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCheck, ArrowLeft, Target, Users, Briefcase, Edit, Save, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface Goal {
  id: string
  month: number
  year: number
  amount: number
  portfolioId: string
  clientId?: string
  createdAt: string
  updatedAt: string
  portfolio?: {
    id: string
    name: string
    vehicle: string
    user: {
      id: string
      name: string
      email: string
    }
  }
  client?: {
    id: string
    name: string
    email: string
  }
}

interface Portfolio {
  id: string
  name: string
  vehicle: string
  user: {
    id: string
    name: string
    email: string
  }
  _count: {
    clients: number
  }
}

export default function PortfolioGoalsPage() {
  const params = useParams()
  const portfolioId = params.portfolioId as string
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<number>(0)
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

    fetchPortfolioData(portfolioId)
  }, [currentUser, authLoading, portfolioId])

  const fetchPortfolioData = async (portfolioId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar dados da carteira
      const portfolioResponse = await fetch(`/api/portfolios?portfolioId=${portfolioId}`)
      if (!portfolioResponse.ok) {
        throw new Error('Erro ao carregar dados da carteira')
      }
      const portfolioData = await portfolioResponse.json()
      setPortfolio(portfolioData[0])
      
      // Buscar metas da carteira
      const goalsResponse = await fetch(`/api/goals?portfolioId=${portfolioId}`)
      if (!goalsResponse.ok) {
        throw new Error('Erro ao carregar metas')
      }
      const goalsData = await goalsResponse.json()
      setGoals(goalsData)
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError('Erro ao carregar dados. Tente novamente.')
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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1] || 'Mês inválido'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal.id)
    setEditAmount(goal.amount)
  }

  const handleSaveGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: editAmount }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar meta')
      }

      // Atualizar a lista de metas
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, amount: editAmount } : goal
      ))
      setEditingGoal(null)
    } catch (err) {
      console.error('Erro ao salvar meta:', err)
      alert('Erro ao salvar meta. Tente novamente.')
    }
  }

  const handleCancelEdit = () => {
    setEditingGoal(null)
    setEditAmount(0)
  }

  // Agrupar metas por ano e mês
  const goalsByPeriod = goals.reduce((acc, goal) => {
    const key = `${goal.year}-${goal.month}`
    if (!acc[key]) {
      acc[key] = {
        year: goal.year,
        month: goal.month,
        goals: []
      }
    }
    acc[key].goals.push(goal)
    return acc
  }, {} as Record<string, { year: number; month: number; goals: Goal[] }>)

  // Ordenar períodos por ano e mês
  const sortedPeriods = Object.values(goalsByPeriod).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  // Calcular totais
  const totalGoals = goals.reduce((sum, goal) => sum + goal.amount, 0)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentPeriodGoals = goals.filter(goal => goal.year === currentYear && goal.month === currentMonth)
  const currentPeriodTotal = currentPeriodGoals.reduce((sum, goal) => sum + goal.amount, 0)

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas da Carteira</h1>
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
          <Link href={`/dashboard/clients/${portfolioId}/clients`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ver Clientes
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGoals)}</div>
            <p className="text-xs text-muted-foreground">
              Todas as metas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mês Atual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPeriodTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {getMonthName(currentMonth)} {currentYear}
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
              {portfolio?._count.clients || 0} clientes
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

      {/* Metas por Período */}
      {sortedPeriods.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma meta encontrada</CardTitle>
            <CardDescription>
              Esta carteira ainda não possui metas cadastradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchPortfolioData(portfolioId)}>
              Recarregar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedPeriods.map((period) => {
            const periodTotal = period.goals.reduce((sum, goal) => sum + goal.amount, 0)
            const isCurrentPeriod = period.year === currentYear && period.month === currentMonth
            
            return (
              <Card key={`${period.year}-${period.month}`} className={isCurrentPeriod ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">
                        {getMonthName(period.month)} {period.year}
                      </CardTitle>
                      {isCurrentPeriod && (
                        <Badge variant="default">Mês Atual</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(periodTotal)}</div>
                      <div className="text-sm text-muted-foreground">
                        {period.goals.length} meta{period.goals.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {period.goals.map((goal) => (
                      <Card key={goal.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {goal.client ? `Cliente: ${goal.client.name}` : 'Meta da Carteira'}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {editingGoal === goal.id ? (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`amount-${goal.id}`}>Valor da Meta</Label>
                                <Input
                                  id={`amount-${goal.id}`}
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(Number(e.target.value))}
                                  placeholder="0.00"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveGoal(goal.id)}
                                  className="flex-1"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(goal.amount)}
                              </div>
                              {goal.client && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {goal.client.email}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}