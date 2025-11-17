import { test, expect } from '@playwright/test';

test.describe('Virtual DM - HP Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load completely (fixes Safari timing issue)
    await page.waitForLoadState('networkidle');
    
    // Create a test token for HP management testing
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    await page.fill('input[placeholder*="name" i]', 'Test Hero');
    await page.fill('input[placeholder*="hp" i]', '100');
    await page.fill('input[placeholder*="initiative" i]', '15');
    await page.locator('input[name="tokenType"]').first().check(); // Ally
    await page.locator('button:has-text("Add Token")').click();
  });

  test('should open HP edit modal when clicking on token', async ({ page }) => {
    // Click on the token to open HP edit modal
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Should open HP edit modal with current HP input
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('should display current HP in the modal input', async ({ page }) => {
    // Click on the token
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // The input should show current HP (100)
    const hpInput = page.locator('input[type="number"]');
    await expect(hpInput).toHaveValue('100');
  });

  test('should update HP when value is changed and saved', async ({ page }) => {
    // Click on the token
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Change HP value
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('75');
    
    // Save the changes (look for OK/Save button)
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Verify HP is updated in the display
    await expect(page.locator('text=75/100')).toBeVisible();
  });

  test('should update HP bar visual representation', async ({ page }) => {
    // Click on the token
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Change HP to 50% (50/100)
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('50');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // The HP bar should reflect 50% width - look for the actual HP bar element
    const hpBar = page.locator('.w-28.h-6 .bg-red-500').first();
    await expect(hpBar).toHaveAttribute('style', /width.*50%/);
  });

  test('should not allow negative HP values', async ({ page }) => {
    // Click on the token
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Try to set negative HP
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('-10');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // HP should be clamped to 0
    await expect(page.locator('text=0/100')).toBeVisible();
  });

  test('should allow HP above maximum (current behavior)', async ({ page }) => {
    // Click on the token
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Try to set HP above maximum
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('150');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // HP is currently not clamped (this tests current behavior)
    await expect(page.locator('text=150/100')).toBeVisible();
  });

  test('should close HP modal when clicking cancel or outside', async ({ page }) => {
    // Click on the token to open modal
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Modal should be open
    await expect(page.locator('input[type="number"]')).toBeVisible();
    
    // Click cancel or close button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("×")').first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    } else {
      // If no cancel button, try clicking outside the modal
      await page.locator('body').click({ position: { x: 50, y: 50 } });
    }
    
    // Modal should be closed
    await expect(page.locator('input[type="number"]')).not.toBeVisible();
  });

  test('should show full edit option in HP modal', async ({ page }) => {
    // Click on the token to open HP modal
    const tokenSquare = page.locator('.w-28.h-28').first();
    await tokenSquare.click();
    
    // Should have option to open full edit
    await expect(page.locator('button:has-text("Edit"), button:has-text("Full Edit")')).toBeVisible();
  });
});
