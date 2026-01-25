/**
 * Docker-specific setup for Cypress
 * This file helps Cypress work in Docker environments
 */

// Set display for Xvfb if running in Docker
if (process.env.CI || process.env.DOCKER) {
    process.env.DISPLAY = ':99';
}

export {};
