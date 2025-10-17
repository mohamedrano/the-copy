#!/bin/bash
cd /home/user/the-copy
export PATH="/home/user/.global_modules/bin:$PATH"

# Check if vite is in node_modules
if [ -f "node_modules/.bin/vite" ]; then
    echo "Starting Vite dev server..."
    node_modules/.bin/vite --host localhost --port 5177
else
    echo "Installing vite..."
    npm install vite@latest @vitejs/plugin-react@latest --save-dev
    node_modules/.bin/vite --host localhost --port 5177
fi
