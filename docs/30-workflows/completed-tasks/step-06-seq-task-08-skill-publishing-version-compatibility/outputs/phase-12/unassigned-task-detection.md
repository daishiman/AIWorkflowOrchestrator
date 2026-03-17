# 未タスク検出レポート

## メタ情報

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 文書     | Phase 12 - Task 4 成果物（未タスク検出）                                      |
| タスクID | TASK-SKILL-LIFECYCLE-08                                                       |
| 作成日   | 2026-03-17                                                                    |
| 検出方式 | SF-03（設計タスク特有パターン）の4チェック + Phase 10 MINOR U-1〜U-5 引き継ぎ |
| 検出総数 | 4件                                                                           |

---

## 1. 検出方式: SF-03 設計タスク特有パターン

本タスクは設計タスク（型定義・契約定義のみ、プロダクションコードなし）であるため、通常の「コード品質チェック」ではなく「設計から実装への変換ギャップ」を検出する。

---

## 2. チェック1: 型定義 → 実装ギャップ

### 検出結果

以下の型定義は Phase 2-5 で設計が完了しているが、ランタイム実装（TypeScript ファイルの作成）が未完了。

| 型名                     | 設計完了Phase | 配置先予定                                              | 実装ステータス |
| ------------------------ | ------------- | ------------------------------------------------------- | -------------- |
| SkillVisibility          | Phase 2       | `packages/shared/src/skill/publishing-types.ts`         | 未実装         |
| SkillPublishingMetadata  | Phase 2       | `packages/shared/src/skill/publishing-types.ts`         | 未実装         |
| CompatibilityCheckResult | Phase 2       | `packages/shared/src/types/publish-eligibility.ts`      | 未実装         |
| PublishReadiness         | Phase 2       | `packages/shared/src/types/publish-eligibility.ts`      | 未実装         |
| SkillRegistryService     | Phase 2       | `apps/desktop/src/main/ports/`                          | 未実装         |
| SkillDistributionService | Phase 2       | `packages/shared/src/types/skill-distribution.ts`       | 未実装         |
| PublishReadinessChecker  | Phase 2       | `packages/shared/src/types/publish-eligibility.ts`      | 未実装         |
| CompatibilityChecker     | Phase 2       | `apps/desktop/src/main/domain/compatibility-checker.ts` | 未実装         |

### 未タスク

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 未タスクID | UT-SKILL-LIFECYCLE-08-TYPE-IMPL                                                               |
| タスク名   | TASK-SKILL-LIFECYCLE-08 設計済み型定義のランタイム実装                                        |
| 優先度     | 中                                                                                            |
| 依存タスク | TASK-SKILL-LIFECYCLE-08（本タスク、設計完了）                                                 |
| スコープ   | 8型定義を TypeScript ファイルとして作成し、`packages/shared/src/index.ts` から re-export する |
| 受入基準   | `pnpm --filter @repo/shared build` が成功し、全型が import 可能であること                     |

---

## 3. チェック2: 契約 → テストギャップ（IPC統合テスト）

### 検出結果

Phase 4-6 で設計済みのテストケース（212件）は仕様書レベルの記述であり、実行可能な Vitest テストファイルとしては未作成。以下の11 IPC チャンネルに対する統合テストが必要。

| IPC チャンネル                         | テスト設計済み | テスト実装済み |
| -------------------------------------- | -------------- | -------------- |
| `skill:publishing:register`            | Phase 4        | 未実装         |
| `skill:publishing:confirm`             | Phase 4        | 未実装         |
| `skill:publishing:update`              | Phase 4        | 未実装         |
| `skill:publishing:deprecate`           | Phase 4        | 未実装         |
| `skill:publishing:remove`              | Phase 4        | 未実装         |
| `skill:publishing:get-dependents`      | Phase 4        | 未実装         |
| `skill:publishing:check-compatibility` | Phase 4        | 未実装         |
| `skill:distribution:import`            | Phase 4        | 未実装         |
| `skill:distribution:export`            | Phase 4        | 未実装         |
| `skill:distribution:fork`              | Phase 4        | 未実装         |
| `skill:distribution:share`             | Phase 4        | 未実装         |

### 未タスク

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 未タスクID | UT-SKILL-LIFECYCLE-08-IPC-TEST                                                   |
| タスク名   | TASK-SKILL-LIFECYCLE-08 IPC チャンネル統合テスト作成                             |
| 優先度     | 中                                                                               |
| 依存タスク | UT-SKILL-LIFECYCLE-08-TYPE-IMPL（型定義実装が先行して完了している必要がある）    |
| スコープ   | 11 IPC チャンネルの統合テスト（P42 3段バリデーション、P60 レスポンス形式を検証） |
| テスト件数 | Phase 4（153件）+ Phase 6（59件）= 212件相当                                     |
| 受入基準   | `pnpm --filter @repo/desktop test` で全テスト PASS、カバレッジ 80% 以上          |

---

## 4. チェック3: UI仕様 → コンポーネントギャップ

### 検出結果

Phase 2 設計書で UI コンポーネントの仕様が定義されているが、React コンポーネントとしては未実装。

| コンポーネント名        | 設計書                              | 機能                                | 実装ステータス |
| ----------------------- | ----------------------------------- | ----------------------------------- | -------------- |
| VisibilityBadge         | publishing-metadata-design.md SS4.1 | 公開レベルバッジ（3色）             | 未実装         |
| SkillCenterFilter       | publishing-metadata-design.md SS4.3 | visibility ドロップダウンフィルタ   | 未実装         |
| PublishFlowDialog       | skill-center-flow-design.md SS3     | 登録・更新・停止の3フローダイアログ | 未実装         |
| CompatibilityResultView | compatibility-check-design.md SS2   | 互換性チェック結果表示              | 未実装         |
| SkillPublishingForm     | skill-center-flow-design.md SS3.2   | メタデータ入力フォーム              | 未実装         |
| SkillPublishingPreview  | skill-center-flow-design.md SS3.2   | 公開プレビュー確認画面              | 未実装         |

### 未タスク

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| 未タスクID | UT-SKILL-LIFECYCLE-08-UI-IMPL                                                           |
| タスク名   | TASK-SKILL-LIFECYCLE-08 UI コンポーネント実装                                           |
| 優先度     | 中                                                                                      |
| 依存タスク | UT-SKILL-LIFECYCLE-08-TYPE-IMPL（型定義）、UT-SKILL-LIFECYCLE-08-IPC-TEST（IPC テスト） |
| スコープ   | 6 コンポーネントの実装（Apple HIG 準拠、P47 バッジスタイル定数使用）                    |
| 受入基準   | 全コンポーネントが Storybook で表示可能、アクセシビリティ検証 PASS                      |

---

## 5. チェック4: 仕様書間差異 → 設計決定（Phase 10 MINOR/WARN 残存）

### 検出結果

Phase 10 最終レビューで MINOR 判定された残存項目（U-1〜U-5）のうち、Phase 12 で未タスク化が必要な項目。

| Phase 10 ID | 出典           | 内容                                                      | 対応方針                                |
| ----------- | -------------- | --------------------------------------------------------- | --------------------------------------- |
| U-1         | Phase 3 W-03   | hasCriticalFeedback の ObservabilityMetrics 追加検討      | 後続実装タスクでアダプタ追加を判断      |
| U-2         | Phase 3 W-04   | usageCount の ObservabilityMetrics 追加検討               | 後続実装タスクで UI 表示情報として判断  |
| U-3         | Phase 3 M-DQ-3 | PublishReadiness.reasons の i18n 対応（メッセージキー化） | i18n タスクとして独立管理               |
| U-4         | Phase 9 D2-AMB | 仕様書内の曖昧表現7件の明確化                             | 後続実装タスクで文脈に応じて明確化      |
| U-5         | Phase 9 D2-NAM | 命名規約違反3件の修正                                     | UT-SKILL-LIFECYCLE-08-NAMING-FIX に統合 |

U-1〜U-4 は後続の実装タスク（UT-SKILL-LIFECYCLE-08-TYPE-IMPL / UT-SKILL-LIFECYCLE-08-UI-IMPL）のスコープ内で対応可能なため、独立した未タスクとしては作成しない。

U-5（命名規約違反3件）は設計書全体に波及するため独立した未タスクとする。

### 未タスク

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-SKILL-LIFECYCLE-08-NAMING-FIX                                                                                                                               |
| タスク名   | TASK-SKILL-LIFECYCLE-08 命名規約対応（boolean フィールド is/has/should プレフィックス）                                                                        |
| 優先度     | 低                                                                                                                                                             |
| 依存タスク | UT-SKILL-LIFECYCLE-08-TYPE-IMPL（型定義実装と同時対応が効率的）                                                                                                |
| スコープ   | 3件の命名規約違反を修正（V-1: autoResolveDependencies → shouldAutoResolveDependencies、V-2: includeMetadata → shouldIncludeMetadata、V-3: passed → hasPassed） |
| 波及範囲   | テスト仕様書8〜15件の修正が必要（Phase 9 naming-audit.md で推奨レベル判定済み）                                                                                |
| 受入基準   | `pnpm lint` が PASS し、boolean フィールドが is/has/should/can プレフィックスを持つこと                                                                        |

---

## 6. 検出結果サマリー

| #   | 未タスクID                       | タスク名               | 優先度 | 依存関係                            |
| --- | -------------------------------- | ---------------------- | ------ | ----------------------------------- |
| 1   | UT-SKILL-LIFECYCLE-08-TYPE-IMPL  | 型定義のランタイム実装 | 中     | TASK-SKILL-LIFECYCLE-08（本タスク） |
| 2   | UT-SKILL-LIFECYCLE-08-IPC-TEST   | IPC 統合テスト作成     | 中     | #1（型定義実装）                    |
| 3   | UT-SKILL-LIFECYCLE-08-UI-IMPL    | UI コンポーネント実装  | 中     | #1（型定義実装）、#2（IPC テスト）  |
| 4   | UT-SKILL-LIFECYCLE-08-NAMING-FIX | 命名規約対応           | 低     | #1 と同時対応推奨                   |

### 依存グラフ

```
TASK-SKILL-LIFECYCLE-08（設計完了）
  |
  v
UT-SKILL-LIFECYCLE-08-TYPE-IMPL（型定義実装）
  |        |
  v        v
  |   UT-SKILL-LIFECYCLE-08-NAMING-FIX（同時対応推奨）
  |
  v
UT-SKILL-LIFECYCLE-08-IPC-TEST（IPC 統合テスト）
  |
  v
UT-SKILL-LIFECYCLE-08-UI-IMPL（UI コンポーネント実装）
```

### Phase 10 U-1〜U-5 との対応

| Phase 10 ID | 独立未タスク化 | 対応先                             |
| ----------- | -------------- | ---------------------------------- |
| U-1         | 不要           | UT-SKILL-LIFECYCLE-08-TYPE-IMPL 内 |
| U-2         | 不要           | UT-SKILL-LIFECYCLE-08-UI-IMPL 内   |
| U-3         | 不要           | UT-SKILL-LIFECYCLE-08-TYPE-IMPL 内 |
| U-4         | 不要           | 各実装タスク内で文脈に応じて対応   |
| U-5         | 必要           | UT-SKILL-LIFECYCLE-08-NAMING-FIX   |
