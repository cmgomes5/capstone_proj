import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Edit Token Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a test token first
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Create New').click();
    await page.fill('input[placeholder*="name" i]', 'Test Hero');
    await page.fill('input[placeholder*="hp" i]', '100');
    await page.fill('input[placeholder*="initiative" i]', '15');
    await page.locator('input[name="tokenType"]').first().check(); // Ally
    await page.locator('button:has-text("Add Token")').click();
  });

  test('should open edit modal from HP modal', async ({ page }) => {
    // Click on token to open HP modal
    await page.locator('.w-28.h-28').first().click();
    
    // Click "Edit" or "Full Edit" button to open edit modal
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Should open edit token modal
    await expect(page.locator('text=Edit Token')).toBeVisible();
    await expect(page.locator('input[id="edit-name"]')).toBeVisible();
  });

  test('should populate form with existing token data', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Check that form is populated with existing data
    await expect(page.locator('input[id="edit-name"]')).toHaveValue('Test Hero');
    await expect(page.locator('input[id="edit-currentHP"]')).toHaveValue('100');
    await expect(page.locator('input[id="edit-totalHP"]')).toHaveValue('100');
    await expect(page.locator('input[id="edit-initiative"]')).toHaveValue('15');
    
    // Check that ally is selected
    const allyRadio = page.locator('input[name="editTokenType"]').first();
    await expect(allyRadio).toBeChecked();
  });

  test('should update token when form is submitted', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Change token name and HP
    await page.fill('input[id="edit-name"]', 'Updated Hero');
    await page.fill('input[id="edit-currentHP"]', '75');
    
    // Submit the form
    await page.locator('button:has-text("Update")').click();
    
    // Verify changes are reflected
    await expect(page.locator('text=Updated Hero')).toBeVisible();
    await expect(page.locator('text=75/100')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Clear required field
    await page.fill('input[id="edit-name"]', '');
    
    // Try to submit
    await page.locator('button:has-text("Update")').click();
    
    // Should show validation error (alert or form still open)
    await expect(page.locator('input[id="edit-name"]')).toBeVisible();
  });

  test('should delete token when delete button is clicked', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Mock the confirm dialog to return true
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.locator('button:has-text("Delete")').click();
    
    // Token should be removed
    await expect(page.locator('text=Test Hero')).not.toBeVisible();
    await expect(page.locator('text=No allies')).toBeVisible();
  });

  test('should cancel deletion when confirm dialog is dismissed', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Mock the confirm dialog to return false
    page.on('dialog', dialog => dialog.dismiss());
    
    // Click delete button
    await page.locator('button:has-text("Delete")').click();
    
    // Token should still exist and modal should still be open
    await expect(page.locator('text=Edit Token')).toBeVisible();
  });

  test('should close modal when Cancel button is clicked', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Click Cancel
    await page.locator('button:has-text("Cancel")').click();
    
    // Modal should be closed
    await expect(page.locator('text=Edit Token')).not.toBeVisible();
  });

  test('should handle ally/enemy type switching', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Switch to enemy
    await page.locator('input[name="editTokenType"]').nth(1).check();
    
    // Submit the form
    await page.locator('button:has-text("Update")').click();
    
    // Token should now appear in enemies section
    const enemiesSection = page.locator('.bg-gray-300');
    await expect(enemiesSection.locator('text=Test Hero')).toBeVisible();
    
    // Should not be in allies section
    const alliesSection = page.locator('.bg-gray-200');
    await expect(alliesSection.locator('text=Test Hero')).not.toBeVisible();
  });

  test('should show Save to Custom button', async ({ page }) => {
    // Open edit modal
    await page.locator('.w-28.h-28').first().click();
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Should have Save to Custom button
    await expect(page.locator('button:has-text("Save to Custom")')).toBeVisible();
  });
});
