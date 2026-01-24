# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成             |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-23             |
| 機能名     | llm-streaming-response |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。ストリーミング機能の全ての受け入れ基準に対応するテストを作成する。

## 背景

TDD原則に従い、テストを先に作成することで、実装の目標を明確にし、品質を担保する。ストリーミング機能は非同期処理が多いため、テスト設計が重要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Adapterユニットテスト作成

**目的**: 各プロバイダーアダプターのstreamChat()メソッドのテスト作成

**実行手順**:

1. BaseLLMAdapter.streamChat()の抽象メソッドテスト設計
2. OpenAIAdapter.streamChat()のテスト作成
3. AnthropicAdapter.streamChat()のテスト作成
4. GoogleAdapter.streamChat()のテスト作成
5. xAIAdapter.streamChat()のテスト作成

**テストカテゴリ**:

- 正常系: ストリーミングチャンクの受信
- 異常系: APIエラー、タイムアウト
- キャンセル: ストリーム中断

**期待される成果物**:

- `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`

---

### タスク2: IPCハンドラーテスト作成

**目的**: llm:stream-chat IPCハンドラーのテスト作成

**実行手順**:

1. IPCハンドラー登録テスト
2. チャンク送信テスト
3. 完了イベントテスト
4. エラーイベントテスト
5. キャンセルテスト

**期待される成果物**:

- `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`

---

### タスク3: UIコンポーネントテスト作成

**目的**: StreamingMessageコンポーネントのテスト作成

**実行手順**:

1. ストリーミング表示テスト
2. isStreaming状態テスト
3. タイピングアニメーションテスト
4. キャンセルボタンテスト
5. 完了後の表示テスト

**期待される成果物**:

- `apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx`

---

### タスク4: 統合テストシナリオ作成

**目的**: エンドツーエンドのストリーミングフローテスト設計

**実行手順**:

1. Renderer→Main→Provider→Main→Rendererの統合テスト設計
2. 各プロバイダーの統合テスト設計
3. エラーシナリオの統合テスト設計

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md`

---

## 参照資料

| 参照資料           | パス                                         | 内容          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                  | 内容               |
| ------------------- | --------------------------------------------------------------------- | ------------------ |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | テスト対象の型定義 |

---

## 成果物

| 成果物              | パス                                                                            | 内容           |
| ------------------- | ------------------------------------------------------------------------------- | -------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                                         | テスト設計     |
| テストケース一覧    | `outputs/phase-4/test-cases.md`                                                 | ケース一覧     |
| 統合テスト設計      | `outputs/phase-4/integration-test-design.md`                                    | 統合テスト設計 |
| Adapterテスト       | `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`                | テストコード   |
| IPCハンドラーテスト | `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`                   | テストコード   |
| UIテスト            | `apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx` | テストコード   |

---

## 統合テスト連携（Phase 1〜11は必須）

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル          |
| ------------------ | ----------------------------------------- | ----------------------- |
| API接続テスト      | IPC→Adapter→Provider疎通                  | `*.integration.test.ts` |
| データフローテスト | チャンク送受信の往復                      | `*.flow.test.ts`        |
| エラーハンドリング | ネットワーク切断、タイムアウト、APIエラー | `*.error.test.ts`       |
| キャンセルテスト   | ストリーム中断、リソースクリーンアップ    | `*.cancel.test.ts`      |
| 状態同期テスト     | isStreaming状態、UIリアルタイム更新       | `*.sync.test.ts`        |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 4プロバイダー（OpenAI、Anthropic、Google、xAI）のテストがある
- [ ] IPCハンドラーテストがある
- [ ] UIコンポーネントテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テスト（長文、空文字列、特殊文字）が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- Adapterユニットテスト作成: [結果]
- IPCハンドラーテスト作成: [結果]
- UIコンポーネントテスト作成: [結果]
- 統合テストシナリオ作成: [結果]

### テスト数

- Adapterテスト: N件
- IPCテスト: N件
- UIテスト: N件

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

`docs/30-workflows/llm-streaming-response/phase-5-implementation.md`
