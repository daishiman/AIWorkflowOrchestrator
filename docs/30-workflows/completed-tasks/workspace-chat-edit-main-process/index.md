# Workspace Chat Edit Main Process - タスク仕様書

## メタ情報

```yaml
task_id: TASK-WCE-MAIN-001
task_name: Workspace Chat Edit Main Process
issue_number: 469
priority: 高
estimated_scale: 中規模
status: 未実施
created_at: 2026-01-24
author: Claude Code
version: 1.0
```

---

## 1. 概要

### 1.1 背景

workspace-chat-edit機能のRenderer側ロジック（chatEditSlice、useFileContext、useDiffApply）が完成しているが、Main Process側のサービス（ファイルI/O、LLM連携、IPCハンドラ）が未実装。IPC通信を通じてRenderer側からMain Process側を呼び出す必要がある。

### 1.2 目的

Main Process側のサービスとIPCハンドラを実装し、Renderer側との通信を確立する。

### 1.3 成果物

| 成果物               | 配置先                                                |
| -------------------- | ----------------------------------------------------- |
| FileService.ts       | `apps/desktop/src/main/services/chat-edit/`           |
| ChatEditService.ts   | `apps/desktop/src/main/services/chat-edit/`           |
| ContextBuilder.ts    | `apps/desktop/src/main/services/chat-edit/`           |
| chatEditHandlers.ts  | `apps/desktop/src/main/ipc/`                          |
| channels.ts更新      | `apps/desktop/src/preload/`                           |
| preload/index.ts更新 | `apps/desktop/src/preload/`                           |
| サービステスト       | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 2. スコープ

### 2.1 含むもの

- FileService - ファイル読み書き、言語検出
- ContextBuilder - コンテキスト構築
- ChatEditService - プロンプト構築、LLM連携
- chatEditHandlers - IPCハンドラ
- Preload API更新 - chatEditチャンネル追加
- ユニットテスト

### 2.2 含まないもの

- UIコンポーネント（別タスク：UT-WCE-001）
- 新規LLMプロバイダー追加
- 高度な言語検出（AST解析等）

---

## 3. Phase構成

| Phase | 名称                 | 概要                                     |
| ----- | -------------------- | ---------------------------------------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準定義         |
| 2     | 設計                 | サービスアーキテクチャ・インターフェース |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証                   |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）           |
| 5     | 実装                 | TDD: Green（テストを通す実装）           |
| 6     | テスト拡充           | カバレッジ目標達成に向けた追加テスト     |
| 7     | テストカバレッジ確認 | カバレッジ目標検証・統合テスト実行       |
| 8     | リファクタリング     | TDD: Refactor（品質改善）                |
| 9     | 品質保証             | 静的解析・セキュリティ・性能             |
| 10    | 最終レビューゲート   | 全体品質・整合性検証                     |
| 11    | 手動テスト検証       | UX・実環境動作確認                       |
| 12    | ドキュメント更新     | ドキュメント更新・仕様反映               |
| 13    | PR作成               | コミット・PR・CI確認                     |

---

## 4. 依存関係

### 4.1 前提タスク

| タスク                      | ステータス | 備考                     |
| --------------------------- | ---------- | ------------------------ |
| workspace-chat-edit（コア） | 完了       | Renderer側ロジック完成   |
| LLM Adapter実装             | 完了       | OpenAI/Anthropic対応済み |

### 4.2 参照リソース

| リソース                 | パス                                                            |
| ------------------------ | --------------------------------------------------------------- |
| 型定義                   | `apps/desktop/src/renderer/features/workspace-chat-edit/types/` |
| LLM Adapter              | `apps/desktop/src/main/adapters/llm/`                           |
| IPC Handler Pattern      | `apps/desktop/src/main/ipc/`                                    |
| Preload API Pattern      | `apps/desktop/src/preload/`                                     |
| SkillService（参考実装） | `apps/desktop/src/main/services/skill/`                         |

---

## 5. システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                         | 内容                                        |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------- |
| APIエンドポイント        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | chat-edit IPC チャネル仕様（4チャネル）     |
| アーキテクチャパターン   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC Handler Registration Pattern            |
| インターフェース（LLM）  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileContext、EditCommand、GeneratedResult型 |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC セキュリティ、validateIpcSender         |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標                        |

### 5.1 タスク完了時のシステム仕様更新【必須】

Phase 12完了時に以下のシステム仕様書を更新する:

| 更新対象          | 更新内容                                                       |
| ----------------- | -------------------------------------------------------------- |
| api-endpoints.md  | 実装状況テーブル更新、完了タスクセクション追加                 |
| interfaces-llm.md | FileService/ContextBuilder/ChatEditServiceインターフェース追加 |

> 詳細は `phase-12-documentation.md` の Phase 12-2 を参照

---

## 6. 完了条件

### 6.1 機能要件

- [ ] FileServiceが実装されている
- [ ] ContextBuilderが実装されている
- [ ] ChatEditServiceが実装されている
- [ ] chatEditHandlersが実装されている
- [ ] Preload APIが更新されている

### 6.2 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### 6.3 セキュリティ要件

- [ ] validateIpcSenderが全ハンドラで使用されている
- [ ] ホワイトリストに登録されている
- [ ] ファイルパス検証が実装されている

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                     |
| ----------------------- | ------ | -------- | ------------------------ |
| LLM Adapter統合の複雑さ | 中     | 中       | 既存パターンを参照       |
| ファイルパス検証漏れ    | 高     | 低       | セキュリティレビュー実施 |
| 大きなファイルの処理    | 中     | 中       | サイズ制限を厳密に適用   |

---

## 8. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0        | 2026-01-24 | 初版作成 |
