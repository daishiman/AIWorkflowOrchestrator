# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 内容                                                  |
| --------- | ----------------------------------------------------- |
| Phase     | 3                                                     |
| Phase名   | 設計レビューゲート                                    |
| カテゴリ  | ゲート                                                |
| 機能名    | task-imp-permission-tool-metadata-001                 |
| Issue     | #606                                                  |
| 前提Phase | Phase 2（設計）                                       |
| 次Phase   | Phase 4（テスト作成）                                 |
| 関連仕様  | security-skill-execution.md, ui-ux-agent-execution.md |

---

## 目的

Phase 2で作成した設計（toolMetadata.tsモジュール設計、RiskBadgeコンポーネント設計、PermissionDialog統合設計）の妥当性を多角的にレビューし、実装開始の可否を判定する。

---

## 実行タスク

### Task 1: 要件との整合性レビュー

**目的**: Phase 1で定義した機能要件・非機能要件が設計で満たされているかを検証する。

**手順**:

1. FR-1〜FR-6の各機能要件に対して設計がカバーしているか確認する：
   - FR-1: 12ツール全てにリスクレベルが定義されているか
   - FR-2: RiskBadgeのPermissionDialog内配置が確定しているか
   - FR-3: 色分けのTailwind CSSクラスマッピングが完成しているか
   - FR-4: セキュリティ影響テキストの表示位置が確定しているか
   - FR-5: デフォルトリスクレベル（Medium）のフォールバックが設計されているか
   - FR-6: Progressive Disclosureパターンが適用されているか

2. NFR-1〜NFR-6の各非機能要件に対して設計が対応しているか確認する：
   - NFR-1: テスタビリティが確保された設計か
   - NFR-2: WCAG 2.1 AAコントラスト比の検証が計画されているか
   - NFR-3: TypeScript strictモード対応の型定義か
   - NFR-4: aria-label等のスクリーンリーダー対応が設計されているか
   - NFR-5: パフォーマンスへの影響が最小限か（静的データ参照のみ）
   - NFR-6: 色+テキストの多重表現が設計されているか

**期待される成果物**: 要件整合性チェック結果

### Task 2: セキュリティレビュー

**目的**: リスクレベルデータの整合性とセキュリティ上の懸念がないかを検証する。

**手順**:

1. security-skill-execution.mdのALLOWED_TOOLS_WHITELISTとtoolMetadata.tsのリスクレベルが一致しているか確認する
2. セキュリティ影響テキストがユーザーを誤解させる表現を含んでいないか確認する
3. XSS等のセキュリティリスクがないか確認する（静的テキスト表示のため低リスク）
4. リスクレベルの表示が操作の危険度を正確に反映しているか確認する

**期待される成果物**: セキュリティレビュー結果

### Task 3: UI/UXレビュー

**目的**: Apple HIG準拠、WCAG準拠、デザイン原則準拠を検証する。

**手順**:

1. Progressive Disclosureの適用が適切か確認する：
   - Level 1（常時表示）: リスクバッジ + セキュリティ影響テキスト
   - Level 2（展開表示）: 技術的引数詳細（既存機能）
2. Gestalt原則（近接の法則）に従い、リスクバッジがツールバッジと視覚的にグループ化されるか確認する
3. Miller's Lawに従い、情報過多になっていないか確認する
4. 色覚多様性対応が十分か確認する
5. キーボードナビゲーションへの影響がないか確認する

**期待される成果物**: UI/UXレビュー結果

### Task 4: アーキテクチャレビュー

**目的**: 既存アーキテクチャとの整合性と拡張性を検証する。

**手順**:

1. toolMetadata.tsとpermissionDescriptions.tsの責務分離が明確か確認する：
   - permissionDescriptions.ts: ツール操作の人間可読説明（何をするか）
   - toolMetadata.ts: ツールのリスクメタデータ（どの程度危険か）
2. モジュール間の依存方向が正しいか確認する：
   - PermissionDialog.tsx → permissionDescriptions.ts（既存）
   - PermissionDialog.tsx → toolMetadata.ts（新規追加）
   - toolMetadata.ts ← permissionDescriptions.ts 間に依存なし（独立）
3. 将来のリスクレベル動的変更や設定画面への拡張が容易な設計か確認する

**期待される成果物**: アーキテクチャレビュー結果

---

## 判定基準

| 判定     | 条件                                       | 対応                         |
| -------- | ------------------------------------------ | ---------------------------- |
| PASS     | 全レビュー観点で問題なし                   | Phase 4（テスト作成）へ進行  |
| MINOR    | 軽微な指摘あり（例: テキスト修正、色調整） | 指摘対応後Phase 4へ進行      |
| MAJOR    | 重大な問題あり（例: 要件漏れ、設計欠陥）   | 影響範囲に応じて戻り先を決定 |
| CRITICAL | 致命的な問題あり（例: セキュリティ脆弱性） | Phase 1へ戻り要件再確認      |

### 戻り先決定基準

| 問題の種類               | 戻り先              |
| ------------------------ | ------------------- |
| リスクレベル定義の問題   | Phase 1（要件定義） |
| コンポーネント設計の問題 | Phase 2（設計）     |
| 配色設計の問題           | Phase 2（設計）     |
| 両方の問題               | Phase 1（要件定義） |

---

## 参照資料

| 資料名                 | パス                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                    |
| Phase 1スコープ定義    | `outputs/phase-1/scope-definition.md`                                           |
| Phase 2設計書          | `outputs/phase-2/architecture-design.md`                                        |
| Phase 2 UIデザイン仕様 | `outputs/phase-2/ui-design-specification.md`                                    |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| UI/UX仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    |
| デザイン原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |
| レビューゲート基準     | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`  |

---

## 統合テスト連携アクション

- テスト戦略の妥当性（ユニットテスト + コンポーネントテスト構成）を確認する
- モック戦略（toolMetadata.tsのモック方式）を確認する

---

## 成果物

| 成果物名             | パス                                      | 種別     |
| -------------------- | ----------------------------------------- | -------- |
| 設計レビューレポート | `outputs/phase-3/design-review-report.md` | document |

---

## 完了条件

- [ ] 要件との整合性レビューが完了し、全FR/NFRがカバーされている
- [ ] セキュリティレビューが完了し、リスクレベル定義の整合性が確認されている
- [ ] UI/UXレビューが完了し、Progressive Disclosure/WCAG準拠が確認されている
- [ ] アーキテクチャレビューが完了し、モジュール間の責務分離が適切と判定されている
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR以上の指摘がある場合、対応方針が記録されている

---

## 次Phase

Phase 4（テスト作成）: レビューをPASSした設計に基づき、TDD Red（失敗するテスト）を作成する。
