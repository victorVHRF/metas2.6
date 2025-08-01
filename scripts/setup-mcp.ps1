# Script de Configuração MCP para Projeto Metas 2.6
# Execute este script para configurar automaticamente o MCP

Write-Host "=== Configuração MCP - Projeto Metas 2.6 ===" -ForegroundColor Green

# Verificar se Docker está instalado e rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando. Inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Criar diretório de configuração se não existir
if (!(Test-Path "mcp-config")) {
    New-Item -ItemType Directory -Path "mcp-config" -Force
    Write-Host "✓ Diretório mcp-config criado" -ForegroundColor Green
}

# Verificar se docker-compose.yml existe
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "✗ Arquivo docker-compose.yml não encontrado" -ForegroundColor Red
    exit 1
}

# Iniciar serviços Docker
Write-Host "Iniciando serviços Docker..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "✓ Serviços Docker iniciados" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao iniciar serviços Docker" -ForegroundColor Red
    exit 1
}

# Aguardar serviços iniciarem
Write-Host "Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos serviços MCP
Write-Host "Verificando status dos serviços MCP..." -ForegroundColor Yellow

$mcpServices = @("metas_mcp_docker", "metas_mcp_filesystem")
foreach ($service in $mcpServices) {
    $status = docker ps --filter "name=$service" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $service) {
        Write-Host "✓ $service está rodando" -ForegroundColor Green
    } else {
        Write-Host "✗ $service não está rodando" -ForegroundColor Red
    }
}

# Verificar portas
Write-Host "Verificando portas..." -ForegroundColor Yellow
$ports = @(3001, 3002)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✓ Porta $port está acessível" -ForegroundColor Green
    } else {
        Write-Host "⚠ Porta $port não está acessível" -ForegroundColor Yellow
    }
}

# Mostrar configuração para Claude Desktop
Write-Host "`n=== Configuração Claude Desktop ===" -ForegroundColor Cyan
Write-Host "Para usar com Claude Desktop, copie o arquivo:" -ForegroundColor White
Write-Host "mcp-config/claude_desktop_config.json" -ForegroundColor Yellow
Write-Host "Para:" -ForegroundColor White
Write-Host "%APPDATA%/Claude/claude_desktop_config.json" -ForegroundColor Yellow

# Mostrar comandos úteis
Write-Host "`n=== Comandos Úteis ===" -ForegroundColor Cyan
Write-Host "Ver logs MCP Docker:     docker-compose logs mcp-docker" -ForegroundColor White
Write-Host "Ver logs MCP Filesystem: docker-compose logs mcp-filesystem" -ForegroundColor White
Write-Host "Parar serviços MCP:     docker-compose stop mcp-docker mcp-filesystem" -ForegroundColor White
Write-Host "Reiniciar serviços MCP: docker-compose restart mcp-docker mcp-filesystem" -ForegroundColor White

# Verificar se Claude Desktop está instalado
$claudePath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $claudePath) {
    Write-Host "`n✓ Claude Desktop encontrado" -ForegroundColor Green
    
    # Perguntar se quer copiar configuração automaticamente
    $response = Read-Host "Deseja copiar a configuração MCP para Claude Desktop automaticamente? (s/n)"
    if ($response -eq "s" -or $response -eq "S") {
        try {
            Copy-Item "mcp-config\claude_desktop_config.json" $claudePath -Force
            Write-Host "✓ Configuração copiada para Claude Desktop" -ForegroundColor Green
            Write-Host "⚠ Reinicie o Claude Desktop para aplicar as mudanças" -ForegroundColor Yellow
        } catch {
            Write-Host "✗ Erro ao copiar configuração" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n⚠ Claude Desktop não encontrado" -ForegroundColor Yellow
    Write-Host "Instale o Claude Desktop e copie manualmente a configuração" -ForegroundColor White
}

Write-Host "`n=== Configuração MCP Concluída ===" -ForegroundColor Green
Write-Host "Consulte o arquivo MCP_SETUP.md para mais informações" -ForegroundColor White