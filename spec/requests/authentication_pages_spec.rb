require 'spec_helper'

describe "Authentication" do

  subject { page }

  describe "signin page" do
    before { visit signin_path }

    it { should have_content('регистрация') }
    it { should have_title('регистрация') }

    describe "with invalid information" do
      before { click_button "Регистрация" }

      it { should have_title('регистрация') }
      it { should have_selector('div.form-group.has-error') }
    end

    describe "with valid information" do
      let(:user) { FactoryGirl.create(:user) }
      before do
        fill_in "Email",    with: user.email.upcase
        fill_in "Password", with: user.password
        click_button "Регистрация"
      end

      it { should have_title(user.name) }
      it { should have_link('Досье', href: user_path(user)) }
      it { should have_link('Выход',     href: signout_path) }

      describe "followed by signout" do
        before { click_link "Выход" }
        it { should have_title('регистрация') }
      end
    end
  end

  describe "authorization" do

    describe "for non-signed-in users" do
      let(:user) { FactoryGirl.create(:user) }

      describe "in the Users controller" do

        describe "visiting the root page" do
          before { visit root_path }
          it { should have_title('регистрация') }
        end
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
