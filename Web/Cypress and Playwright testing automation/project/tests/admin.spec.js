import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Book Management CRUD Tests (Playwright)', () => {

    // Har test case se pehle Admin user se API login bypass aur configuration
    test.beforeEach(async ({ page, request }) => {
        // 1. Aapke real admin credentials se backend par hit karna
        const loginResponse = await request.post('http://localhost:5000/api/auth/login', {
            data: {
                email: 'admin@gmail.com', 
                password: '123456'  // 🔥 Fixed real password
            }
        });

        expect(loginResponse.ok()).toBeTruthy();
        const responseBody = await loginResponse.json();
        const token = responseBody.token;
        const user = responseBody.user;

        // 2. Browser storage mein token inject karna
        await page.addInitScript(({ token, user }) => {
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('user', JSON.stringify(user));
        }, { token, user });

        await page.context().addCookies([{
            name: 'token',
            value: token,
            url: 'http://localhost:5173/'
        }]);

        // 3. Admin dashboard route par jana (App.js ke mutabiq actual route /admin hai)
        await page.goto('http://localhost:5173/admin');
        
        // Wait karein jab tak dashboard heading load na ho jaye
        await page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 15000 });
    });

    test('📝 1. Create a New Book (Add Flow)', async ({ page }) => {
        // Precise button selector jo React code se match karta hai
        const addButton = page.locator('button:has-text("Add New Book")');
        await addButton.click();

        // Modal form fields fill karna
        const uniqueTitle = `Automated Playwright Book ${Date.now()}`;
        await page.locator('input[name="title"]').fill(uniqueTitle);
        await page.locator('input[name="author"]').fill('Playwright Expert');
        await page.locator('textarea[name="description"]').fill('This book is seamlessly uploaded via automated E2E testing.');
        await page.locator('select[name="category"]').selectOption('Technology');
        await page.locator('input[name="rating"]').fill('4.8');

        // Playwright dummy file upload setup (Jaise aapne Cypress mein mock kiya tha)
        await page.locator('input[type="file"]').setInputFiles({
            name: 'sample.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('MOCK_PDF_DATA_STREAM')
        });

        // Browser ke alert click handle karna
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Book added successfully');
            await dialog.accept();
        });

        // Submit form button click
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000); // Wait for table refresh

        // Verify: Check table row
        await expect(page.locator(`table >> text=${uniqueTitle}`)).toBeVisible({ timeout: 10000 });
    });

    test('🔄 2. Update/Edit Existing Book Details', async ({ page }) => {
        // Pehle check karna ke table mein koi book hai ya nahi
        const editButton = page.locator('table tbody tr button:has-text("Edit")').first();
        
        if (await editButton.count() > 0) {
            await editButton.click();

            // Title field ko update karna
            const updatedTitle = `Updated Title ${Date.now()}`;
            await page.locator('input[name="title"]').clear();
            await page.locator('input[name="title"]').fill(updatedTitle);

            // Alert handle
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('Book updated successfully');
                await dialog.accept();
            });

            // Submit update
            await page.locator('button:has-text("Update Book")').click();
            await page.waitForTimeout(2000);

            // Verification
            await expect(page.locator(`table >> text=${updatedTitle}`)).toBeVisible();
        } else {
            console.log("No books available to edit.");
        }
    });

    test('🗑️ 3. Delete a Book from Dashboard', async ({ page }) => {
        const deleteButton = page.locator('table tbody tr button:has-text("Delete")').first();
        
        if (await deleteButton.count() > 0) {
            // Target book ka naam save karna validation ke liye
            const firstRow = page.locator('table tbody tr').first();
            const bookTitle = await firstRow.locator('td').first().locator('div.text-sm.font-medium').innerText();

            // Window confirm aur alert dono ko handle karna
            page.on('dialog', async dialog => {
                if (dialog.type() === 'confirm') {
                    await dialog.accept(); // Confirmation pop up ok karein
                } else {
                    expect(dialog.message()).toContain('Book deleted successfully');
                    await dialog.accept(); // Success alert ok karein
                }
            });

            await deleteButton.click();
            await page.waitForTimeout(2000);

            // Verification: List se delete ho chuka ho
            await expect(page.locator(`table >> text=${bookTitle}`)).not.toBeVisible();
        } else {
            console.log("No books available to delete.");
        }
    });

});