class AddDirectoryIndexesAndAllowanceAudit < ActiveRecord::Migration[8.1]
  def change
    add_index :employees, :name
    add_index :employees, :country
    add_index :employees, :department
    add_index :employees, :status
    add_index :employees, :currency

    add_column :salary_logs, :old_allowances, :decimal, precision: 12, scale: 2
    add_column :salary_logs, :new_allowances, :decimal, precision: 12, scale: 2
  end
end
