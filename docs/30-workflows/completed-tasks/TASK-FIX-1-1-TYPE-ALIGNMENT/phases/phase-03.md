# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 3                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

実装開始前に型統合設計の妥当性を検証する。

## 判定基準

| 判定  | 条件             | 対応                         |
| ----- | ---------------- | ---------------------------- |
| PASS  | 全観点で問題なし | Phase 4へ進行                |
| MINOR | 軽微な指摘あり   | 指摘対応後Phase 4へ進行      |
| MAJOR | 重大な問題あり   | 影響範囲に応じて戻り先を決定 |

## レビュー観点

### 1. 型定義の妥当性

| チェック項目                              | 判定 |
| ----------------------------------------- | ---- |
| 仕様書（specification.md §5.1）との整合性 | ☐    |
| Discriminated Union の型ガード設計        | ☐    |
| 後方互換性の担保（ランタイムエラー防止）  | ☐    |
| TypeScript strict mode 対応               | ☐    |

### 2. 移行計画の妥当性

| チェック項目                   | 判定 |
| ------------------------------ | ---- |
| 影響ファイルが網羅されている   | ☐    |
| 移行順序が適切（依存関係考慮） | ☐    |
| ロールバック可能な設計         | ☐    |

### 3. テスト計画の妥当性

| チェック項目                         | 判定 |
| ------------------------------------ | ---- |
| 既存テストへの影響が明確             | ☐    |
| 型安全性テストの方針が定義されている | ☐    |

## 参照資料

| 資料名                | パス                                                                                        | 説明                   |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 型統合設計書          | `outputs/phase-2/type-integration-design.md`                                                | Phase 2成果物          |
| interfaces-agent-sdk  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル型定義仕様       |
| api-ipc-agent         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャンネル定義      |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | skillSlice状態管理     |
| quality-requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト戦略・カバレッジ |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン           |

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                        |
| ------------------ | ------------------------------- |
| IPC型整合性        | Main-Renderer間の型定義の一貫性 |
| Store型整合性      | Zustand storeでの型使用の妥当性 |
| SDK型互換性        | Claude Agent SDKとの型互換性    |
| エラーハンドリング | ErrorMessageContent型の統一     |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト観点のレビューが完了している
- [ ] MINOR指摘がある場合は対応方針が決定している
- [ ] **本Phase内のレビュー作業を100%実行完了**

## 次のPhase

Phase 4: テスト作成（TDD: Red）
