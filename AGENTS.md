# AGENTS.md

This document defines mandatory engineering constraints for AI agents contributing to this repository.
These rules are strict and must not be violated.

---

# FRONTEND ARCHITECTURE

Architecture: Feature-based + Atomic Design

## 1. Folder Structure

- Features must be separated by domain.
- UI components must follow Atomic Design structure:
  - atoms/
  - molecules/
  - organisms/
  - templates/
  - pages/

- Business logic must live inside the feature layer (hooks, services, stores).
- Atomic components must remain presentation-focused.

Do not mix domain logic inside atomic components.

---

## 2. Separation of Concerns (Strict)

- No business logic inside UI components.
- No API calls inside atoms/molecules.
- State management must live in hooks or feature-level services.
- Pages compose features — they do not implement logic.

---

## 3. Reusability Rules

- Atoms must be pure and reusable.
- Feature logic must not leak into shared components.
- Shared components must not depend on feature-specific types.

---

## 4. Type Safety (Mandatory)

- No `any`.
- Explicit return types for exported functions.
- Shared domain types must be placed in `/shared/types` or `/domain`.
- Duplicate type definitions across features are forbidden.

---

# BACKEND ARCHITECTURE

Architecture: Layered + Clean Architecture oriented.

## 5. Layer Separation

Must follow:

- Controller Layer
- UseCase / Application Layer
- Domain Layer
- Infrastructure Layer

Rules:

- Controllers do not contain business logic.
- Domain must not depend on Infrastructure.
- UseCases orchestrate business rules.
- Repositories are interfaces in Domain, implementations in Infrastructure.

Cross-layer dependency violations are forbidden.

---

## 6. No Redundant Code

- No duplicated business logic.
- Extract shared utilities.
- Avoid deep nesting.
- Avoid unnecessary abstractions.

---

## 7. AI Behavior Constraints

- Do not introduce new architecture patterns.
- Do not generate unnecessary libraries.
- Do not modify folder structure unless explicitly instructed.
- If unsure, ask before generating new patterns.
- Prefer minimal, maintainable implementations.

# 8. Design System Compliance

All UI generation must comply with the rules defined in `design.md`.

- Do not invent new visual styles.
- Do not modify spacing, typography, or color tokens arbitrarily.
- Follow defined component variants and layout constraints.
- If design rules are unclear, ask before generating UI.

Design decisions are not flexible.

# 9. Completion Validation (Mandatory)

All tasks must undergo a final validation process before being declared complete.

## Required Verification Checklist

Before declaring completion, you must:

- Perform a final architectural review.
- Re-check frontend architecture constraints.
- Re-check backend layer separation rules.
- Confirm no cross-layer dependency violations.
- Confirm no business logic exists inside UI components.
- Confirm no API calls exist inside atoms or molecules.
- Confirm state management lives in feature-level hooks or services.
- Confirm strict type safety (no `any`, no duplicated types).
- Confirm no redundant business logic exists.
- Confirm design system compliance (if UI is involved).

## Completion Declaration Rule

You must not declare a task as completed until all verification steps above have been re-confirmed.

If verification cannot be fully performed, you must explicitly state what could not be validated and why.

Completion may only be declared after validation is explicitly acknowledged.
