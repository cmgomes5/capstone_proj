import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Basic Functionality', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and has the expected title
    await expect(page).toHaveTitle(/Virtual DM/);
    
    // Check for key UI elements
    await expect(page.locator('text=No tokens yet')).toBeVisible();
    await expect(page.locator('text=No allies')).toBeVisible();
    await expect(page.locator('text=No enemies')).toBeVisible();
    
    // Check for the add token button
    await expect(page.locator('button[title="Add Token"]')).toBeVisible();
  });

  test('should display the correct layout structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for the main layout structure
    const leftSidebar = page.locator('.w-1\\/6');
    const mainDisplay = page.locator('.w-5\\/6');
    
    await expect(leftSidebar).toBeVisible();
    await expect(mainDisplay).toBeVisible();
    
    // Check for the split display (allies and enemies sections)
    await expect(page.locator('text=No allies')).toBeVisible();
    await expect(page.locator('text=No enemies')).toBeVisible();
  });

  test('should open add token menu when clicking the add button', async ({ page }) => {
    await page.goto('/');
    
    // Click the add token button
    await page.locator('button[title="Add Token"]').click();
    
    // Check that the menu appears with options
    await expect(page.locator('text=Create New')).toBeVisible();
    await expect(page.locator('text=Load Existing')).toBeVisible();
  });

  test('should close add token menu when clicking close button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load completely (fixes Safari timing issue)
    await page.waitForLoadState('networkidle');
    
    // Open the menu
    await page.locator('button[title="Add Token"]').click();
    await expect(page.locator('text=Create New')).toBeVisible();
    
    // Click the close button (×)
    await page.locator('button:has-text("×")').click();
    
    // Menu should be closed
    await expect(page.locator('text=Create New')).not.toBeVisible();
  });
});
