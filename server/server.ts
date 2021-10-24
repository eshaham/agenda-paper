import express from 'express';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
