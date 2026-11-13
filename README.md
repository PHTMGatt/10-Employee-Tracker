# Employee Tracker

A command-line employee database manager: Node.js, Inquirer and PostgreSQL, for viewing and editing departments, roles and employees from a menu.

Walkthrough video: https://youtu.be/ZpXu1Ux4o-0

## What it does

- **View:** all departments, all roles (with department), all employees (with title, department, salary and manager), employees by manager, and employees by department.
- **Add:** departments, roles and employees.
- **Update:** an employee's role, or an employee's manager.
- **Delete:** a department from the menu. The schema cascades, so its roles and their employees go with it.
- **Output:** results print as tables in the terminal under an ASCII-art banner.

## Tech stack

Node.js, Inquirer 8, `pg` (PostgreSQL client), `console.table`, `asciiart-logo`. PostgreSQL for the data.

## Run it

Needs Node.js and PostgreSQL.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database and sample data with `psql` (the schema script creates `minions_db`):

   ```bash
   psql -U postgres -f Assets/schema.sql
   psql -U postgres -d minions_db -f Assets/seeds.sql
   ```

3. The connection settings (host, user, database, port and password) are written directly in `index.js`. Edit them to match your local PostgreSQL before starting.

4. Start the app:

   ```bash
   node index.js
   ```

There is no automated test suite.

## Database

Three tables, created by `Assets/schema.sql`:

| Table | Columns |
|---|---|
| `department` | `id`, `department_name` |
| `roles` | `id`, `title`, `salary`, `department_id` (references `department`) |
| `employees` | `id`, `first_name`, `last_name`, `role_id` (references `roles`), `manager_id` (references `employees`) |

The planning diagram is `Assets/100-sql-challenge-ERD.png`. Its table and column names differ slightly from the final schema.

## What I learned / built

- Designing a small relational schema with foreign keys, cascading deletes and a self-referencing manager column.
- Writing SQL joins for the reports, and using parameterised queries (`$1`, `$2`) for every insert, update and delete.
- Building an interactive CLI with async/await and Inquirer. Known rough edge: the connection details should move to environment variables rather than living in `index.js`.
