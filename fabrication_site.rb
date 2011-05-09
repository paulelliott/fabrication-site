require 'sinatra'

require "sinatra/reloader" if development?

get '/stylesheets/*.css' do |f|
  sass ('/stylesheets/sass/' + f).to_sym
end

get "/" do
  haml :"/index"
end

