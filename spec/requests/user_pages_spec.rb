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
      before do
        fill_in "Пароль",         with: user.password
        click_button "Изменить"
      end

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

  describe "administration" do
    let(:admin) { FactoryGirl.create(:admin) }
    let(:user) { FactoryGirl.create(:user, name: "Bob", email: "bob@example.com") }
    before do
      sign_in admin
      FactoryGirl.create(:user, name: "Ben", email: "ben@example.com")
      visit users_path
    end

    it { should have_link('Создать', href: new_user_path) }

    describe "of index" do
      it { should have_title('Пользователи') }

      it "should list each user" do
        User.all.each do |user|
          expect(page).to have_selector('td', text: user.name)
        end
      end

      describe "pagination" do

        before do
          30.times { FactoryGirl.create(:user) }
          visit users_path
        end

        it { should have_selector('div.pagination') }

        it "should list each user" do
          User.paginate(page: 1).each do |user|
            expect(page).to have_selector('td', text: user.name)
          end
        end
      end
    end

    describe "of profile" do
      before { visit user_path(user) }

      it { should have_selector("input[value=\'#{user.email}\']") }
      it { should have_title(user.name) }

      describe "to assign new admin" do
        before do
          check (I18n.t 'mongo_mapper.attributes.user.admin')
          click_button "Изменить"
        end

        it { should have_selector('div.alert.alert-success') }
        specify { expect(user.reload).to  be_admin }
      end
    end

    describe "of new users" do
      before { visit new_user_path }

      it { should have_title(I18n.t 'users.new.title') }
      let(:submit) { I18n.t 'users.new.link'}

      describe "with invalid information" do
        it "should not create user" do
          expect { click_button submit }.not_to change(User, :count)
        end
      end

      describe "with valid information" do
        before do
          fill_in User.human_attribute_name(:name),                  with: "Example User"
          fill_in User.human_attribute_name(:email),                 with: "user@example.com"
          fill_in User.human_attribute_name(:password),              with: "foobar"
          fill_in User.human_attribute_name(:password_confirmation), with: "foobar"
        end

        it "should create a user" do
          expect { click_button submit }.to change(User, :count).by(1)
        end
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
