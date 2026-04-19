# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 8                                                               |
| 機能名     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 7                                                         |
| 後続Phase  | Phase 9                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

振る舞いを維持したまま、auth-regression テストコードの品質を改善する。
CLEANUPタスクとして、不要なimport文・モック宣言の除去とテスト構造の整理を行い、auth:login IPC回帰テストとして整合性のある状態に整える。

## 背景

`SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` に対して削除・修正・別途判断を行った結果、未使用になったimport文やモック宣言がコード中に残存している可能性がある。これらを除去してテストコードの保守性・セキュリティ観点の追跡可能性を向上させる。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                        |
| ---------- | ---------------- | ----------------------------- |
| SubAgent-A | テストコード責務 | describe.skip除去・import整理 |
| SubAgent-B | モック宣言責務   | 未使用IPCモック宣言の完全除去 |
| SubAgent-C | 型安全責務       | TypeScript型整合の確認        |
| SubAgent-D | 統合監査         | 矛盾・漏れ・整合・依存判定    |

## 実行タスク

- 不要importの除去: テストファイルから未使用になったimport文を完全に削除する
- 未使用IPCモック宣言の除去: auth:login IPC処理に関係しないモック宣言を削除する
- describe.skip残存確認: クリーンアップ後に残った `describe.skip` がないことを確認する
- コメント整理: 残存するコメントがテストの意図を正確に説明しているか確認・整理する
- コード整形: 除去後のコードが正しくフォーマットされていることを確認する

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| 設計書                 | `outputs/phase-2/design.md`                       | Phase 2 成果物 |
| テスト仕様書           | `outputs/phase-4/test-specification.md`           | Phase 4 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-8/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

### 具体的なコマンド手順

```bash
# 対象ファイル確認
cat apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 1. 不要import確認・除去コマンド
# TypeScriptのunused importエラーを確認
pnpm --filter @repo/desktop typecheck 2>&1 | grep "auth-regression"

# 2. describe.skipの残存確認（除去後のテストコード構造確認）
grep -n "describe.skip\|it.skip\|test.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# 期待値: 該当なし（0件）

# 未使用IPCモック宣言の残存確認
grep -n "vi.mock\|mockIpc\|ipcRenderer" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 3. ESLintエラー確認
pnpm --filter @repo/desktop lint \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 4. TypeScript型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "auth-regression|error TS"
```

## 責務境界マップ

| 責務           | ファイル / モジュール                          | 備考                               |
| -------------- | ---------------------------------------------- | ---------------------------------- |
| テストファイル | `SkillLifecyclePanel.auth-regression.test.tsx` | 本タスクの変更対象                 |
| コンポーネント | `SkillLifecyclePanel.tsx`                      | 変更なし（テストのみ対象）         |
| IPCモック      | `vi.mock('electron')` 等のIPC通信モック        | auth:login IPCモックの整合性を確認 |
| auth:login処理 | electron IPC経由のauth:loginチャンネル         | セキュリティ観点の回帰テスト対象   |

## 多角的チェック観点

| 観点     | 確認内容                                                 |
| -------- | -------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                       |
| 漏れ     | 要件から成果物への未反映項目がないか確認する             |
| 整合性   | テストコードとauth:login IPC仕様が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する            |

## 統合テスト連携

| 判定項目                                  | 基準                                 | 結果    |
| ----------------------------------------- | ------------------------------------ | ------- |
| `describe.skip` / `it.skip` / `test.skip` | 0件                                  | pending |
| 未使用IPCモック参照                       | 0件                                  | pending |
| TypeScript                                | unused import / 型エラー 0件         | pending |
| ESLint                                    | 対象テストファイルでエラー・警告 0件 | pending |

## 成果物

| 成果物         | パス                                             | 説明                 |
| -------------- | ------------------------------------------------ | -------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 責務分離・除去計画   |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | テスト責務境界の定義 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `describe.skip` が0件であることを確認
- [ ] 未使用IPCモック宣言が0件であることを確認
- [ ] 不要なimport文が0件であることを確認
- [ ] ESLintエラー0件であることを確認
- [ ] TypeScript型エラー0件であることを確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次のPhase

Phase 9: 品質保証
