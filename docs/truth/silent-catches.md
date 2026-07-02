# KIT-E E.0 — Silent catches (2026-07-02)

Read-only inventura catch blokova koji gutaju grešku i vraćaju prazno/null/false.

| file | line | silent return | logs? |
|---|---:|---|---|
| `lib/booking-db.ts` | 108 | return null | yes |
| `lib/booking-db.ts` | 123 | return null | yes |
| `lib/booking-db.ts` | 138 | return false | yes |
| `lib/booking-db.ts` | 159 | return [] | yes |
| `lib/booking-db.ts` | 185 | return false | yes |
| `lib/booking-db.ts` | 212 | return null | yes |
| `lib/booking-db.ts` | 221 | return null | yes |
| `lib/booking-db.ts` | 242 | return [] | yes |
| `lib/walk-db.ts` | 155 | return null | yes |
| `lib/walk-db.ts` | 177 | return false | yes |
| `lib/walk-db.ts` | 205 | return false | yes |
| `lib/chat/db.ts` | 66 | return [] | yes |
| `lib/chat/db.ts` | 87 | return null | yes |
| `lib/groomer-dashboard-db.ts` | 46 | return null | yes |
| `lib/groomer-dashboard-db.ts` | 71 | return null | yes |
| `lib/groomer-dashboard-db.ts` | 143 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 107 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 129 | return null | yes |
| `lib/owner-dashboard-db.ts` | 151 | return null | yes |
| `lib/owner-dashboard-db.ts` | 162 | return false | yes |
| `lib/owner-dashboard-db.ts` | 182 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 193 | return false | yes |
| `lib/owner-dashboard-db.ts` | 207 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 237 | return false | yes |
| `lib/owner-dashboard-db.ts` | 288 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 306 | return [] | yes |
| `lib/owner-dashboard-db.ts` | 333 | return null | yes |
| `lib/sitter-dashboard-db.ts` | 155 | return null | yes |
| `lib/sitter-dashboard-db.ts` | 181 | return null | yes |
| `lib/sitter-dashboard-db.ts` | 204 | return [] | yes |
| `lib/sitter-dashboard-db.ts` | 218 | return false | yes |
| `lib/sitter-dashboard-db.ts` | 242 | return [] | yes |
| `lib/sitter-dashboard-db.ts` | 281 | return false | yes |
| `lib/sitter-dashboard-db.ts` | 298 | return false | yes |
| `lib/sitter-dashboard-db.ts` | 339 | return [] | yes |
| `lib/sitter-dashboard-db.ts` | 489 | return [] | yes |
| `lib/sitter-dashboard-db.ts` | 513 | return [] | yes |
| `lib/sitter-dashboard-db.ts` | 548 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 25 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 48 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 83 | return [] | yes |
| `lib/trainer-dashboard-db.ts` | 101 | return false | yes |
| `lib/trainer-dashboard-db.ts` | 122 | return [] | yes |
| `lib/trainer-dashboard-db.ts` | 140 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 155 | return false | yes |
| `lib/trainer-dashboard-db.ts` | 174 | return false | yes |
| `lib/trainer-dashboard-db.ts` | 255 | return [] | yes |
| `lib/trainer-dashboard-db.ts` | 273 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 293 | return null | yes |
| `lib/trainer-dashboard-db.ts` | 308 | return false | yes |
| `lib/trainer-dashboard-db.ts` | 344 | return [] | yes |
| `lib/trainer-dashboard-db.ts` | 532 | return [] | yes |

Total: 52
