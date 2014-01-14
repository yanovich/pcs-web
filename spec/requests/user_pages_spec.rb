# spec/requests/homes_spec.rb - test home page
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe "User pages" do
  subject { page }

  describe "profile page" do
    let(:user) { FactoryGirl.create(:user) }
    before do
      sign_in user
      visit user_path(user)
    end

    describe "visit" do
      it { should have_selector("input[value=\'#{user.name}\']") }
      it { should have_selector("input[value=\'#{user.email}\']") }
    end

    describe "edit with invalid information" do
      before { click_button "Изменить" }

      it { should have_selector('div.alert.alert-danger') }
    end

    describe "edit with valid information" do
      let(:new_name)  { "New Name" }
      let(:new_email) { "new@example.com" }
      before do
        fill_in "Полное имя",             with: new_name
        fill_in "Эл.почта",            with: new_email
        fill_in "Пароль",         with: user.password
        fill_in "Подтверждение", with: user.password
        click_button "Изменить"
      end

      it { should have_title(new_name) }
      it { should have_selector('div.alert.alert-success') }
      it { should have_link('Выход', href: signout_path) }
      specify { expect(user.reload.name).to  eq new_name }
      specify { expect(user.reload.email).to eq new_email }
    end
  end

  describe "index" do
    before do
      sign_in FactoryGirl.create(:user)
      FactoryGirl.create(:user, name: "Bob", email: "bob@example.com")
      FactoryGirl.create(:user, name: "Ben", email: "ben@example.com")
      visit users_path
    end

    it { should have_title('Пользователи') }
    it { should have_content('Пользователи') }

    it "should list each user" do
      User.all.each do |user|
        expect(page).to have_selector('td', text: user.name)
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
