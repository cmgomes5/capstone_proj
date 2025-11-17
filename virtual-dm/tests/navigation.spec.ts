import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Navigation and Turn Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create multiple test tokens for navigation testing
    const tokens = [
      { name: 'Hero 1', hp: '100', initiative: '20', ally: true },
      { name: 'Hero 2', hp: '80', initiative: '18', ally: true },
      { name: 'Goblin 1', hp: '25', initiative: '15', ally: false },
      { name: 'Goblin 2', hp: '30', initiative: '12', ally: false },
    ];
    
    for (const token of tokens) {
      await page.locator('button[title="Add Token"]').click();
      await page.locator('text=Create New').click();
      await page.fill('input[placeholder*="name" i]', token.name);
      await page.fill('input[placeholder*="hp" i]', token.hp);
      await page.fill('input[placeholder*="initiative" i]', token.initiative);
      
      if (token.ally) {
        await page.locator('input[name="tokenType"]').first().check();
      } else {
        await page.locator('input[name="tokenType"]').nth(1).check();
      }
      
      await page.locator('button:has-text("Add Token")').click();
    }
  });

  test('should display navigation arrows when tokens exist', async ({ page }) => {
    // Check for navigation arrows in the left sidebar
    const leftArrow = page.locator('.w-1\\/6 button:has-text("←")');
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    
    await expect(leftArrow).toBeVisible();
    await expect(rightArrow).toBeVisible();
  });

  test('should navigate between tokens using arrows', async ({ page }) => {
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    
    // Click next arrow and verify navigation
    await rightArrow.click();
    
    // The current token indicator should be visible
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay).toBeVisible();
  });

  test('should display all alive tokens in sidebar', async ({ page }) => {
    // All tokens should be visible in the sidebar initially
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    
    // Should have 4 tokens (all alive)
    await expect(sidebarTokens).toHaveCount(4);
  });

  test('should allow clicking sidebar tokens to navigate', async ({ page }) => {
    // Click on a token in the sidebar
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    const secondToken = sidebarTokens.nth(1);
    
    await secondToken.click();
    
    // Should change the current token (ring styling should update)
    await expect(secondToken).toHaveClass(/ring-2 ring-gray-800/);
  });

  test('should show initiative numbers on tokens', async ({ page }) => {
    // Check that initiative numbers are displayed (use first() to avoid strict mode violations)
    await expect(page.locator('text=20').first()).toBeVisible(); // Hero 1
    await expect(page.locator('text=18').first()).toBeVisible(); // Hero 2
    await expect(page.locator('text=15').first()).toBeVisible(); // Goblin 1
    await expect(page.locator('text=12').first()).toBeVisible(); // Goblin 2
  });

  test('should separate allies and enemies in main display', async ({ page }) => {
    // Check that allies appear in the top section
    const alliesSection = page.locator('.bg-gray-200');
    await expect(alliesSection.locator('text=Hero 1')).toBeVisible();
    await expect(alliesSection.locator('text=Hero 2')).toBeVisible();
    
    // Check that enemies appear in the bottom section
    const enemiesSection = page.locator('.bg-gray-300');
    await expect(enemiesSection.locator('text=Goblin 1')).toBeVisible();
    await expect(enemiesSection.locator('text=Goblin 2')).toBeVisible();
  });

  test('should highlight current token with yellow ring', async ({ page }) => {
    // The current token should have a yellow ring
    const currentToken = page.locator('.ring-4.ring-yellow-400');
    await expect(currentToken).toBeVisible();
  });

  test('should display HP bars for all tokens', async ({ page }) => {
    // Check for HP display format (current/total)
    await expect(page.locator('text=100/100')).toBeVisible(); // Hero 1
    await expect(page.locator('text=80/80')).toBeVisible();   // Hero 2
    await expect(page.locator('text=25/25')).toBeVisible();   // Goblin 1
    await expect(page.locator('text=30/30')).toBeVisible();   // Goblin 2
  });
});
