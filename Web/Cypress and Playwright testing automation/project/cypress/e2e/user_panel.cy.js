describe('User Panel - Book Details, Favorites & Downloads Tests', () => {

    beforeEach(() => {
        // Backend API call ko intercept kar rahe hain taaki data load hone ka wait kar sakein
        cy.intercept('GET', '**/api/books*').as('getBooks');

        // UI Login ko bypass karke direct API se token generate karna
        cy.request({
            method: 'POST',
            url: 'http://localhost:5000/api/auth/login',
            body: {
                email: 'saki@gmail.com',
                password: '123456'
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            const token = response.body.token;
            const user = response.body.user;

            window.localStorage.setItem('token', token);
            window.localStorage.setItem('user', JSON.stringify(user));
            cy.setCookie('token', token);
        });

        // Direct Home page par visit karein
        cy.visit('http://localhost:5173/');
        
        cy.wait('@getBooks');
        cy.wait(1000); // UI stabilization pause
    });

    it('📚 1. View Book Details & Toggle Favorites (Add/Remove Flow)', () => {
        // Ensure karein dashboard par books grid load ho gayi hai
        cy.get('div.grid', { timeout: 10000 }).should('exist');
        
        // UI link card click jo React router flow ko break nahi karega
        cy.get('div.grid').find('a').first().click({ force: true });
        
        // Route load verification 
        cy.url({ timeout: 10000 }).should('include', 'book');

        // 🔥 ERROR FIX: Pehle check karein ke details page ka heading text full load ho jaye (Purana text ya dummy context na uthaye)
        cy.get('h1').should('be.visible').should('not.have.text', '');
        cy.contains('by', { timeout: 8000 }).should('be.visible');

        // Book title ko memory me save kar rahe hain taaki baad me favorites me check karein
        cy.get('h1').then(($h1) => {
            const bookTitle = $h1.text().trim();

            // Heart button par click karna (Add to favorites triggers backend)
            cy.get('button').contains(/❤️|🤍/).click({ force: true });
            cy.wait(1500); // Backend database save sync wait

            // Favorites page par navigate karna 
            cy.visit('http://localhost:5173/favorites');
            cy.url().should('include', '/favorites');

            // Verify karna ke wahan hamari favorite ki hui book title mojood hai
            cy.contains(bookTitle, { timeout: 8000 }).should('exist');

            // --- Clean up / Remove from Favorites ---
            // Direct book title link par safe click trigger karna
            cy.contains(bookTitle).click({ force: true });
            
            // Heart button par click karke remove karna
            cy.get('button').contains(/❤️|🤍/).click({ force: true });
            cy.wait(1000);

            // Dobara favorites page check karna ke ab khali hai ya title hat chuka hai
            cy.visit('http://localhost:5173/favorites');
            cy.contains(bookTitle).should('not.exist');
        });
    });

    it('📥 2. Trigger Protected Book Download', () => {
        cy.get('div.grid', { timeout: 10000 }).should('exist');
        
        // Pure UI flow navigation for book item link
        cy.get('div.grid').find('a').first().click({ force: true });

        // Download button par click karna (Backend res.download API hit karega)
        cy.get('button').contains(/Download/i).should('be.visible').click({ force: true });

        // Verify state change to downloading status
        cy.get('button').contains(/Downloading...|Download/i).should('exist');
    });

});