# Phase 11: 発見事項 - Runtime Policy Centralization

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| タスク ID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| Phase     | 11（手動テスト）                           |
| 作成日    | 2026-03-21                                 |
| 検出件数  | 2件（重大な問題なし）                      |
| 総合判定  | PASS（設計成果物の一貫性確認済み）         |

## 発見事項一覧

### D-1: sanitizeForRenderer() の配置ファイル未確定（低優先度）

| 項目     | 値                              |
| -------- | ------------------------------- |
| ID       | D-1                             |
| 優先度   | 低                              |
| カテゴリ | 設計詳細の未確定                |
| 影響範囲 | Phase 5 実装時の配置判断        |
| 対応方針 | Phase 12 未タスク候補として記録 |

**内容**: `sanitizeForRenderer()` の配置ファイルが Phase 5 implementation-plan.md では「IPC ハンドラー内」と記載されているが、共通ユーティリティとして独立ファイルに配置する案も検討すべきである。

**理由**: 複数の IPC ハンドラーが同一の sanitize ロジックを必要とする場合、各ハンドラー内にインライン実装すると DRY 原則に違反する。`apps/desktop/src/main/utils/sanitize.ts` のような共通ユーティリティとして抽出する方が保守性が高い。

**推奨対応**: 後続実装タスク（Task03-05）の着手時に、sanitize 対象フィールドの共通性を評価し、配置先を確定する。

---

### D-2: AI_CHECK_CONNECTION の廃止トリガー事前確認（情報）

| 項目     | 値                            |
| -------- | ----------------------------- |
| ID       | D-2                           |
| 優先度   | 情報                          |
| カテゴリ | 実装前確認事項                |
| 影響範囲 | Task03 着手時の作業量見積もり |
| 対応方針 | Task03 着手時に確認           |

**内容**: `AI_CHECK_CONNECTION` の廃止トリガー（grep 0件）は現時点でも成立する可能性がある（既に呼び出し元がない場合）。実装タスク着手前に以下のコマンドで確認する価値がある。

```bash
grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/
```

**理由**: 既に呼び出し元が存在しない場合、廃止作業のスコープが縮小し、Task03 の工数見積もりに影響する。事前確認により、不要な移行コードの作成を回避できる。

**推奨対応**: Task03 着手時に上記コマンドを実行し、結果に応じて作業計画を調整する。

---

## 総合評価

Phase 1-10 の設計成果物を walkthrough した結果、重大な設計問題は発見されなかった。以下の点で一貫性が確認された:

- **型定義の整合性**: `RuntimeResolution` / `HandoffGuidance` / `HealthCheckResult` の型定義が Phase 2 設計書と Phase 4 テストケースで一致
- **責務境界の明確性**: Main Process / Renderer の責務分離が全シナリオで維持されている
- **禁止パターンの網羅性**: validation-matrix.md の全禁止パターンに対応する grep コマンドが manual-test-plan.md に定義済み
- **IPC レスポンス形式の統一**: `sanitizeForRenderer()` による内部型漏洩防止が設計に組み込まれている
