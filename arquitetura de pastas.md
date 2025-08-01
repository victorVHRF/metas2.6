src/
├── app/                     # App Router (Frontend)
│   ├── (dashboard)/         # Grupo de rotas do dashboard
│   ├── api/                 # API Routes (Backend)
│   │   ├── health/
│   │   │   └── route.ts
│   │   ├── users/
│   │   │   └── route.ts
│   │   └── ...
│   ├── health/              # Página de health
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Componentes do shadcn
│   ├── forms/
│   ├── layout/
│   └── ...
├── lib/                     # Utilitários e configurações
│   ├── prisma.ts           # Cliente Prisma
│   ├── validations/         # Schemas Zod
│   ├── utils.ts
│   └── db/
│       ├── mysql.ts
│       └── postgres.ts
├── types/                   # Tipos TypeScript
└── hooks/                   # Custom hooks