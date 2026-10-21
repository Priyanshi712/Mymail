# MyMail — Production AI Email Agent

An intelligent, portfolio-grade AI email agent that organizes inbox messages, generates context-aware summaries, extracts action items and conclusions, surfaces messages requiring response, drafts replies with configurable tone, and schedules persistent follow-up reminders.

## 🛡️ Core Safety Rule
**Human-in-the-Loop by Default**: The AI copilot never dispatches an email, deletes a thread, or executes consequential actions without explicit user review and approval of the recipient, subject, and full message body.

## 🚀 Capabilities Roadmap
- [x] **A. Authentication**: Full signup, login, password visibility, reset flow with Supabase Auth & JWT.
- [x] **B. Application Shell & Navigation**: Messimo-inspired aesthetic (soft lime `#D3F49A`, forest green `#173D2B`, rounded cards, pill buttons, collapsible sidebar, global command palette, compose modal).
- [ ] **C. Dashboard Overview**: High-density inbox health, unread counts, pending replies, follow-ups due today.
- [ ] **D. Email Provider Connection**: Secure OAuth 2.0 with Gmail API (modular architecture for Outlook).
- [ ] **E. Inbox & Thread Viewer**: Thread inspection, message metadata, read/unread states, and pagination.
- [ ] **F. Search & Filtering**: Client & server filtering by sender, date range, read status, and labels.
- [ ] **G. AI Thread Summaries**: Structured distillation of long threads (topic, conclusions, open questions).
- [ ] **H. Action Items & Conclusions**: Extract actionable tasks, assignees, and deadlines.
- [ ] **I. Context-Aware AI Reply Drafting**: Multi-tone drafts (Professional, Friendly, Concise, Formal) with live editor.
- [ ] **J. Needs-Reply Detection**: Smart heuristic and AI-assisted classification of incoming emails.
- [ ] **K. Persistent Follow-up Reminders**: Server-side scheduled reminders, snooze, and overdue tracking.
- [ ] **L. Approved Email Sending**: Two-step confirmation modal with full payload inspection and error handling.
- [ ] **M. User Preferences & Settings**: AI tone customization, notification thresholds, account management.
- [ ] **N. Hardening & Verification**: End-to-end tests, security audit, and deployment readiness.

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 18 / Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Pytest, Uvicorn
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth
- **Email Service**: Google Gmail API (OAuth 2.0)
- **AI Service**: Modular LLM integration with structured Pydantic output validation

## 📁 Repository Structure
```text
Mymail/
├── backend/            # FastAPI Python backend
│   ├── app/
│   │   ├── api/        # REST route handlers
│   │   ├── core/       # Config, security, DB clients
│   │   ├── services/   # Email, AI, and reminder service layers
│   │   └── models/     # Pydantic schemas & DB models
│   └── tests/          # Pytest suite
├── frontend/           # React + TypeScript + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components & design system
│   │   ├── pages/      # Auth & dashboard views
│   │   └── services/   # API client & state management
└── README.md
```

## 🔒 Security
- Strict server-side storage of OAuth access/refresh tokens.
- Email contents treated as untrusted data to mitigate prompt injection.
- Zero credential or token leaks into version control.
