#!/bin/bash

# Colors for better terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Main directory
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Default services to test
DEFAULT_SERVICES=("user-service" "product-service" "api-gateway" "libs")
SERVICES=()

# Default test types
RUN_UNIT=true
RUN_E2E=true
RUN_COVERAGE=false

# Function to print usage
print_usage() {
  echo -e "${BLUE}Usage: $0 [options]${NC}"
  echo -e "${BLUE}Options:${NC}"
  echo -e "  ${GREEN}-s, --service${NC} SERVICE    Run tests for specific service (can be used multiple times)"
  echo -e "  ${GREEN}-u, --unit${NC}               Run only unit tests"
  echo -e "  ${GREEN}-e, --e2e${NC}                Run only e2e/integration tests"
  echo -e "  ${GREEN}-c, --coverage${NC}           Run tests with coverage"
  echo -e "  ${GREEN}-h, --help${NC}               Print this help message"
  echo -e "\n${BLUE}Available services:${NC} user-service, product-service, api-gateway, libs"
  echo -e "\n${BLUE}Examples:${NC}"
  echo -e "  $0                                   # Run all tests for all services"
  echo -e "  $0 -s user-service -s api-gateway    # Run all tests for user-service and api-gateway only"
  echo -e "  $0 -u                                # Run only unit tests for all services"
  echo -e "  $0 -s product-service -e             # Run only e2e tests for product-service"
  echo -e "  $0 -c                                # Run all tests with coverage"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -s|--service)
      SERVICES+=("$2")
      shift 2
      ;;
    -u|--unit)
      RUN_UNIT=true
      RUN_E2E=false
      shift
      ;;
    -e|--e2e)
      RUN_UNIT=false
      RUN_E2E=true
      shift
      ;;
    -c|--coverage)
      RUN_COVERAGE=true
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option: $1${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# If no services specified, use defaults
if [ ${#SERVICES[@]} -eq 0 ]; then
  SERVICES=("${DEFAULT_SERVICES[@]}")
fi

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
echo -e "${GREEN}      RUNNING SELECTED TESTS FOR NESTJS MICROSERVICES${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Print selected options
echo -e "${BLUE}Services to test:${NC} ${YELLOW}${SERVICES[*]}${NC}"
test_types=""
[ "$RUN_UNIT" = true ] && test_types+="Unit "
[ "$RUN_E2E" = true ] && test_types+="E2E/Integration "
[ "$RUN_COVERAGE" = true ] && test_types+="with coverage "
echo -e "${BLUE}Test types:${NC} ${YELLOW}${test_types}${NC}"
echo ""

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
  if [ "$RUN_UNIT" = true ]; then
    if [ "$RUN_COVERAGE" = true ]; then
      if ! run_tests "$service_dir" "Unit (with coverage)" "test:cov"; then
        OVERALL_SUCCESS=false
        FAILED_TESTS+=("$service - unit tests with coverage")
      fi
    else
      if ! run_tests "$service_dir" "Unit" "test"; then
        OVERALL_SUCCESS=false
        FAILED_TESTS+=("$service - unit tests")
      fi
    fi
  fi
  
  # Run integration/e2e tests
  if [ "$RUN_E2E" = true ] && [ -f "$service_dir/test/jest-e2e.json" ]; then
    if ! run_tests "$service_dir" "E2E/Integration" "test:e2e"; then
      OVERALL_SUCCESS=false
      FAILED_TESTS+=("$service - e2e/integration tests")
    fi
  elif [ "$RUN_E2E" = true ]; then
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