PcsWeb::Application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  resources :users, except: [:edit, :destroy]
  resources :sessions, only: [:new, :create, :destroy]
  resources :devices, except: [:edit, :destroy]
  resources :devices do
    resources :states, only: [:index]
  end
  # You can have the root of your site routed with "root"
  root 'main#index'
  match '/signin',  to: 'sessions#new',         via: 'get'
  match '/signout', to: 'sessions#destroy',     via: 'delete'
  match '/history',  to: 'devices#history',     via: 'get'

end

# vim:ts=2 sts=2 sw=2 et:
