export class TodoListPage {
  navigateTo() {
    return cy.visit('/todos');
  }

  getUrl() {
    return cy.url();
  }


  /**
   * Gets the page title, which appears in the page tab
   *
   * @return the title of the component page
   */
  getPageTitle() {
    return cy.title();
  }

  getTodoTitle() {
    return cy.get('.todo-list-title');
  }

  getTodoCards() {
    return cy.get('.todo-cards-container app-todo-card');
  }

  selectCategory(category: string) {
    return cy.get('[data-test=todoCategorySelect]').click()
      .get(`mat-option[value="${category}"]`).click();
  }

  selectSort(sortBy: 'owner' | 'category' | 'body' | 'status') {
    return cy.get('[data-test=todoSortSelect]').click()
      .get(`mat-option[value="${sortBy}"]`).click();
  }

}
