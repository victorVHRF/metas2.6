# Metas 2.6 - Sistema de Gerenciamento de Metas

Um sistema moderno de gerenciamento de metas para clientes, construído com Next.js 15, React 19, e suporte a múltiplos bancos de dados.

## 🚀 Funcionalidades

### Dashboard Principal
- **Autenticação de usuários** com contexto React
- **Sidebar responsiva** com navegação intuitiva
- **Health check** do sistema e bancos de dados

### Gerenciamento de Clientes
- **Listagem de clientes** com interface moderna
- **Criação e edição** de informações de clientes
- **Navegação direta** para metas específicas

### Sistema de Metas
- **Visualização por mês** com totais calculados
- **Edição de metas** por veículo (TV, Rádio, Internet)
- **Filtragem por mês** para edição focada
- **Cálculos automáticos** de totais mensais e anuais
- **Persistência em tempo real** das alterações

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** com App Router
- **React 19** com hooks modernos
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **Lucide React** para ícones
- **TanStack Query** para gerenciamento de estado

### Backend
- **Next.js API Routes** para endpoints
- **Prisma ORM** com suporte multi-database
- **Zod** para validação de dados
- **MySQL** para dados de usuários e clientes
- **PostgreSQL** para analytics (configurado)

### Infraestrutura
- **Docker Compose** para bancos de dados
- **MCP (Model Context Protocol)** para integração com IA
- **ESLint** para qualidade de código

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── clients/            # Endpoints de clientes
│   │   ├── users/              # Endpoints de usuários
│   │   └── health/             # Health check
│   ├── dashboard/              # Páginas do dashboard
│   │   ├── clients/            # Gerenciamento de clientes
│   │   │   └── [id]/goals/     # Metas por cliente
│   │   └── layout.tsx          # Layout do dashboard
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # Componentes Shadcn
│   └── app-sidebar.tsx         # Sidebar principal
├── contexts/
│   └── auth-context.tsx        # Contexto de autenticação
├── hooks/
│   ├── use-health-check.ts     # Hook para health check
│   └── use-mobile.ts           # Hook para responsividade
├── lib/
│   ├── prisma.ts               # Configuração Prisma
│   ├── utils.ts                # Utilitários
│   └── validations/            # Schemas Zod
└── providers/
    └── query-provider.tsx      # Provider TanStack Query
```

## 🗄️ Bancos de Dados

### MySQL
- **User**: Gerenciamento de usuários
- **Client**: Informações de clientes
- **Goal**: Metas por cliente/mês/veículo

### PostgreSQL
- Configurado para analytics e métricas futuras

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd metas2.6
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure os bancos de dados**
```bash
# Inicie os containers Docker
npm run docker:up

# Gere os clientes Prisma
npm run db:all:generate

# Sincronize os schemas
npm run db:mysql:push
npm run db:postgres:push
```

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📊 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
```

### Banco de Dados
```bash
# MySQL
npm run db:mysql:generate    # Gerar cliente Prisma
npm run db:mysql:push        # Sincronizar schema
npm run db:mysql:studio      # Abrir Prisma Studio

# PostgreSQL
npm run db:postgres:generate # Gerar cliente Prisma
npm run db:postgres:push     # Sincronizar schema
npm run db:postgres:studio   # Abrir Prisma Studio

# Todos os bancos
npm run db:all:generate      # Gerar todos os clientes
```

### Docker
```bash
npm run docker:up       # Iniciar containers
npm run docker:down     # Parar containers
npm run docker:logs     # Ver logs
```

### Seeds
```bash
npm run seed:users      # Popular usuários
npm run seed:clients    # Popular clientes
```

### MCP (Model Context Protocol)
```bash
npm run mcp:setup       # Configurar MCP
npm run mcp:health      # Verificar saúde MCP
npm run mcp:logs        # Ver logs MCP
npm run mcp:restart     # Reiniciar serviços MCP
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# MySQL
MYSQL_DATABASE_URL="mysql://user:password@localhost:3306/metas"

# PostgreSQL
POSTGRES_DATABASE_URL="postgresql://user:password@localhost:5432/analytics"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Docker Compose
Os bancos de dados são configurados automaticamente via Docker Compose com:
- **MySQL**: Porta 3306
- **PostgreSQL**: Porta 5432
- **Volumes persistentes** para dados

## 🎯 Funcionalidades Principais

### 1. Autenticação
- Sistema de login/logout
- Contexto React para gerenciamento de estado
- Persistência em localStorage
- Proteção de rotas

### 2. Dashboard de Clientes
- Listagem responsiva de clientes
- Busca e filtros
- Navegação direta para metas
- Interface moderna com Shadcn/ui

### 3. Gerenciamento de Metas
- **Visualização mensal**: Totais por mês em cards interativos
- **Edição por veículo**: TV, Rádio, Internet
- **Filtragem inteligente**: Edite metas de um mês específico
- **Cálculos automáticos**: Totais em tempo real
- **Persistência**: Salvamento automático das alterações

### 4. Health Check
- Monitoramento de bancos de dados
- Status de serviços
- Métricas de performance

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação dos componentes
- Verifique os logs com `npm run docker:logs`

---

**Desenvolvido com ❤️ usando Next.js 15 e React 19**
