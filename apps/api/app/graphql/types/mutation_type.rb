module Types
  class MutationType < Types::BaseObject
    field :create_contact, mutation: Mutations::CreateContact
    field :update_contact, mutation: Mutations::UpdateContact
    field :delete_contact, mutation: Mutations::DeleteContact

    field :create_company, mutation: Mutations::CreateCompany
    field :update_company, mutation: Mutations::UpdateCompany
    field :delete_company, mutation: Mutations::DeleteCompany

    field :create_deal, mutation: Mutations::CreateDeal
    field :update_deal, mutation: Mutations::UpdateDeal
    field :delete_deal, mutation: Mutations::DeleteDeal

    field :create_activity, mutation: Mutations::CreateActivity
    field :update_activity, mutation: Mutations::UpdateActivity
    field :delete_activity, mutation: Mutations::DeleteActivity
  end
end
