# Stockify Application Architecture

This document describes the overall architecture of the Stockify Application. 

## Highlevel Component Digram

![Component Diagram](./ComponentDiagram.png)

## Explanation

Next.js is our front end. It was what our user sees and will be how the user interacts with the application. There are 4 routes for the user to go to (seen in red). These are /posts, /login, /signup, and /explore. These all relate back to next.js by display the info that they are getting to the user. Each route makes calls to the supabase database to either insert data to a table or retrieve data from a table. Minor differencies comes from the /signup route where the supabase database will send a confirmation link to the users email before allowing the user to be "official" and giving them permisions. Another difference is in the /explore route as it access the PolygonAPI to send and recieve stock info

## Entity Diagram

![Entity Diagram](./EntityDiagram.png)

## Explanation
The profile is able to relate to their specified user by the user_id being a primary key refrencing the auth.users.id. Each post has their own specific id to make it easier to spot, but the author is a foreign key pointing to the users id (not user name since multiple people can have the same user name). So if someone makes an inapropriate post, we can ban the right person. The user stock refrences two other tables, the stock and profiles table. A user stock contained a user_id (foreign key from the user_id column in profiled) and a stock id (foreign key from the id column in the stock table). This way we can see the specific stock that a user bought. THe wishlist is the same idea, just without any amount bought or total spent columns. 

## Sign Up Sequence Diagram

![sequence Diagram](./sequenceDiagram.png)

