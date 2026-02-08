# Contributing to VoxFlow

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/voxflow/voxflow.git
cd voxflow

# Install dependencies
npm install

# Start in development mode
npm start
```

## Code Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- Functional components with hooks (React)
- All business logic in main process, UI in renderer

## Pull Request Process

1. Fork the repo and create a branch from `develop`
2. Write clear, descriptive commit messages
3. Add tests for new features
4. Run `npm run typecheck && npm run lint && npm test`
5. Open a PR against `develop`

## Reporting Bugs

Use the [Bug Report template](https://github.com/voxflow/voxflow/issues/new?template=bug_report.md).

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great.
