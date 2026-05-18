# Security Specification for KiddyAssess

## 1. Data Invariants
- A Student must always have an `ownerId` matching the authenticated teacher's UID.
- An Assessment must correspond to a valid Student (verified via matching `ownerId`).
- Settings are unique per teacher (`userId`).
- All timestamps (`createdAt`, `updatedAt`) must be server-generated.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: Attempt to create a student with a different `ownerId`.
2. **Orphan Assessment**: Create an assessment for a student belonging to another user.
3. **Ghost Field Injection**: Add `isAdmin: true` to a Settings document.
4. **Invalid Scale**: Update an assessment with a score not in `['BB', 'MB', 'BSH', 'BSB']`.
5. **Timestamp Forge**: Manually set a future `updatedAt`.
6. **Huge ID**: Use a 2KB string as a `studentId`.
7. **Cross-User Read**: Try to `get` a student document belonging to another teacher.
8. **Malicious Regex**: Use an ID containing SQL-injection-like characters (though ID matches regex).
9. **Settings Overwrite**: Try to update `ownerId` of an existing settings document.
10. **Shadow Student**: Create a student missing the required `semester` field.
11. **PII Leak**: Query list of all students without filtering by `ownerId`.
12. **Photo Hijack**: Upload photo metadata for a student the user doesn't own.

## 3. Test Runner Plan
- We will verify that each of these payloads results in `PERMISSION_DENIED` using local simulation logic or comprehensive rules.
