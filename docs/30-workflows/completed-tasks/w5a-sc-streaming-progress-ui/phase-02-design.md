# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| タスクID   | TASK-SC-07-STREAMING-PROGRESS-UI |
| 機能名     | w5a-sc-streaming-progress-ui     |
| 前提Phase  | Phase 1（要件定義）              |
| 後続Phase  | Phase 3（設計レビュー）          |
| ステータス | 未実施                           |
| 作成日     | 2026-03-22                       |

## 目的

GenerateStep UI改修とストリーミング進捗表示の詳細設計を行う。P5（リスナー二重登録防止: useEffectクリーンアップでリスナー解除必須）・P31（Zustand無限ループ: 個別セレクタ使用、合成Hook依存回避）・P48（useShallow: filter/mapの派生セレクタにuseShallow適用）を考慮した安全な実装方針を策定する。

## 背景

Phase 1 で定義した進捗表示・エラーハンドリング・キャンセル機能の要件に基づき、UIコンポーネント構成・Zustandスライス・カスタムHook・IPCチャンネルの詳細設計を行う。既知のPitfallへの対策を設計段階で織り込む。

## 実行タスク

### タスク1: GenerateStep UI改修設計

**目的**: プログレスバー・ステップ表示・リアルタイムプレビューのコンポーネント構成を設計する

**実行手順**:

1. プログレスバーコンポーネントの設計（0〜100% / 4段階ステップ表示）
2. ステップ表示UI（構造計画中 / SKILL.md 生成中 / agents 生成中 / バリデーション中）の設計
3. リアルタイムプレビュー表示（生成されたSKILL.mdの冒頭を表示）の設計
4. Apple HIG準拠・Atomic Designパターンに従ったビジュアルデザイン方針の策定

**期待される成果物**:

- GenerateStep UI設計図（コンポーネント構成）

### タスク2: SKILL_CREATOR_PROGRESS リスナー設計

**目的**: IPCリスナーとZustandスライスを安全に接続する設計を行う

**実行手順**:

1. P5（リスナー二重登録防止）対策: `useEffect` のクリーンアップでリスナー解除する設計
2. Zustand `generationProgress` スライス設計
   - `stage`: `'planning' | 'generating-skill' | 'generating-agents' | 'validating' | 'done' | 'error'`
   - `percent`: `number` (0-100)
   - `message`: `string`
   - `previewContent`: `string | null`
3. P31（Zustand無限ループ）対策: 個別セレクタ（`useGenerationStage()` 等）を設計し、合成Hook依存を回避する
4. P48（useShallow適用）: filter/mapの派生セレクタにuseShallow適用箇所を特定する

**期待される成果物**:

- Zustand `generationProgress` スライス型定義
- 個別セレクタインターフェース定義

### タスク3: エラー表示設計

**目的**: エラーコードとUIコンポーネントの対応を設計する

**実行手順**:

1. `API_KEY_NOT_SET` → 設定画面誘導リンク付きエラーUI設計
2. `LLM_ERROR`（レートリミット等）→ リトライボタン付きエラーUI設計
3. `NETWORK_ERROR` → オフライン表示（再接続待機UI）設計
4. エラーコードとUIコンポーネントの対応表の作成

**期待される成果物**:

- 3種類のエラーUIコンポーネント設計
- エラーコードとUIコンポーネントの対応表

### タスク4: キャンセル設計

**目的**: AbortControllerを用いたキャンセルフローを設計する

**実行手順**:

1. `AbortController` をカスタムHookで管理する設計
2. キャンセルボタンの表示タイミング（生成開始後、done/error以前）の定義
3. IPC経由キャンセル送信: `skill-creator:cancel` チャンネルの設計
4. キャンセル後のUI: 「キャンセルしました」メッセージ → ウィザード先頭に戻る設計

**期待される成果物**:

- キャンセルフロー設計（AbortController → IPC送信 → UI戻し）

### タスク5: カスタムHook設計

**目的**: 進捗状態管理とキャンセル操作のHookインターフェースを設計する

**実行手順**:

1. `useGenerationProgress()`: 進捗状態管理Hookの設計
2. `useCancelGeneration()`: キャンセル操作Hookの設計
3. Zustand個別セレクタパターンに準拠した設計

**期待される成果物**:

- カスタムHookインターフェース定義

## 参照資料

| 参照資料                   | パス                                                                      | 内容                                                                  |
| -------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Phase 1 要件定義書         | `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-01-requirements.md` | 進捗表示・エラー・キャンセルの要件                                    |
| skill-creator-api          | `apps/desktop/src/preload/skill-creator-api.ts`                           | IPCチャンネル定義                                                     |
| Pitfall P5                 | インライン知識                                                            | P5（リスナー二重登録防止）: useEffectクリーンアップでリスナー解除必須 |
| Pitfall P31                | インライン知識                                                            | P31（Zustand無限ループ）: 個別セレクタ使用、合成Hook依存回避          |
| Pitfall P48                | インライン知識                                                            | P48（useShallow）: filter/mapの派生セレクタにuseShallow適用           |
| 状態管理ガイドライン       | インライン知識                                                            | Zustand個別セレクタパターン使用                                       |
| アーキテクチャガイドライン | インライン知識                                                            | Apple HIG準拠・Atomic Designパターンに従う                            |

## 成果物

| 成果物                       | パス                                             | 内容                                          |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------- |
| GenerateStep UI設計図        | 本ドキュメント内「タスク1」セクション            | コンポーネント構成                            |
| Zustand スライス型定義       | 本ドキュメント内「タスク2」セクション            | generationProgress スライス                   |
| カスタムHookインターフェース | 本ドキュメント内「タスク5」セクション            | useGenerationProgress / useCancelGeneration   |
| エラーコード対応表           | 本ドキュメント内「タスク3」セクション            | エラーコードとUIコンポーネントの対応          |
| IPCチャンネル一覧            | 本ドキュメント内「タスク2」「タスク4」セクション | SKILL_CREATOR_PROGRESS / skill-creator:cancel |

## 統合テスト連携

本Phaseで確認すべき統合テスト観点:

- Zustand `generationProgress` スライスの型定義が、テストでのモック作成に十分な情報を含んでいること
- IPCリスナーのクリーンアップ設計（P5対策）が、テストでの検証可能性を確保していること
- エラーコード→UIコンポーネントの対応が明確で、各パターンのテストケース作成が可能であること

## 完了条件

- [ ] GenerateStep UI改修のコンポーネント構成が図示されている
- [ ] Zustand スライスの型定義（stage / percent / message / previewContent）が確定している
- [ ] P5対策（クリーンアップでリスナー解除）の実装方針が明示されている
- [ ] P31対策（個別セレクタ設計）が明示されている
- [ ] P48（useShallow適用箇所）が特定されている
- [ ] 3種類のエラーUIコンポーネント設計が完了している
- [ ] キャンセルフロー（AbortController → IPC送信 → UI戻し）が設計されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビュー）へ進む

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク           | 結果 | 備考 |
| ---------------- | ---- | ---- |
| （実行後に記入） |      |      |

- 良かった点:
- 問題点:
- 改善提案:
- 次Phaseへの引き継ぎ事項:

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー

`docs/30-workflows/w5a-sc-streaming-progress-ui/phase-03-design-review.md`
