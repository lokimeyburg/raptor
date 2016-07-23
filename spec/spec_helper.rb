require 'bundler/setup'

require 'active_support/json'
require 'active_support/core_ext/hash'
require 'eventmachine'
require 'em-http-request'
require 'em-websocket-client'
require 'raptor'
require 'thin'
require 'raptor_helper_methods'
require 'have_attributes'
require 'openssl'
require 'socket'
require 'timecop'
require 'webmock/rspec'
#require 'em-rspec'

WebMock.disable!

module Raptor; end

def errback
  @errback ||= Proc.new { |e| 
    fail 'cannot connect to raptor. your box might be too slow. try increasing sleep value in the before block' 
  }
end

RSpec.configure do |config|
  config.formatter = 'documentation'
  config.color = true
  config.mock_framework = :mocha
  config.order = 'random'
  config.include RaptorHelperMethods
  config.fail_fast = true
  config.after(:each) { stop_raptor if @server_pid }
  config.before :all do
    Raptor.tap do |p|
      p.host   = '0.0.0.0'
      p.port   = 4567
      p.app_id = '26051'
      p.secret = '19b74451a08ea35ceed7'
      p.key    = '765ec374ae0a69f4ce44'
    end
  end
end
