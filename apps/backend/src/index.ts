import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Hello from Backend route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Backend' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
