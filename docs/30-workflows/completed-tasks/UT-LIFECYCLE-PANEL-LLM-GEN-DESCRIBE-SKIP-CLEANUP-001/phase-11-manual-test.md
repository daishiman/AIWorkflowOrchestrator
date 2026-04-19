# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 11                                                             |
| 機能名     | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 10                                                       |
| 後続Phase  | Phase 12                                                       |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

このタスクはNON_VISUAL（UI変更なし）のため、スクリーンショット証跡取得はN/Aとする。
テスト実行結果の確認をメインとし、非視覚シナリオによる品質保証を行う。

## 背景

`SkillLifecyclePanel.llm-generation.test.tsx` に対するクリーンアップは純粋なテストコード整理であり、UIコンポーネントの挙動・表示内容への変更は一切ない。したがって、手動テスト検証はテスト実行結果・ログの確認のみで完結する。

## NON_VISUAL判定根拠

| 判定項目                   | 判定結果 | 理由                                                 |
| -------------------------- | -------- | ---------------------------------------------------- |
| UIコンポーネントの変更     | なし     | `SkillLifecyclePanel` コンポーネント本体は変更しない |
| 画面レイアウトの変更       | なし     | テストファイルのみの変更であり表示に影響しない       |
| スタイル・CSSの変更        | なし     | スタイル変更はスコープ外                             |
| ユーザー操作フローの変更   | なし     | 操作フローへの影響なし                               |
| **スクリーンショット取得** | **N/A**  | **UI変更がないため画面証跡は不要**                   |

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
- 判定記録: PASS/FAIL判定と根拠を成果物に記録する
- スクリーンショット取得: **N/A**（NON_VISUALタスクのため不要）

## 参照資料

| 資料名                 | パス                                                                                               | 用途                         |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                                                          | Phase 10 判定の引き継ぎ      |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`                                                       | 未解決事項の確認             |
| 品質レポート           | `outputs/phase-9/quality-report.md`                                                                | テスト・型・lint の事前結果  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                                                                 | 手動確認で注視する残存リスク |
| 対象テスト             | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 最終確認対象                 |
| 出荷準備チェックリスト | `outputs/phase-10/release-readiness-checklist.md`                                                  | Phase 10 成果物              |

## 非視覚テストシナリオ

| ケースID | 観点                      | 手順                                                           | 期待結果                                   |
| -------- | ------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| NV-11-01 | describe.skip除去確認     | grep で `describe.skip` が0件であることを確認                  | 0件。スキップされたテストが存在しない      |
| NV-11-02 | 廃止済み API 参照除去確認 | grep で `planSkill` / `detectMode` が0件であることを確認       | 0件。廃止済み API のモック宣言が残存しない |
| NV-11-03 | テスト全件PASS確認        | `pnpm test -- --testPathPattern="llm-generation" --run` を実行 | 全テストケースがPASS（0 failed）           |
| NV-11-04 | 不要import除去確認        | TypeScript型チェックでunused importエラーが0件であることを確認 | TypeScriptエラー0件                        |
| NV-11-05 | Lint違反除去確認          | ESLint実行でエラー・警告が0件であることを確認                  | ESLintエラー0件・警告0件                   |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-11/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

### 具体的なコマンド手順

```bash
# NV-11-01: describe.skip の最終確認
grep -c "describe.skip\|it.skip\|test.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# 期待値: 0

# NV-11-02: 廃止済み API 参照の最終確認
grep -c "planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# 期待値: 0

# NV-11-03: テスト全件実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillLifecyclePanel.llm-generation" --run --reporter=verbose

# NV-11-04: TypeScript型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error TS|llm-generation"
# 期待値: 出力なし（エラー0件）

# NV-11-05: ESLint
pnpm --filter @repo/desktop lint \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# 期待値: エラー0件・警告0件
```

## 多角的チェック観点

| 観点     | 確認内容                                       |
| -------- | ---------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する             |
| 漏れ     | 要件から成果物への未反映項目がないか確認する   |
| 整合性   | テスト実行結果が期待値と一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する  |

## 統合テスト連携

| 判定項目                                | 基準                    | 結果    |
| --------------------------------------- | ----------------------- | ------- |
| `pnpm --filter @repo/desktop test:run`  | PASS                    | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS                    | pending |
| `pnpm --filter @repo/desktop lint`      | PASS                    | pending |
| NON_VISUAL 証跡                         | 補助成果物4件で根拠固定 | pending |

## 成果物

| 成果物                   | パス                                        | 説明                                      |
| ------------------------ | ------------------------------------------- | ----------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 非視覚シナリオと期待値の固定              |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 非視覚シナリオの実行結果（PASS/FAIL記録） |
| 検出課題一覧             | `outputs/phase-11/discovered-issues.md`     | 手動確認中に見つかった問題の有無          |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`     | NON_VISUAL のため取得不要である根拠       |

> **注意**: `outputs/phase-11/screenshots/` は validator 互換のため保持するが、NON_VISUAL タスクのため画像ファイルは生成しない。

`manual-test-result.md` を正本とし、他3ファイルは validator 互換と根拠固定のための補助成果物として扱う。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] NV-11-01〜NV-11-05 の全ケースが PASS であることを確認
- [ ] スクリーンショット取得が N/A である理由を証跡インデックスに明記
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 12: ドキュメント更新
