# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 4                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 3（PASS または MINOR）                               |
| 後続Phase  | Phase 5                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

テキストエリア削除・ウィザードボタン追加を前提とした TDD テストを作成する（Red フェーズ）。  
6 本の既存テストファイルを更新し、新しい UI 仕様を検証するテストケースを作成する。

---

## 事前確認: 既存ユーティリティ重複検出【必須】

```bash
# テスト対象コンポーネントの現状確認
grep -rn "skill-lifecycle-request-input\|skill-lifecycle-execution-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# ウィザードボタンの参照確認
grep -rn "skill-lifecycle-open-wizard-button" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 既存テスト実行（baseline 確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx
```

---

## private method テスト方針【必須】

本タスクはコンポーネントの UI 変更のみのため、**public コンポーネント API（レンダリング結果）経由**でテストする。  
内部 state を直接テストしない。

---

## 実行タスク

- **テスト更新（Red フェーズ）**: 削除対象 data-testid の参照を除去し、ウィザードボタステストを追加
- **Red 確認**: 実装前に新規テストが失敗（Red）することを確認
- **既存テスト確認**: 更新前の既存テストが baseline として全 PASS であることを確認

---

## 参照資料

| 資料名         | パス                                      | 用途                   |
| -------------- | ----------------------------------------- | ---------------------- |
| 設計書         | `outputs/phase-2/design-document.md`      | テストケース設計の根拠 |
| テスト更新方針 | `outputs/phase-2/test-update-strategy.md` | 更新方針               |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`  | テスト網羅の基準       |
| ゲート判定     | `outputs/phase-3/gate-decision.md`        | MINOR 指摘事項の確認   |

---

## テストマトリクス

| TC 番号 | ファイル内テスト名                                            | 対象要素 / 関数                      | 結果（Red/Green） |
| ------- | ------------------------------------------------------------- | ------------------------------------ | ----------------- |
| TC-01   | `renders wizard transition button`                            | `skill-lifecycle-open-wizard-button` | Red（実装前）     |
| TC-02   | `calls onOpenWizard when button is clicked`                   | `onOpenWizard` callback              | Red（実装前）     |
| TC-03   | `does not render skill-lifecycle-request-input`               | textarea 削除確認                    | Red（実装前）     |
| TC-04   | `does not render skill-lifecycle-execution-input`             | textarea 削除確認                    | Red（実装前）     |
| TC-05   | `existing adapter-status tests pass without textarea refs`    | adapter-status テスト                | Red（影響確認後） |
| TC-06   | `existing approval tests pass without textarea refs`          | approval テスト                      | Red（影響確認後） |
| TC-07   | `existing auth-regression tests pass without textarea refs`   | auth-regression テスト               | Red（影響確認後） |
| TC-08   | `existing error-persistence tests pass without textarea refs` | error-persistence テスト             | Red（影響確認後） |
| TC-09   | `existing llm-generation tests pass without textarea refs`    | llm-generation テスト                | Red（影響確認後） |

---

## 実行手順

### ステップ 1: baseline 確認

```bash
# 既存テスト全量を baseline として実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/
```

### ステップ 2: テストファイル更新

各テストファイルを以下の方針で更新する:

1. `getByTestId('skill-lifecycle-request-input')` の参照を削除
2. `getByTestId('skill-lifecycle-execution-input')` の参照を削除
3. `getByTestId('skill-lifecycle-open-wizard-button')` のテストケースを追加

### ステップ 3: Red 確認

```bash
# 更新後のテストを実行して Red を確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx
```

---

## 統合テスト連携

- 6 本のテストファイルの更新影響範囲を全量確認する
- `data-testid="skill-lifecycle-open-wizard-button"` のテストケースを作成する
- baseline（既存テスト全 PASS）を確認してからテスト更新を開始する

---

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧   |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 更新後の失敗確認   |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テストシナリオ |

---

## 完了条件

- [ ] baseline（既存テスト全 PASS）を確認した
- [ ] 6 本のテストファイルの更新が完了した
- [ ] `skill-lifecycle-open-wizard-button` のテストケースを追加した
- [ ] 新規テストが Red（失敗）であることを確認した
- [ ] テストマトリクスが作成された
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] Red テスト結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 4
```

---

## 次のPhase

Phase 5: 実装
