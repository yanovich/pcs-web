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
      device = Device.first
      device.states.build(content: "#{device.name} message",
                          stamp: t.advance(sec: -1)).save
      visit devices_path
    end

    it { should have_title(I18n.t 'devices.index.title') }

    it "should list each device" do
      Device.all.each do |device|
        expect(page).to have_selector('td', text: device.name)
        if state = device.state
          expect(page).to have_selector('td', text: state.content)
          expect(page).to have_selector('td', text: state.time)
        end
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
        Device.page(1).each do |device|
          expect(page).to have_selector('td', text: device.name)
        end
      end
    end

    describe "profile" do
      before do
        t = DateTime.now.change(minutes: -1)
        dev = Device.first
        30.times do |i|
          dev.states.build(content: "#{dev.name} message #{i}",
                           stamp: t).save
          t.advance(sec: 1)
        end
        visit device_path(dev)
      end

      it "should list each state" do
        device = Device.first
        device.states.page(1).each do |state|
          expect(page).to have_selector('td', text: state.content)
        end
      end
    end
  end

  describe "administration" do
    let(:admin) { FactoryGirl.create(:admin) }
    let(:user) { FactoryGirl.create(:user) }
    before do
      sign_in admin
      visit devices_path
    end

    it { should have_link('Создать', href: new_device_path) }

    describe "of new devices" do
      before { visit new_device_path }

      it { should have_title(I18n.t 'devices.new.title') }
      let(:submit) { I18n.t 'devices.new.link'}

      describe "with invalid information" do
        it "should not create device" do
          expect { click_button submit }.not_to change(Device, :count)
        end
      end

      describe "with valid information" do
        before do
          fill_in Device.human_attribute_name(:name),     with: "Test Device"
          fill_in Device.human_attribute_name(:hostname), with: "testdev1"
          fill_in Device.human_attribute_name(:filepath), with: "/tmp/test-dev-1"
          check   Device.human_attribute_name(:enabled)
        end

        it "should create a device" do
          expect { click_button submit }.to change(Device, :count).by(1)
        end
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
