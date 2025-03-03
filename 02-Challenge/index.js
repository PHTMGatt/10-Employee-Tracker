const inquirer = require('inquirer');
const { Client } = require('pg');
const logo = require('asciiart-logo');
// const consoleTable = require('console.table');

// Create a new PostgreSQL client
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  database: 'minions_db',
  password: 'Bvsg3244', // Make sure to replace with your actual password
  port: 5432,
});

// Connect to the PostgreSQL database
client.connect();
function displayLogo() {
  const logoText = logo({ name: 'Our Minions' }).render();
  console.log(logoText);
  mainMenu();
}


// Main function to handle the application flow
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
      'Exit',
    ],
  });

  switch (action) {
    case 'View All Departments':
      viewDepartments();
      break;
    case 'View All Roles':
      viewRoles();
      break;
    case 'View All Employees':
      viewEmployees();
      break;
    case 'Add a Department':
      addDepartment();
      break;
    case 'Add a Role':
      addRole();
      break;
    case 'Add an Employee':
      addEmployee();
      break;
    case 'Update an Employee Role':
      updateEmployeeRole();
      break;
    case 'Exit':
      client.end();
      break;
  }
};

// View all departments
const viewDepartments = async () => {
  const res = await client.query('SELECT * FROM department');
  console.table(res.rows);
  mainMenu();
};

// View all roles
const viewRoles = async () => {
  const res = await client.query(
    'SELECT roles.id, roles.title, roles.salary, department.department_name FROM roles JOIN department ON roles.department_id = department.id'
  );
  console.table(res.rows);
  mainMenu();
};

// View all employees
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
  mainMenu();
};

// Add a new department
const addDepartment = async () => {
  const { departmentName } = await inquirer.prompt({
    type: 'input',
    name: 'departmentName',
    message: 'What is the name of the new department?',
  });

  await client.query('INSERT INTO department (department_name) VALUES ($1)', [
    departmentName,
  ]);
  console.log(`Department '${departmentName}' added successfully!`);
  viewDepartments();
};

// Add a new role
const addRole = async () => {
  const departments = await client.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(department => ({
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
  viewRoles();
};

// Add a new employee
const addEmployee = async () => {
  const roles = await client.query('SELECT * FROM roles');
  const roleChoices = roles.rows.map(role => ({
    name: role.title,
    value: role.id,
  }));

  const managers = await client.query('SELECT * FROM employees');
  const managerChoices = managers.rows.map(manager => ({
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
  viewEmployees();
};

// Update an employee's role
const updateEmployeeRole = async () => {
  const employees = await client.query('SELECT * FROM employees');
  const employeeChoices = employees.rows.map(employee => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
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

  await client.query('UPDATE employees SET role_id = $1 WHERE id = $2', [
    roleId,
    employeeId,
  ]);
  console.log('Employee role updated successfully!');
  viewEmployees();
};

// Start the application
displayLogo();
