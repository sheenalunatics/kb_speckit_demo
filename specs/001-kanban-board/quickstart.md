# Kanban Board - Quick Start Guide

This guide will help you set up and run the Kanban Board application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17.0 or higher)
- **npm** (v9.0.0 or higher) or **pnpm** (v8.0.0 or higher)
- **Git** (for version control)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kanban-board
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using pnpm (recommended for faster installs):

```bash
pnpm install
```

### 3. Initialize Database

The project uses SQLite as the database. Run the initialization script to create the database schema:

```bash
npm run db:init
```

This will:

- Create `kanban.db` in the project root
- Execute all SQL DDL statements from `data-model.md`
- Create tables, indexes, and triggers
- Optionally seed sample data for development

### 4. Environment Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following variables:

```env
# Database Configuration
DATABASE_URL=./kanban.db

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

- Hot reload enabled for instant feedback
- API routes available at `/api/*`
- TypeScript type checking in watch mode

### Build for Production

```bash
npm run build
```

This will:

- Compile TypeScript to JavaScript
- Optimize React components
- Generate static pages
- Create production-ready bundles in `.next/`

### Start Production Server

```bash
npm run start
```

Access the production build at: **http://localhost:3000**

## Testing

### Run Unit Tests

```bash
npm run test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

### Run E2E Tests

```bash
npm run test:e2e
```

For headed mode (see browser):

```bash
npm run test:e2e:headed
```

### Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Database Management

### Reset Database

To drop all tables and recreate from schema:

```bash
npm run db:reset
```

⚠️ **Warning**: This will delete all data!

### Seed Sample Data

To populate the database with test data:

```bash
npm run db:seed
```

This creates:

- 3 sample assignees
- 6 sample labels (Bug, Feature, Enhancement, etc.)
- 12 sample tasks across all columns
- Task history entries for time tracking

### Backup Database

```bash
npm run db:backup
```

Creates a timestamped backup in `backups/` directory.

### View Database

To inspect the SQLite database, you can use:

**VS Code Extension**:

- Install "SQLite Viewer" extension
- Right-click `kanban.db` → "Open Database"

**Command Line**:

```bash
sqlite3 kanban.db
.schema
.tables
SELECT * FROM tasks;
```

**GUI Tool**:

- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [TablePlus](https://tableplus.com/)

## Project Structure

```
kanban-board/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page (Kanban board)
│   │   ├── layout.tsx          # Root layout
│   │   └── api/                # API routes
│   │       ├── tasks/
│   │       ├── labels/
│   │       └── assignees/
│   ├── components/             # React components
│   │   ├── board/
│   │   ├── task/
│   │   ├── label/
│   │   └── ui/
│   ├── lib/                    # Shared utilities
│   │   ├── db/                 # Database layer
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper functions
│   └── context/                # React Context providers
├── specs/                      # Feature specifications
│   └── 001-kanban-board/
│       ├── spec.md
│       ├── data-model.md
│       └── contracts/
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── kanban.db                   # SQLite database (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Build production bundle                  |
| `npm run start`         | Start production server                  |
| `npm run lint`          | Run ESLint for code quality              |
| `npm run lint:fix`      | Auto-fix linting issues                  |
| `npm run type-check`    | Run TypeScript type checking             |
| `npm run format`        | Format code with Prettier                |
| `npm run test`          | Run unit tests with Jest                 |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:e2e`      | Run E2E tests with Playwright            |
| `npm run test:coverage` | Generate test coverage report            |
| `npm run db:init`       | Initialize database schema               |
| `npm run db:reset`      | Reset database (drop & recreate)         |
| `npm run db:seed`       | Seed sample data                         |
| `npm run db:backup`     | Create database backup                   |

## Common Tasks

### Adding a New Feature

1. Create feature spec in `specs/` directory
2. Update `data-model.md` if database changes needed
3. Run `npm run db:reset` to apply schema changes
4. Update TypeScript types in `contracts/types.ts`
5. Implement API routes in `src/app/api/`
6. Create React components in `src/components/`
7. Write tests in `tests/`
8. Update this quickstart if new setup steps required

### Debugging

**Enable Verbose Logging**:

```bash
DEBUG=* npm run dev
```

**Database Query Logging**:
In `.env.local`:

```env
DATABASE_DEBUG=true
```

**React DevTools**:

- Install React DevTools browser extension
- Inspect component tree, props, state

**API Route Debugging**:

- Add `console.log()` in API handlers
- Check terminal output where `npm run dev` is running

### Troubleshooting

**Port Already in Use**:

```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**Database Locked**:

```bash
# Close any open connections to kanban.db
# Restart development server
npm run dev
```

**TypeScript Errors**:

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Dependency Issues**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Mobile Development

The application is responsive and mobile-ready. To test on mobile devices:

### Using Local Network

1. Find your local IP address:

   ```bash
   # Windows
   ipconfig
   # macOS/Linux
   ifconfig
   ```

2. Start dev server with hostname:

   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. Access from mobile device on same network:
   ```
   http://<your-ip>:3000
   ```

### Using Browser DevTools

1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select mobile device or responsive mode

## Next Steps

- Read `specs/001-kanban-board/spec.md` for feature requirements
- Review `data-model.md` for database schema
- Check `contracts/api-spec.yaml` for API documentation
- Explore `contracts/types.ts` for TypeScript interfaces
- See `plan.md` for implementation roadmap

## Support

For issues or questions:

- Check `specs/001-kanban-board/` documentation
- Review existing GitHub issues
- Create new issue with reproduction steps
- Contact team via Slack channel

---

**Happy coding! 🚀**
