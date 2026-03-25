# Phase 10: 最終レビュー

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 10 - 最終レビュー                      |
| Phase名    | 最終レビュー                           |
| 機能名     | health-policy-unification              |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 前提Phase  | Phase 9                                |
| 後続Phase  | Phase 11                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-24                             |

## 目的

多角的な品質・整合性検証を行い、受入基準（AC-1〜AC-7）の充足、DIP 準拠、P62 防止、後方互換性を確認する。PASS / MINOR / MAJOR / CRITICAL の判定を行う。

## 背景

Phase 1 の受入基準（AC-1〜AC-7）に対する充足確認と、Phase 2 設計書（D-1〜D-6）との最終整合性チェックを行う。P61（DIP 違反）・P62（暗黙 fallback）等の既知の落とし穴が混入していないかを最終確認する。

## 前提成果物

| Phase | 成果物                                                         |
| ----- | -------------------------------------------------------------- |
| 9     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |

## 参照資料

| 資料名                 | パス / 参照先                                                    |
| ---------------------- | ---------------------------------------------------------------- |
| Phase 1 受入基準       | `./phase-1-requirements.md`                                      |
| Phase 2 設計書         | `./phase-2-design.md`                                            |
| タスク実行ワークフロー | task-specification-creator skill 実行ガイド                      |
| DIP 原則               | `CLAUDE.md` + プロジェクトアーキテクチャガイドライン（設計原則） |
| P61 DIP 違反検出       | `.claude/rules-disabled/06-known-pitfalls.md#P61`                |
| P62 暗黙 fallback      | `.claude/rules-disabled/06-known-pitfalls.md#P62`                |

## 実行タスク

### Task 1: 受入基準（AC）充足確認

| AC   | 基準                                                                                     | 判定     | 根拠 |
| ---- | ---------------------------------------------------------------------------------------- | -------- | ---- |
| AC-1 | HealthPolicy インターフェースが `packages/shared` に定義されている                       | [ ] PASS | -    |
| AC-2 | HealthStatus 型が `"healthy" \| "degraded" \| "unhealthy" \| "unknown"` である           | [ ] PASS | -    |
| AC-3 | `resolveHealthPolicy()` 純粋関数が全 6 導出ルールを正しく実装している                    | [ ] PASS | -    |
| AC-4 | `ExecutionCapabilityInput.apiKeyDegraded` に `@deprecated` マークが付与されている        | [ ] PASS | -    |
| AC-5 | RuntimePolicyResolver が HealthPolicy を optional DI で受け取り、degraded 分岐を処理する | [ ] PASS | -    |
| AC-6 | mainlineAccess.ts が HealthPolicy を optional で消費し、fallback で既存動作を維持する    | [ ] PASS | -    |
| AC-7 | 全テストが PASS かつカバレッジ基準を満たしている                                         | [ ] PASS | -    |

### Task 2: DIP 準拠確認

#### 2-1. インターフェース依存の確認

```bash
# RuntimePolicyResolver が具象クラスではなくインターフェースに依存していること
grep -n "import.*HealthPolicy" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts
grep -n "import.*DefaultSafetyGate\|import.*ConcreteHealth" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts
```

#### 確認事項

- [ ] RuntimePolicyResolver が `HealthPolicy` インターフェース（型）のみに依存している
- [ ] 具象クラスへの直接依存がない（P61 準拠）
- [ ] mainlineAccess.ts が `HealthPolicy` インターフェース（型）のみに依存している

### Task 3: P62 暗黙 fallback 防止確認

#### 3-1. resolveHealthPolicy() の分岐漏れ確認

```bash
# HealthStatus の全ケースが Record で網羅されていること
grep -n "Record<HealthStatus" packages/shared/src/types/health-policy.ts
```

#### 3-2. RuntimePolicyResolver の fallback 確認

- [ ] HealthPolicy 未指定時に暗黙のデフォルト値を生成していない
- [ ] HealthPolicy 未指定時は明示的に既存のコードパスを通る
- [ ] `DEFAULT_CONFIG` / `defaultHealthPolicy` のような暗黙 fallback がない

### Task 4: 後方互換性確認

#### 4-1. 既存 API の非破壊確認

- [ ] `ExecutionCapabilityInput` の既存フィールドが変更されていない
- [ ] `RuntimePolicyResolver` の既存コンストラクタ引数が変更されていない（optional 追加のみ）
- [ ] `mainlineAccess.ts` の既存関数シグネチャが変更されていない（optional 追加のみ）
- [ ] `packages/shared/src/types/index.ts` の既存エクスポートが削除されていない

#### 4-2. @deprecated 警告の適切性

- [ ] `@deprecated` コメントに移行先が明記されている
- [ ] `@deprecated` コメントに削除予定バージョンが明記されている

### Task 5: コード品質レビュー

#### 5-1. 型安全性

- [ ] `any` 型が使用されていない
- [ ] `as` キャスト（型アサーション）が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] non-null assertion（`!`）が使用されていない（P48/P52 準拠）

#### 5-2. エラーハンドリング

- [ ] エラーカテゴリが適切に分類されている
- [ ] エラーメッセージにパスワード・APIキー・PII が含まれていない

#### 5-3. 命名規約

- [ ] boolean 変数に `is` / `has` / `can` / `should` プレフィックスが使用されている
- [ ] 引数名がセマンティクスと一致している（P45 準拠）

### Task 6: レビュー判定

#### 判定基準

| 判定     | 条件                                   | 対応                                           |
| -------- | -------------------------------------- | ---------------------------------------------- |
| PASS     | AC-1〜AC-7 全て充足、品質問題なし      | Phase 11 へ                                    |
| MINOR    | 軽微な改善点あり（機能に影響なし）     | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 設計・実装に問題あり                   | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | 要件の根本的な問題、セキュリティ脆弱性 | Phase 1 へ戻り要件再確認                       |

#### レビュー結果

```
## 最終レビュー結果

### 判定: [PASS / MINOR / MAJOR / CRITICAL]

### 指摘事項
1. [指摘内容]（重要度: [MINOR/MAJOR/CRITICAL]）
   - 対応: [対応方針]

### MINOR 指摘の未タスク化（MINOR 判定の場合）
- [ ] 指摘 1 → 未タスク仕様書: [ファイルパス]
- [ ] 指摘 2 → 未タスク仕様書: [ファイルパス]
```

## 成果物

| 成果物           | パス                                |
| ---------------- | ----------------------------------- |
| レビューレポート | `outputs/phase-10/review-report.md` |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## Phase末端アクション【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] AC-1〜AC-7 の充足確認が完了している
- [ ] DIP 準拠確認が完了している（P61 準拠）
- [ ] P62 暗黙 fallback 防止確認が完了している
- [ ] 後方互換性確認が完了している
- [ ] コード品質レビューが完了している
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている（省略不可）

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む

## 次 Phase

### PASS / MINOR 判定の場合

[Phase 11: 手動テスト](./phase-11-manual-testing.md)

### MAJOR 判定の場合

影響範囲に応じて以下のいずれかに戻る:

- [Phase 1: 要件定義](./phase-1-requirements.md)（要件問題）
- [Phase 2: 設計](./phase-2-design.md)（設計問題）
- [Phase 5: 実装](./phase-5-implementation.md)（実装問題）

### CRITICAL 判定の場合

[Phase 1: 要件定義](./phase-1-requirements.md)
