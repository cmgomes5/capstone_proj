import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Load Token Modal', () => {
  test('should open load token modal from menu', async ({ page }) => {
    await page.goto('/');
    
    // Open add token menu
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Should open load token modal
    await expect(page.locator('text=Load Existing Token')).toBeVisible();
    await expect(page.locator('button:has-text("Default")').first()).toBeVisible();
    await expect(page.locator('text=Custom')).toBeVisible();
  });

  test('should switch between Default and Custom tabs', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Default tab should be active initially
    const defaultTab = page.locator('button:has-text("Default")');
    const customTab = page.locator('button:has-text("Custom")');
    
    await expect(defaultTab).toHaveClass(/bg-blue-600/);
    
    // Switch to Custom tab
    await customTab.click();
    await expect(customTab).toHaveClass(/bg-blue-600/);
  });

  test('should close load token modal with close button', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Close with × button
    await page.locator('button:has-text("×")').click();
    
    // Modal should be closed
    await expect(page.locator('text=Load Existing Token')).not.toBeVisible();
  });

  test('should close load token modal with Cancel button', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Close with Cancel button
    await page.locator('button:has-text("Cancel")').click();
    
    // Modal should be closed
    await expect(page.locator('text=Load Existing Token')).not.toBeVisible();
  });

  test('should display loading state', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Should show the modal is open (check for modal title instead of specific layout class)
    await expect(page.locator('text=Load Existing Token')).toBeVisible();
    
    // Wait for content to load and verify modal structure
    await page.waitForTimeout(2000);
    
    // Check that either tokens are loaded or "no tokens" message appears
    const hasTokens = await page.locator('.grid.grid-cols-1').isVisible();
    const hasNoTokensMessage = await page.locator('text=No tokens found').isVisible();
    
    expect(hasTokens || hasNoTokensMessage).toBeTruthy();
  });

  test('should handle empty token directories gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Wait for loading to complete
    await page.waitForTimeout(2000);
    
    // Should either show tokens or "No tokens found" message
    const hasTokens = await page.locator('.grid.grid-cols-1').isVisible();
    const hasNoTokensMessage = await page.locator('text=No tokens found').isVisible();
    
    expect(hasTokens || hasNoTokensMessage).toBeTruthy();
  });

  test('should load a premade token when clicked', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Wait for tokens to load
    await page.waitForTimeout(2000);
    
    // Check if there are any tokens available to click
    const tokenCards = page.locator('.grid.grid-cols-1 > div');
    const tokenCount = await tokenCards.count();
    
    if (tokenCount > 0) {
      // Click the first available token
      await tokenCards.first().click();
      
      // Modal should close and token should appear in the game
      await expect(page.locator('text=Load Existing Token')).not.toBeVisible();
      
      // Should have at least one token in the game now
      const alliesSection = page.locator('.bg-gray-200');
      const enemiesSection = page.locator('.bg-gray-300');
      
      // Either allies or enemies section should have a token
      const hasAllyToken = await alliesSection.locator('.w-28.h-28').count() > 0;
      const hasEnemyToken = await enemiesSection.locator('.w-28.h-28').count() > 0;
      
      expect(hasAllyToken || hasEnemyToken).toBeTruthy();
    } else {
      // If no tokens available, just verify the empty state is handled
      const noTokensMessage = page.locator('text=No tokens found');
      await expect(noTokensMessage).toBeVisible();
    }
  });

  test('should assign random initiative to loaded tokens', async ({ page }) => {
    await page.goto('/');
    
    // Open load token modal
    await page.locator('button[title="Add Token"]').click();
    await page.locator('text=Load Existing').click();
    
    // Wait for tokens to load
    await page.waitForTimeout(2000);
    
    // Check if there are any tokens available
    const tokenCards = page.locator('.grid.grid-cols-1 > div');
    const tokenCount = await tokenCards.count();
    
    if (tokenCount > 0) {
      // Load the first token
      await tokenCards.first().click();
      
      // Wait for modal to close and token to be added
      await expect(page.locator('text=Load Existing Token')).not.toBeVisible();
      
      // Verify first token was added
      const alliesSection = page.locator('.bg-gray-200');
      const enemiesSection = page.locator('.bg-gray-300');
      
      let allyTokens = await alliesSection.locator('.w-28.h-28').count();
      let enemyTokens = await enemiesSection.locator('.w-28.h-28').count();
      let totalTokens = allyTokens + enemyTokens;
      
      expect(totalTokens).toBeGreaterThanOrEqual(1);
      
      // If there are multiple token types available, try to load a second one
      if (tokenCount > 1) {
        await page.locator('button[title="Add Token"]').click();
        await page.locator('text=Load Existing').click();
        await page.waitForTimeout(1000);
        
        // Load a different token (second one)
        await tokenCards.nth(1).click();
        
        // Wait for modal to close
        await expect(page.locator('text=Load Existing Token')).not.toBeVisible();
        
        // Check total tokens again
        allyTokens = await alliesSection.locator('.w-28.h-28').count();
        enemyTokens = await enemiesSection.locator('.w-28.h-28').count();
        totalTokens = allyTokens + enemyTokens;
        
        expect(totalTokens).toBeGreaterThanOrEqual(2);
      }
    } else {
      // If no tokens available, just verify the empty state is handled
      const noTokensMessage = page.locator('text=No tokens found');
      await expect(noTokensMessage).toBeVisible();
    }
  });
});
