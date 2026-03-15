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

```text
Tuesday 10th March 2025
Wednesday 2nd August 2025
```

Use the format string `EEEE do MMMM yyyy` with `date-fns/format`:

```ts
import { format } from "date-fns";

format(date, "EEEE do MMMM yyyy"); // e.g. "Tuesday 10th March 2025"
```
