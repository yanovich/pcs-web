def sign_in(user, options={})
  if options[:no_capybara]
    # Sign in when not using Capybara as well.
    remember_token = User.new_remember_token
    cookies[:remember_token] = remember_token
    user.update_attribute(:remember_token, User.encrypt(remember_token))
  else
    visit signin_path
    fill_in "Эл.почта", with: user.email.upcase
    fill_in "Пароль",   with: user.password
    click_button "Регистрация"
  end
end
