# frozen_string_literal: true

class Api::V1::EmployeesController < ApplicationController
  wrap_parameters false
  before_action :set_employee, only: %i[show update]

  def index
    employees = Employee.filtered(filter_params)
    page = [ params[:page].to_i, 1 ].max
    per_page = params[:per_page].presence&.to_i || 20
    per_page = 20 if per_page < 1
    per_page = 100 if per_page > 100

    total_count = employees.count
    records = employees.order(:name, :id).offset((page - 1) * per_page).limit(per_page)

    render json: {
      employees: records.as_json,
      meta: {
        current_page: page,
        per_page: per_page,
        total_pages: [ (total_count.to_f / per_page).ceil, 1 ].max,
        total_count: total_count
      }
    }
  end

  def show
    render json: @employee.as_json(include: :salary_logs)
  end

  def update
    result = @employee.adjust_compensation!(
      base_salary: compensation_params[:base_salary],
      allowances: compensation_params[:allowances],
      change_reason: compensation_params[:change_reason]
    )

    message = result == :unchanged ? "No compensation change detected" : "Salary updated successfully"
    render json: { message: message, employee: @employee.reload.as_json }
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.to_sentence.presence || e.message }, status: :unprocessable_entity
  rescue ArgumentError
    render json: { error: "Base salary and allowances must be numbers" }, status: :unprocessable_entity
  end

  def analytics
    currency_metrics = Employee.group(:currency)
      .select("currency, SUM(base_salary + COALESCE(allowances, 0)) AS total_spend, AVG(base_salary) AS average_salary, COUNT(*) AS employee_count")
      .map do |row|
        {
          currency: row.currency,
          total_spend: row.total_spend.to_f.round(2),
          average_salary: row.average_salary.to_f.round(2),
          employee_count: row.employee_count
        }
      end.sort_by { |row| -row[:employee_count] }

    render json: {
      headcount: Employee.count,
      global_payroll_summary: currency_metrics,
      department_distribution: Employee.group(:department).count,
      status_distribution: Employee.group(:status).count
    }
  end

  private

  def set_employee
    @employee = Employee.find_by(id: params[:id])
    render json: { error: "Employee not found" }, status: :not_found unless @employee
  end

  def filter_params
    params.permit(:search, :country, :department, :status)
  end

  def compensation_params
    source = params[:employee].present? ? params.require(:employee) : params
    source.permit(:base_salary, :allowances, :change_reason)
  end
end
