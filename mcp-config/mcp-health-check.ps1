# Script de Verificação de Saúde dos Serviços MCP
# Execute para verificar se todos os serviços MCP estão funcionando corretamente

Write-Host "=== Verificação de Saúde MCP ===" -ForegroundColor Green

# Função para verificar se um container está rodando
function Test-ContainerHealth {
    param(
        [string]$ContainerName,
        [int]$ExpectedPort = $null
    )
    
    Write-Host "Verificando $ContainerName..." -ForegroundColor Yellow
    
    # Verificar se container existe e está rodando
    $containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
    
    if ($containerStatus) {
        Write-Host "  ✓ Container está rodando: $containerStatus" -ForegroundColor Green
        
        # Verificar logs recentes para erros
        $recentLogs = docker logs --tail 10 $ContainerName 2>&1
        $errorCount = ($recentLogs | Select-String -Pattern "error|Error|ERROR" | Measure-Object).Count
        
        if ($errorCount -eq 0) {
            Write-Host "  ✓ Nenhum erro encontrado nos logs recentes" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $errorCount erro(s) encontrado(s) nos logs recentes" -ForegroundColor Yellow
        }
        
        # Verificar porta se especificada
        if ($ExpectedPort) {
            $portTest = Test-NetConnection -ComputerName localhost -Port $ExpectedPort -WarningAction SilentlyContinue
            if ($portTest.TcpTestSucceeded) {
                Write-Host "  ✓ Porta $ExpectedPort está acessível" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Porta $ExpectedPort não está acessível" -ForegroundColor Red
            }
        }
        
        return $true
    } else {
        Write-Host "  ✗ Container não está rodando" -ForegroundColor Red
        return $false
    }
}

# Verificar serviços principais
$services = @(
    @{Name="metas_mysql"; Port=3306},
    @{Name="metas_postgres"; Port=5432},
    @{Name="metas_adminer"; Port=8080}
)

Write-Host "`n--- Serviços Principais ---" -ForegroundColor Cyan
foreach ($service in $services) {
    Test-ContainerHealth -ContainerName $service.Name -ExpectedPort $service.Port
}

# Verificar serviços MCP
$mcpServices = @(
    @{Name="metas_mcp_docker"; Port=3001},
    @{Name="metas_mcp_filesystem"; Port=3002}
)

Write-Host "`n--- Serviços MCP ---" -ForegroundColor Cyan
$mcpHealthy = $true
foreach ($service in $mcpServices) {
    $result = Test-ContainerHealth -ContainerName $service.Name -ExpectedPort $service.Port
    if (-not $result) {
        $mcpHealthy = $false
    }
}

# Verificar configuração Claude Desktop
Write-Host "`n--- Configuração Claude Desktop ---" -ForegroundColor Cyan
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"

if (Test-Path $claudeConfigPath) {
    Write-Host "✓ Arquivo de configuração Claude encontrado" -ForegroundColor Green
    
    try {
        $claudeConfig = Get-Content $claudeConfigPath | ConvertFrom-Json
        
        if ($claudeConfig.mcpServers) {
            $serverCount = ($claudeConfig.mcpServers | Get-Member -MemberType NoteProperty).Count
            Write-Host "✓ $serverCount servidor(es) MCP configurado(s)" -ForegroundColor Green
            
            # Listar servidores configurados
            $claudeConfig.mcpServers | Get-Member -MemberType NoteProperty | ForEach-Object {
                Write-Host "  - $($_.Name)" -ForegroundColor White
            }
        } else {
            Write-Host "⚠ Nenhum servidor MCP configurado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Erro ao ler configuração Claude" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Configuração Claude Desktop não encontrada" -ForegroundColor Yellow
    Write-Host "  Copie mcp-config/claude_desktop_config.json para:" -ForegroundColor White
    Write-Host "  $claudeConfigPath" -ForegroundColor Yellow
}

# Verificar conectividade de rede
Write-Host "`n--- Conectividade de Rede ---" -ForegroundColor Cyan
$networkName = "metas2.6_metas_network"
$networkExists = docker network ls --filter "name=$networkName" --format "{{.Name}}"

if ($networkExists) {
    Write-Host "✓ Rede Docker '$networkName' existe" -ForegroundColor Green
    
    # Verificar containers na rede
    $containersInNetwork = docker network inspect $networkName | ConvertFrom-Json | ForEach-Object { $_.Containers }
    $containerCount = ($containersInNetwork | Get-Member -MemberType NoteProperty).Count
    
    Write-Host "✓ $containerCount container(s) conectado(s) à rede" -ForegroundColor Green
} else {
    Write-Host "✗ Rede Docker não encontrada" -ForegroundColor Red
}

# Resumo final
Write-Host "`n=== Resumo ===" -ForegroundColor Green

if ($mcpHealthy) {
    Write-Host "✓ Todos os serviços MCP estão funcionando corretamente" -ForegroundColor Green
    Write-Host "✓ Sistema pronto para uso com Claude Desktop" -ForegroundColor Green
} else {
    Write-Host "✗ Alguns serviços MCP apresentam problemas" -ForegroundColor Red
    Write-Host "Execute 'docker-compose up -d' para tentar resolver" -ForegroundColor Yellow
}

# Comandos úteis
Write-Host "`n--- Comandos Úteis ---" -ForegroundColor Cyan
Write-Host "Reiniciar todos os serviços: docker-compose restart" -ForegroundColor White
Write-Host "Ver logs de um serviço:     docker-compose logs [nome-do-serviço]" -ForegroundColor White
Write-Host "Parar todos os serviços:   docker-compose down" -ForegroundColor White
Write-Host "Iniciar todos os serviços: docker-compose up -d" -ForegroundColor White