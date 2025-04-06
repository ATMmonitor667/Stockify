# Stockify Architecture

## Component Diagram (STEP 1)

![Stockify Component Architecture](./docs/architecture-diagram.png)

The diagram above illustrates the high-level component architecture of Stockify. The application starts with a Web Client built in Next.js, deployed via Vercel, which serves the frontend and proxies requests to Supabase over HTTPS. Supabase functions as the backend-as-a-service, handling authentication, database access, file uploads, and external API communication. It interacts with a PostgreSQL database for storing core entities, Supabase Storage for managing user-uploaded media, and external services like the Polygon API and NewsAPI for retrieving real-time stock data and financial news. These components together enable a seamless flow of data between users and the system.

### Entity Relationship Diagram(STEP 2)

![Entity Diagram](./docs/entity-diagram.png)

The diagram above shows the core data model for **Stockify**, highlighting the relationships between users, stocks, and user interactions. The `auth.users` table holds core authentication data and links to `profiles`, which store additional user info like wallet balance. Users can create `posts`, and they interact with the stock market simulation through two main tables: `userstock` (representing owned shares and amount spent) and `wishlist` (stocks users are interested in). The `stock` table holds all tradable stocks, including their names, tickers, and total investors. These entities form the foundation for simulating stock trading and managing user activity in the app.

### Call Sequence Diagram(STEP 3)

![Call Sequence Diagram](./docs/sequence-diagram.png)

The diagram above shows the call sequence for creating a post in Stockify. When a user submits a new post, the Web Client validates the input and sends a POST request to the /api/posts route. The API extracts the data and session, creates a Supabase client, and inserts the post into the posts table in PostgreSQL. If the operation succeeds, the client receives a success response, clears the form, and triggers a UI update to show the new post. This interaction demonstrates seamless integration between the frontend, Supabase backend, and database.
