# Design Brief

## Direction

Dark Editorial Chat — A focused, distraction-free AI conversation interface with professional dark aesthetics and clear message differentiation.

## Tone

Refined minimalism with zero decorative elements; every pixel serves clarity and conversation flow.

## Differentiation

Subtle message differentiation through background colors (primary for user, secondary for AI) with rounded corners; teal-blue accent separates this from ChatGPT's green aesthetic.

## Color Palette

| Token      | OKLCH                | Role                              |
| ---------- | -------------------- | --------------------------------- |
| background | 0.145 0.014 260      | Dark charcoal base                |
| foreground | 0.95 0.01 260        | Off-white text                    |
| card       | 0.18 0.014 260       | Elevated surface                  |
| primary    | 0.75 0.15 190        | Teal-blue accent, user messages   |
| secondary  | 0.22 0.02 260        | AI message background             |
| accent     | 0.75 0.15 190        | Buttons, highlights               |
| destructive| 0.55 0.2 25          | Destructive actions               |

## Typography

- Display: Space Grotesk — headers, titles, conversation labels
- Body: Satoshi — chat text, UI labels, instructions
- Mono: JetBrains Mono — code snippets in chat
- Scale: header `text-lg font-semibold`, body `text-base`, label `text-xs font-medium`

## Elevation & Depth

Subtle layering: background, card surfaces at +2L lightness, sidebar with minimal shadow for depth without distraction.

## Structural Zones

| Zone      | Background   | Border               | Notes                                   |
| --------- | ------------ | -------------------- | --------------------------------------- |
| Header    | card (0.18)  | border/0.28 0.02 260 | Sticky, user auth + logo                |
| Sidebar   | sidebar      | sidebar-border       | Conversation list with hover states     |
| Content   | background   | —                    | Main chat thread area                   |
| Input     | card (0.18)  | border               | Fixed bottom, clear affordance          |

## Spacing & Rhythm

Compact messaging density with comfortable breathing room between message groups; 1rem section gaps, 0.5rem intra-message spacing.

## Component Patterns

- Buttons: teal primary (0.75 0.15 190), rounded-lg, no shadow
- Messages: user right-aligned in primary rounded-3xl, AI left-aligned in secondary
- Sidebar items: hover bg-muted/60, active bg-sidebar-accent
- Badge: muted background, small text

## Motion

- Entrance: subtle fade-in on message arrival (100ms)
- Hover: smooth background transitions on interactive elements (300ms cubic-bezier)
- Decorative: none — focus on clarity

## Constraints

- Only dark mode; light mode not needed
- No gradients, animations beyond transitions
- Spacing priority: message clarity over visual density
- Teal accent used sparingly for buttons and active states

## Signature Detail

Rounded message bubbles (radius 1.5rem) distinguish user/AI with color without additional UI chrome — minimal, human-centric chat design.
