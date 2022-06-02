describe('Timeslots page', () => {
  before(() => {
    cy.visit('/timeslots');
  });

  it('can see the intro section', () => {
    cy.pick('intro').should('be.visible');
  });

  it('can see the time slot list', () => {
    cy.pick('timeslot-list').should('be.visible');
    cy.pick('timeslot-list').get('.timeSlot__item').should('have.length', 30);
  });
});
