# System Spec Update Summary

## current facts

- Phase 11 は `outputs/phase-11/screenshots/` の current build screenshots を正本としている。
- `manual-test-result.md` は NON_VISUAL ではなく screenshot-backed PASS を記録している。
- current contract は `SettingsView` 主導線 / `SkillLifecyclePanel` 補助導線 / `auth-key:*` / `ApiKeyStatus` に収束している。
- `auth-key:validate` は Main 側の契約として残しつつ、現行 UI は保存前に backend validation も呼び出している。
- `apps/desktop/src/main/services/auth/AuthKeyService.ts` / `apps/desktop/src/main/ipc/authKeyHandlers.ts` / `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` / `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` が current contract の参照先である。
- root `artifacts.json` と `outputs/artifacts.json` は同一内容で維持している。

## Step 1-A

- `phase-01-requirements.md` から `phase-13-pr-creation.md` までを current contract に再同期した。
- `phase-11-manual-test.md` を 4TC の current build capture 前提へ更新し、`screenshot-plan.json` / `screenshot-coverage.md` / `phase11-capture-metadata.json` の参照先を揃えた。
- `phase-12-documentation.md` を completed 化し、Phase 11 の NON_VISUAL 前提を除去した。

## Step 1-B

- `SettingsView` は主導線、`SkillLifecyclePanel` は補助導線として固定した。
- `skill-creator:*` の新規 namespace は採用しない方針を明文化した。

## Step 1-C

- completed-only area に未完了指示書は混在していない。
- Phase 13 は user approval がない限り blocked を維持する。

## Step 1-D

- `index.md` と `artifacts.json` の parity を確認対象に含めた。
- Phase 11 screenshot refs は Phase 12 implementation-guide に継承した。

## Step 2

- no-op。
- `.claude/skills/aiworkflow-requirements` の正本ファイルは変更していない。

## canonical root / mirror parity

- `.claude` 正本と `.agents` mirror の差分は作っていない。
- parity は file system 上の参照関係としてのみ維持している。

## artifacts parity

- root `artifacts.json` と `outputs/artifacts.json` は同内容。
- Phase 11 screenshot artifact を追加しても片側だけが先行する drift はない。
