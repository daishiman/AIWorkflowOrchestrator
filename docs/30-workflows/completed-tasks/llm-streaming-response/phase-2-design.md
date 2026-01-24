# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 2                      |
| Phase名    | 設計                   |
| 前提Phase  | Phase 1                |
| 後続Phase  | Phase 3                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-23             |
| 機能名     | llm-streaming-response |

---

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。既存のLLMアダプターアーキテクチャ（Template Methodパターン）を拡張し、ストリーミング機能を追加する設計を行う。

## 背景

現在のBaseLLMAdapterは`chat()`メソッドで一括レスポンスを返す実装になっている。ストリーミング対応では`streamChat()`抽象メソッドを追加し、各プロバイダーアダプターで実装する設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: システム構造の設計とパターン選定

**実行手順**:

1. BaseLLMAdapterへの`streamChat()`抽象メソッド追加設計
2. 各プロバイダー（OpenAI、Anthropic、Google、xAI）のストリーミングAPI呼び出し設計
3. IPC通信設計（send/on方式でのチャンク送信）
4. キャンセル機構設計（AbortController活用）

**期待される成果物**:

- アーキテクチャ設計書
- シーケンス図

---

### タスク2: 型設計

**目的**: ストリーミング用の型定義設計

**実行手順**:

1. `LLMStreamChunk`型の詳細設計（content、done、error）
2. `LLMStreamRequest`型の設計
3. イベント型の設計（chunk、done、error）
4. 既存型との整合性確認

**期待される成果物**:

- 型定義設計書

---

### タスク3: UI設計

**目的**: ストリーミング表示UIの設計

**実行手順**:

1. StreamingMessageコンポーネントの設計
2. `isStreaming`状態管理の設計
3. タイピングアニメーションの設計
4. キャンセルボタンUIの設計

**期待される成果物**:

- UIコンポーネント設計書
- 状態管理設計書

---

## 参照資料

| 参照資料     | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                     |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| LLMインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | LLMStreamChunk型定義     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Adapter/Factory/Template |
| UIコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計指針   |

---

## 成果物

| 成果物               | パス                                     | 内容             |
| -------------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | システム構造設計 |
| 型定義設計           | `outputs/phase-2/type-design.md`         | 型定義詳細       |
| UIコンポーネント設計 | `outputs/phase-2/ui-design.md`           | UI設計詳細       |
| シーケンス図         | `outputs/phase-2/sequence-diagram.md`    | 処理フロー       |

---

## 統合テスト連携（Phase 1〜11は必須）

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                                          |
| ------------------ | ------------------------------------------------- |
| IPC: Renderer→Main | `llm:stream-chat`チャンネルでLLMChatRequestを送信 |
| IPC: Main→Renderer | `llm:stream-chunk`イベントでLLMStreamChunkを送信  |
| Adapter→Provider   | 各プロバイダーAPIのストリーミングエンドポイント   |
| キャンセル         | AbortSignalを通じたストリーム中断                 |

---

## 完了条件

- [ ] アーキテクチャが定義されている（Adapter拡張、IPC設計）
- [ ] 型定義が設計されている（LLMStreamChunk、イベント型）
- [ ] UIコンポーネントが設計されている（StreamingMessage、状態管理）
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] 既存LLMアダプター実装との互換性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- アーキテクチャ設計: [結果]
- 型設計: [結果]
- UI設計: [結果]

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

`docs/30-workflows/llm-streaming-response/phase-3-design-review.md`
