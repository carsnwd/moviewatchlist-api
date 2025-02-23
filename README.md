# Movie Watchlist API 

This is for SWENG 861, week 3 assignment for Consuming 3rd Party API and Designing RESTful API with CRUD Operations.

# Info
* A backend CRUD API that ingests the TMDB API for movies, searches them based on keywords, and adds to a watchlist for a user. Users can remove from their watchlist and update their watchlist items.
* NestJS with Node/Typescript was used for creating the API itself.
* MongoDB a NoSQL database was used for storing the watchlist data.
* User authentication is done with Firebase and protecting every API route with a JWT.
* The app was deployed to Digital Ocean.

# Development Setup
Pre-reqs: Need to have a Firebase project with authentication already setup. This is needed for user auth, and to run the emulators locally for authentication.

1. Run `npm i`
2. Using the .env.SAMPLE as a guide, replace the values with the Firebase admin values, these are secret from the Firebase account do not share or upload your .env to the repo
3. To run with emulators and Firebase install the firebase-tools globally with npm `npm install -g firebase-tools`
4. Run `firebase emulators:start` to start the emulators for development
5. Ensure MongoDB is installed, and points to a database 'movies-watchlist' with a 'watchlists' document.
