activate :autoprefixer do |config|
  config.browsers = ['> 1%', 'last 2 versions']
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

activate :dotenv
activate :syntax

configure :development do
  activate :livereload
end

activate :google_analytics do |ga|
  ga.tracking_id = 'UA-4408103-7'
end

configure :build do
  activate :asset_hash
  activate :minify_css
  activate :minify_javascript
end

activate :s3_sync do |s3_sync|
  s3_sync.after_build = true
end

activate :cloudfront do |cf|
  cf.access_key_id = ENV['AWS_ACCESS_KEY_ID']
  cf.secret_access_key = ENV['AWS_SECRET_ACCESS_KEY']
  cf.distribution_id = ENV['AWS_DISTRIBUTION_ID']
  cf.after_build = true
end
