\c minions_db;


INSERT INTO department (department_name)
VALUES ('Finance'),
       ('Marketing'),
       ('Human Resources'),
       ('IT'),
       ('Sales');
INSERT INTO roles (title, salary, department_id)
VALUES ('Accountant', 60000, 1),
       ('Marketing Manager', 80000, 2),
       ('HR Specialist', 50000, 3),
       ('Software Engineer', 90000, 4),
       ('Sales Associate', 55000, 5);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Jane', 'Smith', 2, 1),
       ('Emily', 'Jones', 3, 1),
       ('Michael', 'Brown', 4, 2),
       ('Sarah', 'Davis', 5, 2);

INSERT INTO department (department_name)
VALUES ('Finance'),
       ('Marketing'),
       ('Human Resources'),
       ('IT'),
       ('Sales');
