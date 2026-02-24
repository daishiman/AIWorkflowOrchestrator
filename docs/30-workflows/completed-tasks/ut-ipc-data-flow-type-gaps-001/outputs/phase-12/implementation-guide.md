# UT-IPC-DATA-FLOW-TYPE-GAPS-001 実装ガイド

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| 作成日     | 2026-02-24                     |
| タスク種別 | 仕様書修正のみ                 |

---

## Part 1: 概念的説明（初学者・非技術者向け）

### この修正は何をしたの？

AIWorkflowOrchestrator アプリケーションは、「バックエンド（裏方）」と「フロントエンド（画面）」の2つの部分で動いています。この2つの部分が情報をやり取りする時に、「型」（情報の形式）がズレていた問題が6つ見つかりました。今回の修正は、これらの「型のズレ」を仕様書（設計図）上で解消したものです。

### 6つの修正を日常の例えで説明

#### Gap 1: 日付データの形式統一（Date → ISO 8601 文字列）

**日常の例え**: 手紙に日付を書く時、コンピュータの中では「日付オブジェクト」として扱いますが、手紙に書く時は「2026年2月24日」という文字列に変換します。この「いつ文字列に変換するか」「どの形式で書くか」を全ての設計図で統一しました。

**修正内容**: 14個の日付フィールド全てに `string; // ISO 8601` という注記を追加し、変換タイミングと形式を明確にしました。

#### Gap 2: デバッグ状態に「待機中」を追加（idle 状態）

**日常の例え**: 信号機に「消灯」状態を追加するようなものです。赤・青・黄の3色だけでなく、「まだ電源が入っていない」状態が必要でした。デバッグ機能にも「まだ始まっていない（idle）」状態を追加しました。

**修正内容**: `DebugSession.status` に `"idle"` を追加し、5値（idle/running/paused/completed/error）に統一しました。

#### Gap 3: エクスポート機能の引数を明確化（onExport）

**日常の例え**: 荷物の発送伝票に「何を」「どこに」「どの形式で」送るかを全部書くようなものです。以前は情報が不足していましたが、`docId`（何を）、`format`（どの形式で）、`outputPath`（どこに）を明確にしました。

**修正内容**: `onExport` コールバックに `docId`, `ExportFormat`, `outputPath` の3つの引数を定義しました。

#### Gap 4: エクスポート結果の画面への伝え方（ExportResult 変換）

**日常の例え**: レストランの厨房からの「完成しました」「失敗しました」という報告を、ウェイターがお客様向けに「お待たせしました」「申し訳ございません、もう一度お作りしましょうか？」と翻訳するようなものです。

**修正内容**: `ExportResult` の `success`/`error` 分岐ロジックと、リトライ条件を仕様書に記載しました。

#### Gap 5: イベント受信の登録・解除パターン（safeOn）

**日常の例え**: 教室で先生の話を聞く時、入室時に耳を傾け、退室時に聞くのをやめます。もし2回入室しても2重に聞いてしまわないよう、「すでに聞いているか」をチェックします。

**修正内容**: `useEffect` + `cleanup` 関数によるリスナー管理パターンと、React StrictMode での二重実行対策を記載しました。

#### Gap 6: 引数のまとめ方（positional → object 形式）

**日常の例え**: 注文票に「名前」「品物」「数量」をまとめて書くようにしました。以前はバラバラに口頭で伝えていたため、順番を間違えるリスクがありました。

**修正内容**: 6つの IPC ハンドラ全てで、引数をオブジェクト形式に統一し、Args 型定義を追加しました。

---

## Part 2: 技術者向け詳細

### 1. Date型のIPC境界での型変換パターン

#### 問題の本質

Electron の IPC（Inter-Process Communication）では、Main Process と Renderer Process 間のデータ転送に Structured Clone Algorithm が使用される。`Date` オブジェクトは Structured Clone でシリアライズ可能だが、`contextBridge` を通過する際の挙動が不定であるため、明示的な文字列変換が必要。

#### 解決パターン

```typescript
// Main Process（ハンドラ戻り値）
return {
  createdAt: internalDate.toISOString(), // Date → string
  updatedAt: internalDate.toISOString(),
};

// Renderer Process（受信側）
const date = new Date(isoString); // string → Date（必要時のみ復元）
```

#### 適用範囲

14フィールド（4ファイル）:

- task-9f（SkillShare）: 5フィールド
- task-9g（SkillSchedule）: 4フィールド（lastRun, nextRun 含む nullable）
- task-9h（SkillDebug）: 3フィールド
- task-9j（SkillAnalytics）: 6フィールド（SkillUsageSummary.lastUsed 含む）

nullable フィールドは `string | null` 型で定義。

### 2. DebugSession.status の拡張と影響範囲

#### 追加された値

```typescript
type DebugSessionStatus = "idle" | "running" | "paused" | "completed" | "error";
```

`idle` は「デバッグセッション未開始」状態を表現する。バックエンド（task-9h 行63）とフロントエンド（05B 行300）の両方で同一の5値セットとして定義。

#### switch 文への影響

`idle` 状態の追加により、`switch (session.status)` で網羅性チェック（TypeScript の exhaustive check）を使用している場合、`case "idle"` の追加が必要。

### 3. docId ベースのデータフロー設計

#### 設計判断の理由

`onExport` コールバックでは、ドキュメント全体をパラメータとして渡すのではなく、`docId` のみを渡す設計を採用。理由: IPC を通じてドキュメント全文を転送するとパフォーマンスコストが大きいため、Main Process 側で `docId` からドキュメントを取得する方式が効率的。

#### データフロー全体像

```
Renderer                 Preload                    Main
   |                        |                         |
   |-- onExport(docId, ---->|                         |
   |   format, outputPath)  |                         |
   |                        |-- safeInvoke(           |
   |                        |   SKILL_DOCS_EXPORT,    |
   |                        |   {docId,format,path})  |
   |                        |------------------------>|
   |                        |                         |-- docId → GeneratedDoc
   |                        |                         |-- export to file
   |                        |                         |-- return ExportResult
   |                        |<------------------------|
   |<-- ExportResult -------|                         |
   |                        |                         |
   |-- handleExportResult() |                         |
   |   success → close      |                         |
   |   failure → show error |                         |
```

### 4. safeOn 購読パターンと P5 対策

#### パターン

```typescript
useEffect(() => {
  // P5対策: safeOnの戻り値をcleanup関数として使用
  const cleanup = window.electronAPI.safeOn(
    IPC_CHANNELS.SKILL_DEBUG_EVENT,
    (event: DebugEvent) => {
      switch (event.type) {
        case "step":
        case "breakpoint_hit":
        case "variable_change":
        case "error":
        case "completed":
          // 各イベントタイプのハンドリング
          break;
      }
    },
  );

  // React StrictMode: 開発環境ではuseEffectが2回実行される
  // → cleanup関数が正しく動作すれば、2回目の登録前に1回目が解除される
  return () => cleanup();
}, []); // 空配列: マウント時に1回だけ登録
```

#### P5 対策のポイント

1. `useEffect` の `return` で `cleanup()` を呼び出し、unmount 時にリスナーを解除
2. 依存配列を空 `[]` にして、マウント時1回のみ登録
3. React StrictMode では useEffect が2回実行されるが、1回目の cleanup が先に実行されるため二重登録を防止
4. `IPC_CHANNELS` 定数を使用（ハードコード文字列禁止 — P27 対策）
