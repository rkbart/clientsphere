class ContactPolicy < ApplicationPolicy
  def index?
    viewer_or_above?
  end

  def show?
    viewer_or_above?
  end

  def create?
    member_or_above?
  end

  # Bulk import/export is a workspace-level operation, not record editing.
  # (Named bulk_* to avoid colliding with the per-contact `export?` below.)
  def bulk_import?
    owner_or_admin?
  end

  def bulk_export?
    owner_or_admin?
  end

  def update?
    member_or_above?
  end

  def destroy?
    owner_or_admin?
  end

  def export?
    viewer_or_above?
  end

  def erase?
    owner_or_admin?
  end

  def score?
    member_or_above?
  end

  class Scope < Scope
    def resolve
      super
    end
  end
end
