# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 3                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

実装開始前に要件・設計の妥当性を検証する。

## 実行タスク

- 要件整合性レビュー: Phase 1の要件とPhase 2の設計の整合性確認
- セキュリティレビュー: XSS対策、サニタイズ設定の妥当性確認
- 既存パターン整合性: 既存サービス（SkillService等）との設計パターン整合性確認

## 参照資料

| 資料名         | パス                                         | 説明          |
| -------------- | -------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| アーキテクチャ | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------ |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | XSS対策原則        |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | サニタイズ実装     |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | Facadeパターン設計 |

## 実行手順

### 1. 要件整合性レビュー

| 要件ID | 要件                           | 設計での対応                       | 整合性 |
| ------ | ------------------------------ | ---------------------------------- | ------ |
| FR-01  | HTMLコードブロック抽出         | ContentExtractor.extractCodeBlocks | ✅     |
| FR-02  | Markdownコードブロック抽出     | ContentExtractor.extractCodeBlocks | ✅     |
| FR-03  | 複数コードブロック順序付き抽出 | order プロパティで対応             | ✅     |
| FR-04  | HTMLサニタイズ                 | ContentSanitizer.sanitizeHtml      | ✅     |
| FR-05  | 一時ファイル保存               | TempFileManager.saveContent        | ✅     |
| FR-06  | クリーンアップ                 | TempFileManager.cleanup            | ✅     |
| FR-07  | IPC経由取得                    | agentHandlers 3チャネル            | ✅     |

### 2. セキュリティレビュー

| レビュー項目               | 確認内容                                       | 結果 |
| -------------------------- | ---------------------------------------------- | ---- |
| XSS対策                    | DOMPurify使用、FORBID_TAGS設定                 | ✅   |
| 危険タグ除去               | script, style, iframe, object, embed, base     | ✅   |
| イベントハンドラ除去       | onclick, onerror, onload, onmouseover, onfocus | ✅   |
| data属性除去               | ALLOW_DATA_ATTR: false                         | ✅   |
| 一時ファイルパーミッション | mode: 0o600 (owner read/write only)            | ✅   |
| クリーンアップ確実性       | cleanup()メソッド、アプリ終了時に呼び出し      | ✅   |

### 3. 既存パターン整合性

| 観点               | SkillService設計           | EnvironmentService設計      | 整合性 |
| ------------------ | -------------------------- | --------------------------- | ------ |
| パターン           | Facade                     | Facade                      | ✅     |
| 内部サービス分離   | Scanner/Parser/Manager     | Extractor/Sanitizer/Manager | ✅     |
| IPC登録            | registerSkillHandlers      | registerEnvironmentHandlers | ✅     |
| 型定義場所         | packages/shared/src/types/ | packages/shared/src/types/  | ✅     |
| エラーハンドリング | try-catch + エラー返却     | try-catch + エラー返却      | ✅     |

### 4. 統合テスト観点レビュー

| レビュー観点       | 確認項目                  | 結果   |
| ------------------ | ------------------------- | ------ |
| IPC設計            | 3チャネル定義、型定義     | ✅     |
| データフロー       | 抽出→サニタイズ→保存→返却 | ✅     |
| エラーハンドリング | サニタイズ失敗時の処理    | 確認要 |
| 認証連携           | 認証不要（ローカル処理）  | ✅     |

## 判定基準

| 判定  | 条件             | 対応                         |
| ----- | ---------------- | ---------------------------- |
| PASS  | 全観点で問題なし | Phase 4へ進行                |
| MINOR | 軽微な指摘あり   | 指摘対応後Phase 4へ進行      |
| MAJOR | 重大な問題あり   | 影響範囲に応じて戻り先を決定 |

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                          | 結果   |
| ------------------ | --------------------------------- | ------ |
| IPC設計            | エンドポイント定義の妥当性        | ✅     |
| データフロー       | 抽出→サニタイズ→保存→返却の設計   | ✅     |
| エラーハンドリング | 障害時のフロントエンド表示設計    | 確認要 |
| 型契約             | ExtractedContent→SanitizedContent | ✅     |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] セキュリティレビュー完了（XSS対策、パーミッション確認）
- [ ] 既存パターン（SkillService）との整合性確認
- [ ] 統合テスト観点のレビューが完了している
- [ ] 判定結果が記録されている
- [ ] **本Phase内のレビュー作業を100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件整合性レビュー
3. セキュリティレビュー
4. 既存パターン整合性レビュー
5. 統合テスト観点レビュー
6. 判定結果の記録
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）
