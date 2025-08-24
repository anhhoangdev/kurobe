#!/usr/bin/env python3
"""
Kurobe BI Platform - Start/Stop Script
Similar to the reference Suna start.py
"""
import subprocess
import sys
import os
import time
import signal
from pathlib import Path


class Colors:
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_banner():
    """Print the Kurobe banner."""
    print(f"""
{Colors.BLUE}{Colors.BOLD}
   ██╗  ██╗██╗   ██╗██████╗  ██████╗ ██████╗ ███████╗
   ██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗██╔══██╗██╔════╝
   █████╔╝ ██║   ██║██████╔╝██║   ██║██████╔╝█████╗  
   ██╔═██╗ ██║   ██║██╔══██╗██║   ██║██╔══██╗██╔══╝  
   ██║  ██╗╚██████╔╝██║  ██║╚██████╔╝██████╔╝███████╗
   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
                                                      
   BI Chat Platform - v0.1.0
{Colors.ENDC}
""")


def check_docker():
    """Check if Docker is running."""
    try:
        subprocess.run(
            ["docker", "info"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False


def start_infrastructure():
    """Start PostgreSQL and Redis using Docker Compose."""
    print(f"{Colors.YELLOW}Starting infrastructure services...{Colors.ENDC}")
    
    if not check_docker():
        print(f"{Colors.RED}❌ Docker is not running. Please start Docker and try again.{Colors.ENDC}")
        return False
    
    # Try modern docker compose first, then fallback to docker-compose
    commands = [
        ["docker", "compose", "up", "-d", "postgres", "redis"],
        ["docker-compose", "up", "-d", "postgres", "redis"]
    ]
    
    for cmd in commands:
        try:
            subprocess.run(cmd, check=True)
            print(f"{Colors.GREEN}✅ Infrastructure services started{Colors.ENDC}")
            
            # Wait for services to be ready
            print(f"{Colors.YELLOW}Waiting for services to be ready...{Colors.ENDC}")
            time.sleep(5)
            
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            continue
    
    print(f"{Colors.RED}❌ Failed to start infrastructure. Make sure Docker Compose is installed.{Colors.ENDC}")
    print(f"{Colors.YELLOW}Try installing: pip install docker-compose or use Docker Desktop{Colors.ENDC}")
    return False


def stop_infrastructure():
    """Stop Docker Compose services."""
    print(f"{Colors.YELLOW}Stopping infrastructure services...{Colors.ENDC}")
    
    # Try modern docker compose first, then fallback to docker-compose
    commands = [
        ["docker", "compose", "down"],
        ["docker-compose", "down"]
    ]
    
    for cmd in commands:
        try:
            subprocess.run(cmd, check=True)
            print(f"{Colors.GREEN}✅ Infrastructure services stopped{Colors.ENDC}")
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            continue
    
    print(f"{Colors.RED}❌ Failed to stop infrastructure{Colors.ENDC}")
    return False


def run_migrations():
    """Run database migrations."""
    print(f"{Colors.YELLOW}Running database migrations...{Colors.ENDC}")
    
    # Check if backend directory exists
    if not Path("backend").exists():
        print(f"{Colors.RED}❌ Backend directory not found{Colors.ENDC}")
        return False
    
    try:
        # Run migrations using alembic
        subprocess.run(
            ["python", "-m", "alembic", "upgrade", "head"],
            cwd="backend",
            check=True
        )
        print(f"{Colors.GREEN}✅ Database migrations completed{Colors.ENDC}")
        return True
    except subprocess.SubprocessError as e:
        print(f"{Colors.YELLOW}⚠️ Migration failed (this is OK for first run): {e}{Colors.ENDC}")
        return True  # Continue anyway


def start_backend():
    """Start the backend API server."""
    print(f"{Colors.YELLOW}Starting backend API server...{Colors.ENDC}")
    
    if not Path("backend").exists():
        print(f"{Colors.RED}❌ Backend directory not found{Colors.ENDC}")
        return None
    
    # Check if .env file exists
    if not Path("backend/.env").exists():
        print(f"{Colors.YELLOW}⚠️ Creating basic .env file...{Colors.ENDC}")
        env_content = """# Kurobe Backend Configuration
ENVIRONMENT=development
DEBUG=true
POSTGRES_SERVER=localhost
POSTGRES_USER=kurobe
POSTGRES_PASSWORD=kurobe
POSTGRES_DB=kurobe
POSTGRES_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
SECRET_KEY=development-secret-key-change-in-production
API_KEY_PREFIX=kb_
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
        with open("backend/.env", "w") as f:
            f.write(env_content)
        print(f"{Colors.GREEN}✅ Created backend/.env file{Colors.ENDC}")
    
    try:
        # Start backend with uvicorn - try different python commands
        for python_cmd in ["python", "python3", "python3.11"]:
            try:
                process = subprocess.Popen(
                    [python_cmd, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
                    cwd="backend"
                )
                print(f"{Colors.GREEN}✅ Backend API server started (PID: {process.pid}){Colors.ENDC}")
                return process
            except FileNotFoundError:
                continue
        
        print(f"{Colors.RED}❌ No suitable Python interpreter found{Colors.ENDC}")
        return None
    except Exception as e:
        print(f"{Colors.RED}❌ Failed to start backend: {e}{Colors.ENDC}")
        return None


def start_frontend():
    """Start the frontend development server."""
    print(f"{Colors.YELLOW}Starting frontend development server...{Colors.ENDC}")
    
    if not Path("frontend").exists():
        print(f"{Colors.YELLOW}⚠️ Frontend directory not found, skipping...{Colors.ENDC}")
        return None
    
    try:
        # Start frontend with npm
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd="frontend"
        )
        print(f"{Colors.GREEN}✅ Frontend server started (PID: {process.pid}){Colors.ENDC}")
        return process
    except Exception as e:
        print(f"{Colors.RED}❌ Failed to start frontend: {e}{Colors.ENDC}")
        return None


def main():
    """Main function."""
    print_banner()
    
    if len(sys.argv) > 1 and sys.argv[1] == "stop":
        print(f"{Colors.YELLOW}Stopping Kurobe services...{Colors.ENDC}")
        stop_infrastructure()
        print(f"{Colors.GREEN}✅ Kurobe stopped{Colors.ENDC}")
        return
    
    print(f"{Colors.BLUE}Starting Kurobe BI Platform...{Colors.ENDC}\n")
    
    # Start infrastructure
    if not start_infrastructure():
        sys.exit(1)
    
    # Run migrations
    run_migrations()
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print(f"{Colors.RED}❌ Failed to start backend, stopping...{Colors.ENDC}")
        stop_infrastructure()
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}🚀 Kurobe is now running!{Colors.ENDC}")
    print(f"{Colors.BLUE}Backend API: http://localhost:8000{Colors.ENDC}")
    print(f"{Colors.BLUE}API Documentation: http://localhost:8000/api/v1/docs{Colors.ENDC}")
    if frontend_process:
        print(f"{Colors.BLUE}Frontend Dashboard: http://localhost:3000{Colors.ENDC}")
    else:
        print(f"{Colors.YELLOW}Frontend not started. Run 'cd frontend && npm install && npm run dev' to start it.{Colors.ENDC}")
    
    print(f"\n{Colors.YELLOW}Press Ctrl+C to stop all services{Colors.ENDC}")
    
    # Wait for interrupt
    processes = [p for p in [backend_process, frontend_process] if p]
    
    def signal_handler(sig, frame):
        print(f"\n{Colors.YELLOW}Shutting down Kurobe...{Colors.ENDC}")
        for process in processes:
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        stop_infrastructure()
        print(f"{Colors.GREEN}✅ Kurobe stopped{Colors.ENDC}")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Wait for processes
    try:
        for process in processes:
            process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)


if __name__ == "__main__":
    main()
