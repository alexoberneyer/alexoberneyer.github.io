# Alex Oberneyer's Blog

This is both my personal blog and the minimalist Rust-based static site generator that powers it. The generator converts Markdown blog posts to HTML for publishing at alexoberneyer.github.io.

## Quick Start

1. **Build the project**:
   ```bash
   cargo build
   ```

2. **Generate your site**:
   ```bash
   cargo run
   ```

3. **View your site**: Open `docs/index.html` in your browser

## Writing Posts

1. Create a new `.md` file in the `docs/` directory
2. Add TOML front matter at the very top:
   ```markdown
   title = "Your Post Title"
   date = "2024-01-01"
   filename = "your-post-slug.html"
   +++

   Your markdown content goes here...
   ```

   **There is no opening `+++`.** The file begins directly with the TOML, closed
   by a single `+++`. The parser does `markdown_text.splitn(3, "+++")` and reads
   part 0 as TOML (`src/main.rs:38`), so an opening delimiter leaves the front
   matter empty and panics the build (`src/main.rs:41`).

   `filename` is the **`.html`** output name, not the `.md` source name — it is
   used verbatim as `docs/{filename}` (`src/main.rs:95`).

   A leading `# Title` H1 in the body is stripped automatically
   (`src/main.rs:50`), so leaving one in is harmless. Drop it anyway:
   `templates/post.html` already renders the title from the front matter.

3. Run `cargo run` to regenerate the HTML

## Project Structure

```
├── docs/             # Markdown source files & generated HTML
│   ├── css/         # Stylesheets
│   └── *.md, *.html # Blog posts and generated pages
├── templates/        # HTML templates (index.html, post.html)
├── src/main.rs      # Main generator code
├── target/          # Cargo build artifacts
└── Cargo.toml       # Rust dependencies
```

## Development

- **Check code**: `cargo check`
- **Run tests**: `cargo test`
- **Format code**: `cargo fmt`
- **Lint code**: `cargo clippy`

## How It Works

1. Scans `docs/` for Markdown files
2. Parses TOML front matter from each file
3. Converts Markdown to HTML
4. Renders posts using Tera templates
5. Generates index page listing all posts


## Interactive Learning

The public [Learning section](https://oberneyer.com/learning/) is a curated
collection of **seven standalone interactive HTML artifacts** in three areas:

- **Core scientific theories:** Bayesian inference, causal inference, entropy &
  irreversibility, information theory, evolution & natural selection
- **Brazilian Jiu-Jitsu:** [No-Gi Standing Game](docs/learning/artifacts/standing-no-gi-game-plan.html),
  a text-first decision map with no illustrations
- **Everyday systems:** [Family 5S](docs/learning/artifacts/family-5s.html),
  a decision helper and a locally saved two-week checklist

**Source of truth:** the private notes repository, `learning/index.html`,
`learning/artifacts/` and `BJJ/standing-no-gi-game-plan-interactive.html`.
Run `learning/publish.sh` there to publish the seven explicitly approved
artifacts. The BJJ file is mapped into the public `artifacts/` directory by
the publisher; do not edit divergent blog copies by hand.

The publisher replaces `docs/learning/`, excludes the older private World
Model Atlas experiments, and verifies page links and public scope. Only the
allowlisted pages are approved; never publish private Markdown, author reviews,
personal notes, or links to private training references.

After publication, run the dependency-free Node regression tests:

```bash
node scripts/check-information-theory.cjs
node --test scripts/check-scientific-essays.cjs
node --test scripts/check-evolution.cjs
node --test scripts/check-learning-publication.cjs
```

These checks cover model arithmetic, interaction wiring, and publication
integrity. They are not a substitute for real browser, mobile or accessibility
testing. Preserve all five scientific essay URLs when updating the index.
