// This file acts as the Vercel Serverless Function entry point.
// It imports the fully compiled NestJS application from the dist/ folder
// so that Vercel doesn't try to compile it with esbuild (which strips decorators).

let cachedServer;
let NestFactory;
let AppModule;
let ExpressAdapter;
let express;

async function bootstrap() {
  if (!cachedServer) {
    NestFactory = require('@nestjs/core').NestFactory;
    try {
      AppModule = require('../dist/app.module.js').AppModule;
    } catch (err) {
      throw new Error('Static require failed: ' + err.message);
    }

    ExpressAdapter = require('@nestjs/platform-express').ExpressAdapter;
    express = require('express');
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

module.exports = async (req, res) => {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error('VERCEL_BOOTSTRAP_ERROR', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message, stack: err.stack });
  }
};
