# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 3                        |
| Phase名    | 設計レビューゲート       |
| 前提Phase  | Phase 2                  |
| 後続Phase  | Phase 4                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

Phase 1-2の成果物をレビューし、設計の妥当性を検証する。問題があれば該当Phaseに戻る。

## 背景

実装に入る前に設計の品質を担保することで、後工程での手戻りを防ぐ。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: code-smell-detection

**パス**: `.claude/skills/code-smell-detection/SKILL.md`

**Trigger条件**:
設計上の問題パターンを検出する必要がある

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Phase 1-2の設計書に対してレビューを実施
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

### スキル2: solid-principles

**パス**: `.claude/skills/solid-principles/SKILL.md`

**Trigger条件**:
SOLID原則への準拠を確認する必要がある

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. アーキテクチャ設計のSOLID原則準拠を確認
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-3/solid-compliance-report.md`

---

## 参照資料

| 参照資料      | パス               | 内容                        |
| ------------- | ------------------ | --------------------------- |
| Phase 1成果物 | `outputs/phase-1/` | 要件定義・受け入れ基準      |
| Phase 2成果物 | `outputs/phase-2/` | アーキテクチャ・API・UI設計 |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                 | 内容         |
| ------------ | -------------------------------------------------------------------- | ------------ |
| 設計レビュー | `.claude/skills/aiworkflow-requirements/references/design-review.md` | レビュー基準 |
| コード品質   | `.claude/skills/aiworkflow-requirements/references/code-quality.md`  | 品質基準     |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "review"`

---

## 成果物

| 成果物            | パス                                         | 内容                   |
| ----------------- | -------------------------------------------- | ---------------------- |
| 設計レビュー結果  | `outputs/phase-3/design-review-result.md`    | レビュー結果と指摘事項 |
| SOLID準拠レポート | `outputs/phase-3/solid-compliance-report.md` | SOLID原則準拠状況      |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 3の統合テスト連携アクション**: 統合テスト観点のレビューゲートを実施

具体的な確認項目:

- [ ] 統合ポイントが網羅されているか
- [ ] API契約が明確に定義されているか
- [ ] エラーハンドリングが考慮されているか
- [ ] 認証フローが適切に設計されているか

---

## 完了条件

- [ ] Phase 1-2の全成果物がレビューされている
- [ ] 重大な設計上の問題がない（またはMAJOR判定で戻り）
- [ ] SOLID原則への準拠が確認されている
- [ ] 統合テスト観点のレビューが完了している

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. code-smell-detectionスキルの実行
3. solid-principlesスキルの実行
4. 統合テスト連携の実施（統合テスト観点のレビュー）
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 3
```

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4 へ進む（PASS/MINORの場合）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 使用スキル

- code-smell-detection: {{result}}
- solid-principles: {{result}}

### レビュー判定

- 判定結果: {{PASS/MINOR/MAJOR/CRITICAL}}
- 指摘事項数: {{number}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-multi-llm-switching/phase-4-test-creation.md`
