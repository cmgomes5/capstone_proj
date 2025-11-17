import { test, expect } from '@playwright/test';

test.describe('Virtual DM - Initiative Edge Cases', () => {
  test('should handle tokens with identical initiative values', async ({ page }) => {
    await page.goto('/');
    
    // Create multiple tokens with the same initiative (15)
    const tokens = [
      { name: 'Fighter', hp: '100', initiative: '15', ally: true },
      { name: 'Wizard', hp: '80', initiative: '15', ally: true },
      { name: 'Orc 1', hp: '30', initiative: '15', ally: false },
      { name: 'Orc 2', hp: '25', initiative: '15', ally: false }
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
    
    // All tokens should be visible
    await expect(page.locator('text=Fighter')).toBeVisible();
    await expect(page.locator('text=Wizard')).toBeVisible();
    await expect(page.locator('text=Orc 1')).toBeVisible();
    await expect(page.locator('text=Orc 2')).toBeVisible();
    
    // Verify all tokens were created by counting tokens in both sections
    const alliesSection = page.locator('.bg-gray-200');
    const enemiesSection = page.locator('.bg-gray-300');
    
    const allyTokens = await alliesSection.locator('.w-28.h-28').count();
    const enemyTokens = await enemiesSection.locator('.w-28.h-28').count();
    const totalTokens = allyTokens + enemyTokens;
    
    expect(totalTokens).toBe(4); // 2 allies + 2 enemies
    
    // Navigation should work through all tokens despite same initiative
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    await expect(sidebarTokens).toHaveCount(4);
  });

  test('should handle negative initiative values correctly', async ({ page }) => {
    await page.goto('/');
    
    // Create tokens with negative, zero, and positive initiatives
    const tokens = [
      { name: 'Fast Hero', hp: '100', initiative: '20', ally: true },
      { name: 'Slow Hero', hp: '80', initiative: '0', ally: true },
      { name: 'Very Slow Hero', hp: '60', initiative: '-5', ally: true },
      { name: 'Extremely Slow Enemy', hp: '30', initiative: '-10', ally: false }
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
    
    // Verify all tokens are created (use first() to avoid strict mode violations)
    await expect(page.locator('text=Fast Hero').first()).toBeVisible();
    await expect(page.locator('text=Slow Hero').first()).toBeVisible();
    await expect(page.locator('text=Very Slow Hero').first()).toBeVisible();
    await expect(page.locator('text=Extremely Slow Enemy').first()).toBeVisible();
    
    // Verify negative initiatives are displayed correctly
    await expect(page.locator('text=-5').first()).toBeVisible();
    await expect(page.locator('text=-10').first()).toBeVisible();
    
    // The highest initiative (20) should be the current token
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=20')).toBeVisible();
  });

  test('should re-sort when initiative is changed via edit', async ({ page }) => {
    await page.goto('/');
    
    // Create two tokens with different initiatives
    const tokens = [
      { name: 'Hero A', hp: '100', initiative: '10', ally: true },
      { name: 'Hero B', hp: '80', initiative: '20', ally: true }
    ];
    
    for (const token of tokens) {
      await page.locator('button[title="Add Token"]').click();
      await page.locator('text=Create New').click();
      await page.fill('input[placeholder*="name" i]', token.name);
      await page.fill('input[placeholder*="hp" i]', token.hp);
      await page.fill('input[placeholder*="initiative" i]', token.initiative);
      await page.locator('button:has-text("Add Token")').click();
    }
    
    // Initially, Hero B (initiative 20) should be current
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=20')).toBeVisible();
    
    // Edit Hero A to have higher initiative (25)
    const alliesSection = page.locator('.bg-gray-200');
    const heroAToken = alliesSection.locator('.w-28.h-28').first();
    await heroAToken.click();
    
    // Open full edit from HP modal
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    
    // Change initiative to 25
    await page.fill('input[id="edit-initiative"]', '25');
    await page.locator('button:has-text("Update")').click();
    
    // Now Hero A should be current (highest initiative)
    await expect(currentTokenDisplay.locator('text=25')).toBeVisible();
    
    // Verify the initiative change is reflected in the display
    await expect(page.locator('text=25').first()).toBeVisible();
  });

  test('should handle initiative changes that create ties', async ({ page }) => {
    await page.goto('/');
    
    // Create tokens with different initiatives
    const tokens = [
      { name: 'Rogue', hp: '70', initiative: '18', ally: true },
      { name: 'Cleric', hp: '90', initiative: '12', ally: true }
    ];
    
    for (const token of tokens) {
      await page.locator('button[title="Add Token"]').click();
      await page.locator('text=Create New').click();
      await page.fill('input[placeholder*="name" i]', token.name);
      await page.fill('input[placeholder*="hp" i]', token.hp);
      await page.fill('input[placeholder*="initiative" i]', token.initiative);
      await page.locator('button:has-text("Add Token")').click();
    }
    
    // Edit Cleric to have same initiative as Rogue (18)
    const alliesSection = page.locator('.bg-gray-200');
    const clericToken = alliesSection.locator('.w-28.h-28').nth(1);
    await clericToken.click();
    
    await page.locator('button:has-text("Edit"), button:has-text("Full Edit")').first().click();
    await page.fill('input[id="edit-initiative"]', '18');
    await page.locator('button:has-text("Update")').click();
    
    // Both tokens should be visible and navigable
    await expect(page.locator('text=Rogue')).toBeVisible();
    await expect(page.locator('text=Cleric')).toBeVisible();
    
    // Should have 2 tokens in sidebar
    const sidebarTokens = page.locator('.w-1\\/6 .w-12.h-12');
    await expect(sidebarTokens).toHaveCount(2);
    
    // Navigation should work between tied initiatives
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    await rightArrow.click();
    
    // Should still be on a token with initiative 18
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=18')).toBeVisible();
  });

  test('should handle extreme initiative values', async ({ page }) => {
    await page.goto('/');
    
    // Create tokens with extreme initiative values
    const tokens = [
      { name: 'Lightning Fast', hp: '50', initiative: '50', ally: true },
      { name: 'Extremely Slow', hp: '100', initiative: '-10', ally: false }
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
    
    // Verify extreme values are handled
    await expect(page.locator('text=Lightning Fast')).toBeVisible();
    await expect(page.locator('text=Extremely Slow')).toBeVisible();
    
    // The highest initiative (50) should be current
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=50')).toBeVisible();
    
    // Navigation should work
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    await rightArrow.click();
    
    // Should go to the enemy with -10 initiative
    await expect(currentTokenDisplay.locator('text=-10')).toBeVisible();
  });

  test('should maintain initiative order after HP changes', async ({ page }) => {
    await page.goto('/');
    
    // Create tokens with clear initiative order
    const tokens = [
      { name: 'First', hp: '100', initiative: '20', ally: true },
      { name: 'Second', hp: '80', initiative: '15', ally: true },
      { name: 'Third', hp: '60', initiative: '10', ally: true }
    ];
    
    for (const token of tokens) {
      await page.locator('button[title="Add Token"]').click();
      await page.locator('text=Create New').click();
      await page.fill('input[placeholder*="name" i]', token.name);
      await page.fill('input[placeholder*="hp" i]', token.hp);
      await page.fill('input[placeholder*="initiative" i]', token.initiative);
      await page.locator('button:has-text("Add Token")').click();
    }
    
    // Verify initial order - First should be current
    const currentTokenDisplay = page.locator('.w-1\\/6 .w-16.h-16');
    await expect(currentTokenDisplay.locator('text=20')).toBeVisible();
    
    // Change HP of Second token (shouldn't affect initiative order)
    const alliesSection = page.locator('.bg-gray-200');
    const secondToken = alliesSection.locator('.w-28.h-28').nth(1);
    await secondToken.click();
    
    const hpInput = page.locator('input[type="number"]');
    await hpInput.fill('1');
    await page.locator('button:has-text("Okay"), button:has-text("Save")').first().click();
    
    // Initiative order should remain the same
    await expect(currentTokenDisplay.locator('text=20')).toBeVisible();
    
    // Navigate through tokens - order should be 20, 15, 10
    const rightArrow = page.locator('.w-1\\/6 button:has-text("→")');
    await rightArrow.click();
    await expect(currentTokenDisplay.locator('text=15')).toBeVisible();
    
    await rightArrow.click();
    await expect(currentTokenDisplay.locator('text=10')).toBeVisible();
  });
});
