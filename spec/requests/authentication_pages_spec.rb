require 'spec_helper'

describe "Authentication" do

  subject { page }

  describe "signin page" do
    before { visit signin_path }

    it { should have_content('Регистрация') }
    it { should have_title('Регистрация') }
  end
end

# vim:ts=2 sts=2 sw=2 et:
