# Configuração do Model Context Protocol (MCP) no Projeto Metas 2.6

## O que é MCP?

O Model Context Protocol (MCP) é um protocolo padrão desenvolvido pela Anthropic que permite que assistentes de IA se conectem de forma segura a fontes de dados e ferramentas externas. <mcreference link="https://www.docker.com/blog/the-model-context-protocol-simplifying-building-ai-apps-with-anthropic-claude-desktop-and-docker/" index="4">4</mcreference>

## Configuração Implementada

Este projeto foi configurado com os seguintes serviços MCP:

### 1. MCP Docker Server
- **Container**: `metas_mcp_docker`
- **Porta**: 3001
- **Funcionalidades**: <mcreference link="https://github.com/QuantGeekDev/docker-mcp" index="5">5</mcreference>
  - Criação e gerenciamento de containers
  - Deploy de stacks Docker Compose
  - Recuperação de logs de containers
  - Listagem e monitoramento de status de containers

### 2. MCP Filesystem Server
- **Container**: `metas_mcp_filesystem`
- **Porta**: 3002
- **Funcionalidades**:
  - Operações seguras de arquivo com controles de acesso configuráveis
  - Acesso ao workspace do projeto

### 3. Integração com Bancos de Dados
- **MySQL**: Acesso direto ao container `metas_mysql`
- **PostgreSQL**: Acesso direto ao container `metas_postgres`

## Como Usar

### 1. Iniciar os Serviços

```bash
# Iniciar todos os serviços incluindo MCP
docker-compose up -d

# Verificar se os serviços MCP estão rodando
docker-compose ps
```

### 2. Configurar Claude Desktop

Para usar com Claude Desktop, copie o conteúdo do arquivo `mcp-config/claude_desktop_config.json` para sua configuração do Claude:

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### 3. Verificar Conexão

Após reiniciar o Claude Desktop, você deve ver as seguintes ferramentas disponíveis:

- **docker-mcp**: Ferramentas para gerenciar containers Docker
- **filesystem**: Ferramentas para operações de arquivo
- **mysql-mcp**: Acesso ao banco MySQL
- **postgres-mcp**: Acesso ao banco PostgreSQL

## Comandos Úteis

### Verificar Logs dos Serviços MCP

```bash
# Logs do MCP Docker
docker-compose logs mcp-docker

# Logs do MCP Filesystem
docker-compose logs mcp-filesystem
```

### Reiniciar Serviços MCP

```bash
# Reiniciar apenas os serviços MCP
docker-compose restart mcp-docker mcp-filesystem
```

### Parar Serviços MCP

```bash
# Parar apenas os serviços MCP
docker-compose stop mcp-docker mcp-filesystem
```

## Exemplos de Uso com Claude

### 1. Gerenciar Containers
```
"Liste todos os containers em execução no projeto"
"Mostre os logs do container metas_mysql"
"Crie um novo container nginx"
```

### 2. Operações de Arquivo
```
"Liste os arquivos na pasta src/"
"Leia o conteúdo do arquivo package.json"
"Crie um novo arquivo de configuração"
```

### 3. Consultas de Banco de Dados
```
"Conecte ao MySQL e mostre as tabelas disponíveis"
"Execute uma consulta no PostgreSQL"
```

## Segurança

- Os serviços MCP rodam em containers isolados <mcreference link="https://www.docker.com/blog/announcing-docker-mcp-catalog-and-toolkit-beta/" index="3">3</mcreference>
- Acesso ao Docker socket é limitado ao container MCP Docker
- Acesso ao filesystem é restrito ao workspace do projeto
- Credenciais de banco são gerenciadas via variáveis de ambiente

## Troubleshooting

### Problema: Serviços MCP não iniciam
```bash
# Verificar se o Docker está rodando
docker --version

# Verificar logs de erro
docker-compose logs mcp-docker
docker-compose logs mcp-filesystem
```

### Problema: Claude não reconhece os serviços MCP
1. Verifique se a configuração foi copiada corretamente
2. Reinicie o Claude Desktop
3. Verifique se os containers estão rodando: `docker-compose ps`

### Problema: Permissões de acesso
- No Windows, certifique-se de que o Docker Desktop está rodando
- No Linux/macOS, verifique as permissões do socket Docker

## Recursos Adicionais

- [Documentação oficial do MCP](https://modelcontextprotocol.io/)
- [Docker MCP Catalog](https://hub.docker.com/search?q=mcp) <mcreference link="https://www.docker.com/blog/announcing-docker-mcp-catalog-and-toolkit-beta/" index="3">3</mcreference>
- [Repositório docker-mcp](https://github.com/QuantGeekDev/docker-mcp) <mcreference link="https://github.com/QuantGeekDev/docker-mcp" index="5">5</mcreference>

## Próximos Passos

Para expandir a funcionalidade MCP, considere adicionar:

1. **MCP GitHub Server**: Para integração com repositórios GitHub <mcreference link="https://dev.to/aws/running-model-context-protocol-mcp-servers-on-containers-using-finch-kj8" index="2">2</mcreference>
2. **MCP Slack Server**: Para integração com Slack
3. **MCP Redis Server**: Para cache e sessões
4. **Servidores MCP customizados**: Para funcionalidades específicas do projeto

Cada novo servidor pode ser adicionado ao `docker-compose.yml` seguindo o mesmo padrão dos serviços existentes.