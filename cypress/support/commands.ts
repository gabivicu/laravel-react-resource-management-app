/// <reference types="cypress" />

/**
 * Custom Cypress commands for authentication
 */

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Login as a test user
             * @example cy.login('admin@demo.com', 'password')
             */
            login(email?: string, password?: string): Chainable<void>;
            
            /**
             * Logout current user
             * @example cy.logout()
             */
            logout(): Chainable<void>;
            
            /**
             * Check if user is logged in
             * @example cy.isLoggedIn().should('be.true')
             */
            isLoggedIn(): Chainable<boolean>;
        }
    }
}

const DEFAULT_EMAIL = 'admin@demo.com';
const DEFAULT_PASSWORD = 'password';

Cypress.Commands.add('login', (email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) => {
    cy.visit('/').then(() => {
        cy.log('Visited root path');
        cy.url().then(url => cy.log('Current URL:', url));
    });
    
    // Check if we are already logged in
    cy.get('body').then($body => {
        if ($body.find('nav, [data-testid="dashboard"], .sidebar').length > 0) {
            cy.log('Already logged in');
            return;
        }

        // Wait for login form
        cy.log('Waiting for login form...');
        cy.get('input[type="email"]', { timeout: 20000 }).should('be.visible');
        
        // Fill in login form
        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').type(password);
        
        // Submit form
        cy.get('button[type="submit"]').click();
        
        // Wait for navigation to dashboard
        cy.url().should('not.include', '/login');
        
        // Wait for main content to load
        cy.get('nav, [data-testid="dashboard"], .sidebar', { timeout: 20000 }).should('be.visible');
    });
});

Cypress.Commands.add('logout', () => {
    // Look for logout button
    cy.get('body').then(($body) => {
        if ($body.find('button:contains("Logout"), a:contains("Logout"), [data-testid="logout"]').length > 0) {
            cy.get('button:contains("Logout"), a:contains("Logout"), [data-testid="logout"]').first().click();
            cy.url().should('include', '/login');
        }
    });
});

Cypress.Commands.add('isLoggedIn', () => {
    return cy.url().then((url) => {
        if (url.includes('/login')) {
            return false;
        }
        return cy.get('nav, [data-testid="dashboard"], .sidebar').should('exist').then(() => true);
    });
});

export {};
