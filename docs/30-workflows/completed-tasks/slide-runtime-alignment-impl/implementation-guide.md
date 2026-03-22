# 実装ガイド: slide-runtime-alignment-impl

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| タスク | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001 |
| Issue  | #1363                                |
| 完了日 | 2026-03-22                           |

---

# Part 1: 概念説明（技術的な前提知識なし）

## 1. スライド機能って何をしてるの？

AIWorkflowOrchestrator のスライド機能は「AI にスライドを作ってもらう機能」です。

これを **レストランの厨房** に例えてみましょう。

- **お客さん（ユーザー）** が「こんなスライドを作りたい」と注文する
- **フロアスタッフ（画面側 = Renderer）** が注文を受け取る
- **厨房（裏方 = Main Process）** が実際にスライドを作る

スライドを作る工程には「ステップ」があります。料理のレシピのようなものです:

1. **hearing（ヒアリング）** --- お客さんの要望を詳しく聞くステップ
2. **structure（構成）** --- スライドの骨組み（何枚目に何を書くか）を決めるステップ
3. **html（作成）** --- 実際のスライドを作るステップ
4. **modifier（修正）** --- 「ここを直して」と言われた箇所を修正するステップ

それぞれのステップで AI が働いて、最終的に1つのスライドが完成します。

## 2. IPC って何？（フロアスタッフと厨房の伝言システム）

IPC は「Inter-Process Communication（プロセス間通信）」の略ですが、難しく考えなくて大丈夫です。

レストランで例えると:

- **お客さん** が「パスタ1つ」と注文する
- **フロアスタッフ** が **注文票** に書く --- これが IPC のメッセージ
- **注文票** を **厨房の窓口** に渡す --- これが Preload（橋渡し役）
- **厨房のシェフ** が注文票を見て調理する --- これが Main Process

ポイントは、フロアスタッフが直接厨房に入ることはできないということです。必ず「窓口」を通す必要があります。これはセキュリティのためです（もしお客さんが厨房に直接入れたら、他のお客さんの料理に触ったり、火を使ったりして危険ですよね）。

今回の修正では、この「注文票の書き方」を統一しました。以前は古い書き方と新しい書き方が混ざっていたので、全部を正しいルールに揃えたのです。

### 2種類の注文票

- **invoke（問い合わせ型）**: 「パスタ1つください」→「はい、できました」のように、答えが返ってくる。画面側から厨房に頼む方向（6種類）。
- **push（通知型）**: 「お客様、お料理の進捗は50%です」のように、厨房から画面に自動的にお知らせが届く。厨房から画面への方向（6種類）。

合計 12 種類の注文票があります。

## 3. RuntimeResolver って何？（配送方法の自動選択システム）

RuntimeResolver は「この注文を自分で作るか、別のお店に頼むか」を自動で判断するシステムです。

- **integrated（自分で作る）**: 自分の厨房で調理する。普段はこちら。
- **handoff（別のお店に頼む）**: 「今日はこの料理は隣のお店の方が得意だから、お願いしよう」という判断。この場合は「この宅配業者に渡してください。住所はここです」という **指示書（guidance）** を返します。

指示書（HandoffGuidance）には3つの情報が入っています:

- **command**: 「ターミナルでこのコマンドを実行してね」という実行手順
- **contextSummary**: 「こんな内容のスライドを作る途中だよ」という文脈の要約
- **reason**: 「なぜ別のお店に頼んだか」の理由

## 4. 今回の修正で何が変わったか

以前は以下の問題がありました:

1. **伝言票の書き方がバラバラだった（D1, D2）** --- 古い書き方（legacy）と新しい書き方（canonical）が混ざっていた。今回、12種類全ての伝言票を新しいルールに統一しました。

2. **厨房への扉が開いていなかった（D1）** --- IPC ハンドラが Main Process に接続されておらず、画面からの注文が厨房に届かない状態でした。接続を追加しました。

3. **セキュリティチェックがなかった（D5）** --- 全ての窓口に `validateIpcSender`（身分証チェック）を設置しました。知らない人が注文を出そうとしたら拒否します。

4. **配送方法を直接決めていた（D3）** --- 以前は AI（SDK）を直接呼んでいましたが、今回から RuntimeResolver を通すようにしました。将来的に「別のお店に頼む」選択肢が自動で使えるようになります。

5. **修正担当が独立していた（D4）** --- modifier-skill.ts が独自に動いていたのを、skill-executor.ts に統合しました。料理のレシピが1つのファイルにまとまりました。

6. **画面側の記録帳が足りなかった（D6）** --- slideSlice（画面側の状態管理）に、同期状態・エラー情報・handoff 情報など7項目の記録欄を追加しました。

---

# Part 2: 開発者向け実装詳細

## 1. 12チャネル定義テーブル

### invoke チャネル（Renderer → Main）: 6本

| チャネル             | 引数                                     | 戻り値                                    | バリデーション                              |
| -------------------- | ---------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| `slide:executePhase` | `phase: SkillPhase, projectPath: string` | `{ success, data: SkillExecutionResult }` | sender + P42(phase) + P42(path) + traversal |
| `slide:watch-start`  | `projectPath: string`                    | `{ success }`                             | sender + P42(path) + traversal              |
| `slide:watch-stop`   | `projectPath: string`                    | `{ success }`                             | sender + P42(path) + traversal              |
| `slide:sync-status`  | `projectPath: string`                    | `{ success, data: SyncStatus }`           | sender + P42(path) + traversal              |
| `slide:reverse-sync` | `projectPath: string`                    | `{ success }`                             | sender + P42(path) + traversal              |
| `slide:cancel`       | `projectPath: string`                    | `{ success }`                             | sender + P42(path) + traversal              |

### push チャネル（Main → Renderer）: 6本

| チャネル                    | ペイロード             | トリガー                      |
| --------------------------- | ---------------------- | ----------------------------- |
| `slide:sync-status-changed` | `SyncStatus`           | ファイル同期状態変更時        |
| `slide:sync-progress`       | `{ percent, message }` | 同期進捗更新時                |
| `slide:sync-error`          | `{ code, message }`    | 同期エラー発生時              |
| `slide:execution-progress`  | `number`               | AI 実行進捗更新時（0-100）    |
| `slide:structureChanged`    | `void`                 | スライド構造変更検知時        |
| `slide:watch-status`        | `boolean`              | ファイル監視のオン/オフ変更時 |

### チャネル名の変更マッピング

| Before（legacy）          | After（canonical）          | 変更種別 |
| ------------------------- | --------------------------- | -------- |
| `slide:startWatching`     | `slide:watch-start`         | rename   |
| `slide:stopWatching`      | `slide:watch-stop`          | rename   |
| `slide:getSyncStatus`     | `slide:sync-status`         | rename   |
| `slide:manualSync`        | `slide:reverse-sync`        | rename   |
| `slide:cancelExecution`   | `slide:cancel`              | rename   |
| `slide:executionProgress` | `slide:execution-progress`  | rename   |
| `slide:syncStatusChanged` | `slide:sync-status-changed` | rename   |
| (なし)                    | `slide:sync-progress`       | 新規     |
| (なし)                    | `slide:sync-error`          | 新規     |
| (なし)                    | `slide:watch-status`        | 新規     |

## 2. RuntimeResolver contract

```typescript
// RuntimeResolver.resolve() の戻り値
type RuntimeMode = "integrated" | "handoff";

// integrated: SDK を RuntimeResolver 経由で呼び出す
// handoff: terminal launcher 用の guidance を返す

// handoff 時の guidance（正本: src/types/handoff.ts から re-export）
interface HandoffGuidance {
  command: string; // terminal で実行するコマンド
  contextSummary: string; // コンテキスト要約
  reason: string; // handoff の理由
}

// SkillExecutionResult（handoff 拡張済み）
interface SkillExecutionResult {
  success: boolean;
  phase: SkillPhase;
  isHandoff?: boolean; // handoff の場合 true
  guidance?: HandoffGuidance; // handoff 時のみ存在
  error?: { code: string; message: string };
}
```

**分岐ロジック**:

```typescript
async function execute(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  const runtimeMode = await RuntimeResolver.resolve("slide", phase);

  if (runtimeMode === "integrated") {
    return executeIntegrated(phase, projectPath);
  } else {
    return {
      success: true,
      phase,
      isHandoff: true,
      guidance: buildHandoffGuidance(phase, projectPath),
    };
  }
}
```

## 3. validateSlideRequest パターン（3段バリデーション）

6本の invoke ハンドラ全てで以下の順序で検証する:

```typescript
// Step 1: 送信元ウィンドウの検証
validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});

// Step 2: P42 3段バリデーション
// (a) typeof チェック
if (typeof projectPath !== "string") {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "..." },
  };
}
// (b) 空文字列チェック
if (projectPath === "") {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "..." },
  };
}
// (c) トリム空文字列チェック
if (projectPath.trim() === "") {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "..." },
  };
}

// Step 3: パストラバーサル攻撃の防止
if (detectPathTraversal(projectPath)) {
  return {
    success: false,
    error: { code: "SECURITY_ERROR", message: "Invalid path" },
  };
}
```

**2バリアント設計**:

- `validateSlideRequestWithPath()`: projectPath を受け取るハンドラ用（executePhase, watch-start, sync-status, reverse-sync）
- `validateSlideSenderOnly()`: projectPath なしで sender のみ検証するハンドラ用（watch-stop, cancel）

## 4. Wave 実装順序と依存関係

```
Wave A: IPC 接続 + チャネル統一 + セキュリティ
  対象 drift: D1（IPC handler 未接続）, D2（チャネル名 legacy）, D5（validateIpcSender 未実装）
  主要変更:
    - ipc-handlers.ts のチャネル定数を canonical 12チャネルに rename
    - registerSlideIpcHandlers() を registerAllIpcHandlers() に接続
    - 全 invoke ハンドラに validateIpcSender + P42 + path guard を適用
    - preload/channels.ts の IPC_CHANNELS 定数を同期

Wave B: RuntimeResolver 統合
  対象 drift: D3（SDK 直接利用）, D4（modifier-skill 独立実装）
  依存: Wave A 完了後に着手
  主要変更:
    - skill-executor.ts に RuntimeResolver を DI
    - integrated/handoff 分岐ロジックの追加
    - modifier-skill.ts の buildModifierPrompt()/parseModifierResponse() を skill-executor.ts に統合
    - HandoffGuidance 型を src/types/handoff.ts に定義し re-export

Wave C: Store fields + legacy 廃止
  対象 drift: D6（slideSlice store fields 不足）
  依存: Wave B 完了後に着手
  主要変更:
    - slideSlice に 7 store fields を追加:
      - syncStatus: SyncStatus
      - syncProgress: { percent: number; message: string } | null
      - syncError: { code: string; message: string } | null
      - isWatching: boolean
      - executionProgress: number
      - isHandoff: boolean
      - handoffGuidance: HandoffGuidance | null
    - agent-client.ts の直接参照を除去
    - Preload listeners を canonical push チャネルに接続
```

## 5. 主要ファイルパス

| ファイル                                        | 役割                             |
| ----------------------------------------------- | -------------------------------- |
| `apps/desktop/src/main/slide/ipc-handlers.ts`   | IPC ハンドラ登録（invoke 6本）   |
| `apps/desktop/src/main/slide/skill-executor.ts` | RuntimeResolver 統合実行エンジン |
| `apps/desktop/src/main/ipc/index.ts`            | 全 IPC ハンドラの統合エントリ    |
| `apps/desktop/src/preload/channels.ts`          | チャネル定数（allowlist）        |
| `apps/desktop/src/renderer/store/slideSlice.ts` | Renderer 側状態管理（7 fields）  |
| `apps/desktop/src/types/handoff.ts`             | HandoffGuidance 型定義           |

## 6. エラーハンドリング

全ハンドラは以下の統一フォーマットで応答する:

```typescript
// 成功
{ success: true, data: <結果> }

// バリデーションエラー（リトライ不可）
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }

// セキュリティエラー（リトライ不可）
{ success: false, error: { code: "SECURITY_ERROR", message: "Invalid path" } }

// ビジネスロジックエラー
{ success: false, error: sanitizeError(error) }
```

`sanitizeError()` は内部情報（スタックトレース、ファイルパス）をマスクしてから Renderer に送る。

## 7. 設定・定数一覧

| 定数                    | 値/型                                              | 定義場所           |
| ----------------------- | -------------------------------------------------- | ------------------ |
| `SLIDE_INVOKE_CHANNELS` | 6本の invoke チャネル                              | `ipc-handlers.ts`  |
| `SLIDE_PUSH_CHANNELS`   | 6本の push チャネル                                | `ipc-handlers.ts`  |
| `SkillPhase`            | `"hearing" \| "structure" \| "html" \| "modifier"` | `types/`           |
| `HandoffGuidance`       | `{ command, contextSummary, reason }`              | `types/handoff.ts` |
