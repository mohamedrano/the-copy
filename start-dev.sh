#!/bin/bash

# Function to detect available terminal
open_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="$1" --working-directory="$2" -- bash -c "$3; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -T "$1" -e "cd $2 && $3; bash" &
    elif command -v konsole &> /dev/null; then
        konsole --new-tab --workdir "$2" -e bash -c "$3; exec bash" &
    else
        echo "Opening $1 in background..."
        cd "$2" && $3 &
        cd - > /dev/null
    fi
}

# Start backend
open_terminal "Backend" "$(pwd)/backend" "npm run dev"

# Start frontend
open_terminal "Frontend" "$(pwd)/frontend" "npm run dev"

echo "Starting development servers..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:9002"