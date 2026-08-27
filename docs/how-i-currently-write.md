title = "How I Currently Write"
date = "2026-08-10"
filename = "how-i-currently-write.html"
+++

This post is about how I currently write blog posts.

The procedure has three steps: drafting, digitization and editing.

## Drafting

In the drafting phase I do one of two things.

Either I take a walk and record a voice memo with my phone or my watch.

Or I sit down on a sofa in a cafe, or somewhere else, and write on my reMarkable e-ink tablet.

Whatever I feel like.

## Digitization

After drafting, the writing has to become digital.

I transcribe the voice memos with superwhisper. If I used the reMarkable, I use their OCR to convert the handwriting into text.

## Editing

Now the real editing starts.

Currently in Ghostty, with two panes: Neovim and a terminal. In the terminal I run a coding agent. I switch between reading and writing in Neovim and asking the agent for feedback.

The first thing I do is use my `polish-text` skill [1]. It strips transcription and OCR errors and adds a bit of structure, so the next steps are easier.

Then I read it and check it.

After that I use the `proofread-post` skill: the coding agent reviews the post and flags weak arguments [2]. I decide what I agree with and what I don't, edit the text, and go back and forth with the agent a couple of times. The skill is ripped off from Simon Willison's proofread prompt [3]. I used the exact prompt at the start and only slightly evolved from there.

Once I'm satisfied, I publish.

## Notes

[1] Here's the [polish-text skill](https://github.com/alexoberneyer/claude-skills/blob/main/plugins/writing/skills/polish-text/SKILL.md).

[2] Here's the [proofread-post skill](https://github.com/alexoberneyer/claude-skills/blob/main/plugins/writing/skills/proofread-post/SKILL.md).

[3] This is [Simon's proofreader prompt](https://simonwillison.net/guides/agentic-engineering-patterns/prompts/#proofreader).
