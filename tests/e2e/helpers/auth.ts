import { Page } from '@playwright/test';

/**
 * Helper functions for authentication in E2E tests
 */

const TEST_USER = {
    email: process.env.E2E_TEST_EMAIL || 'admin@demo.com',
    password: process.env.E2E_TEST_PASSWORD || 'password',
};

/**
 * Login as a test user
 */
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
    await page.goto('/');
    
    // Wait for login form to be visible
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    
    // Fill in login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL(/\/(dashboard|\/)$/, { timeout: 10000 });
    
    // Wait for the main content to load (check for sidebar or dashboard content)
    await page.waitForSelector('nav, [data-testid="dashboard"], .sidebar', { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
    // Look for logout button (usually in header or sidebar)
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
    
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutButton.click();
        await page.waitForURL(/\/login/, { timeout: 5000 });
    }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
    try {
        // Check if we're on login page
        const isOnLoginPage = page.url().includes('/login');
        if (isOnLoginPage) {
            return false;
        }
        
        // Check for authenticated content (sidebar, dashboard, etc.)
        const authenticatedContent = await page.locator('nav, [data-testid="dashboard"], .sidebar').first().isVisible({ timeout: 2000 });
        return authenticatedContent;
    } catch {
        return false;
    }
}
