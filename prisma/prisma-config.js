// Configuração para gerenciar múltiplos schemas Prisma
// Este arquivo ajuda a organizar os comandos para diferentes bancos de dados

const configs = {
  mysql: {
    schema: './prisma/mysql-schema.prisma',
    url: process.env.MYSQL_DATABASE_URL,
    description: 'MySQL Database - Users and Products'
  },
  postgres: {
    schema: './prisma/postgres-schema.prisma', 
    url: process.env.POSTGRES_DATABASE_URL,
    description: 'PostgreSQL Database - Orders and Analytics'
  },
  main: {
    schema: './prisma/schema.prisma',
    url: process.env.DATABASE_URL,
    description: 'Main PostgreSQL Database'
  }
};

// Comandos úteis:
// npx prisma generate --schema=./prisma/mysql-schema.prisma
// npx prisma generate --schema=./prisma/postgres-schema.prisma
// npx prisma db push --schema=./prisma/mysql-schema.prisma
// npx prisma db push --schema=./prisma/postgres-schema.prisma
// npx prisma studio --schema=./prisma/mysql-schema.prisma
// npx prisma studio --schema=./prisma/postgres-schema.prisma

module.exports = configs;