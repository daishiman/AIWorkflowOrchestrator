# Phase 7 カバレッジ確認計画

## メタ情報

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| Phase      | 7 - カバレッジ確認                           |
| タスク ID  | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001  |
| 作成日     | 2026-03-14                                   |
| 前提 Phase | Phase 6（テスト拡充）完了後に実施            |
| 成果物     | `outputs/phase-7/coverage-plan.md`（本文書） |

---

## 1. プロジェクト共通カバレッジ基準

`02-code-quality.md` で定義されたプロジェクト標準基準を下限として適用する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 2. コンポーネント別カバレッジ目標

本タスクで新規実装・修正するコンポーネントに対して、以下の目標値を設定する。

| コンポーネント              | 種別             | Line 目標      | Branch 目標    | Function 目標  | 備考                                                 |
| --------------------------- | ---------------- | -------------- | -------------- | -------------- | ---------------------------------------------------- |
| `handleSendWithContext`     | 修正（約 90 行） | 90%            | 70%            | 100%           | 中心的なハンドラ。分岐が複数あるため Branch 重点確認 |
| `RuntimeResolver`           | 新規（約 50 行） | 90%            | 80%            | 100%           | authMode × hasApiKey の全分岐を網羅する              |
| `TerminalHandoffBuilder`    | 新規（約 40 行） | 85%            | 70%            | 100%           | OS 別分岐の確認が必須                                |
| `ContextBuilder`（既実装）  | 変更なし         | 既存目標を維持 | 既存目標を維持 | 既存目標を維持 | 回帰テストで現状維持を確認                           |
| `ChatEditService`（既実装） | 変更なし         | 既存目標を維持 | 既存目標を維持 | 既存目標を維持 | 回帰テストで現状維持を確認                           |

> **注意**: `chatEditApi.ts` の変更（約 5 行）は contextBridge 公開部分であり、統合テストでのみ検証可能なため単体カバレッジ計測対象外とする（→ GAP-COV-05 参照）。

---

## 3. テストケース構成とカバレッジ貢献

### Phase 4 定義テストケース（39 件）

| カテゴリ                 | テスト ID      | 件数      | カバレッジへの主な貢献コンポーネント       |
| ------------------------ | -------------- | --------- | ------------------------------------------ |
| selection テスト         | TC-SEL-01〜06  | 6 件      | `handleSendWithContext`                    |
| send-with-context テスト | TC-SEND-01〜08 | 8 件      | `handleSendWithContext`, `RuntimeResolver` |
| terminal handoff テスト  | TC-HAND-01〜04 | 4 件      | `TerminalHandoffBuilder`                   |
| workspacePath 制約テスト | TC-WS-01〜06   | 6 件      | `handleSendWithContext`                    |
| エラーコード別テスト     | TC-ERR-01〜07  | 7 件      | `RuntimeResolver`, `handleSendWithContext` |
| contextBridge テスト     | TC-PREL-01〜03 | 3 件      | `chatEditApi.ts`（統合テスト）             |
| 回帰テスト               | TC-REG-01〜05  | 5 件      | `ContextBuilder`, `ChatEditService`        |
| **Phase 4 合計**         |                | **39 件** |                                            |

### Phase 6 追加テストケース（18 件）

| カテゴリ         | テスト ID      | 件数  | カバレッジへの主な貢献コンポーネント      |
| ---------------- | -------------- | ----- | ----------------------------------------- |
| edge case テスト | TC-EDGE-01〜18 | 18 件 | 全コンポーネント（GAP-COV-01〜04 の補完） |

### Phase 6 完了後合計: **57 件**

---

## 4. カバレッジ不足が予想される箇所（GAP 一覧）

| GAP-ID     | 箇所                                                             | 理由                                                                                                                                                                                | 対策テストケース                                                                                    |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GAP-COV-01 | `RuntimeResolver` の hybrid × API キー取得失敗フォールバック分岐 | hybrid モードで `hasApiKey` チェックが成功しても、実際の API キー取得が失敗した場合に terminal handoff へフォールバックする経路はエラーパスであり、通常の正常系テストでは通過しない | TC-EDGE-07〜09（hybrid 失敗系テスト）を Phase 6 で追加                                              |
| GAP-COV-02 | `TerminalHandoffBuilder` の OS 別 `terminalCommand` 生成ロジック | `process.platform` の値（`darwin` / `win32` / `linux`）によって生成コマンドが分岐するが、テスト実行環境は通常 1 OS のみのため、モックなしでは残り 2 分岐が未カバー                  | TC-EDGE-10〜12（`process.platform` モックによる OS 別テスト）                                       |
| GAP-COV-03 | `handleSendWithContext` の `contexts` 空配列処理                 | `contexts` が空配列で渡された場合の早期リターン処理は正常系テストでは通過しない                                                                                                     | TC-EDGE-01〜02（空配列・null コンテキストテスト）                                                   |
| GAP-COV-04 | `handleSendWithContext` の `workspacePath` 未指定スキップ        | `workspacePath` が未指定の場合にパス検証をスキップして処理を続行する分岐は、workspacePath 制約テスト（TC-WS-01〜06）が全て指定ありを前提とするため未カバー                          | TC-EDGE-03〜04（`workspacePath` 未指定での動作確認テスト）                                          |
| GAP-COV-05 | `chatEditApi.ts` の contextBridge 公開部分                       | contextBridge は Electron の Preload スクリプト内で動作するため、純粋な Vitest 単体テストではカバー不可。統合テスト（TC-PREL-01〜03）でのみ検証可能                                 | TC-PREL-01〜03 を Phase 4 で定義済み。単体 Line Coverage の計算対象から除外し、統合テストで担保する |

---

## 5. Branch Coverage の重点確認箇所

### 5-1. RuntimeResolver の条件分岐マトリクス

`RuntimeResolver` は `authMode` と `hasApiKey` の組み合わせで動作が決まる。全 5 分岐のうち 4 分岐（80%）以上をカバーする。

| 分岐 ID | authMode     | hasApiKey | 期待動作                          | 対応テストケース           |
| ------- | ------------ | --------- | --------------------------------- | -------------------------- |
| B-RT-01 | `integrated` | `true`    | integrated モードで処理           | TC-SEND-01, TC-SEND-02     |
| B-RT-02 | `integrated` | `false`   | エラー返却（API キー未設定）      | TC-ERR-01, TC-ERR-02       |
| B-RT-03 | `terminal`   | any       | terminal handoff モードで処理     | TC-HAND-01, TC-HAND-02     |
| B-RT-04 | `hybrid`     | `true`    | integrated を試みて成功           | TC-SEND-05, TC-SEND-06     |
| B-RT-05 | `hybrid`     | `false`   | terminal handoff にフォールバック | TC-EDGE-07（Phase 6 追加） |

**Branch Coverage 目標: 80%（= 5 分岐中 4 分岐以上カバー）**

### 5-2. handleSendWithContext の条件分岐

`handleSendWithContext` は複数の独立した条件分岐を持つ。全 8 分岐のうち 6 分岐（70%）以上をカバーする。

| 分岐 ID | 条件                                      | 期待動作                          | 対応テストケース               |
| ------- | ----------------------------------------- | --------------------------------- | ------------------------------ |
| B-HS-01 | `workspacePath` 指定あり                  | パス検証を実行                    | TC-WS-01〜04                   |
| B-HS-02 | `workspacePath` 未指定                    | パス検証をスキップ                | TC-EDGE-03〜04（Phase 6 追加） |
| B-HS-03 | `workspacePath` 外アクセス検出（true）    | エラー返却                        | TC-WS-05                       |
| B-HS-04 | `workspacePath` 外アクセス検出（false）   | 処理続行                          | TC-WS-01〜02                   |
| B-HS-05 | RuntimeResolver 結果: `integrated`        | integrated 処理実行               | TC-SEND-01〜04                 |
| B-HS-06 | RuntimeResolver 結果: `handoff`           | terminal handoff 実行             | TC-HAND-01〜04                 |
| B-HS-07 | RuntimeResolver 結果: `hybrid`            | integrated 優先・失敗時 handoff   | TC-SEND-05〜06, TC-EDGE-07     |
| B-HS-08 | integrated 失敗時の hybrid フォールバック | terminal handoff にフォールバック | TC-EDGE-08〜09（Phase 6 追加） |

**Branch Coverage 目標: 70%（= 8 分岐中 6 分岐以上カバー）**

---

## 6. カバレッジ計測方法

### 実行コマンド

```bash
# P40 に従い、必ず apps/desktop ディレクトリから実行すること
cd apps/desktop && pnpm vitest run --coverage \
  src/main/handlers/chatEditHandlers.ts \
  src/main/services/chat-edit/RuntimeResolver.ts \
  src/main/services/chat-edit/TerminalHandoffBuilder.ts
```

### 注意事項

- **P40 準拠**: プロジェクトルートから実行すると `apps/desktop/vitest.config.ts` の `environment` 設定と `setupFiles` が読み込まれず、`document is not defined` エラーが発生する。必ず `apps/desktop/` ディレクトリから実行する。
- **P41 準拠（v8 カバレッジプロバイダ）**: Vitest の v8 カバレッジプロバイダはインライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。`RuntimeResolver` や `TerminalHandoffBuilder` のオプションオブジェクト内コールバックが実行されないと Function Coverage が大幅に低下する可能性がある。セキュリティテストでコールバックの戻り値を明示的に検証すること。
- **chatEditApi.ts の除外**: contextBridge 公開部分は統合テスト（TC-PREL-01〜03）で担保するため、単体カバレッジ計測の対象ファイルから除外する。

### カバレッジレポートの確認方法

```bash
# HTML レポートを生成して確認（apps/desktop から実行）
cd apps/desktop && pnpm vitest run --coverage --reporter=html \
  src/main/handlers/chatEditHandlers.ts \
  src/main/services/chat-edit/RuntimeResolver.ts \
  src/main/services/chat-edit/TerminalHandoffBuilder.ts

# レポートは apps/desktop/coverage/ に出力される
open coverage/index.html
```

---

## 7. カバレッジ未達時の対応フロー

| 指標              | 未達条件                                                                  | 対応                                                                                                  |
| ----------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Line Coverage     | 各コンポーネントで 80% 未満                                               | **Phase 6 に戻る**。カバレッジレポートで未カバー行を特定し、不足テストケースを追加する                |
| Branch Coverage   | `RuntimeResolver` で 60% 未満、または `handleSendWithContext` で 60% 未満 | `RuntimeResolver` / `handleSendWithContext` の未カバー分岐を特定し、対応する TC-EDGE テストを追加する |
| Function Coverage | 各コンポーネントで 80% 未満                                               | カバレッジレポートで未テスト関数を洗い出し、最低 1 件以上のテストを追加する                           |

### 未達時の具体的な調査コマンド

```bash
# 未カバー行・分岐の特定（JSON レポートを利用）
cd apps/desktop && pnpm vitest run --coverage --reporter=json \
  src/main/handlers/chatEditHandlers.ts \
  src/main/services/chat-edit/RuntimeResolver.ts \
  src/main/services/chat-edit/TerminalHandoffBuilder.ts

# JSON レポートは apps/desktop/coverage/coverage-final.json に出力される
# 未カバー行は "s"（statements）、"b"（branches）、"f"（functions）セクションで 0 の箇所
```

---

## 8. 完了条件確認チェックリスト

Phase 7 完了の判定基準として、以下を全て確認する。

- [ ] `handleSendWithContext`: Line 90% 以上、Branch 70% 以上、Function 100% を達成している
- [ ] `RuntimeResolver`: Line 90% 以上、Branch 80% 以上、Function 100% を達成している
- [ ] `TerminalHandoffBuilder`: Line 85% 以上、Branch 70% 以上、Function 100% を達成している
- [ ] `ContextBuilder`（既実装）: カバレッジが Phase 6 実施前と同水準以上を維持している（回帰テストで確認）
- [ ] `ChatEditService`（既実装）: カバレッジが Phase 6 実施前と同水準以上を維持している（回帰テストで確認）
- [ ] GAP-COV-01〜04 について、対策テストケースが Phase 6 で追加済みであることを確認している
- [ ] GAP-COV-05（contextBridge）について、統合テスト TC-PREL-01〜03 が全件 PASS していることを確認している
- [ ] カバレッジ計測コマンドを `apps/desktop/` から実行した（P40 準拠）
- [ ] v8 カバレッジプロバイダのインライン関数カウントによる誤差を確認した（P41 準拠）
- [ ] 未達指標がある場合、Phase 6 に差し戻す判断と記録が完了している

---

## 9. 次 Phase への引き継ぎ

Phase 7 で全目標を達成した場合、以下の情報を Phase 8（リファクタリング）に引き継ぐ。

- カバレッジ計測結果（実測値）のサマリー
- GAP-COV-01〜05 の最終対処状況
- リファクタリング時に注意すべきカバレッジ感度の高い箇所（RuntimeResolver の hybrid フォールバック分岐等）

> リファクタリング後は Phase 7 のカバレッジ計測コマンドを再実行し、リファクタリングによるカバレッジ低下がないことを確認すること。
