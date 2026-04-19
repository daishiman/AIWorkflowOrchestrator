# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 11                                                              |
| 機能名     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 10                                                        |
| 後続Phase  | Phase 12                                                        |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

このタスクは NON_VISUAL（UI変更なし）のため、スクリーンショット証跡取得は N/A とする。
テスト実行結果の確認をメインとし、非視覚シナリオによる品質保証を行う。
特にauth:login IPC回帰テストの動作確認をCI相当の実行ログで証明する。

## NON_VISUAL判定根拠

| 判定項目                   | 判定結果 | 理由                                                       |
| -------------------------- | -------- | ---------------------------------------------------------- |
| UIコンポーネントの変更     | なし     | `SkillLifecyclePanel` コンポーネント本体は変更しない       |
| 画面レイアウトの変更       | なし     | テストファイルのみの変更であり表示に影響しない             |
| スタイル・CSSの変更        | なし     | スタイル変更はスコープ外                                   |
| ユーザー操作フローの変更   | なし     | 操作フローへの影響なし                                     |
| auth:login画面の変更       | なし     | テストコードの整理のみ・認証UI自体は変更なし               |
| **スクリーンショット取得** | **N/A**  | **テストファイルのみの変更でUIの見た目変更がないため不要** |

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                         |
| ---------- | -------------- | ------------------------------ |
| SubAgent-A | テスト実行責務 | Vitestテスト全件実行・PASS確認 |
| SubAgent-B | ログ確認責務   | テスト実行ログの異常検出       |
| SubAgent-C | 非視覚シナリオ | describe.skip除去の副作用確認  |
| SubAgent-D | 統合監査       | 矛盾・漏れ・整合・依存判定     |

## 実行タスク

- 非視覚シナリオ設計: テスト実行ベースのシナリオを設計する
- テスト実行確認: 全テストケースがPASSであることを記録する
- CI相当確認: ローカル環境でCI相当のコマンドを実行し結果を記録する
- 判定記録: PASS/FAIL判定と根拠を成果物に記録する
- スクリーンショット取得: **N/A**（NON_VISUALタスクのため不要）

## 参照資料

| 資料名           | パス                                                                                                | 用途                         |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                           | Phase 10 判定の引き継ぎ      |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`                                                        | 未解決事項の確認             |
| 品質レポート     | `outputs/phase-9/quality-report.md`                                                                 | テスト・型・lint の事前結果  |
| リスク台帳       | `outputs/phase-9/risk-register.md`                                                                  | 手動確認で注視する残存リスク |
| 対象テスト       | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 最終確認対象                 |

## 手動テスト結果テーブル（非視覚シナリオのみ）

| ケースID | 観点                       | 手順                                                                                      | 期待結果                                  |
| -------- | -------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| NV-11-01 | describe.skip除去確認      | `grep -c "describe\.skip"` で0件であることを確認                                          | 0件。スキップされたテストが存在しない     |
| NV-11-02 | auth:loginテスト有効化確認 | auth:loginに関するテストが `describe.skip` なしで1件以上存在することを確認                | 1件以上の有効なauth:loginテストが存在する |
| NV-11-03 | テスト全件PASS確認         | `pnpm test -- --testPathPattern="auth-regression" --run` を実行                           | 全テストケースがPASS（0 failed）          |
| NV-11-04 | 不要import除去確認         | TypeScript型チェックでunused importエラーが0件であることを確認                            | TypeScriptエラー0件                       |
| NV-11-05 | Lint違反除去確認           | ESLint実行でエラー・警告が0件であることを確認                                             | ESLintエラー0件・警告0件                  |
| NV-11-06 | IPCモック整合性確認        | auth:login IPCモックが実際のIPC仕様（チャンネル名・引数・戻り値）と一致していることを確認 | IPC仕様との不整合なし                     |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-11/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

### 具体的なコマンド手順

```bash
# NV-11-01: describe.skip の最終確認（auth-regression テスト最終確認コマンド）
grep -c "describe\.skip\|it\.skip\|test\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# 期待値: 0

# NV-11-02: describe.skip 残存最終確認（行番号付き詳細確認）
grep -n "describe\.skip\|it\.skip\|test\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# 期待値: 該当なし（出力なし）

# NV-11-03: auth-regression テスト実行ログの取得と記録
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillLifecyclePanel.auth-regression" --run --reporter=verbose \
  2>&1 | tee /tmp/auth-regression-test-result.log
cat /tmp/auth-regression-test-result.log

# NV-11-04: TypeScript型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error TS|auth-regression"
# 期待値: 出力なし（エラー0件）

# NV-11-05: ESLint
pnpm --filter @repo/desktop lint \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# 期待値: エラー0件・警告0件
```

## 証跡インデックス

| 証跡種別                 | パス                                     | 備考                                                                         |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------- |
| テスト実行ログ           | `outputs/phase-11/manual-test-result.md` | Vitest実行結果（PASS/FAIL記録）                                              |
| UIスクリーンショット     | N/A                                      | **NON_VISUALタスクのため不要。テストファイルのみ変更でUIの見た目変更なし。** |
| describe.skip除去証跡    | `outputs/phase-11/evidence-index.md`     | grep結果0件の記録                                                            |
| auth:loginテスト有効証跡 | `outputs/phase-11/evidence-index.md`     | 有効なauth:loginテストケース一覧                                             |

## 多角的チェック観点

| 観点     | 確認内容                                       |
| -------- | ---------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する             |
| 漏れ     | 要件から成果物への未反映項目がないか確認する   |
| 整合性   | テスト実行結果が期待値と一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する  |

## 統合テスト連携

| 判定項目                                | 基準                            | 結果    |
| --------------------------------------- | ------------------------------- | ------- |
| `pnpm --filter @repo/desktop test:run`  | PASS                            | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                            | pending |
| `pnpm --filter @repo/desktop lint`      | PASS                            | pending |
| NON_VISUAL 証跡                         | N/A根拠を evidence-index に明記 | pending |

## 成果物

| 成果物           | パス                                     | 説明                                                |
| ---------------- | ---------------------------------------- | --------------------------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | 非視覚シナリオの実行結果（PASS/FAIL記録）           |
| 証跡インデックス | `outputs/phase-11/evidence-index.md`     | N/A: UIスクリーンショット不要理由を明記した証跡一覧 |

> **注意**: NON_VISUAL タスクのため画像ファイルは生成しない。証跡は `manual-test-result.md` と `evidence-index.md` に集約する。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] NV-11-01〜NV-11-06 の全ケースが PASS であることを確認
- [ ] スクリーンショット取得が N/A である理由を証跡インデックスに明記
- [ ] auth:loginテストが最低1件有効化されていることを証跡に記録
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
- [ ] NON_VISUAL判定根拠を明記した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次のPhase

Phase 12: ドキュメント更新
