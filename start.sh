#!/bin/bash
# Start the RAG system with auto-presentation generation
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Slide Design RAG System ==="
echo "Features: Chat + Auto-Generate Presentations"
echo ""

# Ensure Node.js deps are installed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "Installing Node.js dependencies..."
  cd "$SCRIPT_DIR" && npm install
  echo ""
fi

# Create output directory
mkdir -p "$SCRIPT_DIR/output"

echo "Starting server on http://localhost:8000"
echo ""

cd "$SCRIPT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
