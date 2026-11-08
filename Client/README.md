# Client

## Libraries to install

Runtime dependencies:

```bash
npm install @reduxjs/toolkit @types/react-router-dom bootstrap dotenv react react-dom react-redux react-router-dom
```

Development dependencies:

```bash
npm install -D @eslint/js @types/node @types/react @types/react-dom @vitejs/plugin-react eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript typescript-eslint vite
```

## APIs used

The client uses the server URL from `VITE_API_URL`. Requests include cookies with `credentials: "include"`.

| Method | Endpoint | Used for | Request body |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate a user | `{ "username": "string", "password": "string" }` |
| `GET` | `/api/auth/me` | Verify the current session | None |
| `POST` | `/api/auth/logout` | End the current session | None |
| `POST` | `/api/order/fetch-item-details` | Search item suggestions by part number | `{ "searchQuery": "string" }` |
| `POST` | `/api/order/addOrder` | Create an order with its items | See the order payload below |

Order creation payload:

```json
{
  "custId": "CUSTOMER001",
  "PONumber": "PO-1001",
  "PODate": "2026-10-24",
  "shipDate": "2026-11-01",
  "items": [
    {
      "partNumber": "PART-001",
      "partDescription": "Part description",
      "partDuplicationStatus": "NEW",
      "pricePerPiece": 10.5,
      "POQTY": 100,
      "catCode": "CAT-01",
      "finishWeight": 2.5,
      "realisationPerKG": 26.25
    }
  ]
}
```
