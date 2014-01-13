class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  include SessionsHelper
  before_filter :signed_in_user

  # Before filters

  def signed_in_user
    redirect_to signin_url, notice: "Please sign in." unless signed_in?
  end
end
