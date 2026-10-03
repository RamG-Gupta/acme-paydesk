class Api::V1::EmployeesController < ApplicationController
  # GET /api/v1/employees
  def index
    # 1. Base Scope (सारे कर्मचारियों को लोड करने के बजाय केवल एक्टिव या सिलेक्टेड स्कोप लें)
    employees = Employee.all

    # 2. सर्च फ़िल्टर (नाम या ईमेल पर केस-इंसेंसिटिव सर्च)
    if params[:search].present?
      employees = employees.where("name LIKE ? OR email LIKE ?", "%#{params[:search]}%", "%#{params[:search]}%")
    end

    # 3. ड्रॉपडाउन फ़िल्टर्स (Country and Department)
    employees = employees.where(country: params[:country]) if params[:country].present?
    employees = employees.where(department: params[:department]) if params[:department].present?
    employees = employees.where(status: params[:status]) if params[:status].present?

    # 4. सर्वर-साइड पैजिनेशन (Server-side Pagination)
    page = [params[:page].to_i, 1].max
    per_page = [params[:per_page].to_i, 20].max # Default 20 items per page
    total_count = employees.count

    # SQL Limit and Offset का इस्तेमाल ताकि डेटाबेस पर लोड न पड़े
    paginated_employees = employees.order(created_at: :desc).limit(per_page).offset((page - 1) * per_page)

    render json: {
      employees: paginated_employees,
      meta: {
        current_page: page,
        per_page: per_page,
        total_pages: (total_count.to_f / per_page).ceil,
        total_count: total_count
      }
    }
  end

  # GET /api/v1/employees/:id
  def show
    employee = Employee.find(params[:id])
    # कर्मचारी के साथ उसकी सैलरी हिस्ट्री भी भेजें
    render json: employee.as_json(include: :salary_logs)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Employee not found" }, status: :not_found
  end

  # PUT/PATCH /api/v1/employees/:id
  def update
    employee = Employee.find(params[:id])
    old_salary = employee.base_salary
    new_salary = params[:base_salary].to_f

    # अगर सैलरी बदल रही है, तो ट्रांजेक्शन के अंदर अपडेट करें और लॉग बनाएं
    if old_salary != new_salary
      ActiveRecord::Base.transaction do
        employee.update!(base_salary: new_salary, allowances: params[:allowances])
        
        # सैलरी चेंज हिस्ट्री लॉग करें
        employee.salary_logs.create!(
          old_salary: old_salary,
          new_salary: new_salary,
          change_reason: params[:change_reason] || "Salary Adjustment"
        )
      end
      render json: { message: "Salary updated successfully", employee: employee }
    else
      render json: { message: "No changes detected", employee: employee }
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Employee not found" }, status: :not_found
  end

  # GET /api/v1/employees/analytics
  # HR Manager के बड़े सवालों के जवाब देने के लिए हाई-परफॉर्मेंस एग्रीगेट फंक्शन्स
  def analytics
    # कुल सैलरी बजट खर्च (USD/INR मिक्स को अलग करके ग्रुप करना बेस्ट होता है, पर यहाँ हम ग्लोबल समरी दे रहे हैं)
    total_stats = Employee.group(:currency).pluck("currency, SUM(base_salary + allowances), AVG(base_salary), COUNT(id)")
    
    currency_metrics = total_stats.map do |currency, total_spend, avg_salary, count|
      {
        currency: currency,
        total_spend: total_spend.to_f.round(2),
        average_salary: avg_salary.to_f.round(2),
        employee_count: count
      }
    end

    # डिपार्टमेंट के हिसाब से हेडकाउंट और औसत खर्च
    dept_stats = Employee.group(:department).count
    
    render json: {
      global_payroll_summary: currency_metrics,
      department_distribution: dept_stats
    }
  end
end
