/**
 * Critical Path E2E Test
 * 
 * This test simulates a real user flow:
 * 1. Login
 * 2. Create a project
 * 3. Create a task in that project
 * 4. Verify the task appears in the task list
 */

describe('Critical Path: Login → Create Project → Create Task → Verify Task', () => {
    const projectName = `E2E Test Project ${Date.now()}`;
    const taskTitle = `E2E Test Task ${Date.now()}`;
    let projectId: number | null = null;

    beforeEach(() => {
        // Clear cookies and localStorage before each test
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('should complete the full user flow successfully', () => {
        // Step 1: Login
        cy.login('admin@demo.com', 'password');
        
        // Verify we're logged in and on the dashboard
        cy.url().should('not.include', '/login');
        cy.get('nav, .sidebar').should('be.visible');

        // Step 2: Navigate to Projects page
        cy.visit('/projects');
        cy.url().should('include', '/projects');
        
        // Wait for projects list to load
        cy.get('body').should('be.visible');
        
        // Step 3: Create a new project
        // Look for "New Project" or "Create Project" button
        cy.get('body').then(($body) => {
            // Try different possible button texts
            const createButton = $body.find('button:contains("New Project"), button:contains("Create Project"), a:contains("New Project"), [data-testid="create-project"]').first();
            
            if (createButton.length > 0) {
                cy.wrap(createButton).click();
            } else {
                // Fallback: look for any button that might create a project
                cy.get('button, a').contains(/new|create|add/i).first().click();
            }
        });

        // Wait for project form modal or page
        cy.get('form, [data-testid="project-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill in project form (scope to the modal form)
        cy.get('form').within(() => {
            cy.contains('label', 'Project Name').parent().find('input[type="text"]').clear().type(projectName);
        });
        
        // Fill description if field exists (checking safely)
        cy.get('form').within(() => {
            cy.get('textarea').first().type('E2E Test Project Description');
        });

        // Submit the form (scope to modal form)
        cy.intercept('POST', '**/api/v1/projects**').as('createProject');
        cy.get('form').within(() => {
            cy.get('button[type="submit"]').click();
        });
        cy.wait('@createProject');
        
        // Wait for potential validation errors or success
        cy.wait(1000);
        
        // Check if form still exists and has errors
        cy.get('body').then(($body) => {
            if ($body.find('form').length > 0) {
                // If form is still visible, check for error messages
                const errors = $body.find('.text-red-600, .text-red-500, [role="alert"]');
                if (errors.length > 0) {
                    cy.log('Form validation errors found:', errors.text());
                    // Fail the test explicitly if there are errors
                    throw new Error(`Form validation failed: ${errors.text()}`);
                }
            }
        });

        // Verify modal overlay is gone (give it more time if network is slow)
        cy.get('[class*="bg-gray-900/75"]', { timeout: 20000 }).should('not.exist');

        // Reload the projects page to ensure fresh data
        cy.visit('/projects');
        cy.url().should('include', '/projects');
        
        // Wait for the page to load
        cy.wait(1000);
        
        // Use the search bar to find the newly created project
        cy.get('input[placeholder*="Search" i]').clear().type(projectName);
        
        // Wait for search results
        cy.wait(1500);
        
        // Verify the new project appears in the list
        cy.contains(projectName, { timeout: 20000 }).should('be.visible');
        
        // Verify we're back on projects page or project was created
        cy.url().should('satisfy', (url) => {
            return url.includes('/projects') || url.includes('/projects/');
        });

        // Step 4: Navigate to Tasks page
        cy.visit('/tasks');
        cy.url().should('include', '/tasks');
        
        // Wait for tasks page to load
        cy.get('body').should('be.visible');
        cy.wait(1000); // Wait for data to load

        // Step 5: Create a new task
        cy.get('body').then(($body) => {
            // Look for "New Task" or "Create Task" button
            const createTaskButton = $body.find('button:contains("New Task"), button:contains("Create Task"), a:contains("New Task"), [data-testid="create-task"]').first();
            
            if (createTaskButton.length > 0) {
                cy.wrap(createTaskButton).click();
            } else {
                // Fallback
                cy.get('button, a').contains(/new|create|add/i).first().click();
            }
        });

        // Wait for task form modal or page
        cy.get('form, [data-testid="task-form"]', { timeout: 10000 }).should('be.visible');
        
        // Fill in task form - use #title selector since the input has id="title"
        cy.get('#title').type(taskTitle);
        
        // Fill description using id="description"
        cy.get('#description').type('E2E Test Task Description');

        // Select project using the ProjectSelector component
        // First, find the project selector input and type the project name
        cy.get('input[placeholder*="Search for a project"]').clear().type(projectName);
        cy.wait(2000); // Wait for suggestions to load
        
        // Click the first suggestion from the ProjectSelector dropdown
        // The dropdown appears in a div.absolute.z-10 container with a ul > li structure
        cy.get('form').find('div.absolute.z-10 ul li').first().click({ force: true });
        
        // Verify the project was selected (input should now show the project name)
        cy.get('input[placeholder*="Search for a project"]').should('have.value', projectName);

        // Submit the task form
        cy.intercept('POST', '**/api/v1/tasks**').as('createTask');
        cy.get('form button[type="submit"]').click();
        
        // Wait for task creation and verify it succeeded
        cy.wait('@createTask').then((interception) => {
            // Log the response for debugging
            cy.log('Task creation response:', JSON.stringify(interception.response?.body));
            
            // Check if task was created successfully (status 201)
            expect(interception.response?.statusCode).to.eq(201);
        });
        
        // Wait for modal to close
        cy.wait(1000);
        
        // Step 6: Verify task appears in the task list
        cy.visit('/tasks');
        cy.url().should('include', '/tasks');
        
        // Wait for tasks list to load
        cy.wait(1000);
        
        // Make sure we're sorting by newest first (default)
        cy.get('select').contains('Sort by Date Created').should('exist');
        
        // Use search bar to find the task
        cy.get('input[placeholder*="Search tasks"]').clear().type(taskTitle);
        
        // Wait for search results
        cy.wait(1500);
        
        // Look for the task we just created
        cy.contains(taskTitle, { timeout: 15000 }).should('be.visible');
    });

    it('should handle login with invalid credentials', () => {
        cy.visit('/');
        
        // Try to login with invalid credentials
        cy.get('input[type="email"]').type('invalid@example.com');
        cy.get('input[type="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        
        // Should show error message - look for text-red classes or alert roles
        cy.get('.text-red-600, .text-red-500, [role="alert"]').should('be.visible');
        
        // Should still show login form (not redirected to dashboard)
        cy.get('input[type="email"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should navigate through main pages after login', () => {
        cy.login();
        
        // Test navigation to different pages
        const pages = [
            { path: '/', name: 'Dashboard' },
            { path: '/projects', name: 'Projects' },
            { path: '/tasks', name: 'Tasks' },
            { path: '/resource-allocations', name: 'Resource Allocations' },
        ];

        pages.forEach(({ path, name }) => {
            cy.visit(path);
            cy.url().should('include', path);
            cy.get('body').should('be.visible');
        });
    });
});
