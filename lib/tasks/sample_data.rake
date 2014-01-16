namespace :db do
  desc "Fill database with sample data"
  task populate: :environment do
    make_users
  end
end

def make_users
  admin = User.create!(name:     "Янович Сергей Владимирович",
                       email:    "ynvich@example.com",
                       password: "foobar",
                       password_confirmation: "foobar",
		       admin: true)
  99.times do |n|
    name  = Faker::Name.name
    email = "example-#{n+1}@example.com"
    password  = "password"
    User.create!(name:     name,
                 email:    email,
                 password: password,
                 password_confirmation: password)
  end
end
