# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 9                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

TypeScript 型チェック・ESLint・全テスト実行により、コードの品質を保証する。

## 実行タスク

1. TypeScript 型チェック実行
2. ESLint 実行（React hooks deps 確認含む）
3. `desktop` パッケージの全テスト実行
4. 問題があれば修正する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 5 の修正結果を前提に、typecheck・lint・vitest を実行する。

## 実行手順

### ステップ 1: TypeScript 型チェック

```bash
# TypeScript 型チェックを実行する
pnpm --filter @repo/desktop typecheck
```

**確認ポイント**:

- `snapshot.currentPhase !== 'handoff'` の比較で型エラーが発生していないこと
- `snapshot.currentPhase` の型が `SkillCreatorWorkflowPhase` または `string` であれば問題なし
- 型エラーが発生する場合は、`snapshot.currentPhase` の型定義を確認し、適切なキャストまたは型ガードを追加する

### ステップ 2: ESLint 実行

```bash
# ESLint を実行する
pnpm --filter @repo/desktop lint
```

**確認ポイント**:

- `react-hooks/exhaustive-deps` ルール: `useEffect` の依存配列が変更なし（`[setHandoffGuidance, setWorkflowError, setWorkflowSnapshot]`）であることを確認
- `@typescript-eslint/no-unused-vars` を含む一般的なルールに違反がないこと

期待される ESLint 結果:

- `react-hooks/exhaustive-deps` 警告なし（依存配列に変更がないため）

### ステップ 3: 全テスト実行

```bash
# desktop パッケージの全テストを実行する
pnpm --filter @repo/desktop exec vitest run
```

**確認ポイント**:

- Phase 4/6 で追加したテスト（TC-EP-01 〜 TC-EP-10）が全て PASS
- 既存テストが全て PASS（AC-4 の確認）
- テスト失敗がある場合は、修正内容または既存テストに問題があるかを調査する

### ステップ 4: 問題発生時の対処フロー

| 問題                      | 対処方法                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| 型エラー                  | `snapshot.currentPhase` の型定義を確認し、型アサーションまたは型ガードを追加 |
| ESLint 警告（hooks deps） | `useEffect` の依存配列を確認し、不足している依存を追加（機能変更なしで対処） |
| テスト失敗（既存）        | 修正内容が既存動作に影響していないか確認し、必要な箇所のみ修正を調整         |
| テスト失敗（新規）        | テストコードのモック設定に問題がないか確認し、テストを修正                   |

## 多角的チェック観点

- TypeScript 型チェックで `snapshot.currentPhase` の型が `'handoff'` との比較に対応しているか確認したか
- ESLint の `react-hooks/exhaustive-deps` で依存配列の警告が発生していないか確認したか（`snapshot.currentPhase` をコールバック内で参照しても deps に追加不要な理由を確認したか）
- 全テスト実行で AC-4（既存テスト全 PASS）が達成されているか確認したか

## 成果物

| 成果物           | パス                           | 説明                                         |
| ---------------- | ------------------------------ | -------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/qa-report.md` | 型チェック・ESLint・テスト実行結果のサマリー |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している（警告含めて確認）
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全 PASS している
- [ ] `react-hooks/exhaustive-deps` の警告が発生していない
- [ ] TC-EP-01 〜 TC-EP-10 が全て PASS している

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-9/qa-report.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 10: 最終レビュー へ進む
