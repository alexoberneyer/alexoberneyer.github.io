title = "The best productivity app"
date = "2025-09-04"
filename = "productivity-app.html"
+++

I'm somewhat of a productivity nerd. Over the years, I've used probably every tool imaginable: OneNote, Evernote, Notion, Apple Notes, Trello, Obsidian, Logseq, Todoist, Wunderlist—you name it, I've tried it. All of these tools are good, but they tend to be a bit too complex for my taste. That's why I wanted to try something different.

Initially, I was intrigued by several approaches that use plain text and markdown files for productivity [1][2][3]. I tried the single-file method, but found it became unwieldy as my notes grew. That's when I evolved to a folder-based approach that combines the simplicity of plain text with better organization.

Instead of a single massive file, I now organize my notes into topic-specific folders like `work/`, `ideas/`, `quotes/`, `jiu-jitsu/`, `books/`, and `projects/`. Each folder contains markdown files relevant to that area. Todo items are written using standard markdown syntax: `* [ ] task description`. A simple script parses these files and generates a consolidated todo list whenever I need an overview.

Here's what my folder structure looks like:
```
notes/
├── work/
│   ├── meetings.md
│   ├── projects.md
│   └── goals.md
├── ideas/
│   ├── blog-posts.md
│   └── app-concepts.md
├── jiu-jitsu/
│   ├── techniques.md
│   └── competition-prep.md
└── books/
    ├── reading-list.md
    └── notes.md
```

This structure works beautifully with the following workflow:

- **On my laptop:** I use Cursor. You can use any editor, but I think Cursor is the best at the moment.
- **On my phone:** I use the GitHub app. Its markdown editor is excellent—simple and effective. Every change I make gets committed to git versioning, so I can see everything, nothing gets lost, and it's really safe. I genuinely like this setup.

This folder-based approach has several advantages. The organizational structure keeps related information together while maintaining the simplicity of plain text. When I need to focus on work tasks, I open the work folder. When I'm brainstorming, I dive into the ideas folder. A simple Python script aggregates all my todos across files, giving me the big picture without losing the context of where each task originated.

Unlike the single-file approach that becomes unwieldy with growth, this folder structure scales naturally. New topics get their own folders, related files stay grouped together, and the system remains fast and searchable regardless of size.

In terms of tools, a text editor—or more specifically, a code editor—is one of the absolute best tools I can imagine. It's a tool built by tool builders themselves, who spend all day working in it improving it for their own use and as a side effect for others. As a result, editors are usually extremely well crafted, and right now, Cursor is my absolute favorite.

The authors of *The Pragmatic Programmer* wrote years ago: use one editor and master it. If you do all your coding and productivity writing in the same editor, your productivity increases because you become deeply familiar with all the shortcuts and features.

For a long time, what I was missing was a good mobile editor. Now, with GitHub for mobile, I'm really happy. Most of my time is spent on my laptop, but for the little time I spend on mobile, the GitHub app is sufficient. I can even use dictation like Superwhisper or the built-in dictation to insert text. If something isn't perfect, I can polish it later. This might involve using a commit hook with an LLM for text preprocessing, or simply reviewing and fixing it on my laptop.

This approach isn't for everyone—those who prefer visual organization, rich formatting, or collaborative features might find it limiting. But for hackers who value speed and simplicity, it's hard to beat.

The git integration adds value beyond just backup. Every change is tracked with timestamps and commit messages, creating a natural audit trail of my thinking over time. I can see when ideas evolved, what I was working on during different periods, and even revert to previous versions if needed. It's like having a time machine for my thoughts.

This approach has staying power where others failed because it embraces rather than fights the natural way I think and work. Instead of forcing my thoughts into predefined structures, it lets the organization emerge organically. The system scales with my needs without becoming bloated, stays fast regardless of size, and most importantly, gets out of my way so I can focus on the work itself.

For me, it's the best productivity app: simple and effective.


## Notes
[1] Jeff Huang's [productivity text file](https://jeffhuang.com/productivity_text_file/) describes using a single massive text file for all notes and todos. This was the original inspiration for my plain text approach, though I found his single-file method became unwieldy at scale.

[2] Alireza Bashiri's [todo.txt journey](https://www.al3rez.com/todo-txt-journey) explores his evolution from complex productivity systems to a simple text file approach. His insights on the balance between structure and simplicity, and his experimentation with different plain text formats, helped validate my own journey toward simpler tools.

[3] Steve Faulkner's [tweet](https://x.com/southpolesteve/status/1952422489847689383) describes his workflow using Claude Code as a personal assistant working with markdown files. His approach of combining AI assistance with simple file structures reinforced my belief that the best productivity systems integrate seamlessly with developer tools and workflows.
