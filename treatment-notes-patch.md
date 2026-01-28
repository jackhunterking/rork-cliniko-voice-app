# PATCH: Update Treatment Note - Complete Implementation Guide

**Endpoint:** `PATCH /treatment_notes/{id}`  
**Base URL:** `https://api.au1.cliniko.com/v1`  
**Authentication:** Bearer Token (API Key)  
**Content-Type:** `application/json`  
**Status Codes:** 200 (Success), 422 (Validation Error)

---

## Table of Contents

1. [Endpoint Overview](#endpoint-overview)
2. [Request Structure](#request-structure)
3. [Path Parameters](#path-parameters)
4. [Request Body Fields](#request-body-fields)
5. [Field Update Behavior](#field-update-behavior)
6. [Response Structure](#response-structure)
7. [Validation Rules](#validation-rules)
8. [Error Handling](#error-handling)
9. [Implementation Examples](#implementation-examples)
10. [Common Scenarios](#common-scenarios)
11. [Edge Cases](#edge-cases)
12. [Best Practices](#best-practices)
13. [Testing Guide](#testing-guide)

---

## Endpoint Overview

### Purpose

Update an existing treatment note with new information. The PATCH method allows you to update specific fields without replacing the entire document.

### Key Characteristics

- **Partial Updates:** Only specified fields are updated
- **Idempotent:** Making the same request multiple times has the same effect as making it once
- **Non-Destructive:** Fields not included in the request are not modified
- **Preserves Read-Only Fields:** Cannot update `id`, `created_at`, `updated_at`, etc.
- **Returns Full Object:** Response includes the complete updated treatment note

### When to Use PATCH vs Other Methods

| Operation | Method | Use Case |
|-----------|--------|----------|
| Create new note | POST | When creating a treatment note for the first time |
| Update specific fields | **PATCH** | When modifying title, content, draft status, etc. |
| Replace entire note | PUT | Not currently supported by Cliniko |
| Delete note | DELETE | Not recommended - use archive instead |
| Archive note | POST /archive | When hiding old notes |

---

## Request Structure

### Basic cURL Format
```bash
curl -X PATCH \\
  -u <username>:<password> \\
  'https://api.au1.cliniko.com/v1/treatment_notes/{id}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title": "Updated Title",
    "draft": false
  }'
```

### Request Components
```
PATCH /treatment_notes/{id} HTTP/1.1
Host: api.au1.cliniko.com
Authorization: Basic <base64_encoded_credentials>
Content-Type: application/json
Content-Length: <length>

{
  "field_name": "field_value"
}
```

### Authentication Header
```bash
# Using Basic Auth
curl -X PATCH \\
  -u username:password \\
  https://api.au1.cliniko.com/v1/treatment_notes/123

# OR using Bearer Token (if supported)
curl -X PATCH \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://api.au1.cliniko.com/v1/treatment_notes/123
```

---

## Path Parameters

### id (Required)

**Type:** `string` or `int64`  
**Description:** Unique identifier of the treatment note to update  
**Format:** Must be a valid treatment note ID

**Examples:**
```
/treatment_notes/123
/treatment_notes/abc123def
/treatment_notes/"1"
```

**Error if Missing:**
```
404 Not Found
{
  "errors": {
    "message": "Treatment note not found"
  }
}
```

### ID Validation
```javascript
// JavaScript validation
function isValidTreatmentNoteId(id) {
  // ID can be numeric string or integer
  if (typeof id === 'number') return id > 0;
  if (typeof id === 'string') return /^\\d+$/.test(id) && parseInt(id) > 0;
  return false;
}

// Usage
if (!isValidTreatmentNoteId(treatmentNoteId)) {
  throw new Error('Invalid treatment note ID');
}
```

---

## Request Body Fields

### Complete Request Body Schema
```json
{
  "title": "string",
  "author_name": "string or null",
  "draft": "boolean or null",
  "patient_id": "string (int64)",
  "attendee_id": "string (int64)",
  "booking_id": "string (int64)",
  "treatment_note_template_id": "string (int64)",
  "content": {
    "sections": [
      {
        "name": "string",
        "description": "string",
        "questions": [
          {
            "answer": "string",
            "name": "string",
            "type": "text"
          }
        ]
      }
    ]
  }
}
```

### Field-by-Field Reference

#### 1. title (String)

**Description:** The title or subject of the treatment note  
**Required:** ❌ No (unless creating)  
**Writable:** ✅ Yes  
**Max Length:** Typically 255 characters  
**Constraints:** Cannot be empty if provided  
**Use Cases:** Update note title, fix typos, clarify topic

**Examples:**
```json
{
  "title": "Follow-up Consultation - Week 3"
}
```

**Validation Rules:**
```javascript
function validateTitle(title) {
  if (title === undefined || title === null) return true; // Optional
  if (typeof title !== 'string') return false;
  if (title.trim().length === 0) return false; // Cannot be empty
  if (title.length > 255) return false; // Too long
  return true;
}
```

---

#### 2. author_name (String or Null)

**Description:** Name of the practitioner or person who authored/updated the note  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** String or null  
**Use Cases:** Update creator name, add authorship information

**Examples:**
```json
{
  "author_name": "Dr. Sarah Johnson"
}
```

**Setting to Null:**
```json
{
  "author_name": null
}
```

**Validation:**
```javascript
function validateAuthorName(authorName) {
  if (authorName === null) return true; // Allowed to be null
  if (typeof authorName !== 'string') return false;
  if (authorName.length > 255) return false;
  return true;
}
```

---

#### 3. draft (Boolean or Null)

**Description:** Indicates whether the note is still being edited (draft) or finalized  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** Boolean or null  
**Default:** true (when creating)  
**Critical:** Controls note visibility and finalization status

**Valid Values:**
```json
{
  "draft": true    // Note is still being edited
}
```
```json
{
  "draft": false   // Note is finalized/completed
}
```
```json
{
  "draft": null    // Unclear status
}
```

**Workflow:**
1. Create note with `draft: true`
2. Add content and details
3. Update to `draft: false` to finalize

**Example - Finalizing a Note:**
```json
{
  "draft": false
}
```

**Timestamp Behavior:**
- When setting `draft: false`, the API may automatically set `finalized_at` timestamp
- `finalized_at` will contain the ISO 8601 timestamp of finalization

**Validation:**
```javascript
function validateDraft(draft) {
  if (draft === undefined || draft === null) return true; // Optional
  if (typeof draft !== 'boolean') return false;
  return true;
}
```

---

#### 4. patient_id (String/Int64)

**Description:** ID of the patient associated with this treatment note  
**Required:** ❌ No (existing association is retained)  
**Writable:** ✅ Yes  
**Type:** String (int64) or Integer  
**Use Cases:** Reassign note to different patient (rare)

**Examples:**
```json
{
  "patient_id": "1"
}
```

**Format:**
```json
{
  "patient_id": "123"  // String format
}
```
```json
{
  "patient_id": 123    // Integer format
}
```

**Error Handling:**
```javascript
async function updatePatientReference(treatmentNoteId, patientId) {
  try {
    const response = await fetch(
      `https://api.au1.cliniko.com/v1/treatment_notes/${treatmentNoteId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patient_id: patientId.toString() })
      }
    );
    
    if (response.status === 404) {
      throw new Error('Patient not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update patient reference:', error);
    throw error;
  }
}
```

---

#### 5. attendee_id (String/Int64)

**Description:** ID of the attendee (participant) in the treatment session  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** String (int64)  
**Use Cases:** Update if attendee changed or was initially missed

**Examples:**
```json
{
  "attendee_id": "1"
}
```

---

#### 6. booking_id (String/Int64)

**Description:** ID of the booking/appointment this note relates to  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** String (int64)  
**Use Cases:** Link note to appointment, fix incorrect booking reference

**Examples:**
```json
{
  "booking_id": "1"
}
```

**Validation:**
```javascript
async function validateBookingExists(bookingId) {
  const response = await fetch(
    `https://api.au1.cliniko.com/v1/bookings/${bookingId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    }
  );
  
  if (response.status === 404) {
    throw new Error(`Booking ${bookingId} does not exist`);
  }
  
  return true;
}
```

---

#### 7. treatment_note_template_id (String/Int64)

**Description:** ID of the template used for structured content  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** String (int64)  
**Use Cases:** Change template structure, apply different template

**Examples:**
```json
{
  "treatment_note_template_id": "1"
}
```

---

#### 8. content (Object or Null)

**Description:** Structured content with sections and questions  
**Required:** ❌ No  
**Writable:** ✅ Yes  
**Type:** Object or null  
**Complexity:** Most important field to understand

**Full Content Structure:**
```json
{
  "content": {
    "sections": [
      {
        "name": "string",
        "description": "string",
        "questions": [
          {
            "answer": "string",
            "name": "string",
            "type": "text"
          }
        ]
      }
    ]
  }
}
```

### Content Deep Dive

#### content.sections (Array)

**Purpose:** Organize note content into logical sections

**Section Object:**
```json
{
  "name": "string",           // Section title
  "description": "string",    // What this section contains
  "questions": [...]          // Questions/content items in section
}
```

**Examples:**

**Example 1: Simple Sections**
```json
{
  "content": {
    "sections": [
      {
        "name": "Chief Complaint",
        "description": "Patient's primary concern",
        "questions": [
          {
            "name": "Chief Complaint",
            "type": "text",
            "answer": "Patient reports lower back pain for 2 weeks"
          }
        ]
      },
      {
        "name": "Vital Signs",
        "description": "Measured vital signs",
        "questions": [
          {
            "name": "Blood Pressure",
            "type": "text",
            "answer": "120/80"
          },
          {
            "name": "Heart Rate",
            "type": "text",
            "answer": "72 bpm"
          }
        ]
      }
    ]
  }
}
```

**Example 2: Medical Examination Structure**
```json
{
  "content": {
    "sections": [
      {
        "name": "History of Present Illness",
        "description": "Detailed account of current symptoms",
        "questions": [
          {
            "name": "Onset",
            "type": "text",
            "answer": "Sudden onset 3 days ago"
          },
          {
            "name": "Severity",
            "type": "text",
            "answer": "Moderate pain, 6/10"
          }
        ]
      },
      {
        "name": "Physical Examination",
        "description": "Findings from physical exam",
        "questions": [
          {
            "name": "Inspection",
            "type": "text",
            "answer": "No visible swelling or deformity"
          },
          {
            "name": "Palpation",
            "type": "text",
            "answer": "Tenderness at lower lumbar region"
          }
        ]
      },
      {
        "name": "Assessment & Plan",
        "description": "Clinical impression and treatment plan",
        "questions": [
          {
            "name": "Diagnosis",
            "type": "text",
            "answer": "Acute lower back strain"
          },
          {
            "name": "Treatment Plan",
            "type": "text",
            "answer": "Rest, ice, NSAIDs, physical therapy"
          }
        ]
      }
    ]
  }
}
```

#### Questions Array

**Purpose:** Individual questions/answers within a section

**Question Object Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Question label/title |
| `type` | string | ✅ Yes | Type of answer (typically "text") |
| `answer` | string | ✅ Yes | The answer/response text |

**Question Type Examples:**
```json
{
  "name": "Diagnosis",
  "type": "text",
  "answer": "Acute inflammatory condition"
}
```

**Complete Question Validation:**
```javascript
function validateQuestion(question) {
  if (!question || typeof question !== 'object') return false;
  
  // Validate name
  if (typeof question.name !== 'string' || question.name.trim() === '') {
    return false;
  }
  
  // Validate type
  const validTypes = ['text', 'number', 'date', 'select'];
  if (!validTypes.includes(question.type)) {
    return false;
  }
  
  // Validate answer
  if (typeof question.answer !== 'string') {
    return false;
  }
  
  return true;
}

function validateQuestions(questions) {
  if (!Array.isArray(questions)) return false;
  return questions.every(q => validateQuestion(q));
}

function validateSection(section) {
  if (!section || typeof section !== 'object') return false;
  
  if (typeof section.name !== 'string' || section.name.trim() === '') {
    return false;
  }
  
  if (typeof section.description !== 'string') {
    return false;
  }
  
  if (!validateQuestions(section.questions)) {
    return false;
  }
  
  return true;
}

function validateContent(content) {
  if (content === null) return true; // Null is valid
  if (!content || typeof content !== 'object') return false;
  
  if (!Array.isArray(content.sections)) return false;
  return content.sections.every(s => validateSection(s));
}
```

---

## Field Update Behavior

### What Gets Updated

**Updated When Specified:**
- `title`
- `author_name`
- `draft`
- `patient_id`
- `attendee_id`
- `booking_id`
- `treatment_note_template_id`
- `content`

**Never Updated (Read-Only):**
- `id`
- `created_at`
- `updated_at` (automatically updated to current time)
- `archived_at`
- `deleted_at`
- `finalized_at` (set automatically when `draft: false`)
- `pinned_at`

### Partial Update Examples

**Example: Update Only Title**
```json
{
  "title": "New Title"
}
```
Only the title changes; all other fields remain unchanged.

**Example: Update Content While Preserving Title**
```json
{
  "content": {
    "sections": [
      {
        "name": "Follow-up Notes",
        "description": "Post-treatment observations",
        "questions": [
          {
            "name": "Patient Response",
            "type": "text",
            "answer": "Patient reports 50% improvement"
          }
        ]
      }
    ]
  }
}
```
The title, author, and draft status remain unchanged.

**Example: Multiple Field Update**
```json
{
  "title": "Updated Title",
  "draft": false,
  "author_name": "Dr. Jane Smith",
  "content": {
    "sections": [...]
  }
}
```
All specified fields are updated in a single request.

### Empty vs Null Behavior

**Setting Field to Null:**
```json
{
  "author_name": null
}
```
Clears the field (removes value).

**Omitting Field:**
```json
{
  "title": "New Title"
}
```
Field is not modified (remains unchanged).

**Empty Content:**
```json
{
  "content": null
}
```
Removes all structured content.
```json
{
  "content": {
    "sections": []
  }
}
```
Clears sections but keeps content object.

---

## Response Structure

### Success Response (200 OK)

**HTTP Status:** 200 OK  
**Content-Type:** application/json

**Complete Response Schema:**
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
        "questions": [
          {
            "answer": "string",
            "name": "string",
            "type": "text"
          }
        ]
      }
    ]
  },
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes/{id}"
  }
}
```

### Response Field Explanations

#### Timestamp Fields

**created_at** (ISO 8601 format)
```
"created_at": "2019-08-24T14:15:22Z"
```
Unchanged - set when note was originally created

**updated_at** (ISO 8601 format)
```
"updated_at": "2024-01-20T10:30:45Z"
```
**Automatically updated to current time** when you make the PATCH request

**finalized_at** (ISO 8601 format or null)
```
"finalized_at": "2024-01-20T10:30:45Z"  // Set when draft: false
"finalized_at": null                      // Null if still draft
```
**Automatically set** when you update `draft: false`

#### Relationship Links (HATEOAS)

All relationships use HATEOAS (Hypermedia As The Engine Of Application State) format:
```json
{
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/101"
    }
  }
}
```

Use these links to navigate to related resources.

### Example Success Responses

**Example 1: Simple Update Response**
```json
{
  "id": "123",
  "title": "Physical Therapy Assessment - Updated",
  "author_name": "PT Sarah Johnson",
  "draft": true,
  "created_at": "2024-01-15T14:30:22Z",
  "updated_at": "2024-01-20T10:30:45Z",
  "archived_at": null,
  "deleted_at": null,
  "finalized_at": null,
  "pinned_at": null,
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/101"
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
        "name": "Assessment",
        "description": "Clinical assessment findings",
        "questions": [
          {
            "name": "Range of Motion",
            "type": "text",
            "answer": "Improved 30% from initial assessment"
          }
        ]
      }
    ]
  },
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes/123"
  }
}
```

**Example 2: Finalized Note Response**
```json
{
  "id": "123",
  "title": "Initial Consultation - Completed",
  "author_name": "Dr. John Smith",
  "draft": false,
  "created_at": "2024-01-15T14:30:22Z",
  "updated_at": "2024-01-20T10:45:00Z",
  "archived_at": null,
  "deleted_at": null,
  "finalized_at": "2024-01-20T10:45:00Z",
  "pinned_at": null,
  "patient": {
    "links": {
      "self": "https://api.au1.cliniko.com/v1/patients/101"
    }
  },
  "links": {
    "self": "https://api.au1.cliniko.com/v1/treatment_notes/123"
  }
}
```

---

## Validation Rules

### Server-Side Validation

The API performs these validations on every PATCH request:

#### 1. Treatment Note Must Exist
```
Condition: Treatment note ID doesn't exist
Error: 404 Not Found
Response:
{
  "errors": {
    "message": "Treatment note not found"
  }
}
```

#### 2. Title Field Validation
```
Condition: title is provided but empty string
Error: 422 Unprocessable Entity
Response:
{
  "errors": {
    "title": ["can't be blank"]
  }
}
```

#### 3. Content Structure Validation
```
Condition: Invalid content structure
Error: 422 Unprocessable Entity
Response:
{
  "errors": {
    "content": ["Invalid content structure"]
  }
}
```

#### 4. Referenced Resources Must Exist
```
Condition: patient_id references non-existent patient
Error: 422 Unprocessable Entity
Response:
{
  "errors": {
    "patient": ["Patient not found"]
  }
}
```

### Client-Side Validation (Pre-Request)

Always validate before sending request to reduce failures:
```javascript
class TreatmentNoteValidator {
  static validateUpdateRequest(updateData) {
    const errors = [];
    
    // Validate title if provided
    if (updateData.title !== undefined) {
      if (typeof updateData.title !== 'string') {
        errors.push('Title must be a string');
      }
      if (updateData.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      }
      if (updateData.title.length > 255) {
        errors.push('Title cannot exceed 255 characters');
      }
    }
    
    // Validate draft status if provided
    if (updateData.draft !== undefined && updateData.draft !== null) {
      if (typeof updateData.draft !== 'boolean') {
        errors.push('Draft must be a boolean');
      }
    }
    
    // Validate author_name if provided
    if (updateData.author_name !== undefined) {
      if (updateData.author_name !== null && typeof updateData.author_name !== 'string') {
        errors.push('Author name must be a string or null');
      }
    }
    
    // Validate IDs if provided
    const idFields = ['patient_id', 'attendee_id', 'booking_id', 'treatment_note_template_id'];
    for (const field of idFields) {
      if (updateData[field] !== undefined) {
        const id = updateData[field];
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
          errors.push(`${field} must be a valid positive integer`);
        }
      }
    }
    
    // Validate content if provided
    if (updateData.content !== undefined) {
      if (updateData.content !== null) {
        if (!Array.isArray(updateData.content.sections)) {
          errors.push('Content.sections must be an array');
        } else {
          updateData.content.sections.forEach((section, index) => {
            if (typeof section.name !== 'string') {
              errors.push(`Section ${index}: name must be a string`);
            }
            if (!Array.isArray(section.questions)) {
              errors.push(`Section ${index}: questions must be an array`);
            }
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

// Usage
const updateData = {
  title: "Updated Title",
  content: {
    sections: [...]
  }
};

const validation = TreatmentNoteValidator.validateUpdateRequest(updateData);
if (!validation.isValid) {
  console.error('Validation failed:', validation.errors);
  return;
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 | OK | Successful update |
| 400 | Bad Request | Malformed JSON or invalid request |
| 401 | Unauthorized | Invalid or missing credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Treatment note doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### 404 Not Found Error

**Scenario:** Trying to update a treatment note that doesn't exist
```bash
curl -X PATCH \\
  -u username:password \\
  'https://api.au1.cliniko.com/v1/treatment_notes/999999' \\
  -H 'Content-Type: application/json' \\
  -d '{"title": "New Title"}'
```

**Response:**
```json
{
  "errors": {
    "message": "Treatment note not found"
  }
}
```

**Handler:**
```javascript
async function updateTreatmentNote(treatmentNoteId, updateData) {
  const response = await fetch(
    `https://api.au1.cliniko.com/v1/treatment_notes/${treatmentNoteId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    }
  );
  
  if (response.status === 404) {
    throw new Error(`Treatment note ${treatmentNoteId} not found`);
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Update failed: ${JSON.stringify(error)}`);
  }
  
  return await response.json();
}
```

### 422 Unprocessable Entity (Validation Error)

**Scenario:** Validation fails on server side

**Example 1: Empty Title**
```json
{
  "errors": {
    "title": ["can't be blank"]
  }
}
```

**Example 2: Invalid Patient Reference**
```json
{
  "errors": {
    "patient": ["Patient not found"]
  }
}
```

**Example 3: Invalid Content Structure**
```json
{
  "errors": {
    "content": ["Invalid content structure"]
  }
}
```

**Comprehensive Error Handler:**
```javascript
class ApiErrorHandler {
  static handleUpdateError(response, error) {
    const status = response.status;
    
    switch (status) {
      case 404:
        return {
          type: 'NOT_FOUND',
          message: 'Treatment note not found',
          userMessage: 'The treatment note you are trying to update does not exist'
        };
      
      case 422:
        return {
          type: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: error.errors,
          userMessage: 'Please check your input and try again'
        };
      
      case 401:
        return {
          type: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          userMessage: 'Authentication failed. Please check your credentials'
        };
      
      case 403:
        return {
          type: 'FORBIDDEN',
          message: 'Insufficient permissions',
          userMessage: 'You do not have permission to update this note'
        };
      
      case 429:
        return {
          type: 'RATE_LIMITED',
          message: 'Too many requests',
          userMessage: 'Please wait a moment before trying again'
        };
      
      default:
        return {
          type: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          userMessage: 'Please try again later or contact support'
        };
    }
  }
  
  static async handleResponse(response) {
    if (response.ok) {
      return { success: true, data: await response.json() };
    }
    
    const error = await response.json();
    const handled = this.handleUpdateError(response, error);
    
    return {
      success: false,
      ...handled
    };
  }
}
```

---

## Implementation Examples

### JavaScript/Node.js Implementation

#### Basic Update
```javascript
async function updateTreatmentNote(treatmentNoteId, updateData) {
  const response = await fetch(
    `https://api.au1.cliniko.com/v1/treatment_notes/${treatmentNoteId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update treatment note: ${JSON.stringify(error)}`);
  }
  
  return await response.json();
}

// Usage
try {
  const updated = await updateTreatmentNote('123', {
    title: 'Updated Consultation',
    draft: false
  });
  console.log('Updated:', updated);
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Advanced Update with Retry Logic
```javascript
class TreatmentNoteClient {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.baseUrl = 'https://api.au1.cliniko.com/v1';
    this.maxRetries = 3;
  }
  
  getAuthHeader() {
    return 'Basic ' + btoa(`${this.username}:${this.password}`);
  }
  
  async updateWithRetry(treatmentNoteId, updateData, retries = 0) {
    try {
      const response = await fetch(
        `${this.baseUrl}/treatment_notes/${treatmentNoteId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429 && retries < this.maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.updateWithRetry(treatmentNoteId, updateData, retries + 1);
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(response.status, error);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`Request failed: ${error.message}`);
    }
  }
  
  async update(treatmentNoteId, updateData) {
    // Validate input
    const validation = this.validateUpdateRequest(updateData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    return this.updateWithRetry(treatmentNoteId, updateData);
  }
  
  validateUpdateRequest(data) {
    const errors = [];
    
    if (data.title !== undefined && typeof data.title !== 'string') {
      errors.push('Title must be a string');
    }
    
    if (data.draft !== undefined && data.draft !== null && typeof data.draft !== 'boolean') {
      errors.push('Draft must be a boolean');
    }
    
    if (data.content !== undefined && data.content !== null) {
      if (!Array.isArray(data.content.sections)) {
        errors.push('Content.sections must be an array');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Custom error classes
class ApiError extends Error {
  constructor(status, error) {
    super(error.message || 'API Error');
    this.status = status;
    this.error = error;
  }
}

class ValidationError extends Error {
  constructor(errors) {
    super('Validation error');
    this.errors = errors;
  }
}

// Usage
const client = new TreatmentNoteClient('username', 'password');

try {
  const result = await client.update('123', {
    title: 'Follow-up Assessment',
    draft: false,
    content: {
      sections: [
        {
          name: 'Outcome',
          description: 'Patient response to treatment',
          questions: [
            {
              name: 'Symptom Relief',
              type: 'text',
              answer: 'Patient reports 80% improvement'
            }
          ]
        }
      ]
    }
  });
  
  console.log('Success:', result);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error (${error.status}):`, error.error);
  } else if (error instanceof ValidationError) {
    console.error('Validation errors:', error.errors);
  } else {
    console.error('Error:', error.message);
  }
}
```

#### Using Async/Await with Error Handling
```javascript
async function updateTreatmentNoteComprehensive(treatmentNoteId, updateData) {
  try {
    console.log(`Updating treatment note ${treatmentNoteId}...`);
    
    const url = `https://api.au1.cliniko.com/v1/treatment_notes/${treatmentNoteId}`;
    const auth = 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    // Log response details
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, {
      contentType: response.headers.get('content-type'),
      rateLimit: response.headers.get('X-RateLimit-Remaining')
    });
    
    const data = await response.json();
    
    // Handle different status codes
    switch (response.status) {
      case 200:
        console.log('✅ Treatment note updated successfully');
        console.log(`Updated at: ${data.updated_at}`);
        if (data.finalized_at) {
          console.log(`Finalized at: ${data.finalized_at}`);
        }
        return { success: true, data };
      
      case 404:
        console.error('❌ Treatment note not found');
        return { success: false, error: 'NOT_FOUND', message: data.errors?.message };