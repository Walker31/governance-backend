# Docker management scripts for AI Governance Backend (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Function to check if Docker Compose is available
function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    }
}

# Development environment
function Start-DevEnvironment {
    Write-Status "Starting development environment..."
    Test-Docker
    Test-DockerCompose
    docker-compose -f docker-compose.dev.yml up --build
}

function Stop-DevEnvironment {
    Write-Status "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    Write-Success "Development environment stopped"
}

function Show-DevLogs {
    Write-Status "Showing development logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Production environment
function Start-ProdEnvironment {
    Write-Status "Starting production environment..."
    Test-Docker
    Test-DockerCompose
    docker-compose up --build -d
    Write-Success "Production environment started"
}

function Stop-ProdEnvironment {
    Write-Status "Stopping production environment..."
    docker-compose down
    Write-Success "Production environment stopped"
}

function Show-ProdLogs {
    Write-Status "Showing production logs..."
    docker-compose logs -f
}

# Database operations
function Open-DatabaseShell {
    Write-Status "Opening MongoDB shell..."
    docker exec -it governance-mongodb mongosh -u admin -p password123
}

function Seed-Data {
    Write-Status "Seeding database with sample data..."
    docker exec -it governance-backend npm run seed
    Write-Success "Database seeded successfully"
}

function Seed-Users {
    Write-Status "Seeding users..."
    docker exec -it governance-backend npm run seed:users
    Write-Success "Users seeded successfully"
}

# Cleanup operations
function Clear-DockerResources {
    Write-Warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    $response = Read-Host
    if ($response -match "^[yY]$") {
        Write-Status "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Success "Cleanup completed"
    }
    else {
        Write-Status "Cleanup cancelled"
    }
}

# Health check
function Test-Health {
    Write-Status "Checking application health..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
        else {
            Write-Error "Backend is not responding correctly"
        }
    }
    catch {
        Write-Error "Backend is not responding"
    }
    
    $mongodbRunning = docker ps | Select-String "mongodb"
    if ($mongodbRunning) {
        Write-Success "MongoDB is running"
    }
    else {
        Write-Error "MongoDB is not running"
    }
}

# Show usage
function Show-Usage {
    Write-Host "Usage: .\docker-scripts.ps1 -Command {dev_up|dev_down|dev_logs|prod_up|prod_down|prod_logs|db_shell|seed_data|seed_users|cleanup|health_check}"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev_up       - Start development environment"
    Write-Host "  dev_down     - Stop development environment"
    Write-Host "  dev_logs     - Show development logs"
    Write-Host "  prod_up      - Start production environment"
    Write-Host "  prod_down    - Stop production environment"
    Write-Host "  prod_logs    - Show production logs"
    Write-Host "  db_shell     - Open MongoDB shell"
    Write-Host "  seed_data    - Seed database with sample data"
    Write-Host "  seed_users   - Seed users"
    Write-Host "  cleanup      - Clean up Docker resources"
    Write-Host "  health_check - Check application health"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-scripts.ps1 -Command dev_up"
    Write-Host "  .\docker-scripts.ps1 -Command prod_up"
    Write-Host "  .\docker-scripts.ps1 -Command health_check"
}

# Main script logic
switch ($Command) {
    "dev_up" {
        Start-DevEnvironment
    }
    "dev_down" {
        Stop-DevEnvironment
    }
    "dev_logs" {
        Show-DevLogs
    }
    "prod_up" {
        Start-ProdEnvironment
    }
    "prod_down" {
        Stop-ProdEnvironment
    }
    "prod_logs" {
        Show-ProdLogs
    }
    "db_shell" {
        Open-DatabaseShell
    }
    "seed_data" {
        Seed-Data
    }
    "seed_users" {
        Seed-Users
    }
    "cleanup" {
        Clear-DockerResources
    }
    "health_check" {
        Test-Health
    }
    default {
        Show-Usage
        exit 1
    }
} 