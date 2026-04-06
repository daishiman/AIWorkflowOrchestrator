# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| Phase名    | 設計レビューゲート                         |
| 前提Phase  | Phase 2                                    |
| 後続Phase  | Phase 4                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

変更が既存テスト・型安全性を損なわないか確認し、Phase 4 へ進めるか判定する。

---

## 実行タスク

### タスク1: 既存テストへの影響分析

**目的**: Phase 2 の設計が既存 90 件 governance tests を破壊しないことを確認する

**実行手順**:

1. Phase 2 の `design.md` を参照し、変更箇所を確認する
2. 既存テスト（`__tests__/governance/`）が `createExecuteGovernanceCanUseTool()` を直接テストしているか確認する
3. シグネチャ変更（`skillRoot: string` 追加）が呼び出し元に与える影響を確認する
4. 影響がある場合、修正方針を記録する

**期待される成果物**:

- 既存テスト影響分析

### タスク2: 型安全性レビュー

**目的**: 設計が TypeScript 型安全性を維持しているか確認する

**レビュー観点**:

1. `CanUseToolContext` 型との整合性（`targetPath?: string`, `allowedSkillRoot?: string`）
2. `input: Record<string, unknown>` からの型安全な抽出（`as string | undefined`）
3. `skillRoot` が `undefined` の場合のフォールバック設計の安全性
4. `evaluateGovernanceToolUse` の第3引数型と設計の一致
5. AC-6: `improve` phase でも `skillRoot` 外の Edit が `deny` される設計か

**期待される成果物**:

- 型安全性レビュー結果

### タスク3: セキュリティ要件充足確認

**目的**: 設計がセキュリティ要件を満たしているか確認する

**確認事項**:

1. AC-1: skill root 外へのWrite/Editが`deny`される設計か
2. AC-2: skill root 内へのWrite/Editが`allow`される設計か
3. AC-3: `targetPath` がない場合の後方互換が保たれているか
4. False deny（`skillRoot` 未設定時）が発生しない設計か
5. AC-6: `improve` phase でも path-scoped deny が有効になる設計か

**期待される成果物**:

- セキュリティ要件充足確認結果

---

## レビュー結果判定

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ進む |
| MAJOR    | 重大な問題あり           | Phase 2（設計）へ戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類         | 戻り先              |
| ------------------ | ------------------- |
| 要件の問題         | Phase 1（要件定義） |
| 設計の問題         | Phase 2（設計）     |
| 型安全性の問題     | Phase 2（設計）     |
| セキュリティの問題 | Phase 2（設計）     |

---

## 参照資料

| 参照資料               | パス                                                                                | 内容           |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物         | `outputs/phase-1/gap-analysis.md`                                                   | 現状調査・要件 |
| Phase 2 成果物         | `outputs/phase-2/design.md`                                                         | 設計方針       |
| 既存 governance テスト | `apps/desktop/src/main/services/runtime/__tests__/governance/`                      | 90件テスト     |
| CanUseToolContext      | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` | 型定義         |

---

## 成果物

| 成果物                  | パス                                      | 内容         |
| ----------------------- | ----------------------------------------- | ------------ |
| design-review-result.md | `outputs/phase-3/design-review-result.md` | レビュー結果 |

---

## 統合テスト連携

統合テスト観点（既存90件テストとの整合、type-safety）のレビューゲートを実施する。

---

## 完了条件

- [ ] 既存 90 件テストへの影響分析が完了している
- [ ] 型安全性レビューが完了している（`CanUseToolContext` 整合確認）
- [ ] セキュリティ要件の充足確認が完了している
- [ ] レビュー結果が PASS または MINOR（対応済み）である
- [ ] `outputs/phase-3/design-review-result.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4（テスト作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-4-test-creation.md`
