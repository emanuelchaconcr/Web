# Contributing to Emanuel Chacón Portfolio

Thank you for considering contributing! Please follow these guidelines:

## 📝 Code style
- Use **HTML5** with proper indentation (2 spaces).
- CSS follows **BEM**‑like naming and uses CSS custom properties for colors.
- JavaScript should be plain **ES6** (no frameworks) and include `'use strict';`.

## 🧹 Commit messages
- Title line limited to 50 characters.
- Body (optional) wraps at 72 characters.
- End each commit with the attribution line:
  ```
  Co-Authored-By: Claude Code <noreply@anthropic.com>
  ```

## 📦 Testing
- Run `npm install -g serve` (or any static server) and verify the site loads.
- Check that meta tags are present on each page.

## 📂 Branch workflow
- Create a branch prefixed with `feature/` or `fix/`.
- Open a Pull Request targeting `main`.
- The PR description should include a short summary of the change.

## 🔒 Security
- Do not commit secrets or private data.
- If you need a `.env` file for local testing, add it to `.gitignore`.

## 📚 Resources
- See the [README](../README.md) for project overview.
- Use the [issue tracker](/issues) for bugs or feature requests.
