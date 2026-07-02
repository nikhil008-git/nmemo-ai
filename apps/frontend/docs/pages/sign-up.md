# Sign up (`/sign-up`)

## Purpose

New users create an account (name, email, password).

## Audience

Prospective site owners evaluating nmemo.

## Layout

- **Header:** breadcrumb with **Sign Up** as current page
- **Form block:**
  - Eyebrow: “Get started”
  - Heading: Sign Up
  - Helper: short onboarding line
  - Fields: full name, email, password (min 8 chars)
  - Submit: Create Account
  - Error: red inline on failure

## Success path

- Account created → redirect to `/dashboard`

## Failure path

- Duplicate email or validation error → show message, stay on page

## Related

- Already have account → `/sign-in` via header

## Future

- Terms / privacy checkbox
- Workspace or company name field
- Email verification gate before dashboard access
