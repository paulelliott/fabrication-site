require 'sinatra'
require 'rdiscount'
require "sinatra/reloader" if development?

get '/stylesheets/*.css' do |f|
  sass ('/stylesheets/sass/' + f).to_sym
end

get "/" do
  @content = RDiscount.new(File.read("views/_content.markdown"), :smart).to_html
  haml :"/index"
end
