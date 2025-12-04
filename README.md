# LinkU - Lightweight LinkedIn-style Network App

A student/alumni networking app with authentication, profiles, posting, comments, likes, connections, and search.

What it does:
1. Auth: Sign up, verify password rules, log in, protected pages.
2. Profiles: Edit name, position, location, about, education, skills, avatar URL.
3. Feed & Posts: Create posts, like/unlike, comment, reply to comments, and delete posts/comments.
4. Connections: Send/accept/decline connection requrests, view "My Network," notifications badge.
5. Search: Find users by name/email/position; search posts by text/author.

Quickstart:
Requirements:
Node.js (tested on v22.21.0)
npm (tested on 10.9.4)
macOS/Linux; Windows users: recommended WSL2 for smooth Node tooling.

Environment variable: 
create a .env in backend/:


create a .env in frontend/:
VITE_API_BASE_URL=http://localhost:4000

Install:
Run setup.sh for a one-step setup. If you prefer doing it manually, run the following commands from the repo root:
cd backend && npm install
cd ../frontend && npm install
cd ..

Run(dev):
At repo root:
./dev.sh

This starts Backend on http://localhost:4000 and Frontend on http://localhost:5173

Tests:
We use Playwright E2E tests:

1. Install test deps in repo root:
npm install -D @playwright/test
npx playwright install
2. Ensure the frontend/backend are running, and run tests.
