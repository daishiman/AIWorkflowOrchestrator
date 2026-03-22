# Phase 9 成果物: 品質チェックリスト

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 9                                                 |
| 成果物種別 | 品質チェックリスト                                |
| 作成日     | 2026-03-22                                        |

---

## 使い方

本チェックリストは Phase 5（実装完了後）に実施する。
各項目は「確認コマンド / 手順」列の手順で実行し、「PASS 条件」を満たしていることを確認する。
全項目 PASS で `implementation_ready` と判定する。

---

## 1. UX 品質チェック

### 1.1 CTA 統一（primary 1 + secondary 1 制約）

| No. | チェック項目                                                      | 確認コマンド / 手順                                                  | PASS 条件                 |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------- |
| U1  | 全 surface で CTA が primary 1 + secondary 1 以内であること       | unit test の各 state の snapshot でボタン数をカウント                | CTA 数 ≤ 2                |
| U2  | terminal-handoff state: primary=「コマンドをコピー」              | `grep -rn "cta.copyCommand" apps/desktop/src/renderer/`              | i18n key が統一されている |
| U3  | terminal-handoff state: secondary=「閉じる」                      | `grep -rn "cta.dismiss" apps/desktop/src/renderer/`                  | i18n key が統一されている |
| U4  | guidance-only state: primary=「設定を開く」                       | `grep -rn "cta.openSettings\|設定を開く" apps/desktop/src/renderer/` | i18n key が統一されている |
| U5  | unavailable state（CLI なし）: CTA が disabled / 非表示であること | GuidanceBlock(info) variant の snapshot 確認                         | 操作 CTA = 0              |
| U6  | blocked / unavailable state に retry ボタンが存在しないこと       | GuidanceBlock の blocked/unavailable variant の snapshot 確認        | retry ボタン = 0          |
| U7  | terminal-only capability が blocked 扱いになっていないこと        | contract-matrix.md § 1.2 のマッピングテーブルとの実装照合            | UiState = "ready"         |

### 1.2 terminal-handoff vs guidance-only の表示分岐

| No. | チェック項目                                             | 確認コマンド / 手順                                                          | PASS 条件                                |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| U8  | terminal-handoff 状態で TerminalHandoffCard が表示される | unit test: `resolution.type === "terminal_handoff"` 時に TerminalHandoffCard | TerminalHandoffCard がレンダリングされる |
| U9  | guidance-only 状態で GuidanceBlock が表示される          | unit test: `capability === "guidance-only"` 時に GuidanceBlock               | GuidanceBlock がレンダリングされる       |
| U10 | integrated-api 状態で TerminalHandoffCard が非表示である | unit test: `capability === "integrated-api"` 時の rendering を確認           | TerminalHandoffCard が null を返す       |
| U11 | 両コンポーネントが同一 surface で同時に表示されないこと  | `toHandoffGuidance()` が integrated-api 時に null を返すことを確認           | 同時表示 = 0                             |

### 1.3 i18n key と全 surface 同名ラベル

| No. | チェック項目                                                  | 確認コマンド / 手順                                                   | PASS 条件                            |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| U12 | 「terminal を開く」が全 surface で同一 i18n key を使っている  | `grep -rn "openTerminal\|terminal を開く" apps/desktop/src/renderer/` | i18n key = `cta.openTerminal` に統一 |
| U13 | surface ごとに異なるボタンラベルが存在しないこと              | i18n ファイルで `openTerminal` の重複定義なし                         | 重複定義 = 0                         |
| U14 | Launcher button のラベルが「terminal を開く」で固定されている | AppShellHeader コンポーネントの props / 実装を確認                    | ラベル = `cta.openTerminal`          |

### 1.4 Launcher 挙動

| No. | チェック項目                                                                 | 確認コマンド / 手順                                                   | PASS 条件              |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| U15 | Launcher click で terminal dock が collapsed → idle に遷移すること           | unit test: click → state 確認                                         | state = idle           |
| U16 | CLI が存在しない場合に Launcher が disabled になること                       | unit test: `AccessCapability === "none"` 時の button state 確認       | button disabled = true |
| U17 | CLI が存在しない場合に tooltip が表示されること                              | unit test / snapshot で tooltip テキスト確認                          | tooltip 存在           |
| U18 | Launcher を二度押しすると terminal dock が close すること（transcript 保持） | unit test: open → close → transcript 保持確認（RSK-1 により暫定確認） | close 動作 PASS        |

---

## 2. アーキテクチャ品質チェック

### 2.1 Renderer local 判定なし（Main authority 維持）

| No. | チェック項目                                           | 確認コマンド / 手順                                                                     | PASS 条件                      |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------ |
| A1  | Renderer で authMode / apiKey を直接参照していないこと | `grep -rn "authMode\|apiKey\|APIKEY" apps/desktop/src/renderer/`                        | ヒット = 0                     |
| A2  | capability 判定が Renderer 内で行われていないこと      | `grep -rn "IRuntimePolicyResolver\|resolveCapability" apps/desktop/src/renderer/`       | ヒット = 0                     |
| A3  | Renderer が `HandoffGuidance` のみを受け取っていること | Renderer コンポーネントの props 型に `TerminalHandoffBundle` がないことを確認           | TerminalHandoffBundle 参照 = 0 |
| A4  | `TerminalHandoffBundle` が IPC を通過していないこと    | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/ apps/desktop/src/preload/` | ヒット = 0                     |

### 2.2 Main authority の維持確認

| No. | チェック項目                                                          | 確認コマンド / 手順                                                   | PASS 条件                 |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------- |
| A5  | `IRuntimePolicyResolver.resolve()` 経由のみで capability が決定される | `grep -rn "resolve" apps/desktop/src/main/services/` でハンドラを確認 | 全パスが resolve() を通過 |
| A6  | `assertNoSilentFallback` が全 capability パスの出口に存在する         | unit test で `capability=none` 時のエラー発生を確認                   | エラーが throw される     |
| A7  | `capability=none` → `integratedRuntime` への暗黙 fallback がない      | `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/`     | 暗黙 fallback = 0         |

### 2.3 IPC 通過型の packages/shared 配置確認

| No. | チェック項目                                                           | 確認コマンド / 手順                                                 | PASS 条件    |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| A8  | `HandoffGuidance` が `packages/shared/src/types/handoff.ts` にある     | `ls packages/shared/src/types/handoff.ts`                           | ファイル存在 |
| A9  | `SkillDocsCapabilityResult` が `packages/shared` にある                | `ls packages/shared/src/types/skill-docs.ts`                        | ファイル存在 |
| A10 | `toHandoffGuidance()` が `packages/shared/src/types/handoff.ts` にある | `grep -rn "toHandoffGuidance" packages/shared/src/types/handoff.ts` | 関数定義存在 |
| A11 | `TerminalHandoffBundle` が packages/shared に存在しない                | `grep -rn "TerminalHandoffBundle" packages/shared/`                 | ヒット = 0   |

### 2.4 Concern 責務境界確認

| No. | チェック項目                                                          | 確認コマンド / 手順                                                                                             | PASS 条件                   |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| A12 | AppShellHeader が capability 判定ロジックを持たないこと               | `grep -rn "resolveCapability\|IRuntimePolicyResolver" apps/desktop/src/renderer/components/App/AppShellHeader*` | ヒット = 0                  |
| A13 | TerminalHandoffCard が HandoffGuidance 以外の props を持たないこと    | TerminalHandoffCard のコンポーネント定義ファイルの props 型を確認                                               | HandoffGuidance のみ        |
| A14 | GuidanceBlock(handoff) が HandoffGuidance を props として受け取ること | GuidanceBlock の handoff variant の props 型を確認                                                              | `guidance: HandoffGuidance` |

---

## 3. IPC 品質チェック

### 3.1 HandoffGuidance のみが IPC を通過することの確認

| No. | チェック項目                                                | 確認コマンド / 手順                                          | PASS 条件            |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------ | -------------------- |
| I1  | IPC レスポンスに `TerminalHandoffBundle` が含まれないこと   | `grep -rn "TerminalHandoffBundle" apps/desktop/src/preload/` | ヒット = 0           |
| I2  | IPC レスポンスの型が `HandoffGuidance` に統一されていること | Preload の型定義ファイルで IPC レスポンス型を確認            | HandoffGuidance のみ |
| I3  | Preload の allowlist が terminal 系チャンネルのみを含むこと | Preload whitelist の定義ファイルを確認                       | 不要チャンネル = 0   |

### 3.2 P42 準拠 3 段バリデーション

| No. | チェック項目                                        | 確認コマンド / 手順                                   | PASS 条件          |
| --- | --------------------------------------------------- | ----------------------------------------------------- | ------------------ |
| I4  | IPC ハンドラで `typeof === "string"` チェックがある | 各ハンドラのバリデーション部分を確認                  | 型チェック存在     |
| I5  | 空文字列チェック `=== ""` がある                    | 各ハンドラのバリデーション部分を確認                  | 空文字チェック存在 |
| I6  | `.trim() === ""` チェックがある                     | `grep -rn "\.trim()" apps/desktop/src/main/handlers/` | trim チェック存在  |

### 3.3 P27 準拠 IPC_CHANNELS 定数参照

| No. | チェック項目                                                        | 確認コマンド / 手順                                                                 | PASS 条件  |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| I7  | IPC チャンネル名がハードコード文字列でないこと                      | `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ \| grep -v "IPC_CHANNELS"` | ヒット = 0 |
| I8  | `IPC_CHANNELS` 定数経由でのみチャンネル名を参照していること         | `grep -rn "\"terminal:\|'terminal:" apps/desktop/src/main/handlers/`                | ヒット = 0 |
| I9  | terminal 系チャンネルが `terminal:*` namespace に統一されていること | `grep -rn "IPC_CHANNELS.TERMINAL\|terminal:" apps/desktop/src/` で namespace 確認   | 統一済み   |

### 3.4 P45 準拠引数名のセマンティクス一致

| No. | チェック項目                                                  | 確認コマンド / 手順                                         | PASS 条件                  |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| I10 | ハンドラの引数名が実際に渡される値のセマンティクスと一致する  | Preload の呼び出し側とハンドラの引数名を照合                | 命名ドリフト = 0           |
| I11 | `skillName` を渡す場合にハンドラの引数名が `skillName` である | `grep -rn "skillId" apps/desktop/src/main/` で P45 再発確認 | skillId の命名ドリフト = 0 |

---

## 4. セキュリティ品質チェック

### 4.1 API key 非露出

| No. | チェック項目                                               | 確認コマンド / 手順                                                                                                | PASS 条件        |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------- |
| S1  | `terminalCommand` に API key が含まれないこと              | `grep -rn "apiKey\|api_key\|ANTHROPIC_API_KEY\|Bearer" apps/desktop/src/main/services/*/TerminalHandoffBuilder.ts` | ヒット = 0       |
| S2  | unit test で key pattern が 0 件であることを asserting     | `terminalCommand` に API key 埋め込みがないことを確認するテストが存在する                                          | アサーション存在 |
| S3  | IPC レスポンス全体に Bearer / sk- パターンが含まれないこと | `grep -rn "Bearer\|sk-" apps/desktop/src/main/handlers/`                                                           | ヒット = 0       |

### 4.2 auto-send 禁止

| No. | チェック項目                                            | 確認コマンド / 手順                                              | PASS 条件      |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| S4  | terminal dock open 時に自動コマンド送信が発生しないこと | unit test: `openTerminal` アクションの実装に send 処理がないこと | auto-send = 0  |
| S5  | `openTerminal` アクションに send 処理が含まれないこと   | `openTerminal` アクションの実装を確認                            | send 処理 = 0  |
| S6  | manual test TC-MAN-5 で auto-send 非発生を確認          | Phase 11 の TC-MAN-5 で手動確認                                  | auto-send なし |

### 4.3 hidden injection 禁止

| No. | チェック項目                                                    | 確認コマンド / 手順                       | PASS 条件              |
| --- | --------------------------------------------------------------- | ----------------------------------------- | ---------------------- |
| S7  | TerminalHandoffCard の表示内容が HandoffGuidance のみであること | unit test で props と表示内容の一致を確認 | 追加注入 = 0           |
| S8  | masked / invisible な文字列が terminal に inject されないこと   | TC-MAN の MB-3 manual test で確認         | hidden inject = 0      |
| S9  | copyCommand が `terminalCommand` フィールドのみをコピーすること | copyCommand handler の実装を確認          | 追加フィールド混入 = 0 |

### 4.4 headless execution 禁止

| No. | チェック項目                                                     | 確認コマンド / 手順                               | PASS 条件        |
| --- | ---------------------------------------------------------------- | ------------------------------------------------- | ---------------- |
| S10 | ユーザー操作なしでコマンドが実行されないこと                     | Phase 11 の MB-4 manual test で確認               | 自動実行 = 0     |
| S11 | コマンド実行は User Action（Enter キー押下）のみが起点であること | terminal dock の実装を確認（event listener 確認） | user action のみ |

### 4.5 P55 準拠メタ文字エスケープ

| No. | チェック項目                                            | 確認コマンド / 手順                                                                | PASS 条件                                                         |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------- |
| S12 | `terminalCommand` 生成時に shell injection 対策がある   | `TerminalHandoffBuilder` で `escapeRegExp()` または sanitize 関数の使用を確認      | sanitize 存在                                                     |
| S13 | `os.homedir()` 等の動的値が RegExp に直接渡されないこと | `grep -rn "new RegExp" apps/desktop/src/main/services/` で raw path 使用がないこと | raw path = 0                                                      |
| S14 | メタ文字（`$`, `` ` ``, `&`, `                          | ` 等）がエスケープされていること                                                   | unit test で特殊文字を含む path での `terminalCommand` 生成を確認 | エスケープ済み |

### 4.6 P62 fallback 禁止

| No. | チェック項目                                                  | 確認コマンド / 手順                                               | PASS 条件         |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| S15 | capability=none 時に DEFAULT_CONFIG へ fallback しないこと    | `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/` | 暗黙 fallback = 0 |
| S16 | `assertNoSilentFallback()` が capability 判定後に呼ばれること | unit test で capability=none 時のエラー発生を確認                 | asserting 存在    |

### 4.7 path traversal 対策（open working directory）

| No. | チェック項目                                                | 確認コマンド / 手順                                              | PASS 条件              |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------- |
| S17 | `workspacePath` に `..` を含むパスが拒否されること          | unit test で `..` を含むパスが VALIDATION_ERROR を返すことを確認 | パストラバーサル = 0   |
| S18 | IPC ハンドラでの P42 3 段バリデーション（型→空→trim）が完備 | I4〜I6 と同様の確認                                              | 3 段バリデーション存在 |

---

## 5. パフォーマンス品質チェック

### 5.1 P5 リスナー二重登録なし

| No. | チェック項目                                                                         | 確認コマンド / 手順                                                    | PASS 条件          |
| --- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------ |
| P1  | IPC ハンドラが同一チャンネルに二重登録されないこと                                   | `ipcMain.handle()` 登録前に `ipcMain.removeHandler()` が呼ばれるか確認 | 二重登録 = 0       |
| P2  | `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` パターンが使われていること | 登録/解除の実装を確認                                                  | 一括解除後に再登録 |

### 5.2 P31 store hooks 無限ループなし

| No. | チェック項目                                                                    | 確認コマンド / 手順                                                      | PASS 条件           |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| P3  | `useEffect` の依存配列に合成 Hook の戻り値関数が含まれないこと                  | `grep -rn "useEffect" apps/desktop/src/renderer/` で合成 Hook 使用を確認 | 合成 Hook 依存 = 0  |
| P4  | 派生セレクタ（`.filter()`/`.map()` を返すもの）に `useShallow` が適用されている | P48 対策のパターン確認                                                   | useShallow 適用済み |

### 5.3 NFR-2 パフォーマンス要件

| No. | チェック項目                                      | 確認コマンド / 手順                              | PASS 条件        |
| --- | ------------------------------------------------- | ------------------------------------------------ | ---------------- |
| P5  | Handoff card の表示が 200ms 以内であること        | unit test / manual test でレンダリング時間を計測 | 表示時間 ≤ 200ms |
| P6  | Launcher click → dock 遷移が 300ms 以内であること | manual test TC-MAN-4 で計測                      | 遷移時間 ≤ 300ms |

---

## 6. ワークフロー品質チェック

### 6.1 artifacts.json 同期

| No. | チェック項目                                           | 確認コマンド / 手順                          | PASS 条件   |
| --- | ------------------------------------------------------ | -------------------------------------------- | ----------- |
| W1  | Phase 8 / Phase 9 の成果物が artifacts.json に記録済み | `diff outputs/artifacts.json artifacts.json` | 差分 = 0    |
| W2  | 全 Phase のステータスが最新の状態を反映していること    | artifacts.json の全 phase status を目視確認  | status 整合 |

### 6.2 documentation-changelog 準備

| No. | チェック項目                                        | 確認コマンド / 手順                                                         | PASS 条件        |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| W3  | Phase 12 で記録する変更内容の草稿があること         | Phase 12 仕様書の Task 3 を事前確認                                         | 草稿存在         |
| W4  | 全 Step 実行前に「完了」と記載しないこと（P4 対策） | documentation-changelog.md への記載タイミングを Phase 12 最終 Step 後にする | 早期完了記載 = 0 |

### 6.3 MINOR 指摘の解決方針確定

| No. | チェック項目                                                  | 確認コマンド / 手順                                                              | PASS 条件 |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------- |
| W5  | MN-1 の解決方針が refactor-boundaries.md に明記されていること | `grep -n "toHandoffGuidance" outputs/phase-8/refactor-boundaries.md`             | 記載あり  |
| W6  | MN-2 の解決方針が risk-register.md に明記されていること       | `grep -n "aborted\|RSK-1" outputs/phase-9/risk-register.md`                      | 記載あり  |
| W7  | MN-3 の解決方針が refactor-boundaries.md に明記されていること | `grep -n "GuidanceBlock\|使い分けルール" outputs/phase-8/refactor-boundaries.md` | 記載あり  |

---

## 7. implementation_ready 判定テーブル

| 判定条件                                         | 確認場所                                        | 必要ステータス |
| ------------------------------------------------ | ----------------------------------------------- | -------------- |
| U1〜U18 の全 UX チェックが PASS                  | 本ファイル § 1                                  | 全 PASS        |
| A1〜A14 の全アーキテクチャチェックが PASS        | 本ファイル § 2                                  | 全 PASS        |
| I1〜I11 の全 IPC チェックが PASS                 | 本ファイル § 3                                  | 全 PASS        |
| S1〜S18 の全セキュリティチェックが PASS          | 本ファイル § 4                                  | 全 PASS        |
| P1〜P6 の全パフォーマンスチェックが PASS         | 本ファイル § 5                                  | 全 PASS        |
| W1〜W7 の全ワークフローチェックが PASS           | 本ファイル § 6                                  | 全 PASS        |
| AC-1〜AC-4 が全て PASS                           | final-review-report.md § 1                      | 全 PASS        |
| MAJOR/CRITICAL 指摘なし                          | final-review-report.md § 6                      | 指摘 = 0       |
| MN-1〜MN-3 の追跡先 Phase が確定済み             | final-gate-decision.md § 2                      | 全確定         |
| RSK-1（Task06 依存）がスコープ外として文書化済み | risk-register.md § 2.1 / final-gate-decision.md | 記載あり       |
