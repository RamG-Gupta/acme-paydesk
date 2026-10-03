# frozen_string_literal: true

class Employee < ApplicationRecord
  DEPARTMENTS = [
    "Engineering", "Product", "Design", "Human Resources", "Sales",
    "Marketing", "Finance", "Legal", "Operations", "Security"
  ].freeze

  COUNTRIES = [
    "United States", "India", "United Kingdom", "Germany", "Singapore"
  ].freeze

  CURRENCIES = %w[USD INR GBP EUR SGD].freeze
  STATUSES = %w[Active Suspended Terminated].freeze

  has_many :salary_logs, -> { order(created_at: :desc, id: :desc) }, dependent: :destroy

  validates :name, :email, :department, :country, :currency, :status, presence: true
  validates :email, uniqueness: { case_sensitive: false }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :department, inclusion: { in: DEPARTMENTS }
  validates :country, inclusion: { in: COUNTRIES }
  validates :currency, inclusion: { in: CURRENCIES }
  validates :status, inclusion: { in: STATUSES }
  validates :base_salary, :allowances, numericality: { greater_than_or_equal_to: 0 }

  scope :search, ->(term) {
    sanitized = sanitize_sql_like(term.to_s.strip)
    return all if sanitized.blank?

    pattern = "%#{sanitized}%"
    where("LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)", pattern, pattern)
  }

  def self.filtered(filters)
    relation = all
    relation = relation.search(filters[:search]) if filters[:search].present?
    relation = relation.where(country: filters[:country]) if filters[:country].present?
    relation = relation.where(department: filters[:department]) if filters[:department].present?
    relation = relation.where(status: filters[:status]) if filters[:status].present?
    relation
  end

  def total_compensation
    base_salary.to_d + allowances.to_d
  end

  # Updates current pay and appends an audit row in one transaction.
  # Raises ActiveRecord::RecordInvalid when the reason is missing or pay is invalid.
  def adjust_compensation!(base_salary:, allowances:, change_reason:)
    next_base = BigDecimal(base_salary.to_s)
    next_allowances = BigDecimal(allowances.to_s)

    if self.base_salary.to_d == next_base && self.allowances.to_d == next_allowances
      return :unchanged
    end

    transaction do
      salary_logs.create!(
        old_salary: self.base_salary,
        new_salary: next_base,
        old_allowances: self.allowances,
        new_allowances: next_allowances,
        change_reason: change_reason.to_s.strip
      )
      update!(base_salary: next_base, allowances: next_allowances)
    end

    :updated
  end

  def as_json(options = {})
    super(options).merge(
      "base_salary" => base_salary.to_f,
      "allowances" => allowances.to_f,
      "total_compensation" => total_compensation.to_f
    )
  end
end
