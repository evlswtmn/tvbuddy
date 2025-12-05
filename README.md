# tvbuddy

A Chrome extension that enforces SOP checklists for a Zendesk ticket close workflow. The content script injects a floating checklist panel, watches the form via mutation observers, and blocks or gates submission when SOP violations are present.

## Features
- **Live SOP checks**: Required field, allowed value, regex, and pseudo-LLM narrative checks update in real time from a floating panel.
- **LLM-style tips**: "Explain" buttons surface guidance for each violation.
- **Submission guard**: Intercepts form submit and enforces hard blocks or confirm overrides; logs overrides for analytics when enabled.
- **Per-domain SOP templates**: Options page lets you edit JSON SOP templates per organization domain and toggle license gating (Free/Pro with Stripe key storage placeholder).

## Development
1. Load the unpacked extension in Chrome using the repository root.
2. Visit the options page to set the domain key (e.g., `zendesk.com`) and edit the SOP JSON template.
3. Navigate to a Zendesk domain page with a ticket form to see the floating SOP checklist and submission guard in action.
