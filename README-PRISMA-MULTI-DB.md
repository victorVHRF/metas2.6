# Configuração Multi-Database com Prisma

Este projeto implementa uma solução para usar múltiplos bancos de dados (MySQL e PostgreSQL) com Prisma de forma organizada e eficiente.

## 📁 Estrutura dos Schemas

```
prisma/
├── schema.prisma          # Schema principal (PostgreSQL)
├── mysql-schema.prisma    # Schema específico para MySQL
├── postgres-schema.prisma # Schema específico para PostgreSQL
└── prisma-config.js       # Configuração para múltiplos schemas
```

## 🗄️ Distribuição dos Modelos

### MySQL (`mysql-schema.prisma`)
- **User**: Gerenciamento de usuários
- **Product**: Catálogo de produtos

### PostgreSQL (`postgres-schema.prisma`)
- **Order**: Sistema de pedidos
- **Analytics**: Dados de análise e métricas

## 🔧 Scripts Disponíveis

### Comandos Gerais
```bash
# Gerar todos os clientes Prisma
npm run db:all:generate
```

### Comandos MySQL
```bash
# Gerar cliente Prisma para MySQL
npm run db:mysql:generate

# Sincronizar schema com banco MySQL
npm run db:mysql:push

# Abrir Prisma Studio para MySQL
npm run db:mysql:studio
```

### Comandos PostgreSQL
```bash
# Gerar cliente Prisma para PostgreSQL
npm run db:postgres:generate

# Sincronizar schema com banco PostgreSQL
npm run db:postgres:push

# Abrir Prisma Studio para PostgreSQL
npm run db:postgres:studio
```

## 💻 Como Usar no Código

### Importação dos Clientes
```typescript
import { getMySQLPrisma, getPostgresPrisma, prisma } from '@/lib/prisma'
```

### Exemplo de Uso - MySQL
```typescript
export async function createUser() {
  const mysqlPrisma = await getMySQLPrisma()
  
  if (!mysqlPrisma) {
    throw new Error('MySQL Prisma client not available')
  }

  const user = await mysqlPrisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com'
    }
  })

  return user
}
```

### Exemplo de Uso - PostgreSQL
```typescript
export async function createOrder() {
  const postgresPrisma = await getPostgresPrisma()
  
  if (!postgresPrisma) {
    throw new Error('PostgreSQL Prisma client not available')
  }

  const order = await postgresPrisma.order.create({
    data: {
      userId: 1,
      productId: 1,
      quantity: 2,
      total: 199.98
    }
  })

  return order
}
```

### Consultas Cross-Database
```typescript
export async function getUserWithOrders(userId: number) {
  const mysqlPrisma = await getMySQLPrisma()
  const postgresPrisma = await getPostgresPrisma()
  
  if (!mysqlPrisma || !postgresPrisma) {
    throw new Error('One or both Prisma clients not available')
  }

  // Buscar usuário no MySQL
  const user = await mysqlPrisma.user.findUnique({
    where: { id: userId }
  })

  // Buscar pedidos no PostgreSQL
  const orders = await postgresPrisma.order.findMany({
    where: { userId: userId }
  })

  return { user, orders }
}
```

## 🔍 Health Check

O endpoint `/api/health` foi atualizado para verificar:
- ✅ Conectividade MySQL (conexão direta)
- ✅ Conectividade PostgreSQL (conexão direta)
- ✅ Cliente Prisma MySQL
- ✅ Cliente Prisma PostgreSQL
- 📊 Informações das tabelas de ambos os bancos

## 🐳 Docker

Certifique-se de que os containers estão rodando:
```bash
# Verificar status dos containers
docker ps

# Iniciar containers (se necessário)
docker-compose up -d
```

## 🔐 Variáveis de Ambiente

Configure no arquivo `.env`:
```env
# PostgreSQL (Principal)
DATABASE_URL="postgresql://postgres:password@localhost:5432/metas_postgres"
POSTGRES_DATABASE_URL="postgresql://postgres:password@localhost:5432/metas_postgres"

# MySQL
MYSQL_DATABASE_URL="mysql://root:password@localhost:3306/metas_mysql"
```

## 🚀 Fluxo de Desenvolvimento

1. **Modificar Schema**: Edite `mysql-schema.prisma` ou `postgres-schema.prisma`
2. **Gerar Cliente**: Execute `npm run db:mysql:generate` ou `npm run db:postgres:generate`
3. **Sincronizar DB**: Execute `npm run db:mysql:push` ou `npm run db:postgres:push`
4. **Testar**: Use o endpoint `/api/health` para verificar conectividade

## 📝 Exemplos Completos

Veja o arquivo `examples/prisma-usage.ts` para exemplos detalhados de:
- ✨ Criação de registros
- 🔍 Consultas complexas
- 🔄 Transações
- 🌐 Operações cross-database

## ⚠️ Considerações Importantes

1. **Transações Cross-Database**: Não são suportadas nativamente. Use transações separadas para cada banco.
2. **Relacionamentos**: Relacionamentos entre tabelas de bancos diferentes devem ser gerenciados na aplicação.
3. **Performance**: Consultas cross-database podem ser mais lentas. Considere cache quando necessário.
4. **Backup**: Configure backup separado para cada banco de dados.

## 🔧 Troubleshooting

### Cliente não disponível
```typescript
if (!mysqlPrisma) {
  throw new Error('MySQL Prisma client not available')
}
```

### Regenerar clientes após mudanças
```bash
npm run db:all:generate
```

### Verificar conectividade
Acesse: `http://localhost:3000/api/health`