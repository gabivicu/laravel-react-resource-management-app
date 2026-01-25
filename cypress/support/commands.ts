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
    const API_BASE_URL = Cypress.env('API_BASE_URL') || 'http://localhost/api/v1';
    
    // Try to login via API first (more reliable for E2E tests)
    cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/auth/login`,
        body: { email, password },
        failOnStatusCode: false, // Don't fail on 429 or other errors
    }).then((response) => {
        if (response.status === 200 && response.body?.data?.token) {
            // Login successful via API - set token and user data
            const { user, token, organization } = response.body.data;
            
            // Set Zustand state in localStorage (auth-storage is the key used by Zustand persist)
            cy.window().then((win) => {
                // Set auth_token for API interceptor
                win.localStorage.setItem('auth_token', token);
                
                // Set tenant_id if organization exists
                if (organization) {
                    win.localStorage.setItem('tenant_id', organization.id.toString());
                }
                
                // Set Zustand persist state (auth-storage is the storage key)
                // Zustand persist saves the partialized state directly
                const authState = {
                    user: user,
                    currentOrganization: organization || null,
                    token: token,
                    isAuthenticated: true,
                };
                win.localStorage.setItem('auth-storage', JSON.stringify(authState));
            });
            
            // Visit the app to load with the token and state
            cy.visit('/');
            cy.url().should('not.include', '/login');
            cy.get('header, aside, main, [data-testid="app-layout"]', { timeout: 20000 }).should('be.visible');
        } else if (response.status === 429) {
            // Rate limited - log warning and try form-based login
            cy.log('⚠️ Rate limited via API - falling back to form-based login');
            cy.log('💡 Tip: Clear cache with: docker-compose exec app php artisan cache:clear');
            
            // Fallback to form-based login
            cy.visit('/');
            
            cy.get('body').then($body => {
                if ($body.find('header, aside, main, [data-testid="dashboard"]').length > 0) {
                    cy.log('Already logged in');
                    return;
                }

                cy.get('input[type="email"]', { timeout: 20000 }).should('be.visible');
                cy.get('input[type="email"]').type(email);
                cy.get('input[type="password"]').type(password);
                cy.get('button[type="submit"]').click();
                
                // Wait a bit and check if we're logged in or still on login page
                cy.wait(2000);
                cy.url().then((url) => {
                    if (!url.includes('/login')) {
                        // Successfully logged in
                        cy.get('header, aside, main, [data-testid="app-layout"]', { timeout: 20000 }).should('be.visible');
                    } else {
                        // Still on login page - might be rate limited
                        cy.log('⚠️ Still on login page - may be rate limited');
                    }
                });
            });
        } else {
            // Other error - try form-based login as fallback
            cy.log(`⚠️ API login failed (status: ${response.status}) - falling back to form-based login`);
            cy.visit('/');
            
            cy.get('body').then($body => {
                if ($body.find('header, aside, main, [data-testid="dashboard"]').length > 0) {
                    cy.log('Already logged in');
                    return;
                }

                cy.get('input[type="email"]', { timeout: 20000 }).should('be.visible');
                cy.get('input[type="email"]').type(email);
                cy.get('input[type="password"]').type(password);
                cy.get('button[type="submit"]').click();
                
                cy.wait(2000);
                cy.url().then((url) => {
                    if (!url.includes('/login')) {
                        cy.get('header, aside, main, [data-testid="app-layout"]', { timeout: 20000 }).should('be.visible');
                    }
                });
            });
        }
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
        // Check for elements that indicate we're logged in
        return cy.get('header, aside, main, [data-testid="dashboard"]').should('exist').then(() => true);
    });
});

export {};
