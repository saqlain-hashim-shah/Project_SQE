describe('Admin Book Management System - End to End Tests', () => {

    beforeEach(() => {
        // 1. Login page par jana
        cy.visit('http://localhost:5173/login');
        
        // 2. Credentials enter karna
        cy.get('input[name="email"]').should('be.visible').clear().type('admin@gmail.com');
        cy.get('input[name="password"]').should('be.visible').clear().type('123456');
        
        // 3. Sign In button par click karna
        cy.contains('button', 'Sign in').click();

        // 4. Wait karein jab tak URL badal kar home page '/' na ho jaye
        cy.url().should('eq', 'http://localhost:5173/');

        // 5. Chota sa pause taaki localStorage/session token memory me set ho jaye
        cy.wait(1000);

        // 6. Ab Admin URL par jayein
        cy.visit('http://localhost:5173/admin');

        // 7. Check karein ke Admin Dashboard ki heading load hui ya nahi
        cy.contains('h1', 'Admin Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('✅ Admin Login & Navigation Works', () => {
        cy.url().should('include', '/admin');
    });

    it('📚 Dashboard Loads the Books Table', () => {
        cy.get('table').should('exist');
        cy.contains('th', 'Book').should('be.visible');
    });

    it('➕ Add New Book Successfully', () => {
        cy.contains('Add New Book').click();

        cy.get('input[name="title"]').type('Automated Cypress Guide');
        cy.get('input[name="author"]').type('Cypress Expert');
        cy.get('textarea[name="description"]').type('This book is seamlessly uploaded via automated E2E testing.');
        cy.get('select[name="category"]').select('Technology');
        cy.get('input[name="rating"]').clear().type('4.9');

        // 🔥 FIXED THE ERROR LINE HERE:
        // Hard drive path dependency ko khatam karne ke liye dynamic dummy data inject kiya hai
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('MOCK_PDF_DATA_STREAM'),
            fileName: 'sample.pdf',
            mimeType: 'application/pdf'
        }, { force: true });

        // Alert popup handler
        cy.on('window:alert', (txt) => {
            expect(txt).to.include('Book added successfully');
        });

        cy.contains('button', 'Add Book').click();
    });

    it('✏️ Edit Existing Book', () => {
        cy.get('table').then(($table) => {
            if ($table.find('tbody tr').length > 0) {
                cy.contains('Edit').first().click();

                cy.get('input[name="title"]')
                    .clear()
                    .type('Updated Book Title By Test Suite');

                cy.on('window:alert', (txt) => {
                    expect(txt).to.include('Book updated successfully');
                });

                cy.contains('button', 'Update Book').click();
            }
        });
    });

    it('🗑️ Delete Book Process', () => {
        cy.get('table').then(($table) => {
            if ($table.find('tbody tr').length > 0) {
                cy.on('window:confirm', () => true);

                cy.on('window:alert', (txt) => {
                    expect(txt).to.include('Book deleted successfully');
                });

                cy.contains('Delete').first().click();
            }
        });
    });

    it('🚪 Cancel Add Form Modal', () => {
        cy.contains('Add New Book').click();
        cy.contains('Cancel').click();
        cy.contains('Add New Book').should('be.visible');
    });

});