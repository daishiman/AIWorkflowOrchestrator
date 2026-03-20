# Phase 6: テスト拡充 成果物

## カバレッジ計測結果（Phase 5 終了時点）

| ファイル           | Line   | Branch | Function |
| ------------------ | ------ | ------ | -------- |
| chatSlice.ts       | 65.35% | 92.3%  | 64%      |
| ChatView/index.tsx | 80.95% | 40%    | 66.66%   |

## 分析

### chatSlice.ts

- Branch Coverage 92.3% は優秀。chatError 関連の分岐は全カバー済み
- Line / Function が低いのはストリーミング系アクション（startStreaming, appendStreamChunk 等）が今回のタスクスコープ外のため
- タスクスコープ内（chatError 追加・clearChatError・callLLMAPI エラー伝搬）の分岐は十分にカバーされている

### ChatView/index.tsx

- Branch 40% が低い。主な未カバー箇所は以下の通り
  - `getErrorMessage` の全エラーコードパス（RATE_LIMIT_EXCEEDED / NETWORK_ERROR / API_KEY_MISSING 等）
  - システムプロンプトパネルの表示 / 非表示分岐
  - chatError が null に戻った際のバナー消去パス
- Line Coverage 80.95% は最低基準（80%）を達成済み

## 追加テストケース

### ChatView 追加テスト

| ID   | テスト名                                           | 対象                   | カバーする分岐              |
| ---- | -------------------------------------------------- | ---------------------- | --------------------------- |
| V-7  | 5秒後に clearChatError が自動呼び出しされる        | タイマー自動消去       | setTimeout コールバック分岐 |
| V-11 | chatError が null に戻った時にバナーが消去される   | 再レンダリング         | chatError === null 分岐     |
| V-12 | RATE_LIMIT_EXCEEDED で正しいメッセージが表示される | エラーコードマッピング | getErrorMessage 分岐        |
| V-13 | NETWORK_ERROR で正しいメッセージが表示される       | エラーコードマッピング | getErrorMessage 分岐        |
| V-14 | API_KEY_MISSING で正しいメッセージが表示される     | エラーコードマッピング | getErrorMessage 分岐        |
| V-15 | 閉じるボタンが type="button" 属性を持つ            | アクセシビリティ       | ボタン属性確認              |

## Phase 6 追加後の期待カバレッジ

| ファイル           | Line（推定）         | Branch（推定）    | Function（推定）     |
| ------------------ | -------------------- | ----------------- | -------------------- |
| chatSlice.ts       | 65% 前後（変化なし） | 92.3%（変化なし） | 64% 前後（変化なし） |
| ChatView/index.tsx | 85%+                 | 70%+              | 80%+                 |

## 判定

Phase 6 テスト追加後、ChatView/index.tsx の Branch Coverage が推奨基準（70%）を超える見込み。
chatSlice.ts のスコープ外低カバレッジはストリーミング系機能タスクで別途対応予定。
Phase 7（カバレッジ確認）へ進む。
