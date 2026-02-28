# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used in this project.**

- Do NOT create custom UI components
- Do NOT use any other component library (MUI, Chakra, Radix primitives directly, etc.)
- Every UI element must be built using [shadcn/ui](https://ui.shadcn.com/) components
- Install new components via the CLI: `npx shadcn@latest add <component>`
- No exceptions to this rule.

If a shadcn/ui component does not exist for a specific use case, compose the UI using multiple existing shadcn/ui components rather than building a custom one.

## Date Formatting

Use [date-fns](https://date-fns.org/) for all date formatting. No other date library should be used.

Dates must be formatted in the following style:

```
1st Sep 2025
2nd Aug 2025
3rd Sep 2026
4th Jun 2025
```

Use the format string `do MMM yyyy` with `date-fns/format`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
