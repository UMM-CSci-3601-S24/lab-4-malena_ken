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
    page.selectMatSelectValue(page.getFormField('status'), 'complete');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
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

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the body field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
  });


});
