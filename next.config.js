module.exports = {
    middleware: (app) => {
      app.use((req, res, next) => {
        // Set the desired size limit for the request body parser
        req.bodyParserOptions = {
          sizeLimit: '1024mb',
        };
        next();
      });
    },
  };