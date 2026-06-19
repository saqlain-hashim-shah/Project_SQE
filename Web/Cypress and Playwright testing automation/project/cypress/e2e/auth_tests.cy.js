describe('User Authentication - Signup & Login Flow Tests', () => {

    // Har test case se pehle naye user ke liye random email generate karne ke liye
    const randomString = Math.random().toString(36).substring(2, 7);
    const newEmail = `user_${randomString}@gmail.com`;

    it('📝 1. Successful User Registration (Signup)', () => {
        // Signup page par jana
        cy.visit('http://localhost:5173/register');

        // Form fields fill karna
        cy.get('input[name="name"]').type('Test User');
        cy.get('input[name="email"]').type(newEmail);
        cy.get('input[name="password"]').type('123456');
        cy.get('input[name="confirmPassword"]').type('123456');

        // Submit button par click karna
        cy.contains('button', 'Create account').click();

        // Successful registration ke baad home page par redirect hona chahiye
        cy.url().should('eq', 'http://localhost:5173/');
    });

    it('❌ 2. Signup Validation - Passwords Do Not Match', () => {
        cy.visit('http://localhost:5173/register');

        cy.get('input[name="name"]').type('Wrong User');
        cy.get('input[name="email"]').type(`wrong_${randomString}@gmail.com`);
        cy.get('input[name="password"]').type('123456');
        cy.get('input[name="confirmPassword"]').type('654321'); // Alag password

        cy.contains('button', 'Create account').click();

        // Check karein ke error alert message screen par dikhe
        cy.contains('Passwords do not match').should('be.visible');
    });

    it('🔑 3. Successful Admin Login', () => {
        cy.visit('http://localhost:5173/login');

        // Admin credentials enter karna
        cy.get('input[name="email"]').should('be.visible').type('admin@gmail.com');
        cy.get('input[name="password"]').should('be.visible').type('123456');

        cy.contains('button', 'Sign in').click();

        // Verification: Home page load hona chahiye
        cy.url().should('eq', 'http://localhost:5173/');
    });

    it('❌ 4. Login Validation - Invalid Credentials', () => {
        cy.visit('http://localhost:5173/login');

        // Galat password enter karna
        cy.get('input[name="email"]').type('admin@gmail.com');
        cy.get('input[name="password"]').type('wrong_password_123');

        cy.contains('button', 'Sign in').click();

        // Backend bad request / invalid credentials ka error message display hona chahiye
        cy.contains('Invalid credentials').should('be.visible');
    });

});