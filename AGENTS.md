# Workspace Agent Coordination Rules

## Article Hero Images (Do Not Conflict)
- **Do NOT overwrite** existing `public/images/articles/*.jpg` photos with `scripts/make_clickbait_thumbnails.swift` or uniform dark-neon AI templates.
- Every article hero image must be clean, modern, and visually distinct (rotating through bright daylight studio shots, candid lab/hardware photography, real product photos, and at most occasional moody shots).
- After adding or updating any article image, always run both checks before committing:
  - `python3 scripts/verify_and_polish_site.py --check-image-diversity`
  - `python3 scripts/verify_and_polish_site.py --audit`

## Editorial Standards
- Keep article titles concise and scannable (`<= 75` characters).
- Keep category badges and reading-time labels visually distinct (never the exact same text color).
- Never commit `example.com` placeholder URLs or internal developer debug badges in reader-facing layouts.
