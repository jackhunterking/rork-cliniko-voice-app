# Cliniko Treatment Notes API Documentation

**API Version:** v1  
**Base URL:** `https://api.au1.cliniko.com/v1`  
**Last Updated:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Treatment Note Object](#treatment-note-object)
5. [Field Reference](#field-reference)
6. [Query Parameters](#query-parameters)
7. [Request Examples](#request-examples)
8. [Response Examples](#response-examples)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Rate Limiting](#rate-limiting)
12. [Pagination](#pagination)

---

## Overview

The Treatment Notes API allows you to create, retrieve, update, and manage treatment notes in Cliniko. Treatment notes are clinical records associated with patient appointments that document the details and outcomes of treatment sessions.

### Key Features

- **Create treatment notes** with structured content sections
- **Retrieve individual or list** of treatment notes
- **Update treatment notes** with new information
- **Archive/Unarchive** treatment notes
- **Draft and finalize** treatment notes for workflow management
- **Pin/Unpin** important notes
- **Template-based structure** for consistent documentation

---

## Authentication

All API requests require authentication using an API token passed in the `Authorization` header:
```bash
Authorization: Bearer YOUR_API_TOKEN
```

### Getting Your API Token

1. Log in to your Cliniko account
2. Navigate to Settings → API & Webhooks
3. Generate or copy your API token
4. Use it in all API requests

### Example Request with Authentication
```bash
curl -X GET https://api.au1.cliniko.com/v1/treatment_notes \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json"
```

---

## API Endpoints

### 1. List Treatment Notes

**Endpoint:** `GET /treatment_notes`

**Description:** Retrieve a paginated list of all treatment notes.

**Parameters:**
- `page` (optional, integer): Page number (default: 1)
- `per_page` (optional, integer): Records per page (default: 25, max: 100)
- `sort` (optional, string): Sort field (e.g., `created_at`, `-created_at`)
- `filter[patient_id]` (optional): Filter by patient ID
- `filter[draft]` (optional, boolean): Filter by draft status

**Example Request:**
```bash
curl -X GET "https://api.au1.cliniko.com/v1/treatment_notes?page=1&per_page=25" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Insufficient permissions

---

### 2. Create Treatment Note

**Endpoint:** `POST /treatment_notes`

**Description:** Create a new treatment note.

**Request Body:**
```json
{
  "title": "string (required)",
  "author_name": "string (optional)",
  "draft": "boolean (optional, default: true)",
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/{patient_id}"
    }
  },
  "practitioner": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/practitioners/{practitioner_id}"
    }
  },
  "booking": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/bookings/{booking_id}"
    }
  },
  "content": {
    "sections": [
      {
        "name": "string",
        "description": "string",
        "questions": ["string", "string"]
      }
    ]
  }
}
```

**Required Fields:**
- `title` - Title of the treatment note
- `patient` - Link to the patient resource

**Optional Fields:**
- `author_name` - Name of the practitioner/author
- `draft` - Whether the note is still being edited (default: true)
- `booking` - Link to associated booking/appointment
- `practitioner` - Link to the practitioner who created the note
- `content` - Structured content with sections and questions

**Example Request:**
```bash
curl -X POST https://api.au1.cliniko.com/v1/treatment_notes \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Follow-up Consultation",
    "author_name": "Dr. Sarah Johnson",
    "draft": true,
    "patient": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/patients/123"
      }
    },
    "practitioner": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/practitioners/456"
      }
    },
    "content": {
      "sections": [
        {
          "name": "Chief Complaint",
          "description": "Patient primary concern",
          "questions": ["What brings you in today?"]
        },
        {
          "name": "Assessment",
          "description": "Clinical assessment",
          "questions": ["How is the patient responding to treatment?"]
        }
      ]
    }
  }'
```

**Status Codes:**
- `201 Created` - Treatment note created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Referenced resource not found

---

### 3. Get Treatment Note

**Endpoint:** `GET /treatment_notes/{id}`

**Description:** Retrieve a specific treatment note by ID.

**Path Parameters:**
- `id` (required, string/int64): Treatment note ID

**Example Request:**
```bash
curl -X GET https://api.au1.cliniko.com/v1/treatment_notes/123 \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Treatment note not found

---

### 4. Update Treatment Note

**Endpoint:** `PATCH /treatment_notes/{id}`

**Description:** Update an existing treatment note.

**Path Parameters:**
- `id` (required, string/int64): Treatment note ID

**Request Body:** (Same fields as Create, all optional)
```json
{
  "title": "string",
  "author_name": "string",
  "draft": "boolean",
  "content": {
    "sections": [
      {
        "name": "string",
        "description": "string",
        "questions": ["string"]
      }
    ]
  }
}
```

**Example Request:**
```bash
curl -X PATCH https://api.au1.cliniko.com/v1/treatment_notes/123 \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": {
      "sections": [
        {
          "name": "Assessment",
          "description": "Updated clinical assessment",
          "questions": ["Follow-up responses"]
        }
      ]
    }
  }'
```

**Status Codes:**
- `200 OK` - Treatment note updated successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Treatment note not found

---

### 5. List Treatment Notes for Patient

**Endpoint:** `GET /patients/{patient_id}/treatment_notes`

**Description:** Retrieve all treatment notes for a specific patient.

**Path Parameters:**
- `patient_id` (required, string/int64): Patient ID

**Query Parameters:**
- `page` (optional, integer): Page number
- `per_page` (optional, integer): Records per page
- `sort` (optional, string): Sort field

**Example Request:**
```bash
curl -X GET "https://api.au1.cliniko.com/v1/patients/123/treatment_notes?page=1&per_page=10" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Patient not found

---

### 6. Archive Treatment Note

**Endpoint:** `POST /treatment_notes/{id}/archive`

**Description:** Archive a treatment note (soft delete).

**Path Parameters:**
- `id` (required, string/int64): Treatment note ID

**Example Request:**
```bash
curl -X POST https://api.au1.cliniko.com/v1/treatment_notes/123/archive \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Status Codes:**
- `200 OK` - Treatment note archived successfully
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Treatment note not found

---

### 7. Unarchive Treatment Note

**Endpoint:** `POST /treatment_notes/{id}/unarchive`

**Description:** Restore an archived treatment note.

**Path Parameters:**
- `id` (required, string/int64): Treatment note ID

**Example Request:**
```bash
curl -X POST https://api.au1.cliniko.com/v1/treatment_notes/123/unarchive \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Status Codes:**
- `200 OK` - Treatment note unarchived successfully
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Treatment note not found

---

### 8. Delete Treatment Note (DEPRECATED)

**Endpoint:** `DELETE /treatment_notes/{id}`

**Status:** ⚠️ **DEPRECATED** - Use archive/unarchive instead

**Description:** Permanently delete a treatment note (not recommended).

> **Note:** This endpoint is deprecated. Use the archive endpoint instead for better data management and audit trails.

---

## Treatment Note Object

### Full Object Schema
```json
{
  "id": "string (int64)",
  "title": "string",
  "author_name": "string or null",
  "draft": "boolean or null",
  "created_at": "string (date-time)",
  "updated_at": "string (date-time)",
  "archived_at": "string or null (date-time)",
  "deleted_at": "string or null (date-time)",
  "finalized_at": "string or null (date-time)",
  "pinned_at": "string or null (date-time)",
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/{patient_id}"
    }
  },
  "practitioner": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/practitioners/{practitioner_id}"
    }
  },
  "booking": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/bookings/{booking_id}"
    }
  },
  "attendee": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/attendees/{attendee_id}"
    }
  },
  "treatment_note_template": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/treatment_note_templates/{template_id}"
    }
  },
  "content": {
    "sections": [
      {
        "name": "string",
        "description": "string",
        "questions": ["string"]
      }
    ]
  },
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes/{id}"
  }
}
```

---

## Field Reference

### Core Fields

| Field | Type | Writable | Required | Description |
|-------|------|----------|----------|-------------|
| `id` | string (int64) | ❌ No | ✅ Read-only | Unique identifier for the treatment note |
| `title` | string | ✅ Yes | ✅ Yes | Title/subject of the treatment note |
| `author_name` | string or null | ✅ Yes | ❌ No | Name of the person who authored the note |
| `draft` | boolean or null | ✅ Yes | ❌ No | Whether the note is still being edited (default: true) |

### Timestamp Fields

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `created_at` | string (date-time) | ❌ No | ISO 8601 timestamp of creation |
| `updated_at` | string (date-time) | ❌ No | ISO 8601 timestamp of last update |
| `archived_at` | string or null (date-time) | ❌ No | ISO 8601 timestamp of archival (null if not archived) |
| `deleted_at` | string or null (date-time) | ❌ No | ISO 8601 timestamp of deletion (null if not deleted) |
| `finalized_at` | string or null (date-time) | ❌ No | ISO 8601 timestamp of finalization (null if draft) |
| `pinned_at` | string or null (date-time) | ❌ No | ISO 8601 timestamp of pinning (null if not pinned) |

### Relationship Fields

| Field | Type | Description |
|-------|------|-------------|
| `patient` | object | Reference to the patient (HATEOAS link) |
| `practitioner` | object | Reference to the practitioner/creator (HATEOAS link) |
| `booking` | object | Reference to the associated booking (HATEOAS link) |
| `attendee` | object | Reference to the attendee (HATEOAS link) |
| `treatment_note_template` | object | Reference to the template used (HATEOAS link) |

### Content Field

| Field | Type | Description |
|-------|------|-------------|
| `content` | object or null | Structured content with sections |
| `content.sections` | array | Array of content sections |
| `content.sections[].name` | string | Section name (e.g., "Examination", "Diagnosis") |
| `content.sections[].description` | string | Section description |
| `content.sections[].questions` | array | Array of questions within the section |

### Link Field

| Field | Type | Description |
|-------|------|-------------|
| `links.self` | string (URL) | HATEOAS link to this resource |

---

## Query Parameters

### Common Query Parameters
```
GET /treatment_notes?page=1&per_page=25&sort=-created_at
```

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | N/A | Page number for pagination |
| `per_page` | integer | 25 | 100 | Records per page |
| `sort` | string | `id` | N/A | Sort field (prefix with `-` for descending) |

### Filter Parameters
```
GET /treatment_notes?filter[patient_id]=123&filter[draft]=true
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[patient_id]` | integer | Filter by patient ID |
| `filter[draft]` | boolean | Filter by draft status |
| `filter[archived]` | boolean | Filter by archived status |

### Sort Examples
```bash
# Sort by creation date (newest first)
?sort=-created_at

# Sort by creation date (oldest first)
?sort=created_at

# Sort by title
?sort=title
```

---

## Request Examples

### Example 1: Create a Basic Treatment Note
```bash
curl -X POST https://api.au1.cliniko.com/v1/treatment_notes \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Initial Consultation",
    "author_name": "Dr. John Smith",
    "patient": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/patients/101"
      }
    }
  }'
```

### Example 2: Create with Template Sections
```bash
curl -X POST https://api.au1.cliniko.com/v1/treatment_notes \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Physical Therapy Assessment",
    "author_name": "PT Sarah Wilson",
    "draft": true,
    "patient": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/patients/101"
      }
    },
    "practitioner": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/practitioners/50"
      }
    },
    "booking": {
      "links": {
        "self": "https://api.au1.cliniko.com/v1/bookings/999"
      }
    },
    "content": {
      "sections": [
        {
          "name": "Chief Complaint",
          "description": "Primary reason for visit",
          "questions": [
            "What is the chief complaint?",
            "When did symptoms start?"
          ]
        },
        {
          "name": "Physical Examination",
          "description": "Examination findings",
          "questions": [
            "Range of motion assessment:",
            "Strength testing results:",
            "Palpation findings:"
          ]
        },
        {
          "name": "Diagnosis",
          "description": "Clinical impression",
          "questions": [
            "Preliminary diagnosis:",
            "Severity assessment:"
          ]
        },
        {
          "name": "Treatment Plan",
          "description": "Proposed treatment",
          "questions": [
            "Recommended treatment modalities:",
            "Frequency and duration:",
            "Patient education provided:"
          ]
        }
      ]
    }
  }'
```

### Example 3: Update Treatment Note
```bash
curl -X PATCH https://api.au1.cliniko.com/v1/treatment_notes/123 \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Physical Therapy Assessment - Updated",
    "content": {
      "sections": [
        {
          "name": "Outcome",
          "description": "Treatment outcome",
          "questions": [
            "Patient improved range of motion by 30%",
            "Pain reduced from 7/10 to 4/10"
          ]
        }
      ]
    }
  }'
```

### Example 4: Retrieve All Notes for a Patient
```bash
curl -X GET "https://api.au1.cliniko.com/v1/patients/101/treatment_notes?per_page=50&sort=-created_at" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

---

## Response Examples

### Successful Create Response (201 Created)
```json
{
  "id": "12345",
  "title": "Initial Consultation",
  "author_name": "Dr. John Smith",
  "draft": true,
  "created_at": "2024-01-15T14:30:22Z",
  "updated_at": "2024-01-15T14:30:22Z",
  "archived_at": null,
  "deleted_at": null,
  "finalized_at": null,
  "pinned_at": null,
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/101"
    }
  },
  "practitioner": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/practitioners/50"
    }
  },
  "booking": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/bookings/999"
    }
  },
  "attendee": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/attendees/1"
    }
  },
  "treatment_note_template": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/treatment_note_templates/1"
    }
  },
  "content": {
    "sections": [
      {
        "name": "Chief Complaint",
        "description": "Primary reason for visit",
        "questions": ["What is the chief complaint?"]
      }
    ]
  },
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes/12345"
  }
}
```

### List Response (200 OK)
```json
{
  "treatment_notes": [
    {
      "id": "12345",
      "title": "Initial Consultation",
      "author_name": "Dr. John Smith",
      "draft": false,
      "created_at": "2024-01-15T14:30:22Z",
      "updated_at": "2024-01-15T14:30:22Z",
      "archived_at": null,
      "deleted_at": null,
      "finalized_at": "2024-01-15T15:00:00Z",
      "pinned_at": null,
      "patient": {
        "links": {
          "self": "https://api.au1.cliniko.com/v1/patients/101"
        }
      },
      "links": {
        "self": "https://api.au1.cliniko.com/v1/treatment_notes/12345"
      }
    }
  ],
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes?page=1",
    "next": "https://api.au1.cliniko.com/v1/treatment_notes?page=2",
    "last": "https://api.au1.cliniko.com/v1/treatment_notes?page=5"
  }
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "errors": {
    "title": ["can't be blank"],
    "patient": ["is required"]
  }
}
```

#### 401 Unauthorized
```json
{
  "errors": {
    "message": "Invalid authentication token"
  }
}
```

#### 403 Forbidden
```json
{
  "errors": {
    "message": "You do not have permission to access this resource"
  }
}
```

#### 404 Not Found
```json
{
  "errors": {
    "message": "Treatment note not found"
  }
}
```

#### 422 Unprocessable Entity
```json
{
  "errors": {
    "content": ["Invalid content structure"]
  }
}
```

#### 429 Too Many Requests
```json
{
  "errors": {
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

### Error Handling Best Practices
```javascript
// JavaScript/Node.js example
async function createTreatmentNote(noteData) {
  try {
    const response = await fetch('https://api.au1.cliniko.com/v1/treatment_notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(noteData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      
      switch (response.status) {
        case 400:
          // Handle validation errors
          console.error('Validation failed:', error.errors);
          break;
        case 401:
          // Handle authentication error
          console.error('Invalid token');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 429:
          // Handle rate limiting
          console.error('Rate limited, retry after delay');
          break;
        default:
          console.error('Unknown error');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

---

## Best Practices

### 1. Use Draft Workflow
Always create notes as drafts first, then finalize when complete:
```json
{
  "title": "Consultation Notes",
  "draft": true,
  "patient": { "links": { "self": "..." } }
}
```

Then update to finalize:
```bash
PATCH /treatment_notes/{id}
{ "draft": false }
```

### 2. Structure Content with Sections
Organize notes into logical sections for better readability:
```json
{
  "content": {
    "sections": [
      { "name": "History", "description": "...", "questions": [...] },
      { "name": "Examination", "description": "...", "questions": [...] },
      { "name": "Assessment", "description": "...", "questions": [...] },
      { "name": "Plan", "description": "...", "questions": [...] }
    ]
  }
}
```

### 3. Always Include Author Information
Maintain audit trails by including author names:
```json
{
  "author_name": "Dr. Sarah Johnson",
  "practitioner": { "links": { "self": "..." } }
}
```

### 4. Link to Related Resources
Always establish relationships with related objects:
```json
{
  "patient": { "links": { "self": "..." } },
  "booking": { "links": { "self": "..." } },
  "practitioner": { "links": { "self": "..." } }
}
```

### 5. Use Template-Based Structure
Leverage templates for consistency across notes:
```json
{
  "treatment_note_template": { "links": { "self": "..." } }
}
```

### 6. Archive Instead of Delete
Use archive endpoints for better data retention:
```bash
POST /treatment_notes/{id}/archive
POST /treatment_notes/{id}/unarchive
```

### 7. Handle Pagination
When retrieving lists, implement proper pagination:
```bash
GET /treatment_notes?page=1&per_page=25
```

### 8. Validate Before Submission
Check required fields before submitting:
```javascript
const requiredFields = ['title', 'patient'];
for (const field of requiredFields) {
  if (!noteData[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}
```

### 9. Implement Retry Logic
Handle transient failures with exponential backoff:
```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 10. Cache When Possible
Cache treatment note lists to reduce API calls:
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedNotes(patientId) {
  const now = Date.now();
  if (cache.has(patientId)) {
    const cached = cache.get(patientId);
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  const data = await fetchTreatmentNotes(patientId);
  cache.set(patientId, { data, timestamp: now });
  return data;
}
```

---

## Rate Limiting

Cliniko API implements rate limiting to ensure fair use and system stability.

### Rate Limit Headers

All responses include rate limit information:
```
X-RateLimit-Limit: 1000          # Requests per hour
X-RateLimit-Remaining: 999        # Requests left
X-RateLimit-Reset: 1705425600    # Unix timestamp of reset time
```

### Limits

- **Standard Users:** 1,000 requests per hour
- **Enterprise Users:** 5,000 requests per hour

### Handling Rate Limits
```javascript
if (response.status === 429) {
  const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
  const waitTime = resetTime - Math.floor(Date.now() / 1000);
  console.log(`Rate limited. Wait ${waitTime} seconds before retry.`);
}
```

---

## Pagination

### Pagination Response Structure
```json
{
  "treatment_notes": [...],
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes?page=1",
    "next": "https://api.au1.cliniko.com/v1/treatment_notes?page=2",
    "prev": "https://api.au1.cliniko.com/v1/treatment_notes?page=0",
    "last": "https://api.au1.cliniko.com/v1/treatment_notes?page=10",
    "first": "https://api.au1.cliniko.com/v1/treatment_notes?page=1"
  }
}
```

### Pagination Parameters

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `page` | integer | 1 | N/A |
| `per_page` | integer | 25 | 100 |

### Pagination Examples
```bash
# Get first page
GET /treatment_notes?page=1&per_page=25

# Get all records (handling pagination)
GET /treatment_notes?page=1&per_page=100
GET /treatment_notes?page=2&per_page=100
# Continue until 'next' link is null

# Use cursor-based pagination (more efficient for large datasets)
GET /treatment_notes?cursor=abc123&per_page=25
```

### Implementing Pagination
```javascript
async function getAllTreatmentNotes(patientId) {
  const notes = [];
  let nextUrl = `https://api.au1.cliniko.com/v1/patients/${patientId}/treatment_notes?per_page=100`;
  
  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    const data = await response.json();
    notes.push(...data.treatment_notes);
    
    // Get next page URL from response links
    nextUrl = data.links?.next ? data.links.next : null;
  }
  
  return notes;
}
```

---

## Common Use Cases

### Use Case 1: Create Note for Appointment
```javascript
async function createAppointmentNote(patientId, bookingId) {
  const noteData = {
    title: `Treatment Note - ${new Date().toLocaleDateString()}`,
    author_name: "Current User",
    draft: true,
    patient: {
      links: { self: `https://api.au1.cliniko.com/v1/patients/${patientId}` }
    },
    booking: {
      links: { self: `https://api.au1.cliniko.com/v1/bookings/${bookingId}` }
    }
  };
  
  return await fetch('https://api.au1.cliniko.com/v1/treatment_notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(noteData)
  });
}
```

### Use Case 2: Archive Old Notes
```javascript
async function archiveOldNotes(patientId, daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const notes = await getAllTreatmentNotes(patientId);
  
  for (const note of notes) {
    const noteDate = new Date(note.created_at);
    if (noteDate < cutoffDate && !note.archived_at) {
      await fetch(`https://api.au1.cliniko.com/v1/treatment_notes/${note.id}/archive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
      });
    }
  }
}
```

### Use Case 3: Finalize and Pin Important Notes
```javascript
async function finalizeAndPinNote(noteId) {
  // First update to finalize
  await fetch(`https://api.au1.cliniko.com/v1/treatment_notes/${noteId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ draft: false })
  });
  
  // Note: Pin functionality may require additional endpoint
  // Check Cliniko documentation for pinning endpoint
}
```

---

## Troubleshooting

### Issue: 404 Not Found on Create

**Causes:**
- Patient ID does not exist
- Practitioner ID does not exist
- Booking ID does not exist

**Solution:** Verify all linked resources exist before creating note.

### Issue: 400 Validation Error

**Causes:**
- Missing required `title` field
- Missing required `patient` link
- Invalid content section structure

**Solution:** Check error response for specific validation failures.

### Issue: Rate Limit (429)

**Solution:** Implement exponential backoff retry logic and respect rate limit headers.

### Issue: 401 Unauthorized

**Causes:**
- Invalid or expired API token
- Token does not have required permissions

**Solution:** Verify API token is correct and has appropriate scopes.

---

## Related Resources

- [Cliniko API Documentation](https://docs.api.cliniko.com/)
- [Patient API](https://docs.api.cliniko.com/openapi/patient)
- [Practitioner API](https://docs.api.cliniko.com/openapi/practitioner)
- [Booking API](https://docs.api.cliniko.com/openapi/booking)
- [Treatment Note Template API](https://docs.api.cliniko.com/openapi/treatment-note-template)
- [API Authentication Guide](https://docs.api.cliniko.com/authentication)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial documentation |

---

## Support

For issues or questions:
- Check the [Cliniko API Documentation](https://docs.api.cliniko.com/)
- Contact Cliniko Support
- Review API status page

---

**Last Updated:** January 2024  
**Documentation Version:** 1.0  
**API Base URL:** `https://api.au1.cliniko.com/v1`