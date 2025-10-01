# Legal Deadline Calculator API

## Endpoint

```
POST /api/calculate
```

## Request Body

```json
{
  "startDate": "2025-10-01",
  "days": 30,
  "direction": "forward",
  "useBusinessDays": true,
  "excludeHolidays": true
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string | Yes | - | Start date in YYYY-MM-DD format |
| `days` | number | Yes | - | Number of days to calculate |
| `direction` | string | No | "forward" | Direction: "forward" or "backward" |
| `useBusinessDays` | boolean | No | false | Exclude weekends from calculation |
| `excludeHolidays` | boolean | No | false | Exclude US federal holidays |

## Response

### Success Response (200)

```json
{
  "success": true,
  "result": {
    "startDate": "2025-10-01",
    "endDate": "2025-11-05",
    "targetDays": 30,
    "direction": "forward",
    "useBusinessDays": true,
    "excludeHolidays": true,
    "totalCalendarDays": 43,
    "businessDaysCount": 30,
    "isRollover": false,
    "excludedDates": [
      {
        "date": "2025-10-04",
        "reason": "Weekend"
      },
      {
        "date": "2025-10-05",
        "reason": "Weekend"
      }
    ],
    "calculationSteps": [
      {
        "date": "2025-10-02",
        "action": "Counted",
        "daysRemaining": 29
      }
    ]
  }
}
```

### Error Responses

#### 400 - Bad Request

```json
{
  "error": "Missing required field: startDate",
  "message": "Please provide a startDate in YYYY-MM-DD format"
}
```

#### 405 - Method Not Allowed

```json
{
  "error": "Method not allowed",
  "message": "Please use POST request"
}
```

#### 500 - Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Error description"
}
```

## Example Usage

### JavaScript (Fetch)

```javascript
const response = await fetch('https://your-domain.vercel.app/api/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    startDate: '2025-10-01',
    days: 30,
    direction: 'forward',
    useBusinessDays: true,
    excludeHolidays: true
  })
});

const data = await response.json();
console.log(data.result.endDate);
```

### cURL

```bash
curl -X POST https://your-domain.vercel.app/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-10-01",
    "days": 30,
    "direction": "forward",
    "useBusinessDays": true,
    "excludeHolidays": true
  }'
```

### Python

```python
import requests

response = requests.post(
    'https://your-domain.vercel.app/api/calculate',
    json={
        'startDate': '2025-10-01',
        'days': 30,
        'direction': 'forward',
        'useBusinessDays': True,
        'excludeHolidays': True
    }
)

result = response.json()
print(result['result']['endDate'])
```

## Federal Holidays

The API includes US federal holidays for 2025 and 2026:

- New Year's Day
- Martin Luther King Jr. Day
- Washington's Birthday
- Memorial Day
- Juneteenth National Independence Day
- Independence Day
- Labor Day
- Columbus Day
- Veterans Day
- Thanksgiving Day
- Christmas Day

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD)
- When `useBusinessDays` is true, weekends (Saturday and Sunday) are excluded
- When `excludeHolidays` is true, US federal holidays are excluded
- If the calculated deadline falls on a weekend or holiday (when those options are enabled), it automatically rolls over to the next business day
- The `calculationSteps` array shows the detailed calculation process
- The `excludedDates` array lists all dates that were skipped during calculation
