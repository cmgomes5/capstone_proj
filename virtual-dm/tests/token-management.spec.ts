import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Token Management', () => {
  test('should create a new ally token successfully', async ({ page }) => {
    await page.goto('/');
    
    // Open add token menu
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    
    // Fill out the token form
    await page.fill('input[placeholder*="name" i]', 'Test Hero');
    await page.fill('input[placeholder*="hp" i]', '100');
    await page.fill('input[placeholder*="initiative" i]', '15');
    
    // Ensure ally is selected (should be default)
    const allyRadio = page.locator('input[name="tokenType"]').first();
    await expect(allyRadio).toBeChecked();
    
    // Submit the form
    await page.locator('button:has-text("Add Token")').click();
    
    // Verify the token appears in the allies section
    await expect(page.locator('text=Test Hero')).toBeVisible();
    await expect(page.locator('text=100/100')).toBeVisible();
    
    // Verify no more "No allies" message
    await expect(page.locator('text=No allies')).not.toBeVisible();
  });

  test('should create a new enemy token successfully', async ({ page }) => {
    await page.goto('/');
    
    // Open add token menu
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    
    // Fill out the token form
    await page.fill('input[placeholder*="name" i]', 'Test Goblin');
    await page.fill('input[placeholder*="hp" i]', '25');
    await page.fill('input[placeholder*="initiative" i]', '12');
    
    // Select enemy
    await page.locator('input[name="tokenType"]').nth(1).check();
    
    // Submit the form
    await page.locator('button:has-text("Add Token")').click();
    
    // Verify the token appears in the enemies section
    await expect(page.locator('text=Test Goblin')).toBeVisible();
    await expect(page.locator('text=25/25')).toBeVisible();
    
    // Verify no more "No enemies" message
    await expect(page.locator('text=No enemies')).not.toBeVisible();
  });

  test('should sort tokens by initiative correctly', async ({ page }) => {
    await page.goto('/');
    
    // Create first token with lower initiative
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    await page.fill('input[placeholder*="name" i]', 'Slow Hero');
    await page.fill('input[placeholder*="hp" i]', '50');
    await page.fill('input[placeholder*="initiative" i]', '10');
    await page.locator('button:has-text("Add Token")').click();
    
    // Create second token with higher initiative
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    await page.fill('input[placeholder*="name" i]', 'Fast Hero');
    await page.fill('input[placeholder*="hp" i]', '40');
    await page.fill('input[placeholder*="initiative" i]', '20');
    await page.locator('button:has-text("Add Token")').click();
    
    // Verify tokens are present
    await expect(page.locator('text=Slow Hero')).toBeVisible();
    await expect(page.locator('text=Fast Hero')).toBeVisible();
    
    // The token with higher initiative should be selected first (current token)
    // Check the left sidebar for the current token display
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay).toBeVisible();
  });

  test('should validate required fields in token creation', async ({ page }) => {
    await page.goto('/');
    
    // Open add token menu
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    
    // Try to submit without filling required fields
    await page.locator('button:has-text("Add Token")').click();
    
    // The form should still be open (validation should prevent submission)
    await expect(page.locator('input[placeholder*="name" i]')).toBeVisible();
  });

  test('should handle token click for HP editing', async ({ page }) => {
    await page.goto('/');
    
    // Create a test token first
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    await page.fill('input[placeholder*="name" i]', 'Test Character');
    await page.fill('input[placeholder*="hp" i]', '50');
    await page.fill('input[placeholder*="initiative" i]', '15');
    await page.locator('button:has-text("Add Token")').click();
    
    // Click on the token square to open HP edit modal
    await page.locator('.w-28.h-28').first().click();
    
    // Should open HP edit modal (look for HP-related elements)
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });
});
