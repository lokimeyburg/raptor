# encoding: utf-8
require 'bundler/setup'

require 'eventmachine'
require 'em-hiredis'
require 'rack'
require 'active_support/core_ext/string'
require './lib/raptor-server/version'

module Raptor; end

EM.epoll
EM.kqueue

File.tap do |f|
  Dir[f.expand_path(f.join(f.dirname(__FILE__),'lib', 'raptor-server', '*.rb'))].each do |file|
    Raptor.autoload File.basename(file, '.rb').camelize, file
  end
end
