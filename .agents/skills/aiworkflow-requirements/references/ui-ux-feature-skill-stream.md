# SkillStreamDisplay コンポーネント仕様

> 本ドキュメントは機能別UIコンポーネント仕様の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-feature-components.md](./ui-ux-feature-components.md)

---

## 概要

スキル実行結果をリアルタイムでストリーミング表示するUIコンポーネント群。TASK-3-2シリーズで段階的に機能拡張。

### タスク履歴

| タスクID   | 機能名                 | 完了日     | 主要追加機能                                     |
| ---------- | ---------------------- | ---------- | ------------------------------------------------ |
| TASK-3-2   | 基盤実装               | 2026-01-25 | SkillStreamDisplay、useSkillExecution            |
| TASK-3-2-A | UX改善                 | 2026-01-27 | LoadingSpinner、MessageTimestamp、CopyButton     |
| TASK-3-2-B | i18n対応               | 2026-01-28 | formatRelativeTime locale対応、日英2言語         |
| TASK-3-2-C | タイムスタンプ自動更新 | 2026-01-28 | TimestampContext、useInterval、usePageVisibility |

---

## コンポーネント階層

| コンポーネント     | 種類      | 親                 | 子要素                                                                                                       |
| ------------------ | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| SkillStreamDisplay | organisms | -                  | StreamHeader, StreamContent                                                                                  |
| StreamHeader       | -         | SkillStreamDisplay | StatusBadge, LoadingSpinner（running時）, AbortButton（running時）, ResetButton（completed/error/aborted時） |
| StreamContent      | -         | SkillStreamDisplay | MessageItem（複数、React.memo適用）                                                                          |
| MessageItem        | -         | StreamContent      | message-content, MessageTimestamp, CopyButton                                                                |

StreamContentにはrole="log"およびaria-live="polite"を設定する。

---

## SkillStreamDisplay コンポーネント

| 項目     | 仕様                                                                    |
| -------- | ----------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| 責務     | スキル実行ストリームの表示、実行制御                                    |
| 依存Hook | `useSkillExecution`                                                     |

### Props

| Prop           | 型                                     | 必須 | デフォルト | 説明                       |
| -------------- | -------------------------------------- | ---- | ---------- | -------------------------- |
| skillId        | `string`                               | Yes  | -          | 実行対象のスキルID         |
| initialPrompt  | `string`                               | No   | -          | 初期プロンプト             |
| autoExecute    | `boolean`                              | No   | false      | 自動実行フラグ             |
| onComplete     | `() => void`                           | No   | -          | 完了時コールバック         |
| onError        | `(error: SkillExecutionError) => void` | No   | -          | エラー時コールバック       |
| onStatusChange | `(status: string) => void`             | No   | -          | ステータス変更コールバック |
| height         | `string \| number`                     | No   | "auto"     | コンポーネント高さ         |
| className      | `string`                               | No   | -          | カスタムクラス名           |

### ステータス表示

| ステータス | 日本語表示 | 色    |
| ---------- | ---------- | ----- |
| idle       | 待機中     | gray  |
| running    | 実行中     | blue  |
| completed  | 完了       | green |
| error      | エラー     | red   |
| aborted    | 中断       | red   |

---

## useSkillExecution Hook

| 項目     | 仕様                                                   |
| -------- | ------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` |
| 責務     | スキル実行状態管理、IPC通信                            |

### 戻り値

| プロパティ  | 型                                      | 説明                     |
| ----------- | --------------------------------------- | ------------------------ |
| messages    | `SkillStreamMessage[]`                  | ストリームメッセージ一覧 |
| status      | `ExecutionStatus`                       | 現在のステータス         |
| executionId | `string \| null`                        | 現在の実行ID             |
| error       | `SkillExecutionError \| null`           | エラー情報               |
| isAborting  | `boolean`                               | 中断処理中フラグ         |
| execute     | `(prompt: string) => Promise<Response>` | 実行開始関数             |
| abort       | `() => Promise<void>`                   | 中断関数                 |
| reset       | `() => void`                            | リセット関数             |

---

## IPC API（Preload）

SkillAPIは以下のメソッドを提供する。

| メソッド           | 引数                                            | 戻り値                             | 説明                     |
| ------------------ | ----------------------------------------------- | ---------------------------------- | ------------------------ |
| execute            | request: SkillExecutionRequest                  | `Promise<SkillExecutionResponse>`  | スキル実行開始           |
| onStream           | callback: (message: SkillStreamMessage) => void | `() => void`（クリーンアップ関数） | ストリームメッセージ購読 |
| abort              | executionId: string                             | `Promise<boolean>`                 | 実行中断                 |
| getExecutionStatus | executionId: string                             | `Promise<ExecutionInfo \| null>`   | ステータス照会           |

### IPCチャンネル

| チャンネル       | 方向            | 用途                 |
| ---------------- | --------------- | -------------------- |
| skill:execute    | Renderer → Main | 実行開始             |
| skill:stream     | Main → Renderer | メッセージストリーム |
| skill:abort      | Renderer → Main | 実行中断             |
| skill:get-status | Renderer → Main | ステータス照会       |

---

## UX改善機能（TASK-3-2-A）

SkillStreamDisplayコンポーネントのユーザー体験を向上させる3つの機能。

### R1: LoadingSpinner（ローディングアニメーション）

| 項目             | 仕様                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 表示条件         | `status === "running"`                                                                            |
| 表示位置         | StreamHeader内、StatusBadgeの隣                                                                   |
| スタイル         | 16x16px、青色（#3B82F6）、border-2、1秒周期回転                                                   |
| アニメーション   | Tailwind CSS `animate-spin`                                                                       |
| アクセシビリティ | `role="status"` `aria-label="実行中"`                                                             |
| data-testid      | `loading-spinner-container`, `loading-spinner`                                                    |
| CSSクラス        | `loading-spinner w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin` |

### R2: MessageTimestamp（タイムスタンプ表示）

| 項目           | 仕様                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| 表示位置       | MessageItem内、message-contentの右側                                           |
| フォーマット   | 相対時刻（「X秒前」「X分前」「X時間前」「X日前」）                             |
| スタイル       | `text-xs text-gray-400 flex-shrink-0`                                          |
| 依存関数       | `formatRelativeTime`                                                           |
| Props          | `timestamp: number`, `messageId: string`                                       |
| HTML要素       | `<time dateTime="ISO形式">相対時刻</time>`                                     |
| ユーティリティ | `formatRelativeTime(timestamp: number, locale?: string, now?: number): string` |
| ファイル       | `apps/desktop/src/renderer/utils/formatTime.ts`                                |
| i18n対応       | TASK-3-2-Bで追加（日英2言語、詳細は下記i18n対応セクション参照）                |

**表示形式**

| 経過時間  | 表示     |
| --------- | -------- |
| 0秒       | たった今 |
| 1〜59秒   | X秒前    |
| 1〜59分   | X分前    |
| 1〜23時間 | X時間前  |
| 1日以上   | X日前    |

**エッジケース処理**: null、undefined、NaN、負数の場合は空文字列を返す

### R3: CopyButton（クリップボードコピー）

| 項目                   | 仕様                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| 表示条件               | Clipboard API対応時のみ（非対応時は `null` を返す）                                     |
| 表示位置               | MessageItem内、ホバー時に表示                                                           |
| スタイル               | `opacity-0 group-hover:opacity-100 transition-opacity`                                  |
| API                    | `navigator.clipboard.writeText(content)`                                                |
| 状態管理               | `copiedMessageId: string \| null`                                                       |
| フィードバック表示時間 | 2秒                                                                                     |
| ボタンアイコン         | 通常: 📋、コピー後: ✓                                                                   |
| フィードバックテキスト | "コピーしました"                                                                        |
| キーボード操作         | `tabIndex={0}`, Enter/Space対応                                                         |
| アクセシビリティ       | `aria-label="メッセージをコピー"`, `role="status" aria-live="polite"`（フィードバック） |
| Props                  | `content: string`, `messageId: string`                                                  |
| エラーハンドリング     | コピー失敗時は `console.error` でログ出力                                               |

**コピーボタンCSS**: `copy-button ml-2 p-1 text-gray-400 hover:text-gray-600 rounded`

**フィードバックCSS**: `copy-feedback ml-2 text-xs text-green-600`（role="status", aria-live="polite"）

### MessageItem 内部構造

| 要素                 | 位置     | 説明                             |
| -------------------- | -------- | -------------------------------- |
| アバター/アイコン    | 左端     | roleに応じたアイコン表示         |
| メッセージ内容       | 中央     | テキストコンテンツ               |
| タイムスタンプ       | 右側     | formatRelativeTimeによる相対時刻 |
| コピーボタン         | 右端     | クリップボードコピー機能         |
| コピーフィードバック | ボタン隣 | コピー成功時に2秒間表示          |

### テスト品質（TASK-3-2-A）

| ファイル                    | テスト数 | カバレッジ |
| --------------------------- | -------- | ---------- |
| formatTime.test.ts          | 25       | 100%       |
| SkillStreamDisplay.test.tsx | 63       | 96.9%      |
| 合計                        | 88       | -          |

---

## タイムスタンプ自動更新機能（TASK-3-2-C）

SkillStreamDisplayのMessageTimestampコンポーネントの相対時刻表示を定期的に自動更新し、常に正確な経過時間を表示する機能。

### 概要

| 項目     | 仕様                                                     |
| -------- | -------------------------------------------------------- |
| 目的     | 相対時刻（「X秒前」「X分前」）を自動更新し常に正確に表示 |
| 対象     | MessageTimestampコンポーネント                           |
| トリガー | TimestampContextの値変更                                 |
| 最適化   | 経過時間に応じた動的更新間隔、ページ非表示時の更新停止   |

### コンポーネント構成

| コンポーネント    | 親                 | 責務                 |
| ----------------- | ------------------ | -------------------- |
| TimestampProvider | SkillStreamDisplay | 現在時刻を管理・配信 |
| MessageList       | TimestampProvider  | メッセージ一覧表示   |
| MessageItem       | MessageList        | 個別メッセージ表示   |
| MessageTimestamp  | MessageItem        | Contextから時刻取得  |

### TimestampProvider

| 項目       | 仕様                                                      |
| ---------- | --------------------------------------------------------- |
| ファイル   | `apps/desktop/src/renderer/contexts/TimestampContext.tsx` |
| 責務       | 現在時刻を子コンポーネントに配信                          |
| Props      | `children: ReactNode`, `updateInterval?: number`          |
| デフォルト | updateInterval = 1000（1秒）                              |

**エクスポート**

| エクスポート        | 型        | 説明             |
| ------------------- | --------- | ---------------- |
| TimestampProvider   | Component | Context Provider |
| useTimestampContext | Hook      | 現在時刻を取得   |

### useInterval Hook

| 項目     | 仕様                                             |
| -------- | ------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/hooks/useInterval.ts` |
| 責務     | 動的な間隔でコールバックを実行                   |
| 引数     | `callback: () => void`, `delay: number \| null`  |
| 戻り値   | `void`                                           |

**特徴**

| 特徴                 | 説明                                   |
| -------------------- | -------------------------------------- |
| 動的間隔対応         | `delay`が`null`の場合はタイマー停止    |
| コールバック参照維持 | `useRef`で参照維持、不要な再設定を防止 |
| クリーンアップ       | `useEffect`でタイマーを確実に解放      |

### usePageVisibility Hook

| 項目     | 仕様                                                   |
| -------- | ------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/hooks/usePageVisibility.ts` |
| 責務     | ページの可視状態を監視                                 |
| 引数     | なし                                                   |
| 戻り値   | `boolean` (true=表示中, false=非表示)                  |

**特徴**

| 特徴           | 説明                                      |
| -------------- | ----------------------------------------- |
| イベント監視   | `document.visibilitychange`イベントを監視 |
| SSR対応        | `typeof document === "undefined"`チェック |
| クリーンアップ | イベントリスナーを確実に解除              |

### UPDATE_INTERVALS 定数

| 定数名                  | 値      | 用途            |
| ----------------------- | ------- | --------------- |
| UPDATE_INTERVALS.SECOND | 1000    | 1秒（ミリ秒）   |
| UPDATE_INTERVALS.MINUTE | 60000   | 1分（ミリ秒）   |
| UPDATE_INTERVALS.HOUR   | 3600000 | 1時間（ミリ秒） |

### 更新間隔計算

| 関数                       | 説明                                       |
| -------------------------- | ------------------------------------------ |
| calculateUpdateInterval    | 単一タイムスタンプから最適な更新間隔を計算 |
| calculateMinUpdateInterval | 複数タイムスタンプから最小更新間隔を計算   |

**更新間隔ロジック**

| 経過時間   | 更新間隔  |
| ---------- | --------- |
| 1時間以上  | 1時間ごと |
| 1分〜1時間 | 1分ごと   |
| 1分未満    | 1秒ごと   |

### データフロー

| ステップ | 処理                                    |
| -------- | --------------------------------------- |
| 1        | setInterval tick発火                    |
| 2        | setCurrentTime(Date.now())でContext更新 |
| 3        | TimestampContext value変更              |
| 4        | 全MessageTimestamp再レンダー            |
| 5        | formatRelativeTime再計算                |

### パフォーマンス最適化

| 最適化ポイント | 実装                              |
| -------------- | --------------------------------- |
| 単一タイマー   | TimestampProvider で1つのみ       |
| バッチ更新     | Context経由で全コンポーネント更新 |
| メモ化         | React.memoでMessageTimestamp      |
| 非表示時停止   | usePageVisibilityでタイマー制御   |

### ファイル配置（TASK-3-2-C）

| ファイル              | パス                                                      |
| --------------------- | --------------------------------------------------------- |
| TimestampContext.tsx  | `apps/desktop/src/renderer/contexts/TimestampContext.tsx` |
| useInterval.ts        | `apps/desktop/src/renderer/hooks/useInterval.ts`          |
| usePageVisibility.ts  | `apps/desktop/src/renderer/hooks/usePageVisibility.ts`    |
| formatTime.ts（更新） | `apps/desktop/src/renderer/utils/formatTime.ts`           |

### テスト品質（TASK-3-2-C）

| ファイル                  | カバレッジ |
| ------------------------- | ---------- |
| useInterval.test.ts       | 100%       |
| usePageVisibility.test.ts | 100%       |
| TimestampContext.test.tsx | 100%       |
| formatTime.test.ts        | 100%       |

---

## i18n対応（TASK-3-2-B）

SkillStreamDisplayコンポーネントの国際化対応。formatRelativeTime関数へのlocaleパラメータ追加により、日英2言語での相対時刻表示を実現。

### 対応言語

| 言語コード | 言語名 | 備考       |
| ---------- | ------ | ---------- |
| ja         | 日本語 | デフォルト |
| en         | 英語   | 複数形対応 |

### formatRelativeTime 関数仕様

| 項目             | 仕様                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| 関数シグネチャ   | `formatRelativeTime(timestamp: number, locale?: string, now?: number): string` |
| localeパラメータ | "ja" \| "en"、デフォルト: "ja"                                                 |
| フォールバック   | 未対応ロケールは "ja" にフォールバック                                         |
| ファイル         | `apps/desktop/src/renderer/utils/formatTime.ts`                                |

### 翻訳テーブル

| 日本語   | 英語（単数） | 英語（複数）  |
| -------- | ------------ | ------------- |
| たった今 | Just now     | Just now      |
| X秒前    | X second ago | X seconds ago |
| X分前    | X minute ago | X minutes ago |
| X時間前  | X hour ago   | X hours ago   |
| X日前    | X day ago    | X days ago    |

### 実装アプローチ

| 項目           | 選択                              |
| -------------- | --------------------------------- |
| 翻訳ライブラリ | 不使用（独自翻訳テーブル）        |
| 型定義         | SupportedLocale型（"ja" \| "en"） |
| 複数形対応     | 英語のみ count !== 1 で分岐       |

### テスト品質（TASK-3-2-B）

| ファイル                                     | テスト数 | カバレッジ |
| -------------------------------------------- | -------- | ---------- |
| formatTime.test.ts                           | 42       | 100%       |
| SkillStreamDisplay.i18n.integration.test.tsx | 32       | -          |
| 合計                                         | 74       | 100%       |

---

## ChatPanel統合 SkillStreamingView（TASK-7D）

### 概要

ChatPanel統合により、SkillStreamingView コンポーネントを新規実装した。既存の SkillStreamDisplay とは別に、ChatPanel 内でスキル実行結果をストリーミング表示するための軽量コンポーネントである。

### コンポーネント構成

| コンポーネント         | レベル    | 役割                           |
| ---------------------- | --------- | ------------------------------ |
| SkillStreamingView     | organisms | ストリーミング表示コンテナ     |
| StatusBadge            | atoms     | 実行ステータスバッジ表示       |
| StreamMessageItem      | molecules | メッセージアイテム表示         |
| ToolExecutionHistory   | molecules | ツール実行履歴（折りたたみ）   |

### Props

| Prop       | 型                               | 説明                   |
| ---------- | -------------------------------- | ---------------------- |
| skillName  | `string`                         | 実行中のスキル名       |
| messages   | `SkillStreamMessage[]`           | ストリーミングメッセージ |
| status     | `SkillExecutionStatus \| null`   | 実行ステータス         |

### ステータスバッジマッピング

| ステータス          | 色          | ラベル     |
| ------------------- | ----------- | ---------- |
| running             | bg-blue-500 | 実行中...  |
| permission_pending  | bg-yellow-500 | 権限確認  |
| completed           | bg-green-500 | 完了      |
| cancelled           | bg-gray-500 | キャンセル |
| error               | bg-red-500  | エラー     |
| idle                | -           | 非表示     |

### ChatPanel統合パターン

| 統合コンポーネント   | 統合方式               | 条件                              |
| -------------------- | ---------------------- | --------------------------------- |
| SkillSelector        | 直接レンダー           | 常時表示                          |
| SkillStreamingView   | 条件付きレンダー       | `isExecuting && selectedSkillName` |
| SkillImportDialog    | ローカルstate制御      | `importDialogSkill !== null`      |
| PermissionDialog     | Store-directパターン   | 常時マウント                      |

### テスト品質（TASK-7D）

| ファイル                     | テスト数 | Line   | Branch | Function |
| ---------------------------- | -------- | ------ | ------ | -------- |
| SkillStreamingView.test.tsx  | 33       | 99.3%  | 93.75% | 100%     |
| ChatPanel.test.tsx           | 15       | 100%   | 100%   | 100%     |
| 合計                         | 48       | -      | -      | -        |

### 実装ファイル

| ファイル                                             | 行数 |
| ---------------------------------------------------- | ---- |
| `components/skill/SkillStreamingView.tsx`            | 252  |
| `components/chat/ChatPanel.tsx`                      | 131  |
| `components/skill/index.ts`                          | 7    |

---

## 関連ドキュメント

| ドキュメント                  | パス                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| TASK-3-2-B i18n実装ガイド     | `docs/30-workflows/TASK-3-2-B-skill-stream-i18n/outputs/phase-12/implementation-guide.md` |
| TASK-3-2-A UX改善成果物       | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/`                              |
| TASK-3-2-C タイムスタンプ更新 | `docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/`                                      |
| TASK-7D ChatPanel統合         | `docs/30-workflows/TASK-7D-chat-panel-integration/`                                       |
| 親ドキュメント                | [ui-ux-feature-components.md](./ui-ux-feature-components.md)                              |

---

## 変更履歴

| Version   | Date       | Changes                                                                       |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| **1.1.0** | 2026-01-30 | TASK-7D完了: ChatPanel統合SkillStreamingView仕様追加                          |
| **1.0.0** | 2026-01-28 | 初版作成（ui-ux-feature-components.mdより分割）                               |
|           |            | TASK-3-2/3-2-A/3-2-B/3-2-C仕様を統合、コンポーネント階層・IPC・Hook・i18n対応 |
