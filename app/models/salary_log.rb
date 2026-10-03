# frozen_string_literal: true

class SalaryLog < ApplicationRecord
  belongs_to :employee

  validates :old_salary, :new_salary, presence: true
  validates :change_reason, presence: true, length: { minimum: 3 }

  def as_json(options = {})
    super(options).merge(
      "old_salary" => old_salary.to_f,
      "new_salary" => new_salary.to_f,
      "old_allowances" => old_allowances.to_f,
      "new_allowances" => new_allowances.to_f
    )
  end
end
