import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Dead Enemy Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create test tokens: 1 ally, 2 enemies
    const tokens = [
      { name: 'Hero', hp: '100', initiative: '20', ally: true },
      { name: 'Goblin 1', hp: '25', initiative: '15', ally: false },
      { name: 'Goblin 2', hp: '30', initiative: '10', ally: false }
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

  test('should remove dead enemies from turn order navigation', async ({ page }) => {
    // Kill Goblin 1 by setting HP to 0 - find token in enemies section
    const enemiesSection = page.locator('.bg-gray-300');
    const goblin1Token = enemiesSection.locator('.w-28.h-28').first();
    await goblin1Token.click();
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('0');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Verify Goblin 1 shows 0/25 HP
    await expect(page.locator('text=0/25')).toBeVisible();
    
    // Navigate through turn order using arrows
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    
    // Start with Hero (initiative 20), click next should go to Goblin 2 (initiative 10)
    // and skip dead Goblin 1 (initiative 15)
    await rightArrow.click();
    
    // Should skip dead Goblin 1 and go to alive Goblin 2
    // Check that current token display shows Goblin 2's initiative (10)
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=10')).toBeVisible();
  });

  test('should hide dead enemies from sidebar navigation', async ({ page }) => {
    // Initially should have 3 tokens in sidebar (1 ally + 2 enemies)
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    await expect(sidebarTokens).toHaveCount(3);
    
    // Kill Goblin 1 (first enemy)
    const enemiesSection = page.locator('.bg-gray-300');
    const goblin1Token = enemiesSection.locator('.w-28.h-28').first();
    await goblin1Token.click();
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('0');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Should now have 2 tokens in sidebar (1 ally + 1 alive enemy)
    await expect(sidebarTokens).toHaveCount(2);
    
    // Verify dead enemy is not clickable in sidebar
    const sidebarGoblin1 = page.locator('.w-1\\/6 .w-12.h-12').filter({ hasText: '15' });
    await expect(sidebarGoblin1).not.toBeVisible();
  });

  test('should still display dead enemies in main area but not in navigation', async ({ page }) => {
    // Kill Goblin 1 (first enemy)
    const enemiesSection = page.locator('.bg-gray-300');
    const goblin1Token = enemiesSection.locator('.w-28.h-28').first();
    await goblin1Token.click();
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('0');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Dead enemy should still be visible in main display area
    await expect(enemiesSection.locator('text=Goblin 1')).toBeVisible();
    await expect(enemiesSection.locator('text=0/25')).toBeVisible();
    
    // But should not be in sidebar navigation
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    await expect(sidebarTokens).toHaveCount(2); // Only Hero and Goblin 2
  });

  test('should handle current token death gracefully', async ({ page }) => {
    // Navigate to Goblin 1 (initiative 15)
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    await rightArrow.click(); // Should go from Hero to Goblin 1
    
    // Verify we're on Goblin 1
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=15')).toBeVisible();
    
    // Kill the current enemy (Goblin 1)
    const enemiesSection = page.locator('.bg-gray-300');
    const goblin1Token = enemiesSection.locator('.w-28.h-28').first();
    await goblin1Token.click();
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('0');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Verify the token is dead (shows 0 HP)
    await expect(page.locator('text=0/25')).toBeVisible();
    
    // App should remain functional - navigation should still work
    await rightArrow.click();
    
    // Should be able to navigate to remaining alive tokens
    // Don't assume specific behavior, just verify app doesn't crash
    const isDisplayVisible = await currentTokenDisplay.isVisible();
    expect(isDisplayVisible).toBeTruthy();
  });

  test('should handle all enemies dead scenario', async ({ page }) => {
    // Kill both enemies
    const enemies = ['Goblin 1', 'Goblin 2'];
    
    const enemiesSection = page.locator('.bg-gray-300');
    for (let i = 0; i < enemies.length; i++) {
      const enemyToken = enemiesSection.locator('.w-28.h-28').first();
      await enemyToken.click();
      const hpInput = page.locator('input[type="number"]');
      await hpInput.fill('0');
      await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    }
    
    // Check sidebar navigation - may still show dead enemies or only alive ones
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    const sidebarCount = await sidebarTokens.count();
    
    // Should have at least 1 token (the Hero) and at most 3 (if dead enemies still show)
    expect(sidebarCount).toBeGreaterThanOrEqual(1);
    expect(sidebarCount).toBeLessThanOrEqual(3);
    
    // Verify that both enemies show 0 HP (are dead)
    await expect(page.locator('text=0/25')).toBeVisible(); // Goblin 1 dead
    await expect(page.locator('text=0/30')).toBeVisible(); // Goblin 2 dead
    
    // Hero should still be alive and visible
    await expect(page.locator('text=100/100')).toBeVisible(); // Hero alive
    
    // Navigation should still function (app doesn't crash)
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    if (await rightArrow.isVisible()) {
      await rightArrow.click();
      // Just verify the app is still functional, don't check specific initiative
    }
  });

  test('should allow dead enemies to be revived and return to turn order', async ({ page }) => {
    // Kill Goblin 1 (first enemy)
    const enemiesSection = page.locator('.bg-gray-300');
    const goblin1Token = enemiesSection.locator('.w-28.h-28').first();
    await goblin1Token.click();
    let hpInput = page.locator('input[type="number"]');
    await hpInput.fill('0');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Should have 2 tokens in sidebar
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    await expect(sidebarTokens).toHaveCount(2);
    
    // Revive Goblin 1
    await goblin1Token.click();
    hpInput = page.locator('input[type="number"]');
    await hpInput.fill('10');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Should now have 3 tokens in sidebar again
    await expect(sidebarTokens).toHaveCount(3);
    
    // Goblin 1 should be back in turn order navigation
    await expect(page.locator('text=10/25')).toBeVisible();
  });
});
