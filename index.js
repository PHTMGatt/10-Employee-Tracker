/**
 * Our Minions CLI Application
 *
 * This application lets you view and manage departments, roles,
 * and employees in a PostgreSQL database.
 *
 * Dependencies:
 *   - inquirer
 *   - pg
 *   - asciiart-logo
 *
 * To install dependencies:
 *   npm install inquirer pg asciiart-logo
 */

const inquirer = require('inquirer');
const { Client } = require('pg');
const logo = require('asciiart-logo');

// Create a new PostgreSQL client. Update credentials as needed.
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  database: 'minions_db',
  password: 'Bvsg3244', // Replace with your actual password
  port: 5432,
});

// Connect to the PostgreSQL database.
client.connect().catch((err) => {
  console.error('Error connecting to the database:', err);
  process.exit(1);
});

/**
 * Displays the application logo then calls the main menu.
 */
function displayLogo() {
  const logoText = logo({ name: 'Our Minions' }).render();
  console.log(logoText);
  mainMenu();
}

/**
 * Main function to handle the application flow.
 */
const mainMenu = async () => {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      'Update an Employee Role',
      'Update employee managers.',
      'View employees by manager.',
      'View employees by department.',
      'Delete departments, roles, and employees.',
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
    case 'Add a Department':
      await addDepartment();
      break;
    case 'Add a Role':
      await addRole();
      break;
    case 'Add an Employee':
      await addEmployee();
      break;
    case 'Update an Employee Role':
      await updateEmployeeRole();
      break;
    case 'Update employee managers.':
      await UpdateEmployeeManager();
      break;
    case 'View employees by manager.':
      await viewEmployeesByManager();
      break;
    case 'View employees by department.':
      await viewEmployeesByDepartment();
      break;
    case 'Delete departments, roles, and employees.':
      // Call delete functions as needed. For now, you can choose one.
      // For example, here we'll call deleteDepartment as a placeholder.
      await deleteDepartment();
      break;
    case 'Exit':
      client.end();
      break;
    default:
      console.log('Invalid option. Please try again.');
      await mainMenu();
  }
};

/**
 * Deletes a department.
 */
const deleteDepartment = async () => {
  const departments = await client.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map((department) => ({
    name: department.department_name,
    value: department.id,
  }));

  const { departmentId } = await inquirer.prompt({
    type: 'list',
    name: 'departmentId',
    message: 'Select a department to delete:',
    choices: departmentChoices,
  });

  await client.query('DELETE FROM department WHERE id = $1', [departmentId]);
  console.log('Department deleted successfully!');
  await viewDepartments();
};

/**
 * Deletes a role.
 */
const deleteRole = async () => {
  const roles = await client.query('SELECT * FROM roles');
  const roleChoices = roles.rows.map((role) => ({
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
  await viewRoles();
};

/**
 * View employees by department.
 */
const viewEmployeesByDepartment = async () => {
  const departments = await client.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map((department) => ({
    name: department.department_name,
    value: department.id,
  }));

  const { departmentId } = await inquirer.prompt({
    type: 'list',
    name: 'departmentId',
    message: 'Select a department to view its employees:',
    choices: departmentChoices,
  });

  const res = await client.query(
    `SELECT employees.id, employees.first_name, employees.last_name, roles.title, department.department_name, roles.salary,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
     FROM employees
     JOIN roles ON employees.role_id = roles.id
     JOIN department ON roles.department_id = department.id
     LEFT JOIN employees manager ON employees.manager_id = manager.id
     WHERE department.id = $1`,
    [departmentId]
  );
  console.table(res.rows);
  await mainMenu();
};

/**
 * View employees by manager.
 */
const viewEmployeesByManager = async () => {
  const managers = await client.query('SELECT * FROM employees WHERE manager_id IS NULL');
  const managerChoices = managers.rows.map((manager) => ({
    name: `${manager.first_name} ${manager.last_name}`,
    value: manager.id,
  }));

  const { managerId } = await inquirer.prompt({
    type: 'list',
    name: 'managerId',
    message: 'Select a manager to view their employees:',
    choices: managerChoices,
  });

  const res = await client.query(
    `SELECT employees.id, employees.first_name, employees.last_name, roles.title, department.department_name, roles.salary,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
     FROM employees
     JOIN roles ON employees.role_id = roles.id
     JOIN department ON roles.department_id = department.id
     LEFT JOIN employees manager ON employees.manager_id = manager.id
     WHERE employees.manager_id = $1`,
    [managerId]
  );
  console.table(res.rows);
  await mainMenu();
};

/**
 * View all departments.
 */
const viewDepartments = async () => {
  const res = await client.query('SELECT * FROM department');
  console.table(res.rows);
  await mainMenu();
};

/**
 * View all roles.
 */
const viewRoles = async () => {
  const res = await client.query(
    'SELECT roles.id, roles.title, roles.salary, department.department_name FROM roles JOIN department ON roles.department_id = department.id'
  );
  console.table(res.rows);
  await mainMenu();
};

/**
 * View all employees.
 */
const viewEmployees = async () => {
  const res = await client.query(
    `SELECT employees.id, employees.first_name, employees.last_name, roles.title, department.department_name, roles.salary, 
     CONCAT(manager.first_name, ' ', manager.last_name) AS manager
     FROM employees
     JOIN roles ON employees.role_id = roles.id
     JOIN department ON roles.department_id = department.id
     LEFT JOIN employees manager ON employees.manager_id = manager.id`
  );
  console.table(res.rows);
  await mainMenu();
};

/**
 * Add a new department.
 */
const addDepartment = async () => {
  const { departmentName } = await inquirer.prompt({
    type: 'input',
    name: 'departmentName',
    message: 'What is the name of the new department?',
  });

  await client.query('INSERT INTO department (department_name) VALUES ($1)', [departmentName]);
  console.log(`Department '${departmentName}' added successfully!`);
  await viewDepartments();
};

/**
 * Update an employee's manager.
 */
const UpdateEmployeeManager = async () => {
  const employees = await client.query('SELECT * FROM employees');
  const employeeChoices = employees.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const managers = await client.query('SELECT * FROM employees');
  const managerChoices = managers.rows.map((manager) => ({
    name: `${manager.first_name} ${manager.last_name}`,
    value: manager.id,
  }));
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
  await viewEmployees();
};

/**
 * Add a new role.
 */
const addRole = async () => {
  const departments = await client.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map((department) => ({
    name: department.department_name,
    value: department.id,
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
  await viewRoles();
};

/**
 * Add a new employee.
 */
const addEmployee = async () => {
  const roles = await client.query('SELECT * FROM roles');
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const managers = await client.query('SELECT * FROM employees');
  const managerChoices = managers.rows.map((manager) => ({
    name: `${manager.first_name} ${manager.last_name}`,
    value: manager.id,
  }));
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
  await viewEmployees();
};

/**
 * Update an employee's role.
 */
const updateEmployeeRole = async () => {
  const employees = await client.query('SELECT * FROM employees');
  const employeeChoices = employees.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const roles = await client.query('SELECT * FROM roles');
  const roleChoices = roles.rows.map((role) => ({
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
  await viewEmployees();
};

// Start the application.
displayLogo();
