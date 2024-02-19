import { Todo } from 'src/app/todos/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD TODO button should be disabled until all the necessary fields
    // are filled. Once the last (`#statusField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('test');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectValue(page.getFormField('category'), 'software design');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('test');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectBoolean(page.getFormField('status'), 'Complete');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs for owner', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type('This is a very long name that goes beyond the 50 character limit').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');
  });

  it('Should show error messages for invalid inputs for body', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the body field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Some more tests for various invalid body inputs
    const longString = 'a'.repeat(201);
    page.getFormField('body').clear().type(longString).blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Entering a valid body should remove the error.
    page.getFormField('body').clear().type('This is a valid body').blur();
    cy.get('[data-test=bodyError]').should('not.exist');
  });

  it('Should show error messages for invalid inputs for category', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]', { timeout: 6000 }).should('not.exist');
    // Just clicking the category field without selecting anything should cause an error message
    page.getFormField('category').focus().blur();
    cy.get('[data-test=categoryError]', { timeout: 6000 }).should('exist').and('be.visible');
  });

  it('Should show error messages for invalid inputs for status', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=statusError]', { timeout: 6000 }).should('not.exist');
    // Just clicking the status field without selecting anything should cause an error message
    page.getFormField('status').focus().blur();
    cy.get('[data-test=statusError]', { timeout: 6000 }).should('exist').and('be.visible');
  });

  /* COULDN'T GET THIS TO WORK - I THINK THE DROP DOWNS ARE COVERING THE OTHER INPUTS - KEN
    describe('Adding a new todo', () => {

      beforeEach(() => {
        cy.task('seed:database');
      });

      it('Should go to the right page, and have the right info', () => {
        const todo: Todo = {
          _id: null,
          owner: 'Test User',
          body: 'This is a test todo',
          category: 'software design',
          status: false,
        };

        page.addTodo(todo);

        // New URL should end in the 24 hex character Mongo ID of the newly added todo
        cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

        // The new todo should have all the same attributes as we entered
        cy.get('.todo-owner').should('have.text', todo.owner);
        cy.get('.todo-body').should('have.text', todo.body);
        cy.get('.todo-status').should('have.text', 'Incomplete');
        cy.get('.todo-category').should('have.text', todo.category);

        // We should see the confirmation message at the bottom of the screen
        page.getSnackBar().should('contain', `Added todo ${todo.owner}`);
      });

      it('Should fail with no category', () => {
        const todo: Todo = {
          _id: null,
          owner: 'Test User',
          category: '',
          body: 'This is a test todo',
          status: false,
        };

        page.addTodo(todo);

        // We should see the error message
        page.getSnackBar().should('contain', 'Category is required');
      });
    }); */

});
