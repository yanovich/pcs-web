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
  end
end

# vim:ts=2 sts=2 sw=2 et:
