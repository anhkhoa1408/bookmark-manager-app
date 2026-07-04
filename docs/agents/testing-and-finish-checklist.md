# Testing Policy and Finish Checklist

## Testing Policy

Unit tests and integration tests are not required for this project by default.

Do not:

- Add unit tests unless explicitly requested.
- Add integration tests unless explicitly requested.
- Add test libraries or test setup unless explicitly requested.
- Block completion because tests are missing.
- Run `npm run test` by default for normal feature work.

For normal tasks, validate with the existing non-test checks that are relevant, especially:

```sh
npm run build
```

If a requested task specifically involves tests, then follow the user's instruction for that task only.

## Before Finishing

Check:

- The change solves only the requested task.
- No unrelated files were modified.
- No unrelated code was deleted.
- Existing patterns were followed.
- Auth and Firebase boundaries are respected.
- UI follows Atomic Design.
- Loading, empty, error, and unauthorized states are handled when relevant.
- Unit/integration tests were not added unless explicitly requested.
- Relevant existing non-test checks were run, or the reason they were skipped is stated.
