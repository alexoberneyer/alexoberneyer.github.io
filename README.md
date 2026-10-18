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


## Learning atlas

`docs/learning/` contains standalone HTML lessons and is published with the rest
of the site. The source lessons live in the private notes repository at `learning/`;
`learning/publish.sh` copies the public HTML here. The Markdown post generator
leaves these HTML files intact. Keep developer notes outside `docs/` because the generator
recursively treats Markdown files there as blog posts.

The Information Theory essay pilot lives at
`docs/learning/artifacts/information-theory.html`. It contains its own styles, SVG figures,
and JavaScript, with no external runtime dependencies. The original deeper coding
lab remains at `docs/learning/artifacts/information.html`. The atlas index links
to the essay, and the essay and lab link to each other.

Run the pilot's numerical and UI wiring checks with:

```bash
node scripts/check-information-theory.cjs
```

The check uses a small document stub, not a rendering engine. Before major design
changes, also check the page visually at mobile and desktop widths, keyboard
operation, and the no-JavaScript fallback. The page has responsive styles,
visible focus states, native range controls, text equivalents for diagrams,
and worked examples available without JavaScript.
