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
        fill_in "Эл.почта",    with: user.email.upcase
        fill_in "Пароль", with: user.password
        click_button "Регистрация"
      end

      it { should have_title(user.name) }
      it { should_not have_link('Пользователи', href: users_path) }
      it { should have_link('Досье',        href: user_path(user)) }
      it { should have_link('Выход',        href: signout_path) }

      describe "followed by signout" do
        before { click_link "Выход" }
        it { should have_title('регистрация') }
      end
    end

    describe "as an admin" do
      let(:admin) { FactoryGirl.create(:admin) }
      before do
        fill_in "Эл.почта",    with: admin.email.upcase
        fill_in "Пароль", with: admin.password
        click_button "Регистрация"
      end

      it { should have_link('Пользователи', href: users_path) }
    end
  end

  describe "and authorization" do

    describe "for non-signed-in users" do
      let(:user) { FactoryGirl.create(:user) }

      describe "in the Users controller" do

        describe "visiting the root page" do
          before { visit root_path }
          it { should have_title('регистрация') }
        end
      end
    end

    describe "as a wrong user" do
      let(:user) { FactoryGirl.create(:user) }
      let(:wrong_user) { FactoryGirl.create(:user, email: "wrong@example.com") }
      before { sign_in user, no_capybara: true }

      describe "submitting a PATCH request to the Users#update action" do
        before { patch user_path(wrong_user) }
        specify { expect(response).to redirect_to(signin_path) }
      end
    end

    describe "as a non-admin user" do
      let(:non_admin) { FactoryGirl.create(:user, email: "non_admin@example.com") }
      let(:another_user) { FactoryGirl.create(:user) }
      before { sign_in non_admin, no_capybara: true }

      describe "visiting the user index" do
        before { get users_path }
        specify { expect(response).to redirect_to(user_path(non_admin)) }
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
