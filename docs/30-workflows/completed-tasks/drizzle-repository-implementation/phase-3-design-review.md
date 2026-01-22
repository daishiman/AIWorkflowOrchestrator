# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 3                                 |
| Phase名    | 設計レビューゲート                |
| 前提Phase  | Phase 2                           |
| 後続Phase  | Phase 4                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

Phase 1〜2の成果物（要件定義・設計）をレビューし、実装フェーズへ進む準備が整っているか検証する。

## 背景

設計レビューゲートは、実装前に要件・設計の妥当性を検証し、手戻りを防止するための品質ゲートである。Clean Architecture準拠、インターフェース整合性、テスト戦略の妥当性を確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件定義レビュー

**目的**: Phase 1成果物の完全性・正確性をレビューする

**実行手順**:

1. `outputs/phase-1/interface-analysis.md` をレビュー:
   - [ ] IChatSessionRepository の全7メソッドが分析されているか
   - [ ] IChatMessageRepository の全8メソッドが分析されているか
   - [ ] 各メソッドの引数・戻り値・責務が正確に記載されているか
2. `outputs/phase-1/schema-entity-mapping.md` をレビュー:
   - [ ] chatSessions テーブルの全カラムが対応付けされているか
   - [ ] chatMessages テーブルの全カラムが対応付けされているか
   - [ ] 型変換（boolean↔integer, Date↔string）が特定されているか
3. `outputs/phase-1/functional-requirements.md` をレビュー:
   - [ ] 全メソッドに対して機能要件が定義されているか
   - [ ] FTS5全文検索要件が明記されているか
   - [ ] トランザクション要件が明記されているか

**期待される成果物**:

- `outputs/phase-3/requirements-review.md`: 要件定義レビュー結果

---

### タスク2: 設計レビュー

**目的**: Phase 2成果物の技術的妥当性をレビューする

**実行手順**:

1. `outputs/phase-2/drizzle-chat-session-repository-design.md` をレビュー:
   - [ ] IChatSessionRepository の全メソッドが設計されているか
   - [ ] Drizzle API使用パターンが適切か
   - [ ] Mapper活用方針が明確か
2. `outputs/phase-2/drizzle-chat-message-repository-design.md` をレビュー:
   - [ ] IChatMessageRepository の全メソッドが設計されているか
   - [ ] バッチ処理（saveMany）の設計が適切か
3. `outputs/phase-2/drizzle-query-patterns.md` をレビュー:
   - [ ] Select/Insert/Update/Delete の各パターンが設計されているか
   - [ ] FTS5クエリパターンが設計されているか
   - [ ] upsert パターン（onConflictDoUpdate）が適切か
4. `outputs/phase-2/error-handling-design.md` をレビュー:
   - [ ] エラー種別が適切に分類されているか
   - [ ] 既存エラー体系との整合性があるか

**期待される成果物**:

- `outputs/phase-3/design-review.md`: 設計レビュー結果

---

### タスク3: Clean Architecture準拠チェック

**目的**: 設計がClean Architecture原則に準拠しているか確認する

**実行手順**:

1. 依存関係ルールのチェック:
   - [ ] Repository実装がDomain層のインターフェースに依存しているか
   - [ ] Repository実装がDBスキーマ（Infrastructure）に依存しているか
   - [ ] Domain層への逆依存がないか
2. 層間境界のチェック:
   - [ ] Mapperがレイヤー間の変換を担当しているか
   - [ ] DTOとEntityが適切に分離されているか
3. 依存性逆転原則のチェック:
   - [ ] Use CaseがRepositoryインターフェースに依存しているか
   - [ ] 具体実装（Drizzle）が抽象（Interface）に依存しているか

**期待される成果物**:

- `outputs/phase-3/architecture-compliance.md`: アーキテクチャ準拠チェック結果

---

### タスク4: テスト戦略レビュー

**目的**: テスト戦略の妥当性・網羅性をレビューする

**実行手順**:

1. `outputs/phase-2/test-strategy.md` をレビュー:
   - [ ] テスト環境（インメモリSQLite）が適切か
   - [ ] テストカテゴリ（正常系/異常系/境界値/FTS5）が網羅的か
   - [ ] カバレッジ目標（Line≥80%, Branch≥60%, Function≥80%）が達成可能か
2. 統合テスト観点のチェック:
   - [ ] DB接続テストが含まれているか
   - [ ] トランザクションテストが含まれているか
   - [ ] FTS5テストが含まれているか

**期待される成果物**:

- `outputs/phase-3/test-strategy-review.md`: テスト戦略レビュー結果

---

### タスク5: リスク評価・対策

**目的**: 実装フェーズで想定されるリスクを評価し、対策を検討する

**実行手順**:

1. 技術リスクの評価:
   - FTS5動作の不確実性
   - Drizzle API変更の可能性
   - 型変換エラーの可能性
2. 品質リスクの評価:
   - カバレッジ目標未達リスク
   - 既存テストとの干渉リスク
3. 各リスクに対する対策を検討

**期待される成果物**:

- `outputs/phase-3/risk-assessment.md`: リスク評価・対策

---

### タスク6: レビュー結果判定

**目的**: レビュー結果を総合判定し、次フェーズへの進行可否を決定する

**実行手順**:

1. 上記タスク1〜5のレビュー結果を集約
2. 以下の判定基準で判定:
   - **PASS**: 全レビュー観点で問題なし → Phase 4へ進行
   - **MINOR**: 軽微な指摘あり → 指摘対応後、Phase 4へ進行
   - **MAJOR**: 重大な問題あり → 影響範囲に応じて戻る
   - **CRITICAL**: 致命的な問題あり → Phase 1へ戻りユーザー確認
3. 指摘事項と対応方針を記録

**期待される成果物**:

- `outputs/phase-3/review-result.md`: レビュー結果判定書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | Repository IF定義      |

### Phase 1〜2成果物

| 参照資料      | パス               | 内容           |
| ------------- | ------------------ | -------------- |
| Phase 1成果物 | `outputs/phase-1/` | 要件定義成果物 |
| Phase 2成果物 | `outputs/phase-2/` | 設計成果物     |

---

## 成果物

| 成果物                     | パス                                         | 内容               |
| -------------------------- | -------------------------------------------- | ------------------ |
| 要件定義レビュー結果       | `outputs/phase-3/requirements-review.md`     | Phase 1レビュー    |
| 設計レビュー結果           | `outputs/phase-3/design-review.md`           | Phase 2レビュー    |
| アーキテクチャ準拠チェック | `outputs/phase-3/architecture-compliance.md` | CA準拠チェック     |
| テスト戦略レビュー結果     | `outputs/phase-3/test-strategy-review.md`    | テスト戦略レビュー |
| リスク評価・対策           | `outputs/phase-3/risk-assessment.md`         | リスク対策         |
| レビュー結果判定書         | `outputs/phase-3/review-result.md`           | 総合判定           |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 3での統合テスト連携アクション**:

- 統合テスト観点のレビューゲートを実施
- DB接続テスト・トランザクションテスト・FTS5テストがテスト戦略に含まれているか確認
- Repository-DB間インターフェースの設計が適切か確認

---

## 完了条件

- [ ] Phase 1成果物の全項目がレビューされている
- [ ] Phase 2成果物の全項目がレビューされている
- [ ] Clean Architecture準拠チェックが完了している
- [ ] テスト戦略のレビューが完了している
- [ ] リスク評価・対策が完了している
- [ ] レビュー結果判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（6ファイル）

---

## レビューゲート判定

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4へ     |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む（PASS/MINOR判定の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-4-test-creation.md`
