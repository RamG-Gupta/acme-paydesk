Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :employees, only: [ :index, :show, :update ] do
        collection do
          get :analytics
        end
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
  root "spa#index"
  get "*path", to: "spa#index", constraints: ->(req) {
    !req.path.start_with?("/api", "/up", "/rails")
  }
end
