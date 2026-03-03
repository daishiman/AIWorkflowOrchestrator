# task-ui-05a-phase11-screenshot-name-consistency

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-UI-05A-PHASE11-SCREENSHOT-NAME-CONSISTENCY-001 |
| 親タスク   | UT-UI-05A-IMPLEMENTATION-CLOSURE-001              |
| 優先度     | 低                                                |
| 推定工数   | 0.5h                                              |
| 作成日     | 2026-03-03                                        |
| 期限       | 未定                                              |
| ステータス | 未着手                                            |

## 1. なぜこのタスクが必要か（Why）

Phase 11 の証跡ファイル `06-navigation-breadcrumb.png` は実際の内容が「未保存離脱ダイアログ」であり、ファイル名と中身の意味が一致していない。証跡検索時の誤読を防ぐため、命名を意味一致にそろえる必要がある。

## 2. 何を達成するか（What）

- Phase 11 の証跡名を内容に一致させる
- 参照している仕様書・結果ファイルのリンク切れをゼロのまま維持する

## 3. どのように実行するか（How）

- 対象ファイルを `06-navigation-unsaved-dialog.png` に改名する
- 参照元（`phase-11-manual-test.md`, `manual-test-result.md`, Phase 12 文書）を一括更新する
- `verify-unassigned-links` / `validate-phase11-screenshot-coverage` を再実行して整合を確認する

## 4. 実行手順

1. `outputs/phase-11/screenshots/06-navigation-breadcrumb.png` を新命名へ変更する
2. 参照パスを全ファイルで更新する
3. 検証コマンドを実行し PASS を確認する

## 5. 完了条件チェックリスト

- [ ] スクリーンショットファイル名が意味一致している
- [ ] 参照ファイル全てで新しいファイル名に更新されている
- [ ] リンク検証・カバレッジ検証が PASS

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-editor-view-closure
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

## 7. リスクと対策

| リスク                             | 対策                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| ファイル名変更で参照切れが発生する | 変更後に `rg` で旧名残存を確認し、検証コマンドを実行する |

## 8. 参照情報

- `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-11-manual-test.md`

## 9. 備考

本タスクは機能影響なしの文書品質改善。CI 影響はない。
