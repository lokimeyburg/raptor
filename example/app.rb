require 'bundler/setup'
require 'sinatra'
require 'haml'
require 'pusher'
require 'digest/md5'
require 'thin'
require 'json'

set :views, File.dirname(__FILE__) + '/templates'
set :port,  3000

enable :sessions

Pusher.host   = '0.0.0.0'
Pusher.port   = 4567
Pusher.app_id = '26051'
Pusher.secret = '19b74451a08ea35ceed7'
Pusher.key    = '765ec374ae0a69f4ce44'

get '/' do
  @channel = "MY_CHANNEL"
  haml :index
end

get '/chat' do
  @channel = "presence-channel"
  if session[:current_user]
    haml :chat_room
  else
    haml :chat_lobby
  end
end

post '/chat' do
  if session[:current_user]
    Pusher['presence-channel'].trigger_async('chat_message', {
      sender: session[:current_user], body: params['message']
    })
    request.xhr? ? status(201) : redirect('/chat')
  else
    status 403
  end
end

post '/identify' do
  session[:current_user] = params['handle']
  redirect request.referer
end

post '/pusher/auth' do
  # socket_id:33270.697357
  # channel_name:presence-organization
  
  Pusher[params['channel_name']].authenticate(params['socket_id'], {
    user_id: Digest::MD5.hexdigest(session[:current_user]),
    user_info: {
      name: session[:current_user]
    }
  }).to_json
end
