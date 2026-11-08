# Server

## Libraries to install

Runtime dependencies:

```bash
npm install @prisma/client @types/bcrypt @types/cors @types/jsonwebtoken bcrypt cors dotenv express jsonwebtoken pg
```

Development dependencies:

```bash
npm install -D @types/express @types/node @types/pg nodemon prisma ts-node typescript
```

## APIs created

All order and session endpoints use the `/api` prefix. Protected endpoints require the JWT cookie created during login.

### Health

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| `GET` | `/health` | Check whether the server is running | Not required |

### Authentication

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a user | Not required |
| `POST` | `/api/auth/login` | Authenticate a user and set the JWT cookie | Not required |
| `POST` | `/api/auth/logout` | Clear the JWT cookie | Not required |
| `GET` | `/api/auth/me` | Return the authenticated user | Required |

Registration body:

```json
{
  "fullName": "User Name",
  "username": "username",
  "password": "password",
  "role": "SALES_EXUCUTIVE_MEMBER"
}
```

Login body:

```json
{
  "username": "username",
  "password": "password"
}
```

### Orders

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| `POST` | `/api/order/addOrder` | Create an order and its items | Required |
| `DELETE` | `/api/order/deleteOrder` | Delete orders by PO number | Required |
| `GET` | `/api/order/customers/:custId/orders` | Fetch a customer's orders and items | Required |
| `POST` | `/api/order/fetch-item-details` | Search item details by part number prefix | Required |

Delete orders body:

```json
{
  "poNumbers": ["PO-1001", "PO-1002"]
}
```

Item search body:

```json
{
  "searchQuery": "PART-00"
}
```
