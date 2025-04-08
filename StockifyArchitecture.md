# Stockify Application Architecture

This document describes the overall architecture of the Stockify Application. 

## Highlevel Component Digram

![Component Diagram](./ComponentDiagram.png)

## Explanation

Next.js is our front end. It was what our user sees and will be how the user interacts with the application. There are 4 routes for the user to go to (seen in red). These are /posts, /login, /signup, and /explore. These all relate back to next.js by display the info that they are getting to the user. Each route makes calls to the supabase database to either insert data to a table or retrieve data from a table. Minor differencies comes from the /signup route where the supabase database will send a confirmation link to the users email before allowing the user to be "official" and giving them permisions. Another difference is in the /explore route as it access the PolygonAPI to send and recieve stock info

## Entity Diagram