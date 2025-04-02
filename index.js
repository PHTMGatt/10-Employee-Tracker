/**
 * Minions Database CLI Application
 *
 * This application allows you to view and manage departments, roles, and employees 
 * in a PostgreSQL database. It uses Inquirer for interactive command line prompts,
 * pg for PostgreSQL interactions, asciiart-logo for displaying a logo, 
 * and console.table for nicely formatted table output in the console.
 */

const inquirer = require('inquirer');
const { Client } = require('pg');
const logo = require('asciiart-logo');
require('console.table'); // Make sure you've installed 'console.table'

// Create a new PostgreSQL client (update the credentials as needed)
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  database: 'minions_db',
  password: 'Bvsg3244', // Replace with your actual password
  port: 5432,
});

// Connect to the PostgreSQL database
client.connect();

/**
 * Displays the application logo and starts the main menu.
 */
async function displayLogo() {
  const logoText = logo({ name: 'Our Minions' }).render();
  console.log(logoText);
  await mainMenu();
}

/**
 * Displays the main menu and routes to the appropriate function based on user input.
 */
async function mainMenu() {
  try {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View Employees by Manager',
        'View Employees by Department',
        'View Total Utilized Budget by Department',
        'Delete Record',
        'Exit',
      ],
    });

    switch (action) {
      case 'View All Departments':
        await viewDepartments();
        break;
      case 'View All Roles':
        await viewRoles();
        break;
      case 'View All Employees':
        await viewEmployees();
        break;
      case 'Add Department':
        await addDepartment();
        break;
      case 'Add Role':
        await addRole();
        break;
      case 'Add Employee':
        await addEmployee();
        break;
      case 'Update Employee Role':
        await updateEmployeeRole();
        break;
      case 'Update Employee Manager':
        await updateEmployeeManager();
        break;
      case 'View Employees by Manager':
        await viewEmployeesByManager();
        break;
      case 'View Employees by Department':
        await viewEmployeesByDepartment();
        break;
      case 'View Total Utilized Budget by Department':
        await viewUtilizedBudgetByDepartment();
        break;
      case 'Delete Record':
        await deleteRecords();
        break;
      case 'Exit':
        console.log('Exiting application...');
        client.end();
        process.exit(0);
      default:
        console.log('Invalid option. Please try again.');
        await mainMenu();
    }
  } catch (err) {
    console.error('An error occurred:', err);
    // If there's an error, go back to the main menu to allow continued use.
    await mainMenu();
  }
}

/**
 * Retrieves and displays all departments.
 */
async function viewDepartments() {
  try {
    const res = await client.query('SELECT * FROM department');
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving departments:', err);
  }
  await mainMenu();
}

/**
 * Retrieves and displays all roles with their respective departments.
 */
async function viewRoles() {
  try {
    const res = await client.query(`
      SELECT roles.id, roles.title, roles.salary, department.department_name
      FROM roles 
      JOIN department ON roles.department_id = department.id
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving roles:', err);
  }
  await mainMenu();
}

/**
 * Retrieves and displays all employees along with their role, department, salary, and manager.
 */
async function viewEmployees() {
  try {
    const res = await client.query(`
      SELECT e.id,
             e.first_name,
             e.last_name,
             r.title,
             d.department_name,
             r.salary,
             CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving employees:', err);
  }
  await mainMenu();
}

/**
 * Prompts the user to add a new department and inserts it into the database.
 */
async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    type: 'input',
    name: 'departmentName',
    message: 'What is the name of the new department?',
  });

  try {
    await client.query('INSERT INTO department (department_name) VALUES ($1)', [departmentName]);
    console.log(`Department '${departmentName}' added successfully!`);
  } catch (err) {
    console.error('Error adding department:', err);
  }
  await viewDepartments();
}

/**
 * Prompts the user to add a new role and inserts it into the database.
 */
async function addRole() {
  try {
    const departments = await client.query('SELECT * FROM department');
    const departmentChoices = departments.rows.map(dept => ({
      name: dept.department_name,
      value: dept.id,
    }));

    const { title, salary, departmentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of the new role?',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this role?',
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department does this role belong to?',
        choices: departmentChoices,
      },
    ]);

    await client.query(
      'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
      [title, salary, departmentId]
    );
    console.log(`Role '${title}' added successfully!`);
  } catch (err) {
    console.error('Error adding role:', err);
  }
  await viewRoles();
}

/**
 * Prompts the user to add a new employee and inserts it into the database.
 */
async function addEmployee() {
  try {
    const roles = await client.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map(role => ({
      name: role.title,
      value: role.id,
    }));

    const employeesResult = await client.query('SELECT * FROM employees');
    const managerChoices = employeesResult.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));
    // Add "None" option if the employee does not have a manager.
    managerChoices.unshift({ name: 'None', value: null });

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
      },
      {
        type: 'list',
        name: 'roleId',
        message: "What is the employee's role?",
        choices: roleChoices,
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Who is the employee's manager?",
        choices: managerChoices,
      },
    ]);

    await client.query(
      'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [firstName, lastName, roleId, managerId]
    );
    console.log(`Employee ${firstName} ${lastName} added successfully!`);
  } catch (err) {
    console.error('Error adding employee:', err);
  }
  await viewEmployees();
}

/**
 * Prompts the user to update an employee's role.
 */
async function updateEmployeeRole() {
  try {
    const employees = await client.query('SELECT * FROM employees');
    const employeeChoices = employees.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));

    const roles = await client.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map(role => ({
      name: role.title,
      value: role.id,
    }));

    const { employeeId, roleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: "Which employee's role would you like to update?",
        choices: employeeChoices,
      },
      {
        type: 'list',
        name: 'roleId',
        message: "What is the employee's new role?",
        choices: roleChoices,
      },
    ]);

    await client.query('UPDATE employees SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
    console.log('Employee role updated successfully!');
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
  await viewEmployees();
}

/**
 * Prompts the user to update an employee's manager.
 */
async function updateEmployeeManager() {
  try {
    const employeesResult = await client.query('SELECT * FROM employees');
    const employeeChoices = employeesResult.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));

    // For managers, we can use the same list as employees.
    const managerChoices = employeesResult.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));
    // Include a "None" option.
    managerChoices.unshift({ name: 'None', value: null });

    const { employeeId, managerId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: "Which employee's manager would you like to update?",
        choices: employeeChoices,
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Who is the employee's new manager?",
        choices: managerChoices,
      },
    ]);

    await client.query('UPDATE employees SET manager_id = $1 WHERE id = $2', [managerId, employeeId]);
    console.log('Employee manager updated successfully!');
  } catch (err) {
    console.error('Error updating employee manager:', err);
  }
  await viewEmployees();
}

/**
 * Displays employees managed by a selected manager.
 */
async function viewEmployeesByManager() {
  try {
    // Retrieve managers (employees who have no manager themselves)
    const managersResult = await client.query('SELECT * FROM employees WHERE manager_id IS NULL');
    const managerChoices = managersResult.rows.map(manager => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));

    const { managerId } = await inquirer.prompt({
      type: 'list',
      name: 'managerId',
      message: 'Select a manager to view their employees:',
      choices: managerChoices,
    });

    const query = `
      SELECT e.id,
             e.first_name,
             e.last_name,
             r.title,
             d.department_name,
             r.salary,
             CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.manager_id = $1
    `;
    const res = await client.query(query, [managerId]);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving employees by manager:', err);
  }
  await mainMenu();
}

/**
 * Displays employees belonging to a selected department.
 */
async function viewEmployeesByDepartment() {
  try {
    const departmentsResult = await client.query('SELECT * FROM department');
    const departmentChoices = departmentsResult.rows.map(dept => ({
      name: dept.department_name,
      value: dept.id,
    }));

    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Select a department to view its employees:',
      choices: departmentChoices,
    });

    const query = `
      SELECT e.id,
             e.first_name,
             e.last_name,
             r.title,
             d.department_name,
             r.salary,
             CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE d.id = $1
    `;
    const res = await client.query(query, [departmentId]);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving employees by department:', err);
  }
  await mainMenu();
}

/**
 * Displays the total utilized budget for a selected department.
 * (i.e., the sum of salaries of all employees in that department)
 */
async function viewUtilizedBudgetByDepartment() {
  try {
    const departmentsResult = await client.query('SELECT * FROM department');
    const departmentChoices = departmentsResult.rows.map(dept => ({
      name: dept.department_name,
      value: dept.id,
    }));

    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Select a department to view its total utilized budget:',
      choices: departmentChoices,
    });

    const query = `
      SELECT d.department_name, SUM(r.salary) AS utilized_budget
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      WHERE d.id = $1
      GROUP BY d.department_name
    `;
    const res = await client.query(query, [departmentId]);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving utilized budget:', err);
  }
  await mainMenu();
}

/**
 * Prompts the user to select a type of record to delete and calls the corresponding delete function.
 */
async function deleteRecords() {
  const { deleteType } = await inquirer.prompt({
    type: 'list',
    name: 'deleteType',
    message: 'What type of record would you like to delete?',
    choices: ['Department', 'Role', 'Employee', 'Cancel'],
  });

  switch (deleteType) {
    case 'Department':
      await deleteDepartment();
      break;
    case 'Role':
      await deleteRole();
      break;
    case 'Employee':
      await deleteEmployee();
      break;
    default:
      await mainMenu();
  }
}

/**
 * Deletes a department from the database.
 */
async function deleteDepartment() {
  try {
    const departmentsResult = await client.query('SELECT * FROM department');
    const departmentChoices = departmentsResult.rows.map(dept => ({
      name: dept.department_name,
      value: dept.id,
    }));

    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Select a department to delete:',
      choices: departmentChoices,
    });

    await client.query('DELETE FROM department WHERE id = $1', [departmentId]);
    console.log('Department deleted successfully!');
  } catch (err) {
    console.error('Error deleting department:', err);
  }
  await viewDepartments();
}

/**
 * Deletes a role from the database.
 */
async function deleteRole() {
  try {
    const rolesResult = await client.query('SELECT * FROM roles');
    const roleChoices = rolesResult.rows.map(role => ({
      name: role.title,
      value: role.id,
    }));

    const { roleId } = await inquirer.prompt({
      type: 'list',
      name: 'roleId',
      message: 'Select a role to delete:',
      choices: roleChoices,
    });

    await client.query('DELETE FROM roles WHERE id = $1', [roleId]);
    console.log('Role deleted successfully!');
  } catch (err) {
    console.error('Error deleting role:', err);
  }
  await viewRoles();
}

/**
 * Deletes an employee from the database.
 */
async function deleteEmployee() {
  try {
    const employeesResult = await client.query('SELECT * FROM employees');
    const employeeChoices = employeesResult.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));

    const { employeeId } = await inquirer.prompt({
      type: 'list',
      name: 'employeeId',
      message: 'Select an employee to delete:',
      choices: employeeChoices,
    });

    await client.query('DELETE FROM employees WHERE id = $1', [employeeId]);
    console.log('Employee deleted successfully!');
  } catch (err) {
    console.error('Error deleting employee:', err);
  }
  await viewEmployees();
}

// Start the application
displayLogo().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
