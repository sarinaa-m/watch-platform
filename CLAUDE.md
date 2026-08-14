# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Core behavior

Follow the existing architecture, naming conventions, folder structure, and code style of this repository.

Before changing code:

- Inspect the existing implementation first.
- Reuse existing utilities, components, types, constants, composables, services, and patterns.
- Do not duplicate logic when shared code already exists.
- Do not introduce new dependencies unless they are clearly necessary.
- Keep changes minimal, focused, and easy to review.

## Architecture

This frontend (Vue 3 + TypeScript + Vite) follows a practical ports-and-adapters structure:

- `domain` owns framework-free entities and port contracts.
- `application/usecases` owns Vue Query (`@tanstack/vue-query`) use-case composables that orchestrate repository calls and cache updates.
- `infrastructure` owns HTTP clients, storage, auth, routing, i18n, and repository adapter implementations.
- `presentation` owns Vue pages, components, composables, view models, and UI-specific mappers.
- `shared` is reserved for generic enums and utilities that do not depend on a feature, UI component, or infrastructure adapter.

Dependency direction:

- `domain` must not import `application`, `infrastructure`, or `presentation`.
- `shared` must not import `presentation`, `application`, or `infrastructure`.
- Repository ports expose domain/application data contracts; API details stay in `infrastructure`.
- UI rendering helpers and table view-model mappers belong in `presentation`, even when reused by multiple screens.

Current composition note:

The existing `application/usecases` files are Vue Query composables and still import concrete infrastructure adapters directly. A deeper inversion can introduce factories or a composition root later, but this cleanup keeps that established pattern to avoid a large behavioral rewrite.

## External documentation with Context7

Before writing or modifying code that depends on external libraries, frameworks, APIs, or package behavior, always use Context7.

Use Context7 for:

- Vue
- TypeScript
- Vite
- Vue Router
- vue-i18n
- Vue Query (`@tanstack/vue-query`)
- hls.js
- Any third-party package used in the task

Workflow:

1. Identify the libraries involved in the task.
2. Use Context7 to fetch the latest version-specific documentation and examples.
3. Base the implementation on the retrieved docs, not memory.
4. If Context7 has no docs for a library, say that and continue using the best available local project context.
5. Briefly mention which Context7 docs were used when the implementation depends on external APIs.
