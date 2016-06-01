activate :autoprefixer do |config|
  config.browsers = ['> 1%', 'last 2 versions']
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

activate :asset_hash
activate :dotenv
activate :syntax

activate :google_analytics do |ga|
  ga.tracking_id = 'UA-4408103-7'
end

activate :s3_sync do |s3_sync|
  s3_sync.bucket = 'www.fabricationgem.org'
  s3_sync.aws_access_key_id = ENV['AWS_ACCESS_KEY_ID']
  s3_sync.aws_secret_access_key = ENV['AWS_SECRET_ACCESS_KEY']
  s3_sync.after_build = true
end

configure :development do
  activate :livereload
end

configure :build do
  activate :minify_css
  activate :minify_javascript
end
