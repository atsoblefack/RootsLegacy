# API Reference - RootsLegacy

## Base URL

```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa
```

Replace `{PROJECT_ID}` with your Supabase project ID.

## Authentication

All endpoints (except public ones) require a Bearer token:

```
Authorization: Bearer {ACCESS_TOKEN}
```

Get the access token from Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;
```

## Response Format

All responses follow this format:

```json
{
  "data": {...} or [...],
  "error": null
}
```

On error:

```json
{
  "error": "Error message",
  "status": 400
}
```

## Pagination

Endpoints that return lists support pagination:

```
GET /endpoint?limit=20&cursor=CURSOR_VALUE
```

Response:

```json
{
  "data": [...],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

---

## Endpoints

### Health Check

#### GET /health

Check if the server is running.

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-25T10:30:00Z"
}
```

---

### Authentication

#### POST /auth/signup

Create a new account and family.

**Request:**
```bash
curl -X POST https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "name": "John Doe",
    "familyName": "Doe Family"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    }
  },
  "family": {
    "id": "uuid",
    "family_id": "uuid",
    "name": "Doe Family",
    "plan": "trial",
    "status": "trial",
    "trial_ends_at": "2024-03-26T10:30:00Z",
    "member_limit": 30,
    "created_at": "2024-02-25T10:30:00Z"
  },
  "message": "Account and family created successfully with 30-day trial"
}
```

**Errors:**
- `400` — Missing required fields
- `400` — Email already exists

---

#### GET /auth/role

Get current user's role and family info.

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/auth/role \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "role": "admin",
  "familyId": "uuid",
  "userId": "uuid",
  "email": "user@example.com"
}
```

**Roles:**
- `guest` — Not logged in
- `member` — Regular family member
- `admin` — Family admin
- `super_admin` — System admin

---

### Profiles

#### POST /profiles

Create a new profile (admin only).

**Request:**
```bash
curl -X POST https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/profiles \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "local_name": "Jane",
    "birth_date": "1990-01-15",
    "birth_place": "New York",
    "gender": "female",
    "profession": "Engineer",
    "bio": "A short bio",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "village_country": "USA",
    "village_city": "New York",
    "village_name": "Manhattan",
    "is_alive": true
  }'
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "family_id": "uuid",
    "full_name": "Jane Doe",
    "local_name": "Jane",
    "birth_date": "1990-01-15",
    "birth_place": "New York",
    "gender": "female",
    "profession": "Engineer",
    "bio": "A short bio",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "village_country": "USA",
    "village_city": "New York",
    "village_name": "Manhattan",
    "is_alive": true,
    "created_at": "2024-02-25T10:30:00Z",
    "updated_at": "2024-02-25T10:30:00Z"
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not admin
- `403` — Member limit reached

---

#### GET /profiles

List profiles (pagination).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/profiles?limit=20 \
  -H "Authorization: Bearer {TOKEN}"
```

**Query Parameters:**
- `limit` (optional) — Number of results (default: 20)
- `cursor` (optional) — Pagination cursor

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "family_id": "uuid",
      "full_name": "Jane Doe",
      ...
    }
  ],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

**Errors:**
- `401` — Unauthorized
- `404` — Family not found

---

#### GET /profiles/:id

Get a specific profile.

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/profiles/uuid \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "family_id": "uuid",
    "full_name": "Jane Doe",
    ...
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Access denied
- `404` — Profile not found

---

#### PUT /profiles/:id

Update a profile (admin only).

**Request:**
```bash
curl -X PUT https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/profiles/uuid \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "profession": "Manager"
  }'
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "profession": "Manager",
    "updated_at": "2024-02-25T10:35:00Z",
    ...
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not admin
- `404` — Profile not found

---

### Relations

#### POST /relations

Create a family relationship (admin only).

**Request:**
```bash
curl -X POST https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/relations \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId1": "uuid",
    "profileId2": "uuid",
    "relationType": "spouse",
    "marriageDate": "2015-06-20",
    "marriagePlace": "Paris, France",
    "notes": "Married in a church"
  }'
```

**Relation Types:**
- `spouse` — Husband/Wife
- `parent` — Father/Mother
- `child` — Son/Daughter
- `sibling` — Brother/Sister
- `uncle_aunt` — Uncle/Aunt
- `nephew_niece` — Nephew/Niece
- `cousin` — Cousin
- `guardian` — Guardian/Tutor
- `godparent` — Godfather/Godmother

**Response:**
```json
{
  "relation": {
    "id": "uuid",
    "family_id": "uuid",
    "profile_id_1": "uuid",
    "profile_id_2": "uuid",
    "relation_type": "spouse",
    "marriage_date": "2015-06-20",
    "marriage_place": "Paris, France",
    "notes": "Married in a church",
    "created_at": "2024-02-25T10:30:00Z"
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not admin
- `400` — Missing required fields

---

#### GET /relations

List relations (pagination).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/relations?limit=20 \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "family_id": "uuid",
      "profile_id_1": "uuid",
      "profile_id_2": "uuid",
      "relation_type": "spouse",
      ...
    }
  ],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

**Errors:**
- `401` — Unauthorized
- `404` — Family not found

---

### Family Members

#### GET /family-members

List family members (pagination).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/family-members?limit=20 \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "family_id": "uuid",
      "user_id": "uuid",
      "role": "admin",
      "status": "active",
      "joined_at": "2024-02-25T10:30:00Z"
    }
  ],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

**Errors:**
- `401` — Unauthorized
- `404` — Family not found

---

#### POST /family-members/:userId/promote

Promote a member to admin (admin only).

**Request:**
```bash
curl -X POST https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/family-members/uuid/promote \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "family_id": "uuid",
    "user_id": "uuid",
    "role": "admin",
    "status": "active"
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not admin
- `403` — Admin limit reached

---

### Pricing & Configuration

#### GET /pricing

Get pricing plans (public).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/pricing
```

**Response:**
```json
{
  "plans": [
    {
      "plan_id": "roots",
      "lifetime_price": 29,
      "storage_included_years": 1,
      "storage_annual_price": 5,
      "member_limit": 30
    },
    {
      "plan_id": "family",
      "lifetime_price": 59,
      "storage_included_years": 1,
      "storage_annual_price": 10,
      "member_limit": 80
    },
    {
      "plan_id": "heritage",
      "lifetime_price": 149,
      "storage_included_years": 2,
      "storage_annual_price": 19,
      "member_limit": 9999
    }
  ]
}
```

---

#### GET /app-config

Get all configuration (super admin only).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/app-config \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "config": {
    "trial_duration_days": 30,
    "grace_period_days": 90,
    "referral_cap_months": 36,
    "referral_reward_referrer_months": 12,
    "referral_reward_referred_months": 3,
    "max_admins_per_family": 3,
    "plan_roots_member_limit": 30,
    "plan_family_member_limit": 80,
    "plan_heritage_member_limit": 9999,
    "plan_roots_lifetime_price": 29,
    "plan_family_lifetime_price": 59,
    "plan_heritage_lifetime_price": 149,
    "plan_roots_storage_annual_price": 5,
    "plan_family_storage_annual_price": 10,
    "plan_heritage_storage_annual_price": 19,
    "plan_roots_storage_included_years": 1,
    "plan_family_storage_included_years": 1,
    "plan_heritage_storage_included_years": 2
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not super admin

---

#### PUT /app-config

Update configuration (super admin only).

**Request:**
```bash
curl -X PUT https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/app-config \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "trial_duration_days",
    "value": 45
  }'
```

**Response:**
```json
{
  "config": {
    "trial_duration_days": 45,
    ...
  }
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not super admin
- `400` — Missing key or value

---

### Admin Actions (Audit Log)

#### GET /admin-actions

List admin actions (super admin only, pagination).

**Request:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/admin-actions?limit=20 \
  -H "Authorization: Bearer {TOKEN}"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "admin_user_id": "uuid",
      "action_type": "create_profile",
      "target_family_id": "uuid",
      "target_user_id": null,
      "metadata": {
        "profileId": "uuid"
      },
      "created_at": "2024-02-25T10:30:00Z"
    }
  ],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Not super admin

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Bad Request (missing fields, invalid data) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Examples

### Create a family and add members

```typescript
// 1. Sign up
const signupResponse = await fetch('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'secure_password',
    name: 'John Doe',
    familyName: 'Doe Family'
  })
});
const { user, family } = await signupResponse.json();

// 2. Get token
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// 3. Create profiles
const profileResponse = await fetch('/profiles', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    full_name: 'Jane Doe',
    birth_date: '1990-01-15'
  })
});
const { profile } = await profileResponse.json();

// 4. Create relation
const relationResponse = await fetch('/relations', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    profileId1: profile.id,
    profileId2: 'other_profile_id',
    relationType: 'spouse'
  })
});
```

---

**Dernière mise à jour :** Février 2026
**Version :** 1.0.0
