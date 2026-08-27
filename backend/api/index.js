// This file acts as the Vercel Serverless Function entry point.
// It imports the fully compiled NestJS application from the dist/ folder
// so that Vercel doesn't try to compile it with esbuild (which strips decorators).

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

const server = express();
let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  return app(req, res);
};
