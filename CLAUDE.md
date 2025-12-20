# CLAUDE.md - AI Assistant Guide for TVBuddy

## Project Overview

**TVBuddy** is a Chrome extension that provides TV show information and recommendations to users while browsing.

### Project Status
- **Stage**: Initial Development
- **Type**: Chrome Browser Extension (Manifest V3)
- **Primary Language**: JavaScript/TypeScript (to be determined)
- **Target Browsers**: Chrome, Edge, and other Chromium-based browsers

---

## Repository Structure

This project follows the standard Chrome extension structure. Expected directory layout:

```
tvbuddy/
├── manifest.json           # Extension manifest (Manifest V3)
├── src/
│   ├── background/        # Service worker scripts
│   ├── content/           # Content scripts injected into pages
│   ├── popup/             # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/           # Options/settings page
│   ├── utils/             # Shared utilities and helpers
│   └── api/               # API integration modules
├── assets/
│   ├── icons/             # Extension icons (16x16, 48x48, 128x128)
│   └── images/            # Other images and assets
├── tests/                 # Unit and integration tests
├── docs/                  # Additional documentation
├── dist/                  # Build output (gitignored)
├── package.json           # Node dependencies and scripts
└── README.md              # User-facing documentation
```

---

## Development Conventions

### Code Style

1. **JavaScript/TypeScript**
   - Use ES6+ features (async/await, arrow functions, destructuring)
   - Prefer `const` over `let`, avoid `var`
   - Use meaningful variable and function names
   - Add JSDoc comments for public functions
   - Maximum line length: 100 characters

2. **File Naming**
   - Use kebab-case for files: `content-script.js`, `api-client.js`
   - Use PascalCase for component/class files if using a framework
   - Use `.test.js` suffix for test files

3. **Code Organization**
   - One primary export per file
   - Group related functions into modules
   - Separate concerns (UI, logic, API calls)
   - Keep functions small and focused (< 50 lines ideally)

### Chrome Extension Best Practices

1. **Manifest V3 Requirements**
   - Use service workers instead of background pages
   - Implement proper CSP (Content Security Policy)
   - Use declarativeNetRequest for request modification
   - Prefer dynamic imports for code splitting

2. **Security**
   - Never use `eval()` or inline scripts
   - Sanitize all user inputs and external data
   - Use strict CSP headers
   - Implement proper CORS handling
   - Store sensitive data using chrome.storage with encryption if needed

3. **Performance**
   - Lazy load content scripts when possible
   - Minimize DOM manipulation in content scripts
   - Use chrome.storage.local for caching
   - Implement debouncing for frequent API calls
   - Bundle and minify for production

4. **Permissions**
   - Request minimal permissions required
   - Use optional permissions for non-essential features
   - Document why each permission is needed

### API Integration

1. **TV Data Sources**
   - Primary: TVMaze API, TMDB API, or similar
   - Implement rate limiting and caching
   - Handle API errors gracefully
   - Provide fallback when APIs are unavailable

2. **Data Caching**
   - Cache API responses in chrome.storage.local
   - Implement TTL (Time To Live) for cached data
   - Clear stale cache entries periodically

3. **Error Handling**
   - Always wrap API calls in try-catch
   - Provide user-friendly error messages
   - Log errors for debugging (with privacy in mind)
   - Implement retry logic with exponential backoff

---

## Git Workflow

### Branch Strategy

- **main/master**: Production-ready code only
- **develop**: Integration branch for features
- **claude/***: AI assistant working branches (auto-created)
- **feature/***: New features
- **fix/***: Bug fixes
- **docs/***: Documentation updates

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(popup): add TV show search functionality
fix(content): resolve script injection timing issue
docs(readme): add installation instructions
```

### Development Workflow

1. **Starting New Work**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Making Changes**
   - Write code following conventions
   - Test changes locally
   - Commit with descriptive messages

3. **Before Committing**
   - Test the extension in Chrome
   - Run linter if configured
   - Review changes with `git diff`

4. **Creating Pull Requests**
   - Ensure branch is up to date
   - Provide clear PR description
   - Link related issues
   - Request review if applicable

---

## Testing Strategy

### Manual Testing

1. **Extension Loading**
   - Load unpacked extension in Chrome (chrome://extensions)
   - Test with Developer Mode enabled
   - Verify all permissions granted

2. **Functionality Testing**
   - Test popup UI interactions
   - Verify content scripts inject properly
   - Test on various TV-related websites
   - Check background service worker behavior

3. **Cross-Browser Testing**
   - Test on Chrome stable
   - Test on Edge if possible
   - Verify on different OS (Windows, macOS, Linux)

### Automated Testing

When implemented:
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows
- Test coverage target: >80%

---

## Key Chrome Extension APIs to Use

### Essential APIs

1. **chrome.storage**
   - Store user preferences
   - Cache TV show data
   - Sync settings across devices (chrome.storage.sync)

2. **chrome.runtime**
   - Message passing between components
   - Extension lifecycle management
   - Error handling

3. **chrome.tabs**
   - Detect TV-related websites
   - Inject content scripts dynamically
   - Open recommendation pages

4. **chrome.action** (formerly browserAction)
   - Control popup behavior
   - Update badge text/color
   - Handle icon clicks

### Optional APIs (Based on Features)

- **chrome.alarms**: Scheduled tasks (cache cleanup, update checks)
- **chrome.notifications**: Show TV show alerts
- **chrome.contextMenus**: Right-click menu integration
- **chrome.declarativeNetRequest**: Modify network requests if needed

---

## Environment Setup

### Prerequisites

```bash
# Node.js (LTS version)
node --version  # Should be v18+ or v20+

# npm or yarn
npm --version
```

### Initial Setup (To Be Created)

```bash
# Install dependencies
npm install

# Run development build
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Chrome Extension Development

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the project directory (or dist/ folder if build step exists)
5. Extension icon should appear in toolbar

---

## AI Assistant Guidelines

### When Working on This Project

1. **Always Read Before Writing**
   - Read existing files before modifying
   - Understand the current structure
   - Don't assume file contents

2. **Follow Manifest V3**
   - Never suggest Manifest V2 patterns
   - Use service workers, not background pages
   - Implement proper CSP

3. **Security First**
   - Validate and sanitize all inputs
   - Use parameterized queries/safe APIs
   - Never expose API keys in client code
   - Implement proper CORS handling

4. **Progressive Enhancement**
   - Build features incrementally
   - Test each feature before moving on
   - Don't over-engineer early features
   - Keep it simple initially

5. **Documentation**
   - Update this file when architecture changes
   - Comment complex logic
   - Keep README.md user-focused
   - Document API integrations

6. **Code Quality**
   - Prefer editing existing files over creating new ones
   - Don't add unnecessary abstractions early
   - Keep functions focused and small
   - Use meaningful names

### Common Tasks

#### Adding a New Feature

1. Create feature branch
2. Implement in appropriate directory (popup, content, background)
3. Test manually in Chrome
4. Update manifest.json if needed (permissions, content scripts)
5. Document in README if user-facing
6. Commit and push

#### Adding API Integration

1. Create API client in `src/api/`
2. Implement error handling and retries
3. Add caching layer
4. Test with various scenarios
5. Document API usage and rate limits

#### Debugging Issues

1. Check Chrome DevTools Console
2. Inspect service worker (chrome://extensions)
3. Review chrome.storage contents
4. Check network tab for API calls
5. Test in incognito mode

---

## Project-Specific Considerations

### TV Show Data

- **Identify TV Shows**: Parse page content to detect TV show names
- **Show Information**: Title, season, episode, air date, rating
- **Recommendations**: Similar shows, cast information
- **User Preferences**: Track watched shows, favorites

### UI/UX Principles

- **Non-Intrusive**: Extension should enhance, not obstruct
- **Fast**: Minimal loading time, instant popup
- **Clean**: Simple, intuitive interface
- **Accessible**: Support keyboard navigation, screen readers

### Privacy Considerations

- Don't track user browsing without consent
- Store data locally when possible
- Clear disclosure of data usage
- Provide data export/deletion options

---

## Resources

### Documentation

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome API Reference](https://developer.chrome.com/docs/extensions/reference/)

### TV Data APIs

- [TVMaze API](https://www.tvmaze.com/api)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [OMDB API](http://www.omdbapi.com/)

### Tools

- Chrome DevTools for Extensions
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) for development

---

## Troubleshooting

### Common Issues

**Extension Not Loading**
- Check manifest.json syntax
- Verify file paths are correct
- Check Chrome console for errors

**Content Script Not Injecting**
- Verify matches pattern in manifest
- Check if page has loaded
- Review CSP of target page

**Storage Not Persisting**
- Use chrome.storage, not localStorage in service workers
- Check storage permissions in manifest
- Verify async/await usage

**API Calls Failing**
- Check CORS configuration
- Verify API key validity
- Review rate limiting
- Check network tab in DevTools

---

## Future Enhancements

### Planned Features

- [ ] TV show detection on streaming platforms
- [ ] Personalized recommendations
- [ ] Watch history tracking
- [ ] Episode notifications
- [ ] Integration with multiple TV databases
- [ ] Dark mode support
- [ ] Options page for customization

### Technical Improvements

- [ ] TypeScript migration
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Automated release process
- [ ] Performance monitoring
- [ ] Error tracking/reporting

---

## Notes for AI Assistants

- This is a greenfield project - establish patterns early
- Prioritize user experience and extension performance
- Follow Chrome Web Store policies for eventual publishing
- Keep dependencies minimal
- Document architectural decisions
- Test thoroughly before committing
- This file should be updated as the project evolves

---

**Last Updated**: 2025-12-20
**Version**: 1.0.0 (Initial)
