# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 10                                |
| Phase名    | 最終レビューゲート                |
| 前提Phase  | Phase 9                           |
| 後続Phase  | Phase 11                          |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

Phase 1〜9の全成果物を最終レビューし、手動テスト・ドキュメント更新・PR作成フェーズへ進む準備を確認する。

## 背景

最終レビューゲートは、実装完了後の最後の品質ゲートである。要件定義から品質保証までの全フェーズの成果物を総合的にレビューし、リリース準備が整っているか確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件充足レビュー

**目的**: Phase 1で定義した要件が全て満たされているか確認する

**実行手順**:

1. `outputs/phase-1/functional-requirements.md` を参照
2. 各機能要件の充足状況を確認:
   - [ ] IChatSessionRepository の全メソッド実装
   - [ ] IChatMessageRepository の全メソッド実装
   - [ ] FTS5全文検索機能
   - [ ] トランザクション対応
3. `outputs/phase-1/non-functional-requirements.md` を参照
4. 非機能要件の充足状況を確認:
   - [ ] テストカバレッジ目標達成
   - [ ] 型安全性確保
   - [ ] コード品質基準準拠

**期待される成果物**:

- `outputs/phase-10/requirements-fulfillment.md`: 要件充足レビュー結果

---

### タスク2: 設計整合性レビュー

**目的**: Phase 2の設計と実装が整合しているか確認する

**実行手順**:

1. 設計書と実装の比較:
   - `outputs/phase-2/drizzle-chat-session-repository-design.md` vs 実装
   - `outputs/phase-2/drizzle-chat-message-repository-design.md` vs 実装
2. 設計からの逸脱がある場合は理由を記録
3. Clean Architecture準拠の再確認:
   - [ ] 依存関係の方向性
   - [ ] 層間境界の維持
   - [ ] インターフェース分離

**期待される成果物**:

- `outputs/phase-10/design-consistency.md`: 設計整合性レビュー結果

---

### タスク3: テスト品質レビュー

**目的**: テストの品質と網羅性を最終確認する

**実行手順**:

1. テスト一覧の確認:
   - ユニットテスト数
   - 統合テスト数
   - エッジケーステスト数
2. カバレッジ最終確認:
   - Line Coverage: ?%（目標: ≥80%）
   - Branch Coverage: ?%（目標: ≥60%）
   - Function Coverage: ?%（目標: ≥80%）
3. テスト品質チェック:
   - [ ] テストが独立している
   - [ ] テスト名が意図を表している
   - [ ] アサーションが適切

**期待される成果物**:

- `outputs/phase-10/test-quality-review.md`: テスト品質レビュー結果

---

### タスク4: 成果物一覧確認

**目的**: 全Phaseの必須成果物が揃っているか確認する

**実行手順**:

1. 実装成果物:
   - [ ] `DrizzleChatSessionRepository.ts`
   - [ ] `DrizzleChatMessageRepository.ts`
   - [ ] エクスポート設定（`index.ts`）
2. テスト成果物:
   - [ ] `DrizzleChatSessionRepository.test.ts`
   - [ ] `DrizzleChatMessageRepository.test.ts`
   - [ ] テストヘルパー
3. ドキュメント成果物:
   - [ ] Phase 1〜9の各出力ファイル

**期待される成果物**:

- `outputs/phase-10/artifact-checklist.md`: 成果物一覧チェックリスト

---

### タスク5: リスク・課題の最終確認

**目的**: 残存リスク・課題を特定し、対応方針を確認する

**実行手順**:

1. Phase 3で特定したリスクの対応状況確認
2. 新たに発見された課題の記録
3. 未解決課題の対応方針決定:
   - 本タスク内で対応
   - 別タスクとして切り出し
   - 許容リスクとして受容
4. 既知の制限事項を記録

**期待される成果物**:

- `outputs/phase-10/risk-issue-final.md`: リスク・課題最終確認

---

### タスク6: 最終レビュー判定

**目的**: 最終レビューの総合判定を行う

**実行手順**:

1. 全レビュー結果を集約
2. 判定基準に従い判定:
   - **PASS**: 全項目OK → Phase 11へ進行
   - **MINOR**: 軽微な指摘 → 指摘対応後、Phase 11へ
   - **MAJOR**: 重大な問題 → 影響範囲に応じて戻る
   - **CRITICAL**: 致命的な問題 → Phase 1へ戻りユーザー確認
3. 判定結果と理由を記録

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`: 最終レビュー判定結果

---

## 参照資料

### 全Phase成果物

| 参照資料      | パス               | 内容         |
| ------------- | ------------------ | ------------ |
| Phase 1成果物 | `outputs/phase-1/` | 要件定義     |
| Phase 2成果物 | `outputs/phase-2/` | 設計         |
| Phase 3成果物 | `outputs/phase-3/` | 設計レビュー |
| Phase 7成果物 | `outputs/phase-7/` | カバレッジ   |
| Phase 8成果物 | `outputs/phase-8/` | リファクタ   |
| Phase 9成果物 | `outputs/phase-9/` | 品質保証     |

---

## 成果物

| 成果物               | パス                                           | 内容       |
| -------------------- | ---------------------------------------------- | ---------- |
| 要件充足レビュー     | `outputs/phase-10/requirements-fulfillment.md` | 要件確認   |
| 設計整合性レビュー   | `outputs/phase-10/design-consistency.md`       | 設計確認   |
| テスト品質レビュー   | `outputs/phase-10/test-quality-review.md`      | テスト確認 |
| 成果物一覧チェック   | `outputs/phase-10/artifact-checklist.md`       | 成果物確認 |
| リスク・課題最終確認 | `outputs/phase-10/risk-issue-final.md`         | リスク確認 |
| 最終レビュー判定     | `outputs/phase-10/final-review-result.md`      | 総合判定   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10での統合テスト連携アクション**:

- 最終レビューで統合テスト結果を確認
- 統合テストカバレッジを最終確認

---

## 完了条件

- [ ] 全機能要件が充足されている
- [ ] 全非機能要件が充足されている
- [ ] 設計と実装が整合している
- [ ] テスト品質が基準を満たしている
- [ ] 全成果物が揃っている
- [ ] 残存リスク・課題の対応方針が決定している
- [ ] 最終レビュー判定がPASSまたはMINORである

---

## レビューゲート判定

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11へ進行            |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11へ    |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 最終レビュー判定がPASS/MINORであること

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR判定の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-11-manual-test.md`
