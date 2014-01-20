# spec/requests/device_page_spec.rb - test device pages
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe "Devices pages" do
  subject { page }

  describe "index page" do
    let(:user) { FactoryGirl.create(:user) }
    before do
      sign_in user
      t = DateTime.now.beginning_of_hour
      3.times { FactoryGirl.create(:device) }
      Device.all.each do |device|
        device.states.build(content: "#{device.name} message",
                            stamp: t.advance(sec: -1)).save
      end
      visit devices_path
    end

    it { should have_title(I18n.t 'devices.index.title') }

    it "should list each device" do
      Device.all.each do |device|
        expect(page).to have_selector('td', text: device.name)
        state = device.states.desc(:c_at).first
        expect(page).to have_selector('td', text: state.content)
        expect(page).to have_selector('td', text: state.time)
      end
    end

    describe "pagination" do

      before (:all) do
        30.times { FactoryGirl.create(:device) }
        t = DateTime.now.beginning_of_hour
        Device.all.each do |device|
          device.states.build(content: "#{device.name} message",
                              stamp: t.advance(sec: -1)).save
        end
        visit devices_path
      end

      it { should have_selector('div.pagination') }

      it "should list each device" do
        Device.paginate(page: 1).each do |device|
          expect(page).to have_selector('td', text: device.name)
        end
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
