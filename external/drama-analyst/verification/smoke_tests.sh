#!/bin/bash
BASE_URL="http://localhost:4173"

echo "=== Smoke Tests ==="

# Test 1: Homepage loads
if curl -s -o /dev/null -w "%{http_code}" $BASE_URL | grep -q "200"; then
  echo "✓ Homepage loads (200 OK)"
else
  echo "✗ Homepage failed"
  exit 1
fi

# Test 2: Check bundle loads
if curl -s $BASE_URL | grep -q "index.*\.js"; then
  echo "✓ JavaScript bundle referenced"
else
  echo "✗ No JS bundle found"
  exit 1
fi

# Test 3: No console errors (requires headless browser - optional)
echo "✓ Smoke tests passed"


