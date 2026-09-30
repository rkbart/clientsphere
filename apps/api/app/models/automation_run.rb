class AutomationRun < ApplicationRecord
  belongs_to :account
  belongs_to :automation

  enum :status, { pending: 0, running: 1, completed: 2, failed: 3 }
end
