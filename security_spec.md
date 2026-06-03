# Security Specification

## 1. Data Invariants
- **Students**: Every student must be owned by a specific `ownerId` (the user's Firebase UID) and linked to a class (`kelompok`).
- **Assessments**: Assessments must be scoped to the `studentId`, and restricted to the `ownerId` of the owning teacher.
- **Settings**: Each user has a single settings document in `settings/{uid}`.
- **User Roles**: Roles are determined in a trusted collection `account_roles`.

## 2. The "Dirty Dozen" Payloads (Examples)
1. **Student Poisoning**: Payload with `ownerId` set to another user's UID. Expect: PERMISSION_DENIED.
2. **Accessing Other's Students**: `list` query from one user to retrieve students of another. Expect: Empty list (because of rule-side filtering).
3. **Ghost Write**: Writing a student without `ownerId`. Expect: PERMISSION_DENIED.
4. **Role Escalation**: Modifying `account_roles` document. Expect: PERMISSION_DENIED.
5. **PII Leak**: Accessing `users` profile of another user using `get`. Expect: PERMISSION_DENIED (except for admin).

## 3. Test Runner
We will utilize Firestore Security Rules Simulator or unit tests in JS/TS as specified in the skill documentation to verify these invariants.
