# Shopify-App-with-Node-and-React

## Repository

This project will provide basic Shopify App which is run into your store.

## Requirements:

-   Nodejs
-   React
-   Next.js
-   GraphQL
-   Apollo
-   Polaris

## Set up your app

```bash
# Node version 8.1.0 or later
node -v

# Install dependencies
npm install

# Start project at development
npm run dev 
(App will be run on https://localhost:3000/)
```

## Expose your dev environment

When authenticating merchants, Shopify redirects from the app authorization prompt back to your app. Your app needs an HTTPS address to be able to do this. Since your localhost:3000 isn’t a public address, you’ll use ngrok to create a secure tunnel from the public internet to your local machine.

```bash
npm install ngrok -g

ngrok http 3000
```

## Create APP at Shopify Account where this app is run, Get a Shopify API key and Shopify API secret key

-  Please refer this link to get API Key (https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#get-a-shopify-api-key)

## Authenticate and test your app

-   Please refer this link to create store and install app in to that store (https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#authenticate-and-test)

-   After install the app in store, visit store and your store run your app.
