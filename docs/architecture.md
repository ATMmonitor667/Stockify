# Stockify Architecture

## High-Level Component Diagram

![High-Level Component Diagram](/docs/HigherLevel.png)

Stockify’s stack centers on two main technologies being Next .js on the client side and Supabase on the backend (while Finnhub supplies live market feeds). A browser session rendered by Next .js first issues HTTPS/JSON requests to a frontend hosted on Vercel. Acting as the gateway communication, Vercel forwards each call to Supabase [a backend service ],which handles authentication, SQL operations, object-storage uploads, and API calls. Within Supabase, user and application data are persisted in a managed PostgreSQL instance, and larger assets (screenshots, CSV exports, profile images) flow into Supabase Storage. Whenever the dashboard needs fresh quotes or news, Supabase triggers HTTP calls to Finnhub and returns the data to Vercel, which streams it back to the client. Every arrow in the diagram reflects these secure, stateless transactions, yielding a fully managed, horizontally scalable architecture built on modern cloud primitives.

---

## Entity Relationship Diagram

![Entity Relationship Diagram](/docs/entity%20diagram.jpeg)

This entity relationship (ER) diagram provides a detailed overview of the database structure underlying the Stockify application. The central table, profiles, holds critical user information, including wallet amount and username, and links directly to Supabase's default authentication system via the auth.users.id. Users interact within Stockify primarily through creating posts, managed in the posts table, which stores details like author IDs and content timestamps. Stock-related activities are organized using two associative tables: userstock and watchlist. These tables function as bridges connecting users to stocks they have either purchased or added to their wishlist. The stock table itself maintains key stock data points, such as the stock's name, ticker symbol, and the number of investors. Together, these interlinked tables facilitate seamless user interactions, stock transactions, and personalized stock management within the Stockify ecosystem.

---

## Call Sequence Diagram

![Call Sequence Diagram](/docs/call%20sequence.jpeg)

This sequence diagram describes how a user initiates and executes a trade within the platform. Initially, the user navigates to the Explore Page, prompting the page to load and display available stock or asset cards. When the user selects a specific asset, an event triggers the opening of a trade modal, managed by the Trade Function component. This modal requests and retrieves user-specific data from the Supabase database, allowing the user to complete the trade form with accurate details. After the user submits the trade information, the Trade Function component forwards the request to Supabase for execution. Supabase confirms the transaction and returns a response to the Trade Function, which subsequently closes the modal and refreshes the user interface. Finally, the updated trade information is presented to the user, reflecting the successful completion of the transaction.

---