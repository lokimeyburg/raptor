require './lib/raptor-server/version'

Gem::Specification.new do |s|
  s.platform                    = Gem::Platform::RUBY
  s.name                        = 'raptor-server'
  s.version                     = RaptorServer::VERSION
  s.summary                     = 'Realtime messaging and presence server'
  s.description                 = 'Realtime messaging and presence server'

  s.required_ruby_version       = '>= 2.0.0'

  s.author                      = 'Loki Meyburg'
  s.email                       = 'loki@medeo.ca'
  s.homepage                    = 'https://github.com/lokimeyburg/raptor-server'

  s.add_dependency                'eventmachine',     '~> 1.0.3'
  s.add_dependency                'em-hiredis',       '~> 0.2.1'
  s.add_dependency                'em-websocket',     '~> 0.5.0'
  s.add_dependency                'rack',             '~> 1.5.2'
  s.add_dependency                'rack-fiber_pool',  '~> 0.9.3'
  s.add_dependency                'signature',        '~> 0.1.7'
  s.add_dependency                'activesupport',    '~> 4.0.1'
  s.add_dependency                'glamazon',         '~> 0.3.1'
  s.add_dependency                'sinatra',          '~> 1.4.4'
  s.add_dependency                'thin',             '~> 1.6.1'
  s.add_dependency                'em-http-request',  '~> 1.0.3'

  s.add_development_dependency    'rspec',            '~> 2.14.1'
  s.add_development_dependency    'raptor',           '~> 0.12.0'
  s.add_development_dependency    'haml',             '~> 4.0.4'
  s.add_development_dependency    'rake'
  s.add_development_dependency    'timecop',          '~> 0.7.0'
  s.add_development_dependency    'webmock',          '~> 1.16.0'
  s.add_development_dependency    'mocha',            '~> 0.14.0'
  s.add_development_dependency    'debugger'
  s.add_development_dependency    'em-websocket-client', '~> 0.1.2'

  s.files                       = Dir['README.md', 'lib/**/*', 'raptor-server.rb']
  s.require_path                = '.'

  s.executables << 'raptor'
end
