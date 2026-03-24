# Implementation Guide: SafetyGate Preload API (UT-06-003-PRELOAD-API-IMPL)

## Part 1: 概念説明

### SafetyGate Preload API とは？

SafetyGate Preload API は「お店（Renderer）と工場（Main Process）の間にある受付窓口（Preload）に、新しいサービス窓口を追加する」仕組みです。

- **お店（Renderer）**: ユーザーが「このスキルは安全？」と質問する場所
- **受付窓口（Preload）**: 質問を工場に安全に取り次ぐ場所。ここに `evaluateSafety` 窓口を新設
- **工場（Main Process）**: 実際にスキルの安全性をチェックして結果を返す場所

お店のお客さんが直接工場に入ると危険なので、必ず受付窓口を通す仕組みになっています。これが Electron の「contextBridge」の役割です。

### なぜ直接呼び出さないの？

Web ブラウザの中で動くコード（Renderer）から、コンピュータのファイルやネットワークに直接アクセスさせると、悪意のあるコードが何でもできてしまいます。そこで「受付窓口（Preload）」が間に入り、許可されたリクエストだけを工場に渡します。

---

## Part 2: 開発者向け実装詳細

### 変更ファイル

| ファイル                                                              | 変更内容                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                               | `SkillAPI` interface + `skillAPI` object に `evaluateSafety` メソッド追加 |
| `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts` | Preload テスト（T-1〜T-6）新規作成                                        |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts`                | メソッド数カウント 50→51 に更新                                           |
| `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`    | メソッドリストに `evaluateSafety` 追加、カウント 50→51                    |

### IPC 4層の完成

| Layer               | 状態               | ファイル                         |
| ------------------- | ------------------ | -------------------------------- |
| 1. IPC Channel 定数 | 既存               | `preload/channels.ts:371`        |
| 2. Allowlist 登録   | 既存               | `preload/channels.ts:647`        |
| 3. Main Handler     | 既存               | `main/ipc/safetyGateHandlers.ts` |
| 4. Preload API      | **本タスクで追加** | `preload/skill-api.ts`           |

### 設計判断

- **`safeInvoke` を使用**（`safeInvokeUnwrap` ではない）
  - 理由: SafetyGate の `success: false` は正常な業務フロー（unsafe 判定）の一部であり、Renderer 側で `success`/`error` を個別ハンドリングする必要がある
- **`@repo/shared` から `SafetyGateResult` を import**（P23準拠: Preload 独自型禁止）
- **`IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数使用**（P27準拠: ハードコード文字列禁止）

### テストケース

| ID  | テスト内容                                 | カテゴリ         |
| --- | ------------------------------------------ | ---------------- |
| T-1 | SKILL_EVALUATE_SAFETY チャンネルで呼ばれる | 正常系           |
| T-2 | skillName 引数が正しく渡される             | 正常系           |
| T-3 | ラップ形式がそのまま返される               | 正常系           |
| T-4 | ホワイトリストに含まれる                   | セキュリティ     |
| T-5 | skillAPI に evaluateSafety が存在する      | インターフェース |
| T-6 | エラーが伝搬する                           | 異常系           |
