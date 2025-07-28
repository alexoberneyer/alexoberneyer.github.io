use pulldown_cmark::{html, Options, Parser};
use serde::{Deserialize, Serialize};
use serde_json::to_value;
use std::fs::{read_to_string, write};
use tera::{Context, Tera};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FrondMatter {
    title: String,
    date: String,
    filename: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Blogpost {
    front_matter: FrondMatter,
    content: String,
}

fn convert_markdown_to_html(markdown_input: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    let parser = Parser::new_ext(markdown_input, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

fn write_html_to_file(output_filepath: &str, content: &str) {
    if let Err(e) = write(output_filepath, content) {
        eprintln!("failed to write todos to file: {}", e);
    }
}

fn get_blogpost_from_markdown_file(filepath: &str) -> Blogpost {
    let markdown_text = read_to_string(filepath).expect("error when reading file");
    let parts: Vec<&str> = markdown_text.splitn(3, "+++").collect();
    let front_matter_str = parts[0].trim();
    let content = parts[1].trim();
    let front_matter = toml::from_str(front_matter_str).expect("error parsing front matter");
    Blogpost {
        front_matter,
        content: convert_markdown_to_html(content),
    }
}

fn get_blogposts_from_directory(directory_path: &str) -> Vec<Blogpost> {
    WalkDir::new(directory_path)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.path().is_file())
        .filter(|f| f.path().extension().map_or(false, |ext| ext == "md"))
        .map(|f| get_blogpost_from_markdown_file(f.path().to_str().unwrap()))
        .collect()
}

fn write_blogpost_to_file(tera: &Tera, post: Blogpost) {
    let mut context = Context::new();
    context.insert("title", &post.front_matter.title);
    context.insert("content", &post.content);
    let rendered = match tera.render("post.html", &context) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Template rendering error: {}", e);
            return;
        }
    };
    let html_file_path = format!("content/{}", &post.front_matter.filename);
    write_html_to_file(&html_file_path, &rendered);
}

fn write_blogposts_to_file(tera: &Tera, posts: &Vec<Blogpost>) {
    for post in posts {
        write_blogpost_to_file(tera, post.clone());
    }
}

fn write_about_to_file(tera: &Tera) {
    let mut context = Context::new();
    context.insert("title", "about");
    context.insert("content", "This is my blog. I hope you like it :-)");

    let rendered = match tera.render("post.html", &context) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Error rendering index template: {}", e);
            return;
        }
    };
    let html_file_path = "content/about.html";
    write_html_to_file(html_file_path, &rendered);
}

fn write_index_to_file(tera: &Tera, posts: &[Blogpost]) {
    let front_matters: Vec<FrondMatter> = posts.iter().map(|f| f.front_matter.clone()).collect();
    let mut context = Context::new();
    context.insert("title", "index");
    context.insert("posts", &to_value(front_matters).unwrap());

    let rendered = match tera.render("index.html", &context) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Error rendering index template: {}", e);
            return;
        }
    };
    let html_file_path = "content/index.html";
    write_html_to_file(html_file_path, &rendered);
}

fn main() {
    let tera = match Tera::new("templates/**/*") {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Template parsing error: {}", e);
            return;
        }
    };

    let dir_path = "content";
    let posts = get_blogposts_from_directory(dir_path);

    write_blogposts_to_file(&tera, &posts);

    write_about_to_file(&tera);

    write_index_to_file(&tera, &posts);
}
