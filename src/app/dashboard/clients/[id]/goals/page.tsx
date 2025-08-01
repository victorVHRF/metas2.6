'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Target, Calendar, Tv, Radio, Globe, Save } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
  updatedAt: string
}

interface Goal {
  id: string
  clientId: string
  month: number
  year: number
  tvGoal: number
  radioGoal: number
  internetGoal: number
  totalGoal: number
  createdAt: string
  updatedAt: string
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function ClientGoalsPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, logout, isLoading: authLoading } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [editingGoals, setEditingGoals] = useState<{[key: string]: number}>({})
  const [saving, setSaving] = useState(false)

  const clientId = params.id as string
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (authLoading) {
      return
    }
    
    if (!currentUser) {
      setError('Usuário deslogado. Faça login novamente.')
      setLoading(false)
      return
    }

    fetchClientAndGoals()
  }, [currentUser, clientId, authLoading])

  const fetchClientAndGoals = async () => {
    try {
      setLoading(true)
      
      // Buscar dados do cliente
      const clientResponse = await fetch(`/api/clients/${clientId}?userId=${currentUser?.id}`)
      if (!clientResponse.ok) {
        throw new Error('Cliente não encontrado')
      }
      const clientData = await clientResponse.json()
      setClient(clientData)

      // Buscar metas do cliente
      const goalsResponse = await fetch(`/api/clients/${clientId}/goals?year=${currentYear}`)
      if (!goalsResponse.ok) {
        throw new Error('Erro ao carregar metas')
      }
      const goalsData = await goalsResponse.json()
      setGoals(goalsData)

      // Inicializar valores de edição
      const initialEditingGoals: {[key: string]: number} = {}
      goalsData.forEach((goal: Goal) => {
        initialEditingGoals[`${goal.month}-tv`] = goal.tvGoal
        initialEditingGoals[`${goal.month}-radio`] = goal.radioGoal
        initialEditingGoals[`${goal.month}-internet`] = goal.internetGoal
      })
      setEditingGoals(initialEditingGoals)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/dashboard/users')
  }

  const getMonthlyTotal = (month: number) => {
    const goal = goals.find(g => g.month === month)
    return goal ? goal.totalGoal : 0
  }

  const handleGoalChange = (month: number, type: 'tv' | 'radio' | 'internet', value: number) => {
    setEditingGoals(prev => ({
      ...prev,
      [`${month}-${type}`]: value
    }))
  }

  const saveGoals = async () => {
    try {
      setSaving(true)
      
      const updates = goals.map(goal => {
        const tvGoal = editingGoals[`${goal.month}-tv`] || 0
        const radioGoal = editingGoals[`${goal.month}-radio`] || 0
        const internetGoal = editingGoals[`${goal.month}-internet`] || 0
        const totalGoal = tvGoal + radioGoal + internetGoal

        return {
          id: goal.id,
          tvGoal,
          radioGoal,
          internetGoal,
          totalGoal
        }
      })

      const response = await fetch(`/api/clients/${clientId}/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals: updates })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar metas')
      }

      // Recarregar dados
      await fetchClientAndGoals()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
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
            <Link href="/dashboard/clients">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Clientes
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
            <h1 className="text-3xl font-bold tracking-tight">Metas do Cliente</h1>
            <p className="text-muted-foreground">
              Gerenciando metas de {client?.name} - {currentYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/clients">
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
        
        {client && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {client.name}
              </CardTitle>
              <CardDescription>{client.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {client.company && (
                  <Badge variant="secondary">{client.company}</Badge>
                )}
                <Badge variant="outline">{goals.length} metas cadastradas</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Meses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Metas por Mês - {currentYear}
          </CardTitle>
          <CardDescription>
            Clique em um mês para ver o total de metas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthNames.map((monthName, index) => {
              const month = index + 1
              const total = getMonthlyTotal(month)
              const isSelected = selectedMonth === month
              
              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedMonth(isSelected ? null : month)}
                  className="h-auto p-4 flex flex-col items-center"
                >
                  <span className="font-medium">{monthName}</span>
                  <span className="text-sm opacity-75">
                    Total: {total.toLocaleString('pt-BR')}
                  </span>
                </Button>
              )
            })}
          </div>
          
          {selectedMonth && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">
                Meta Total de {monthNames[selectedMonth - 1]}: {getMonthlyTotal(selectedMonth).toLocaleString('pt-BR')}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {goals.filter(g => g.month === selectedMonth).map(goal => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Tv className="h-4 w-4" />
                      <span>TV: {goal.tvGoal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Radio className="h-4 w-4" />
                      <span>Rádio: {goal.radioGoal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>Internet: {goal.internetGoal.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Edição de Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Editar Metas por Veículo
          </CardTitle>
          <CardDescription>
            {selectedMonth 
              ? `Editando metas de ${monthNames[selectedMonth - 1]} - Clique em outro mês ou desmarque para ver todos`
              : 'Altere os valores das metas por tipo de mídia - Selecione um mês acima para filtrar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.filter(goal => selectedMonth ? goal.month === selectedMonth : true).map((goal) => {
              const monthName = monthNames[goal.month - 1]
              
              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">{monthName} {goal.year}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tv className="h-4 w-4" />
                        TV
                      </Label>
                      <Input
                        type="number"
                        value={editingGoals[`${goal.month}-tv`] || 0}
                        onChange={(e) => handleGoalChange(goal.month, 'tv', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        Rádio
                      </Label>
                      <Input
                        type="number"
                        value={editingGoals[`${goal.month}-radio`] || 0}
                        onChange={(e) => handleGoalChange(goal.month, 'radio', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Internet
                      </Label>
                      <Input
                        type="number"
                        value={editingGoals[`${goal.month}-internet`] || 0}
                        onChange={(e) => handleGoalChange(goal.month, 'internet', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded">
                    <span className="font-medium">
                      Total: {(
                        (editingGoals[`${goal.month}-tv`] || 0) +
                        (editingGoals[`${goal.month}-radio`] || 0) +
                        (editingGoals[`${goal.month}-internet`] || 0)
                      ).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })}
            
            <div className="flex justify-end">
              <Button onClick={saveGoals} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Metas'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}