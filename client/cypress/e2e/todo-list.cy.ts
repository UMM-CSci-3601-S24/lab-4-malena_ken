import { TodoListPage } from "cypress/support/todo-list.po";

const page = new TodoListPage();

describe('Todo list', () => {

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct page title', () => {
    page.getPageTitle().should('eq', 'Todos');
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('Should select something in the category filter and check that it returned correct elements', () => {
    // Filter for category 'software design'
    page.selectCategory('software design');

    page.getTodoCards().should('have.lengthOf', 74);

    // All of the todo cards that shouldn't be found
    page.getTodoCards().find('.todo-card-category')
      .should('not.contain.text', 'homework')
      .should('not.contain.text', 'video games')
      .should('not.contain.text', 'groceries');
  });

  it('Should type a name in the owner filter and check that it returned correct elements', () => {
    // Filter for owner 'Blanche'
    cy.get('[data-test=todoOwnerInput]').type('Blanche');

    page.getTodoCards().should('have.lengthOf', 43);

    // All of the todo cards should have the owner we are filtering by
    page.getTodoCards().find('.todo-card-owner').each($card => {
      cy.wrap($card).should('have.text', 'Blanche');
    })

    page.getTodoCards().find('.todo-card-owner')
      .should('not.contain.text', 'Fry')
      .should('not.contain.text', 'Barry')
      .should('not.contain.text', 'Dawn');
  });

  it('Should type something in the body filter and check that it returned correct elements', () => {
    // Filter for body 'Amet do velit tempor'
    cy.get('[data-test=todoBodyInput]').type('Amet do velit tempor');

    page.getTodoCards().should('have.lengthOf', 1);
    page.getTodoCards().find('.todo-card-owner').each($card => {
      cy.wrap($card).should('have.text', 'Blanche');
    })
  });

  it('Should type a number in the limit filter and check that it returned correct elements', () => {
    // Filter for limit '5'
    cy.get('[data-test=todoLimitInput]').type('5');

    page.getTodoCards().should('have.lengthOf', 5);
  });

  it('Should select a category to Sort By and check that it returned correct elements', () => {

    page.selectSort('category');
    cy.get('[data-test=todoLimitInput]').type('20');
    page.getTodoCards().find('.todo-card-category')
      .should('contain.text', 'groceries')
      .should('not.contain.text', 'homework')
      .should('not.contain.text', 'video games')
      .should('not.contain.text', 'software design');
  });
});
