# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 3                  |
| Phase名    | 設計レビューゲート |
| 前提Phase  | Phase 2            |
| 後続Phase  | Phase 4            |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

実装開始前に要件・設計の妥当性を検証する。問題があれば適切なPhaseに戻って修正する。

## 背景

Phase 1, 2で作成した成果物が整合性を持ち、実装可能な状態であることを確認する。特にAgent SDK連携とIPC設計の妥当性を重点的にレビューする。

---

## 使用スキル

このPhaseは設計レビューを行うため、特定のスキルは使用せず、レビュー観点に基づいて成果物を検証する。

---

## 参照資料

| 参照資料           | パス                                         | 内容          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| ドメインモデル     | `outputs/phase-2/domain-model.md`            | Phase 2成果物 |
| API仕様            | `outputs/phase-2/api-specification.md`       | Phase 2成果物 |
| IPC設計            | `outputs/phase-2/ipc-design.md`              | Phase 2成果物 |

### システム仕様（aiworkflow-requirements）

> レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料           | パス                                                                        | 内容                      |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent連携インターフェース |
| IPC設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        | Electron IPC設計          |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン        |

---

## レビュー観点

### 1. 要件整合性

- [ ] 全要件が設計でカバーされているか
- [ ] 受け入れ基準と設計の整合性があるか
- [ ] スコープ定義と設計範囲が一致しているか

### 2. アーキテクチャ妥当性

- [ ] 既存のslide-dependency-management実装と整合しているか
- [ ] Main/Renderer分離が適切か
- [ ] 無限ループ防止機構の設計が妥当か

### 3. Agent SDK連携

- [ ] Agent SDK呼び出しパターンが妥当か
- [ ] エラーハンドリングが考慮されているか
- [ ] レートリミット/タイムアウトの考慮があるか

### 4. IPC設計

- [ ] チャンネル名が既存と衝突しないか
- [ ] 型安全性が確保されているか
- [ ] エラー伝播パターンが明確か

### 5. テスト可能性

- [ ] 各コンポーネントが独立してテスト可能か
- [ ] モック可能なインターフェースが定義されているか

---

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                                   |
| ------------------ | ------------------------------------------ |
| file-watcher設計   | index.html監視の追加が既存設計と整合するか |
| sync-manager設計   | 逆方向同期トリガーの設計が妥当か           |
| skill-executor設計 | modifierスキル実行の設計が妥当か           |
| IPC設計            | SyncStatusIndicator連携の設計が妥当か      |
| エラーハンドリング | 障害時のフロントエンド表示設計が適切か     |

---

## 成果物

| 成果物       | パス                                      | 内容               |
| ------------ | ----------------------------------------- | ------------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果と指摘事項 |

---

## 判定基準

| 判定     | 条件                     | 次のアクション                      |
| -------- | ------------------------ | ----------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4へ進行                       |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4へ進行           |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻り先を決定        |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザーと要件を再確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |
| 両方に問題 | Phase 1（要件定義） |

---

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト観点のレビューが完了している
- [ ] **本Phase内のレビュー作業を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1, 2の成果物を読み込み
2. 要件整合性のレビュー
3. アーキテクチャ妥当性のレビュー
4. Agent SDK連携のレビュー
5. IPC設計のレビュー
6. テスト可能性のレビュー
7. 統合テスト観点のレビュー
8. 判定結果の記録
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全レビュー観点を100%確認完了
- [ ] レビュー結果が記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 3
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 3 実行記録

### レビュー結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 4: テスト作成（TDD: Red）

`docs/30-workflows/slide-reverse-sync/phase-4-test-creation.md`
