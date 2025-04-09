#!/bin/bash

# Colors for better terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Main directory
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Services to test
SERVICES=("user-service" "product-service" "api-gateway" "libs")

# Function to print header with service name
print_header() {
  echo -e "\n${BLUE}======================================================${NC}"
  echo -e "${BLUE}  Running tests for: ${YELLOW}$1${NC}"
  echo -e "${BLUE}======================================================${NC}\n"
}

# Function to run npm tests in a directory
run_tests() {
  local service_dir="$1"
  local test_type="$2"
  local test_command="$3"

  echo -e "${YELLOW}Running $test_type tests...${NC}"
  cd "$service_dir" || { 
    echo -e "${RED}Failed to change directory to $service_dir${NC}" 
    return 1
  }

  echo -e "${BLUE}Executing: ${YELLOW}npm run $test_command${NC}"
  if npm run "$test_command" --if-present; then
    echo -e "${GREEN}✓ $test_type tests passed${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_type tests failed${NC}"
    return 1
  fi
}

# Function to check for and install dependencies if needed
check_dependencies() {
  local service_dir="$1"
  
  cd "$service_dir" || return 1
  
  if [ ! -d "node_modules" ] || [ ! -f "node_modules/.modules.yaml" ]; then
    echo -e "${YELLOW}Installing dependencies for $(basename "$service_dir")...${NC}"
    npm install
  fi
}

# Main execution
echo -e "${BLUE}==========================================================${NC}"
echo -e "${GREEN}      RUNNING ALL TESTS FOR NESTJS MICROSERVICES${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Track overall success
OVERALL_SUCCESS=true
FAILED_TESTS=()

# Run the tests for each service
for service in "${SERVICES[@]}"; do
  service_dir="$ROOT_DIR/$service"
  
  # Skip if service directory doesn't exist
  if [ ! -d "$service_dir" ]; then
    echo -e "${YELLOW}Directory for $service does not exist, skipping...${NC}"
    continue
  fi
  
  print_header "$service"
  
  # Check dependencies
  check_dependencies "$service_dir"
  
  # Run unit tests
  if ! run_tests "$service_dir" "Unit" "test"; then
    OVERALL_SUCCESS=false
    FAILED_TESTS+=("$service - unit tests")
  fi
  
  # Run integration/e2e tests
  if [ -f "$service_dir/test/jest-e2e.json" ]; then
    if ! run_tests "$service_dir" "E2E/Integration" "test:e2e"; then
      OVERALL_SUCCESS=false
      FAILED_TESTS+=("$service - e2e/integration tests")
    fi
  else
    echo -e "${YELLOW}No E2E test configuration found for $service, skipping...${NC}"
  fi
  
  echo ""
done

# Print summary
echo -e "${BLUE}==========================================================${NC}"
echo -e "${BLUE}                     TEST SUMMARY${NC}"
echo -e "${BLUE}==========================================================${NC}"

if [ "$OVERALL_SUCCESS" = true ]; then
  echo -e "${GREEN}✓ All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed:${NC}"
  for failed in "${FAILED_TESTS[@]}"; do
    echo -e "${RED}  - $failed${NC}"
  done
  exit 1
fi