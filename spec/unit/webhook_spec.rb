require 'spec_helper'
require 'lib/raptor/webhook'

describe 'Raptor::Webhook' do

  around do |example|
    Raptor::Config.load webhook_url: 'https://example.com/raptor',
      app_key: 'RAPTOR_APP_KEY', secret: 'secret'
    WebMock.enable!
    Timecop.freeze(Time.now) { example.run }
    WebMock.disable!
    Raptor::Config.load webhook_url: nil
  end

  describe '.post' do
    it 'make a POST request to the endpoint' do
      payload = {
        time_ms: Time.now.strftime('%s%L'),
        events: [{ name: 'channel_occupied', channel: 'test channel' }]
      }.to_json

      digest   = OpenSSL::Digest::SHA256.new
      hmac     = OpenSSL::HMAC.hexdigest(digest, Raptor::Config.secret, payload)

      stub_request(:post, Raptor::Config.webhook_url).
        with(body: payload, headers: {
            "X-Raptor-Key"    => Raptor::Config.app_key,
            "X-Raptor-Secret" => hmac
        }).
        to_return(:status => 200, :body => {}.to_json, :headers => {})

      Raptor::Webhook.post name: 'channel_occupied', channel: 'test channel'

      WebMock.should have_requested(:post, Raptor::Config.webhook_url).
        with(body: payload, headers: {
            "X-Raptor-Key"    => Raptor::Config.app_key,
            "X-Raptor-Secret" => hmac
        })
    end
  end
end
