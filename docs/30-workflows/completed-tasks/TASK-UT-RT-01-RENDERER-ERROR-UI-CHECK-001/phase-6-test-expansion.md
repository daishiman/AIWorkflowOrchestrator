# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 6                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 5                                      |
| 後続Phase  | Phase 7                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 5 の Green テストを基盤に、fail path・回帰ガード・境界値テストを追加し、
エラー表示経路の堅牢性を高める。

## 拡充対象テストケース

### fail path テスト

| テストID | シナリオ                                                       | 期待結果                                   |
| -------- | -------------------------------------------------------------- | ------------------------------------------ |
| UT-06    | `errorMessage` が空文字の場合                                  | alert が表示されない（空文字はエラーなし） |
| UT-07    | `errorMessage` が非常に長い文字列の場合                        | UI がクラッシュせずエラーが表示される      |
| UT-08    | `applyWorkflowSnapshot` が `setWorkflowError(null)` を呼ぶ場合 | workflowError がリセットされる             |
| UT-09    | 複数回 `onWorkflowStateChanged` が発火する場合                 | 最後の errorMessage が表示される           |

### 回帰ガード

| テストID | シナリオ                                                                     | 期待結果                    |
| -------- | ---------------------------------------------------------------------------- | --------------------------- |
| UT-10    | errorMessage がない場合に `data-testid="skill-lifecycle-error"` が存在しない | 要素が DOM に存在しない     |
| UT-11    | `localError` が設定されたときに `workflowError` が上書きしない               | localError が優先表示される |

### `applyWorkflowSnapshot` リセット注意事項

Issue #1844 の修正により、`applyWorkflowSnapshot` 内では `snapshot.currentPhase !== "handoff"` のとき
`setWorkflowError(null)` が呼ばれる。このリセットタイミングを UT-08 でテストすること。

## テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx \
  --reporter=verbose
```

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | UT-06〜UT-11 の詳細  |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全テスト PASS の証跡 |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | fail path テスト結果 |

## 完了条件

- [ ] UT-06〜UT-11 が実装されている
- [ ] 全テスト（UT-01〜UT-11）が PASS している
- [ ] `applyWorkflowSnapshot` のリセット動作が UT-08 でカバーされている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全テスト PASS 結果が記録されている
- [ ] 実行記録を残した

## 次のPhase

Phase 7: テストカバレッジ確認
