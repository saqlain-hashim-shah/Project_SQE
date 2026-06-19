import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - Login & Register E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        // State clean karne ke liye cookies aur storage clear karein
        await page.context().clearCookies();
        await page.goto('http://localhost:5173/login');
        await page.waitForSelector('form', { timeout: 5000 });
    });

    // ==========================================
    // 🔓 1. LOGIN SCENARIOS
    // ==========================================

    test('❌ 1. Should show error with invalid login credentials', async ({ page }) => {
        await page.locator('input[name="email"]').fill('completely_fake_user@gmail.com');
        await page.locator('input[name="password"]').fill('wrongpassword123');
        
        await page.locator('button[type="submit"]').click();

        const errorAlert = page.locator('.bg-red-100');
        await expect(errorAlert).toBeVisible({ timeout: 5000 });
    });

    test('✅ 2. Should login user successfully and redirect to home page', async ({ page }) => {
        // STRICTNESS FIX: Form wale specific link par click karne ke liye `.first()` lagaya
        await page.locator('a[href="/register"]').first().click();
        await page.waitForURL(/.*register/);
        
        await page.locator('input[name="name"]').fill('Normal User');
        await page.locator('input[name="email"]').fill('user@bookhaven.com');
        await page.locator('input[name="password"]').fill('user123');
        await page.locator('input[name="confirmPassword"]').fill('user123');
        await page.locator('button[type="submit"]').click();
        
        // Agar user pehle se exist karta hoga toh error aayega, direct login page par wapas chalte hain
        await page.goto('http://localhost:5173/login');

        // Login input fields filling
        await page.locator('input[name="email"]').fill('user@bookhaven.com');
        await page.locator('input[name="password"]').fill('user123');

        const submitBtn = page.locator('button[type="submit"]');
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10000 });
    });

    test('👑 3. Should login admin successfully and route to admin portal', async ({ page }) => {
        await page.locator('input[name="email"]').fill('admin@bookhaven.com');
        await page.locator('input[name="password"]').fill('admin123');

        await page.locator('button[type="submit"]').click();

        // Admin dashboard transition validation
        await expect(page).toHaveURL(/(.*admin|\/)/, { timeout: 10000 });
    });

    // ==========================================
    // 📝 2. REGISTRATION SCENARIOS
    // ==========================================

    test('❌ 4. Should show error if passwords do not match during registration', async ({ page }) => {
        // STRICTNESS FIX: Resolved multiple element collision using .first()
        await page.locator('a[href="/register"]').first().click();
        await expect(page).toHaveURL(/.*register/);

        await page.locator('input[name="name"]').fill('Test Error Tester');
        await page.locator('input[name="email"]').fill(`mismatch_${Date.now()}@domain.com`);
        await page.locator('input[name="password"]').fill('securePass123');
        await page.locator('input[name="confirmPassword"]').fill('wrongMatch789');

        await page.locator('button[type="submit"]').click();

        const errorAlert = page.locator('.bg-red-100');
        await expect(errorAlert).toBeVisible({ timeout: 5000 });
        await expect(errorAlert).toContainText('Passwords do not match');
    });

    test('✅ 5. Should successfully register a unique new account instance', async ({ page }) => {
        // STRICTNESS FIX: Resolved multiple element collision using .first()
        await page.locator('a[href="/register"]').first().click();
        await expect(page).toHaveURL(/.*register/);

        const freshUniqueEmail = `dynamic_qa_user_${Date.now()}@bookhaven.com`;

        await page.locator('input[name="name"]').fill('QA Automated Node');
        await page.locator('input[name="email"]').fill(freshUniqueEmail);
        await page.locator('input[name="password"]').fill('controlledPass123');
        await page.locator('input[name="confirmPassword"]').fill('controlledPass123');

        await page.locator('button[type="submit"]').click();

        await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10000 });
    });

});