# ClientSphere

> A free, open-source, customizable CRM for small businesses.

## Quick Start

```bash
# Clone
git clone https://github.com/rkbart/clientsphere.git
cd clientsphere

# Start with Docker
docker compose up

# Or start manually
cd apps/api && bundle install && bin/rails db:setup && bin/rails server
cd apps/web && pnpm install && pnpm dev
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Setup](docs/SETUP.md)
- [Tutorial](docs/TUTORIAL.md)
- [Features](docs/FEATURES.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Tech Decisions](docs/TECH-DECISIONS.md)
- [Dependencies](docs/DEPENDENCIES.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](docs/SECURITY.md)
- [Privacy](docs/PRIVACY.md)

## Stack

Ruby 3.4 · Rails 8.1 · Next.js · React · Tailwind CSS · PostgreSQL · TanStack Query · Zustand · openapi-fetch

## Support

- [Buy Me a Coffee](https://www.buymeacoffee.com/rkbart)
- [GitHub](https://github.com/rkbart)

## License

MIT
