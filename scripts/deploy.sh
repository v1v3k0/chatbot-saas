#!/bin/bash

# P2P Lending Platform Deployment Script
# This script automates the deployment process for both frontend and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    print_success "All dependencies are available"
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Install dependencies
    npm ci
    
    # Run type check
    print_status "Running type check..."
    npm run type-check
    
    # Run linting
    print_status "Running linting..."
    npm run lint
    
    # Build the application
    print_status "Building Next.js application..."
    npm run build
    
    print_success "Application built successfully"
}

# Deploy to Supabase
deploy_backend() {
    print_status "Deploying backend to Supabase..."
    
    # Check if Supabase project is linked
    if [ ! -f ".supabase/config.toml" ]; then
        print_error "Supabase project not initialized. Please run 'supabase init' first."
        exit 1
    fi
    
    # Deploy database migrations
    print_status "Deploying database migrations..."
    supabase db push
    
    # Deploy Edge Functions
    print_status "Deploying Edge Functions..."
    supabase functions deploy
    
    print_success "Backend deployed successfully"
}

# Deploy to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Check if Vercel project is linked
    if [ ! -f ".vercel/project.json" ]; then
        print_warning "Vercel project not linked. Please run 'vercel link' first."
        print_status "Linking to Vercel..."
        vercel link
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Frontend deployed successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if npm run test; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Set up environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from template..."
        cp .env.local.example .env.local
        print_warning "Please update .env.local with your actual values"
    fi
    
    # Check if required environment variables are set
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "$var is not set in environment"
        fi
    done
}

# Main deployment function
main() {
    print_status "Starting P2P Lending Platform deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_env
    
    # Run tests
    run_tests
    
    # Build application
    build_app
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    print_success "Deployment completed successfully!"
    print_status "Your application is now live!"
    print_status "Frontend: https://your-app.vercel.app"
    print_status "Backend: $NEXT_PUBLIC_SUPABASE_URL"
}

# Parse command line arguments
case "${1:-all}" in
    "backend")
        check_dependencies
        setup_env
        deploy_backend
        ;;
    "frontend")
        check_dependencies
        setup_env
        build_app
        deploy_frontend
        ;;
    "build")
        check_dependencies
        setup_env
        build_app
        ;;
    "test")
        check_dependencies
        setup_env
        run_tests
        ;;
    "all"|*)
        main
        ;;
esac