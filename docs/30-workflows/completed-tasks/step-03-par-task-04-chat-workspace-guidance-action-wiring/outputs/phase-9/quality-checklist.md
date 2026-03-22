# Phase 9: 品質チェックリスト

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 9                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 全設計成果物の整合性

### 用語統一

- [x] blocked reason: 全 Phase で `BlockedReason` union type を使用
- [x] guidance: GuidanceConfig 型で統一
- [x] action: GuidanceActionType で統一
- [x] CTA: primary / secondary の2段構成で統一

### パス参照整合性

- [x] outputs/phase-1/ に 3 ファイル配置
- [x] outputs/phase-2/ に 3 ファイル配置
- [x] outputs/phase-3/ に 2 ファイル配置
- [x] outputs/phase-4/ に 2 ファイル配置
- [x] outputs/phase-5/ に 2 ファイル配置
- [x] outputs/phase-6/ に 2 ファイル配置
- [x] outputs/phase-7/ に 2 ファイル配置
- [x] outputs/phase-8/ に 2 ファイル配置
- [x] outputs/phase-9/ に 2 ファイル配置

### AC 充足確認

| AC   | 設計成果物での充足                                  | 検証方法の定義 |
| ---- | --------------------------------------------------- | -------------- |
| AC-1 | BLOCKED_GUIDANCE_MAP (Phase 2)                      | CT-01, RG-05   |
| AC-2 | contract-matrix.md 禁止事項 D-01 (Phase 2)          | CT-05, CT-06   |
| AC-3 | contract-matrix.md State/Action Ownership (Phase 2) | IS-03          |
| AC-4 | validation-matrix.md RG-03, 禁止事項 D-04 (Phase 2) | RG-03          |
| AC-5 | requirements-definition.md FR-5 (Phase 1)           | MT-02          |

## 2. 設計品質検証

- [x] 曖昧表現（「適切に」「必要に応じて」）が排除されている
- [x] 各 Phase の完了条件がチェックリスト形式で検証可能
- [x] 依存関係が循環していない（Phase 1 → 2 → 3 → 4 ... → 13 の直線）
- [x] 禁止事項が D-01〜D-07 で明文化されている

## 3. implementation_ready 判定条件

| 条件                               | 充足 |
| ---------------------------------- | ---- |
| Phase 1-3 設計ゲート PASS          | Yes  |
| テストマトリクス定義済み (Phase 4) | Yes  |
| 実装計画定義済み (Phase 5)         | Yes  |
| カバレッジ目標定義済み (Phase 7)   | Yes  |
| リファクタ境界定義済み (Phase 8)   | Yes  |
| 品質チェックリスト完了 (Phase 9)   | Yes  |

**判定: implementation_ready**
