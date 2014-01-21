FactoryGirl.define do
  factory :user do
    sequence(:name)  { |n| "Person #{n}" }
    sequence(:email) { |n| "person_#{n}@example.com"}   
    password "foobar"
    password_confirmation "foobar"

    factory :admin do
      sequence(:name) { |n| "Admin #{n}" }
      sequence(:email) { |n| "admin#{n}@exapmle.com" }
      admin true
    end
  end

  factory :device do
    sequence(:name)  { |n| "Device #{n}" }
    sequence(:hostname)  { |n| "testdev#{n}" }
    sequence(:filepath) { |n| "/tmp/pcs-testdev-#{n}"}
    enabled true
  end
end

# vim:ts=2 sts=2 sw=2 et:
