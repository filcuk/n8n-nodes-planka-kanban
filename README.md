# n8n-nodes-planka-kanban

n8n community node for [Planka](https://github.com/plankanban/planka) v2. It exposes the full Planka REST API (100 endpoints) for workflow automation — projects, boards, cards, custom fields, attachments, notifications, users, webhooks, and more.

Published by [filcuk on npm](https://www.npmjs.com/~filcuk).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

**Self-hosted n8n** — install from npm:

```bash
npm install n8n-nodes-planka-kanban
```

Or search for **Planka** in **Settings → Community nodes** and install `n8n-nodes-planka-kanban`.

> **Note:** This package replaces the earlier community node [`n8n-nodes-plankav2`](https://www.npmjs.com/package/n8n-nodes-plankav2) (v0.x, partial API coverage). Use `n8n-nodes-planka-kanban` for full Planka v2 API support.

## Credentials

Create **Planka API** credentials with:

| Field | Description |
|-------|-------------|
| **Base URL** | Your Planka instance URL (e.g. `https://planka.example.com`) |
| **Authentication** | Email & password, or API key |
| **Email or Username** | Planka login (password auth) |
| **Password** | Planka password (password auth) |
| **API Key** | User API key via `X-Api-Key` header |

API keys can be created in Planka via **User → Create API Key** (or using this node's User resource).

## Resources

The node provides **26 resources** covering all Planka v2 API endpoints:

| Resource | Operations |
|----------|------------|
| Project | Create, Get, Get Many, Update, Delete |
| Board | Create, Get, Update, Delete |
| List | Create, Get, Update, Delete, Clear, Move Cards, Sort |
| Card | Create, Get, Get Many, Update, Delete, Duplicate, Mark Notifications Read |
| Comment | Create, Get Many, Update, Delete |
| Label | Create, Update, Delete, Add to Card, Remove From Card |
| Tasklist | Create, Get, Update, Delete |
| Task | Create, Update, Delete |
| Board Membership | Create, Update, Delete |
| Card Membership | Add, Remove |
| Action | Get Board Actions, Get Card Actions |
| Attachment | Create (file/link), Update, Delete |
| Notification | Get Many, Get, Update, Mark All Read |
| Base Custom Field Group | Create, Update, Delete |
| Custom Field Group | Create on Board/Card, Get, Update, Delete |
| Custom Field | Create in Base/Group, Update, Delete |
| Custom Field Value | Set, Clear |
| Project Manager | Create, Delete |
| Background Image | Upload, Delete |
| Notification Service | Create for Board/User, Update, Delete, Test |
| Access Token | Accept Terms, Exchange OIDC, Logout, Revoke Pending |
| Bootstrap | Get |
| Term | Get |
| User | Create, Get Many, Get, Update, Delete, Update Email/Username/Password, Create API Key, Upload Avatar |
| Config | Get, Update, Test SMTP |
| Webhook | Create, Get Many, Update, Delete |

**Card → Get Many** supports pagination plus optional filters: `search`, `userIds`, `labelIds`.

**File uploads** (attachments, background images, avatars) require a binary input — set the **Binary Property** field to the property name containing the file.

## Compatibility

- **Planka:** v2.x API ([Swagger reference](https://plankanban.github.io/planka/swagger-ui/#/))
- **n8n:** Tested with n8n 1.x / Node.js 22+
- **Node package API version:** 1

## Development

```bash
git clone https://github.com/filcuk/n8n-nodes-planka-v2.git
cd n8n-nodes-planka-v2
npm install
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Start n8n with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run n8n node linter |
| `npm run lint:fix` | Auto-fix lint issues |

## Publishing

```bash
npm login   # as filcuk on npmjs.com
npm publish
```

`prepublishOnly` runs build and lint automatically before publish.

## Resources

- [Planka](https://github.com/plankanban/planka)
- [Planka API docs](https://plankanban.github.io/planka/swagger-ui/#/)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)
- [npm: @filcuk/planka-mcp](https://www.npmjs.com/package/@filcuk/planka-mcp) — MCP server for Planka by the same author

## Version history

### 1.1.2

- Add position parameter to Label create and update operations (default: 65536)

### 1.1.1

- Fix schema mismatches: remove unsupported fields from list create and task create
- Align node parameters with Planka OpenAPI spec

### 1.0.0

- Full Planka v2 API coverage (100 endpoints)
- 26 resources with modular architecture
- Password and API key authentication
- Card search filters, multipart uploads, cursor pagination

## License

[MIT](LICENSE.md)
