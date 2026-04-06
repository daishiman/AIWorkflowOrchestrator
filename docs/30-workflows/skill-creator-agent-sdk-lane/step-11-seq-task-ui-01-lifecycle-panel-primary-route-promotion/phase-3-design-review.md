# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| Phase名    | 設計レビュー                            |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 2: 設計                           |
| 次Phase    | Phase 4: テスト作成                     |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

Phase 2 の設計文書をレビューし、後方互換性の確保、ナビゲーション契約との整合性、エッジケースの網羅性を検証する。GATE 判定（PASS / MINOR / MAJOR / CRITICAL）を行い、Phase 4 への進行可否を決定する。

## 実行タスク

### Task 1: 後方互換性レビュー

- SkillCreateWizard への既存導線が維持されることを確認
- SkillManagementPanel → LifecyclePanel 導線が維持されることを確認
- 既存の ViewType 定義への影響がないことを確認
- 既存テストへの影響範囲を特定

### Task 2: ナビゲーション契約との整合性レビュー

- `ui-ux-navigation.md` に定義されたナビゲーション契約との整合性を確認
- メインナビゲーション構造の変更が契約に準拠することを確認
- モバイル/デスクトップ両方のナビゲーションパターンが契約に準拠することを確認

### Task 3: エッジケース分析

- 直接URL アクセス時の挙動
- ブラウザ戻る/進む操作時の挙動
- LifecyclePanel が作成中状態でのナビゲーション離脱
- 両導線同時利用時の状態競合
- ViewType の未定義値が渡された場合の fallback

### Task 4: 設計品質チェック

- 単一責務原則の遵守確認
- 変更箇所の最小化確認
- テスト容易性の確認
- 将来の拡張性（TASK-UI-02/03 への影響）確認

### Task 5: GATE 判定

- PASS: 問題なし、Phase 4 へ進行
- MINOR: 軽微な修正で Phase 4 へ進行可能
- MAJOR: Phase 2 へ差し戻し、設計修正が必要
- CRITICAL: Phase 2 へ差し戻し、根本的な再設計が必要

## 参照資料

| 資料名             | パス                                                                    | 説明                     |
| ------------------ | ----------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計文書   | `outputs/phase-2/design-document.md`                                    | レビュー対象の設計文書   |
| ナビゲーション契約 | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | UI/UX ナビゲーション仕様 |
| Phase 1 要件       | `outputs/phase-1/requirements-checklist.md`                             | 要件チェックリスト       |

## 成果物

| 成果物           | パス                                    | 説明                              |
| ---------------- | --------------------------------------- | --------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-gate.md` | レビュー結果、指摘事項、GATE 判定 |

## 完了条件

- [ ] 後方互換性レビューが完了している
- [ ] ナビゲーション契約との整合性レビューが完了している
- [ ] エッジケース分析が完了している
- [ ] 設計品質チェックが完了している
- [ ] GATE 判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)（GATE: PASS/MINOR の場合）
→ [Phase 2: 設計](./phase-2-design.md)（GATE: MAJOR/CRITICAL の場合）
