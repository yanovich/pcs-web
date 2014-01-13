class SessionsController < ApplicationController
  skip_before_filter :signed_in_user, only: [:new, :create]

  def new
  end

  def create
    user = User.find_by(email: params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      sign_in user
      redirect_to root_path
    else
      flash.now[:error] = "Невернoе имя пользователя или пароль"
      render 'new'
    end
  end

  def destroy
    sign_out
    redirect_to signin_url
  end
end
