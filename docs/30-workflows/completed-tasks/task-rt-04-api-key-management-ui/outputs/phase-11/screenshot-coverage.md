# Phase 11 画面カバレッジ

## current facts

- `outputs/phase-11/screenshots/` に current build screenshots を保存済み。
- `manual-test-result.md` / `phase11-capture-metadata.json` は 4 TC の証跡を参照している。
- `screenshot-plan.json` は SkillLifecyclePanel 側の 4 ケース計画を保持している。
- `TC-11-04` は `SkillLifecyclePanel` の non-interference 確認として baseline reuse を使っている。
- `NON_VISUAL` は採用せず、視覚証跡ありの current build capture を正本にしている。

| TC-ID    | 画面                                      | 期待証跡                                          | current fact                                       |
| -------- | ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| TC-11-01 | SkillLifecyclePanel / ApiKeySettingsPanel | `screenshots/TC-11-01-skill-authkey-initial.png`  | current build capture                              |
| TC-11-02 | SkillLifecyclePanel / ApiKeySettingsPanel | `screenshots/TC-11-02-skill-authkey-action.png`   | current build capture                              |
| TC-11-03 | SkillLifecyclePanel / ApiKeySettingsPanel | `screenshots/TC-11-03-skill-authkey-fallback.png` | current build capture                              |
| TC-11-04 | SkillLifecyclePanel / ApiKeySettingsPanel | `screenshots/TC-11-02-skill-authkey-action.png`   | baseline reuse for non-interference                |
| **合計** | 4                                         | 3 PNG / 4 TC covered                              | current build screenshots 3件 + baseline reuse 1件 |
