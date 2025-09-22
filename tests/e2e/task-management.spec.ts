import { test, expect } from '@playwright/test';

test.describe('Task Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should create a new task', async ({ page }) => {
    // Click on create task button
    await page.click('[data-testid="create-task-button"]');
    
    // Fill in task details
    await page.fill('[data-testid="task-title-input"]', 'Test Task');
    await page.fill('[data-testid="task-description-input"]', 'This is a test task');
    await page.selectOption('[data-testid="task-priority-select"]', 'medium');
    
    // Submit the form
    await page.click('[data-testid="submit-task-button"]');
    
    // Verify task was created
    await expect(page.locator('[data-testid="task-item"]')).toContainText('Test Task');
  });

  test('should update task status', async ({ page }) => {
    // Assuming there's already a task in the list
    await page.click('[data-testid="task-status-dropdown"]');
    await page.click('[data-testid="status-in-progress"]');
    
    // Verify status was updated
    await expect(page.locator('[data-testid="task-status"]')).toContainText('In Progress');
  });

  test('should filter tasks by status', async ({ page }) => {
    // Click on filter dropdown
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-completed"]');
    
    // Verify only completed tasks are shown
    const tasks = page.locator('[data-testid="task-item"]');
    const count = await tasks.count();
    
    for (let i = 0; i < count; i++) {
      await expect(tasks.nth(i).locator('[data-testid="task-status"]')).toContainText('Completed');
    }
  });

  test('should search tasks', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Test');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    const tasks = page.locator('[data-testid="task-item"]');
    const count = await tasks.count();
    
    for (let i = 0; i < count; i++) {
      const taskText = await tasks.nth(i).textContent();
      expect(taskText?.toLowerCase()).toContain('test');
    }
  });

  test('should handle AI task analysis', async ({ page }) => {
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Implement user authentication');
    
    // Click AI analyze button
    await page.click('[data-testid="ai-analyze-button"]');
    
    // Wait for AI analysis to complete
    await page.waitForSelector('[data-testid="ai-suggestions"]', { timeout: 10000 });
    
    // Verify AI suggestions are displayed
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggested-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggested-tags"]')).toBeVisible();
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to create a task
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Offline Task');
    await page.click('[data-testid="submit-task-button"]');
    
    // Verify offline message is shown
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify task syncs when back online
    await page.reload();
    await expect(page.locator('[data-testid="task-item"]')).toContainText('Offline Task');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile navigation works
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Verify layout adapts
    await expect(page.locator('[data-testid="task-grid"]')).toHaveClass(/tablet-layout/);
  });

  test('should handle performance under load', async ({ page }) => {
    // Create multiple tasks quickly
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="create-task-button"]');
      await page.fill('[data-testid="task-title-input"]', `Task ${i}`);
      await page.click('[data-testid="submit-task-button"]');
      await page.waitForTimeout(100); // Small delay to prevent overwhelming
    }
    
    // Verify all tasks are created and UI remains responsive
    const tasks = page.locator('[data-testid="task-item"]');
    await expect(tasks).toHaveCount(10);
    
    // Test scrolling performance
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Verify page is still responsive
    await page.click('[data-testid="filter-dropdown"]');
    await expect(page.locator('[data-testid="filter-menu"]')).toBeVisible();
  });
});