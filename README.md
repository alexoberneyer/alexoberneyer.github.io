# Alex Oberneyer's Blog

This is both my personal blog and the Rust-based static site generator that powers it. The generator converts Markdown blog posts to HTML for publishing at alexoberneyer.github.io.

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
2. Add TOML front matter at the top:
   ```markdown
   +++
   title = "Your Post Title"
   date = "2024-01-01"
   filename = "your-post-slug"
   +++
   
   Your markdown content goes here...
   ```

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