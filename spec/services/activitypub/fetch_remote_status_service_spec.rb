require 'rails_helper'

RSpec.describe ActivityPub::FetchRemoteStatusService do
  let(:sender) { Fabricate(:account) }
  let(:recipient) { Fabricate(:account) }
  let(:valid_domain) { Rails.configuration.x.local_domain }

  let(:note) do
    {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: "https://#{valid_domain}/@foo/1234",
      type: 'Note',
      content: 'Lorem ipsum',
      attributedTo: ActivityPub::TagManager.instance.uri_for(sender),
    }
  end

  subject { described_class.new }

  describe '#call' do
    before do
      subject.call(object[:id], prefetched_body: Oj.dump(object))
    end

    context 'with Note object' do
      let(:object) { note }

      it 'creates status' do
        status = sender.statuses.first

        expect(status).to_not be_nil
        expect(status.text).to eq 'Lorem ipsum'
      end
    end

    context 'with wrong id' do
      let(:note) do
        {
          '@context': 'https://www.w3.org/ns/activitystreams',
          id: "https://real.address/@foo/1234",
          type: 'Note',
          content: 'Lorem ipsum',
          attributedTo: ActivityPub::TagManager.instance.uri_for(sender),
        }
      end

      let(:object) do
        temp = note.dup
        temp[:id] = 'https://fake.address/@foo/5678'
        temp
      end

      it 'does not create status' do
        expect(sender.statuses.first).to be_nil
      end
    end
  end
end
