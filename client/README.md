# IMovies client

The client uses React, Vite, and React Router. Start the API from `server/` and
the frontend from `client/`:

```powershell
cd server
npm install
npm run dev
```

In another terminal:

```powershell
cd client
npm install
npm run dev
```

The API base URL defaults to `http://localhost:8000/api`, matching the local
server configuration. Override it with `VITE_API_BASE_URL` when the API runs
elsewhere (for example, `http://localhost:5000/api` when using the server's
default port).

To add the local sample catalog (and safely fill it to at least 200 movies),
run `npm run seed` from `server/`. The extra sample listings are identified in
their titles and descriptions; replace them with verified catalog entries
before production.

Seat checkout currently uses the server's demo payment endpoint. It confirms
the booking without charging a card or contacting a payment provider. Its QR
code is an order-information demo, not a UPI or bank payment QR.
