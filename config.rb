activate :autoprefixer do |config|
  config.browsers = ['> 1%', 'last 2 versions']
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

activate :syntax

activate :google_analytics do |ga|
  ga.tracking_id = 'UA-4408103-7'
end

configure :development do
  activate :livereload
end

configure :build do
  activate :minify_css
  activate :minify_javascript
end
