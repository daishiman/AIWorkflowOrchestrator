# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 8                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 7                                      |
| 後続Phase  | Phase 9                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 5 で実装した変更内容（およびテストコード）をレビューし、
重複・不明瞭・責務混在がないかを確認・整理する。
小規模タスクのため、リファクタリング対象が存在しない場合は「対象なし」として記録して進む。

## リファクタリング方針

**注意**: このタスクは検証タスク（verification）であり、実装変更は最小限。
リファクタリングのスコープは Phase 5 で変更した箇所のみ。

### チェック項目

| 項目                          | 確認内容                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| テストコードの重複            | `beforeEach` での重複するモック設定がないか                  |
| 命名一貫性                    | テスト description が受け入れ基準と対応しているか            |
| 責務混在                      | コンポーネントテストが IPC 層の実装詳細に依存していないか    |
| モックの適切性                | `Object.defineProperty` が正しく使われているか（副作用なし） |
| 実装コードの navigation drift | `SkillLifecyclePanel.tsx` の変更が他の機能に影響していないか |

### 変更内容記録フォーマット（[Feedback RT-03]）

| 対象ファイル                              | Before                 | After            | 理由                 |
| ----------------------------------------- | ---------------------- | ---------------- | -------------------- |
| `SkillLifecyclePanel.test.tsx`            | （Phase 5 の実装内容） | （リファクタ後） | 重複除去・命名統一等 |
| `SkillLifecyclePanel.tsx`（変更した場合） | （Phase 5 の実装内容） | （リファクタ後） | 責務整理等           |

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## リファクタリング後の確認

```bash
# リファクタ後にテストが全て PASS することを確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx
```

## 成果物

| 成果物         | パス                                             | 説明                                      |
| -------------- | ------------------------------------------------ | ----------------------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Before/After テーブル（対象なし記録含む） |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の確認手順                    |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Renderer/Store/IPC 責務分離確認           |

## 完了条件

- [ ] リファクタリング対象が記録されている（「対象なし」も許容）
- [ ] Before/After テーブルが作成されている
- [ ] リファクタ後に全テスト（UT-01〜UT-11）が PASS している
- [ ] 責務境界マップが作成されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] リファクタ後テスト PASS が記録されている
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
