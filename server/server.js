const express = require('express');
const path = require('path');
const routes = require('./routes');

// Import Apollo

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4')
const { authMiddleware } = require('./utils/auth');

// Import GraphQL Schema

const { typeDefs, resolvers } = require('./schemas')
const db = require('./config/connection');

// Configure Server

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const app = express();

// Launch Apollo Server

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('./graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  db.once('open', () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
}

startApolloServer();