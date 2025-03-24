# Data Helper

Data helper is a full-stack app built using a Next.js frontend and a Python backend.

### Frontend

I use Next.js as it is a framework that I am very familiar with. Next.js also provides alot of useful functionality right off the bat such as server-side rendering, routing and static site generation.

### Backend

For the backend, I will be using Python and the FastAPI as it is designed for building fast and efficient backend APIs. It is also very lightweight and thus will be very good for AI APIs.

### Database

For the databse, I will be using a Vercel provisioned PostgreSQL database, which I will use to store prompt history, file metadata and feedback. I opted to use Postgres instead of something more complex like a Pinecone Vector DB (which I have used previously for my own full stack AI chatbot app) because the data is already structured and all we are doing is interacting with tables and interpreting them.
