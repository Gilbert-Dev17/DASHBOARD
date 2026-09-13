# Constants & Options (`src/lib/constants`)

This directory houses all the global constants, configuration options, and UI options for the dashboard.
Centralizing these values makes it easy to read, validate, and maintain the application's configuration over time.

## `options.ts` Structure

The `options.ts` file is organized into clear sections for maintainability:

- **⚙️ CONFIGURATION & LIMITS**: Global system limits (e.g. `MAX_QUICK_ADD_TASKS`, `ITEMS_PER_PAGE`, `AUTOSAVE_DELAY`). Keep all hard limits here to prevent massive API calls or UI slowdowns.
- **🛡️ DATA VALIDATION**: Regex patterns and validation constants (e.g. `DATE_REGEX`). Use these in Server Actions to validate inputs.
- **🎛️ UI FILTER OPTIONS**: Dropdown arrays and tabs (e.g. `TIME_FILTERS`).
- **💰 FINANCE OPTIONS**: Categories, transaction types, currencies, and wallet types.
- **✅ TASK OPTIONS**: Valid task categories (`TASK_CATEGORY_OPTIONS`).

### Why use this file?

1. **Reusability**: Importing `ITEMS_PER_PAGE` into different pagination components ensures the whole app respects a single source of truth.
2. **Security**: Using shared validation regex (like `DATE_REGEX`) ensures frontend validation and server action validation are always in sync.
3. **Refactoring**: Need to add a new Wallet Type? Just add it to `WALLET_TYPE_OPTIONS` and it will automatically populate across all select dropdowns and server validations.
