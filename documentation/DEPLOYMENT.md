# Release and deployment

## Intended destination

GitHub account confirmed by the user: `sibongumusaoscarnduli-cmd`.
Repository: https://github.com/sibongumusaoscarnduli-cmd/data-quality-workbench
Hosting: GitHub Pages, static `docs/` directory, no paid services.

## Publish procedure

1. Sign in to the user's GitHub account and verify the owner.
2. Check for an existing repository to avoid duplicates.
3. Create the public repository only for this project; do not upload its parent folder, which contains private job-application materials.
4. Push the project contents to `main`, including tests, README, LICENSE and workflow.
5. Confirm the Tests workflow succeeds in GitHub Actions.
6. In Settings → Pages, choose deployment from branch, `main`, `/docs`.
7. Wait for GitHub to provide the real public URL; open it and run the sample.
8. Verify file import, filtering, correction and JSON export on the deployed page.
9. Add the verified demo URL to the README and repository About section.

## Current state

Published and verified on 22 October 2026. Live demo: https://sibongumusaoscarnduli-cmd.github.io/data-quality-workbench/

Tests passed: https://github.com/sibongumusaoscarnduli-cmd/data-quality-workbench/actions/runs/39761573867

Initial deployment: https://github.com/sibongumusaoscarnduli-cmd/data-quality-workbench/actions/runs/39761654242

The deployed sample, warning filter, corrected valid input, file import and JSON export were tested in a real browser.

## Release gate

- All tests pass, including cross-language parity.
- No secrets or personal documents are in the staged files.
- README accurately describes current features and limitations.
- Browser sample and error states work.
- The actual hosting build and public URL are verified.

## Rollback

If a published change breaks the demo, revert its commit, rerun tests and let GitHub Pages redeploy. Keep the last working release recorded. Do not delete unrelated repositories or change account-wide settings.
