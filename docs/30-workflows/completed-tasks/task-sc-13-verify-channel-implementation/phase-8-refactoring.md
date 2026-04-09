# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 8                                        |
| Phase名    | リファクタリング                         |
| 前提Phase  | Phase 7                                  |
| 後続Phase  | Phase 9                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

Phase 5-6 の実装を維持しながら、重複・navigation drift・コード品質の問題を取り除く。
変更内容は `対象/Before/After/理由` テーブル形式で記録する（Feedback RT-03）。

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。変更内容は `outputs/phase-8/refactoring-result.md` の Before/After テーブルに記録する。

### タスク1: コード重複の確認と除去

**目的**: verify 実装で発生した重複コードを特定・除去する

**確認観点**:

- `sanitizeErrorMessage` の呼び出しパターンが既存ハンドラと一致しているか
- `validateSender` の呼び出し位置が既存パターンと一致しているか
- 型定義で重複が発生していないか（`VerifyResult` と既存型の関係）

**実行手順**:

1. 実装した5ファイルを読み、重複や不整合を特定する
2. 修正が必要な箇所を Before/After テーブルにまとめる
3. 修正を実施し、テストが引き続き PASS であることを確認する

---

### タスク2: 命名・スタイルの整合確認

**目的**: 既存コードとの命名・スタイル整合性を確認する

**確認項目**:

- `verifySkill` のメソッド名が Preload API の既存命名（`planSkill`/`executeSkill` 等）と整合するか
- `SKILL_CREATOR_VERIFY` の定数名が既存定数と命名規則上整合するか
- JSDoc コメントの有無・スタイルが既存コードと一致するか（追加コメントは変更箇所のみ）

---

### タスク3: リファクタリング後の検証

**目的**: リファクタリング後もテストが PASS であることを確認する

```bash
# リファクタリング後のテスト全件実行
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

---

## リファクタリング記録フォーマット（Before/After テーブル）

`outputs/phase-8/refactoring-result.md` に以下の形式で記録する：

| 対象ファイル     | Before           | After            | 理由             |
| ---------------- | ---------------- | ---------------- | ---------------- |
| （実行時に記入） | （実行時に記入） | （実行時に記入） | （実行時に記入） |

---

## 参照資料

| 参照資料       | パス                                                                                   | 内容                       |
| -------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| 依存Phase      | Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7                                        | 本Phase の前提             |
| 実装フェーズ   | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-5-implementation.md` | リファクタ対象の本体       |
| テスト拡充     | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-6-test-expansion.md` | 境界値 / 回帰 guard の前提 |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md`                                                   | 重点見直し箇所の根拠       |
| Green 確認     | `outputs/phase-5/green-confirmation.md`                                                | リファクタ前の PASS 基準   |

## 成果物

| 成果物               | パス                                    | 内容                      |
| -------------------- | --------------------------------------- | ------------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | Before/After/理由テーブル |

---

## 統合テスト連携

- リファクタ後の統合テスト継続成功を確認（Plan/Execute/Verify の相互非影響）

---

## 完了条件

- [ ] 重複コードの確認を実施し、問題があれば修正済みであること
- [ ] 命名・スタイルの整合確認が完了していること
- [ ] リファクタリング内容が `outputs/phase-8/refactoring-result.md` に Before/After テーブルで記録されていること
- [ ] リファクタリング後、全テスト PASS が維持されていること
- [ ] TypeScript 型チェック PASS であること
- [ ] Lint エラーなしであること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## 次Phase

**Phase 9: 品質保証** — typecheck・lint・全テストを一括実行し、品質ゲートを通過させる。
