# task-rt-04-api-key-management-ui - タスク実行仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 機能名     | Skill Runtime API Key Panel  |
| タスクID   | TASK-RT-04                   |
| 関連Issue  | #1881                        |
| 作成日     | 2026-04-04                   |
| ステータス | completed (Phase 13 blocked) |
| 総Phase数  | 13                           |

---

## 参照基準

| 仕様                       | 参照先                                                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` / `references/phase-template-phase11.md` / `references/phase-template-phase12.md` / `references/phase-template-phase13.md`   |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md` / `references/ui-ux-feature-components-core.md` / `references/api-ipc-system-core.md` / `references/task-workflow-completed.md` |

---

## Phase一覧

| Phase | 名称                        | 仕様書                                                   | ステータス |
| ----- | --------------------------- | -------------------------------------------------------- | ---------- |
| 1     | 要件定義                    | [phase-01-requirements.md](phase-01-requirements.md)     | completed  |
| 2     | 設計                        | [phase-02-design.md](phase-02-design.md)                 | completed  |
| 3     | 設計レビューゲート          | [phase-03-design-review.md](phase-03-design-review.md)   | completed  |
| 4     | テスト作成                  | [phase-04-test-creation.md](phase-04-test-creation.md)   | completed  |
| 5     | 実装                        | [phase-05-implementation.md](phase-05-implementation.md) | completed  |
| 6     | テスト拡充                  | [phase-06-test-expansion.md](phase-06-test-expansion.md) | completed  |
| 7     | テストカバレッジ確認        | [phase-07-coverage.md](phase-07-coverage.md)             | completed  |
| 8     | リファクタリング            | [phase-08-refactoring.md](phase-08-refactoring.md)       | completed  |
| 9     | 品質保証                    | [phase-09-quality.md](phase-09-quality.md)               | completed  |
| 10    | 最終レビューゲート          | [phase-10-final-review.md](phase-10-final-review.md)     | completed  |
| 11    | 手動テスト検証              | [phase-11-manual-test.md](phase-11-manual-test.md)       | completed  |
| 12    | ドキュメント更新            | [phase-12-documentation.md](phase-12-documentation.md)   | completed  |
| 13    | PR作成（user approval待ち） | [phase-13-pr-creation.md](phase-13-pr-creation.md)       | blocked    |

---

## 実行フロー

```text
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13（blocked）
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行する
2. **成果物配置**: 必須成果物は `outputs/phase-11/` `outputs/phase-12/` `outputs/phase-13/` に集約し、task root 直下へ分散させない
3. **成果物確認**: すべての必須成果物が生成されていることを確認する
4. **artifacts.json更新**: root `artifacts.json` と `outputs/artifacts.json` を同一内容で更新する
5. **完了条件チェック**: 各タスクを完遂した旨を必ず明記する

## 共通ルール

- `skill-creator:*` の新規導入はしない。既存の `auth-key:*` 契約を再利用する
- `SettingsView` を主導線、`SkillLifecyclePanel` を補助導線として扱う
- Phase 13 は user の明示承認があるまで blocked を維持する

_このファイルはタスク仕様書改善時に更新された。最終更新: 2026-04-04_
