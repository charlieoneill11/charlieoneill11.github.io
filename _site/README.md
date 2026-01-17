# charlieoneill.com

Personal website built with Jekyll, deployed via GitHub Pages.

## Local Development

**Prerequisites:** Homebrew Ruby (macOS system Ruby is too old)

```bash
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Run locally:**

```bash
bundle install    # first time only
bundle exec jekyll serve --livereload
```

Site will be at http://127.0.0.1:4000 with auto-refresh on save.
