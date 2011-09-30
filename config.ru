$:.unshift File.join(File.dirname(__FILE__), "lib")
require 'rubygems'
require "gollum/frontend/app"

Precious::App.set(:gollum_path, File.join(File.dirname(__FILE__), "wiki"))
Precious::App.set(:wiki_options, {})
run Precious::App
