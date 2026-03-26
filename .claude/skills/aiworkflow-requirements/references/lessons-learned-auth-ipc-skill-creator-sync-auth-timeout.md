# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26）

## UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 Runtime Skill Creator public IPC wiring（2026-03-21）

## TASK-SDK-02 workflow-engine-runtime-orchestration（2026-03-26）

## UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle（2026-03-26）

### 苦戦箇所と解決策

#### 1. `executor reject` と `success:false` を同じ failure とみなすと downstream review 契約が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade.execute()` が reject / `success:false` / verify review required を同列に扱うと、verify pending へ誤遷移し、Task04/08 が参照する review 契約と実装がずれる |
| 原因 | `ExecutionResult` の失敗と promise reject を「どちらも失敗だから同じ snapshot でよい」とまとめ、state transition の意味論を固定していなかった |
| 解決策 | `execution_error` / `execution_failed` / `verification_review` を分離し、reject は `recordExecutionFailure()`、`success:false` は verify 非遷移の failure snapshot、review required は `awaitingUserInput` に閉じ込めた |
| 教訓 | runtime failure lifecycle は「失敗した」ではなく「どの owner が次を決めるか」で分類すると downstream contract が崩れにくい |

#### 2. failure artifact を upsert すると時系列監査が失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | 同じ artifact kind を上書きすると repeated failure の履歴が消え、どの実行で何が起きたかを Phase 12 や review で再現しにくい |
| 原因 | success path の snapshot 更新パターンを failure path にも流用し、history と latest snapshot を区別していなかった |
| 解決策 | artifact 生成を append ベースへ変更し、読み出し側は latest accessor で現在値を取る構成に整理した |
| 教訓 | workflow engine の failure artifact は「履歴を append、消費は latest accessor」の二層に分けると監査性と実装単純さを両立しやすい |

#### 3. toolchain workaround を記録せずに close-out すると再検証が再現できない

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境では素の `pnpm vitest` が esbuild binary mismatch で落ちるため、Phase 12 に exact command を残さないと再検証者が同じ失敗を踏む |
| 原因 | blocker の存在だけ記録し、実際に PASS した回避コマンドを system spec / workflow outputs / skill update へ横展開していなかった |
| 解決策 | `ESBUILD_BINARY_PATH=... pnpm vitest ... --run` を verification command として成果物へ明記し、未タスクは既存 native binary guard を再利用する方針に固定した |
| 教訓 | 環境 blocker を新設しない場合でも、「何で PASS したか」の exact command は lessons と implementation-guide の両方へ残す必要がある |

### 同種課題向け簡潔解決手順（4ステップ）

1. reject / `success:false` / review required を別 reason に分け、verify pending へ進めてよい経路を先に固定する。
2. failure artifact は append、参照は latest accessor として owner の責務を分離する。
3. `awaitingUserInput` は `verification_review` のように次の owner が分かる reason を必ず持たせる。
4. toolchain workaround で検証した場合は PASS した exact command を Phase 12 成果物、lessons、skill logs に同値転記する。

### 苦戦箇所と解決策

#### 1. facade が public bridge と state owner を兼務したままだと downstream task の責務境界が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade` に phase/state を残したままだと、Task03/04/08 が facade 前提で設計され、engine 導入後に route/state/UI 責務が再混在する |
| 原因 | public IPC bridge と workflow state owner を「同じ runtime service」と見なし、review / verify / resume の保存責務を facade へ寄せていた |
| 解決策 | `SkillCreatorWorkflowEngine` を新設し、`currentPhase` / `awaitingUserInput` / `verifyResult` / artifacts / `resumeTokenEnvelope` を engine の単独 owner にした |
| 教訓 | runtime orchestration では「public bridge」と「workflow state owner」を別クラスに切り分けた方が downstream handoff と spec sync が安定する |

#### 2. `terminal_handoff` 経路で executor を呼ぶと public contract は正しくても state と副作用がねじれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `execute()` が `terminal_handoff` 判定後も executor 側へ進むと、public response は handoff でも内部副作用が integrated path と混線する |
| 原因 | policy 判定と state 遷移の owner が分離されておらず、「戻り値の union が合っていればよい」という認識で止まっていた |
| 解決策 | `RuntimeSkillCreatorFacade.execute()` を early return 化し、handoff は engine に handoff state だけを記録、integrated path のみ verify phase へ進めた |
| 教訓 | runtime union の検証は戻り値型だけでなく「禁止される副作用」を含めてテスト化する必要がある |

#### 3. source provenance を path 定数に頼ると resume contract と Task03 resource selection の境界が曖昧になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `DEFAULT_SKILL_CREATOR_PATH` だけを前提にすると、dynamic source root / manifest snapshot / resume route snapshot の provenance が別々に漂流する |
| 原因 | resource root を compile-time constant と runtime snapshot のどちらで持つかを固定していなかった |
| 解決策 | `ResourceLoader.getBasePath()` を追加し、engine が `resumeTokenEnvelope.sourceProvenance` として current source root を保持する形へ整理した |
| 教訓 | resume や downstream handoff に渡す provenance は「path 定数」ではなく「engine が固定した snapshot」として残すと再利用しやすい |

### 同種課題向け簡潔解決手順（4ステップ）

1. `RuntimeSkillCreatorFacade` の責務を public bridge に限定し、owner 候補を `engine` / `renderer` / downstream task に棚卸しする。
2. `terminal_handoff` は early return にし、禁止すべき副作用をテストで固定する。
3. `resumeTokenEnvelope` / verify state / artifacts は同一 owner に集約する。
4. source root は `ResourceLoader` 由来の snapshot として engine に記録し、shared/preload/ipc parity test を同時に回す。

## UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle hardening（2026-03-26）

### 苦戦箇所と解決策

#### 1. `success:false` を verify pending に流すと response union は正しくても review contract が壊れる

| 項目 | 内容 |
| --- | --- |
| 課題 | execute 結果が `success:false` でも verify pending へ進むと、Renderer は再レビュー待ちを認識できず Task04 / Task08 の前提が崩れる |
| 原因 | `success:false` を「統合実行は終わったので verify へ送る」と解釈し、review へ戻す契約が state machine に入っていなかった |
| 解決策 | `recordExecuteResult()` を review path に寄せ、`verification_review` と `awaitingUserInput` を同時保存する形へ統一した |
| 教訓 | runtime union は `success` 値ごとの phase contract まで定義しないと、戻り値型だけ current でも state drift が起きる |

#### 2. executor reject を facade 外へ漏らすと `execute` 停滞と証跡欠落が同時に起きる

| 項目 | 内容 |
| --- | --- |
| 課題 | `skillExecutor.execute()` reject 時に state が `execute` のまま残り、失敗 artifact / `verifyResult` / review prompt が一切残らない |
| 原因 | integrated path を success response 前提で組み、例外経路の snapshot 保存 owner を決めていなかった |
| 解決策 | `RuntimeSkillCreatorFacade.execute()` で reject を catch し、engine に failure snapshot を保存した上で sanitize 済み error を返す |
| 教訓 | runtime facade は public bridge でも「engine へ失敗 snapshot を残す責務」だけは持つ必要がある |

#### 3. transition guard を追加すると plan 起点互換が壊れやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | invalid jump を拒否する `assertTransition()` を入れると、既存の plan 起点 review state 初期化まで弾いてしまう |
| 原因 | guard 導入前に存在した暗黙初期化と、正式 state machine の境界が未分離だった |
| 解決策 | `ensureReviewReadyState()` を追加し、plan 起点互換の初期化だけを明示 API に分離した |
| 教訓 | state guard は「禁止遷移」と同時に「許可される互換初期化」の入口も明文化しないと後方互換を壊す |

#### 4. artifact append と upsert の曖昧さが review 再入時の監査性を落とす

| 項目 | 内容 |
| --- | --- |
| 課題 | ownership matrix は append 前提なのに実装が upsert だと、失敗履歴が潰れて再現調査しづらい |
| 原因 | artifact を「現在値 snapshot」と「phase 履歴」のどちらで扱うかが契約化されていなかった |
| 解決策 | 実装を append に揃え、親 workflow の ownership / phase-6 文書も same-wave で修正した |
| 教訓 | artifact 戦略は実装コメントではなく contract なので、append/upsert を曖昧語で残さない |

### 同種課題向け簡潔解決手順（4ステップ）

1. `success:true` / `success:false` / reject / handoff の4経路を表にして、phase / prompt / artifact を先に固定する。
2. facade は error を catch して engine へ snapshot を残し、public response は sanitize した最小情報だけ返す。
3. transition guard と互換初期化 API を対で実装し、plan 起点や resume 起点を明文化する。
4. artifact 戦略は append/upsert のどちらかに揃え、tests と ownership matrix を同ターンで更新する。

### 苦戦箇所と解決策

#### 1. public surface は `skillCreatorHandlers.ts` なのに runtime 実装だけ `creator:*` に分岐していた

| 項目 | 内容 |
| --- | --- |
| 課題 | runtime 用 `creatorHandlers.ts` が未登録のまま残り、public `skill-creator:*` surface と contract drift を起こしていた |
| 原因 | capability bridge 実装時に internal helper と public handler の責務境界を分けず、別 namespace を暫定追加していた |
| 解決策 | `creatorHandlers.ts` を internal runtime helper に再構成し、`skillCreatorHandlers.ts` entrypoint から `skill-creator:plan/execute-plan/improve-skill` を登録する形へ統一した |
| 教訓 | Electron IPC は「handler を増やす」のではなく「public surface の入口を増やさない」を優先すると drift が減る |

#### 2. preload/main の runtime contract が shared に存在せず、型の重複先がぶれていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade` の戻り値型と Preload API の公開型が別々に存在し、将来の IPC drift 余地が大きかった |
| 原因 | 追加した runtime bridge を「内部実装」と見なし、public IPC contract として shared 型へ上げていなかった |
| 解決策 | `TerminalHandoffBundle` と runtime plan/execute/improve response を `packages/shared/src/types/skillCreator.ts` に集約した |
| 教訓 | public IPC で renderer に見える payload は、使用中 UI がなくても shared contract に昇格させた方が保守しやすい |

#### 3. DI 不在時に「handler 未登録」にするか「一定エラー応答」にするかの判断

| 項目 | 内容 |
| --- | --- |
| 課題 | `SkillExecutor` 未初期化時に handler 登録自体をスキップすると、Renderer からは `No handler registered` になり UX と監査が不安定になる |
| 原因 | graceful degradation を registration failure の文脈だけで考え、public channel の安定性を別扱いしていた |
| 解決策 | handler は常に登録し、runtime service がなければ `"Runtime Skill Creator は現在利用できません"` を返す契約にした |
| 教訓 | public IPC では「channel missing」より「一定の failure envelope」を返す方がデバッグと仕様同期が楽になる |

### 同種課題向け簡潔解決手順（4ステップ）

1. `channels.ts` を起点に public channel 名を決め、preload/main/helper を同時に合わせる。
2. shared contract を先に定義し、戻り値型のローカル重複を避ける。
3. 既存 entrypoint から内部 helper を登録する形に寄せ、dead-end namespace を増やさない。
4. runtime DI が欠ける経路は handler missing ではなく graceful degradation で固定する。

### タスク概要

| 項目       | 内容                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-9B                                                                                                      |
| 目的       | SkillCreator IPC拡張実装（13チャンネル）とシステム仕様書のドリフトを解消し、再利用可能な運用知見へ落とし込む |
| 完了日     | 2026-02-26                                                                                                   |
| ステータス | **完了**                                                                                                     |

### 苦戦箇所と解決策

#### 1. IPCチャンネル契約数（6/13）の混在

| 項目   | 内容                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| 課題   | 基盤実装の6チャンネル記述と拡張実装の13チャンネル実体が混在し、仕様書ごとに記述がずれた        |
| 原因   | TASK-9B-H（基盤）とTASK-9B（拡張）の仕様同期を同一ターンで束ねていなかった                     |
| 解決策 | `channels.ts` を正本にして `interfaces/security/task/lessons` を一括更新し、13チャンネルへ統一 |
| 教訓   | IPC拡張は「実装完了」より先に「契約数の正本確定」を行うとドリフトを抑制できる                  |

#### 2. createハンドラーのP42 3段バリデーション未完了

| 項目   | 内容                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 課題   | `create` だけ `trim()` 空白検証が欠落し、P42運用に穴があった                           |
| 原因   | 既存ハンドラー改修の水平展開時に、チェック項目の統一基準が暗黙運用だった               |
| 解決策 | `skillCreatorHandlers.ts` に型/空文字/trim空文字を実装し、空文字・空白回帰テストを追加 |
| 教訓   | P42は「実装 + 回帰テスト」までを1セットで完了判定しないと再発する                      |

#### 3. 未タスク監査のcurrent/baseline混同

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 課題   | 全体監査の違反数を今回差分違反と誤認し、不要な是正作業に流れやすい                              |
| 原因   | `audit-unassigned-tasks --json` と `--diff-from HEAD` の役割差を明示していなかった              |
| 解決策 | 合否判定は `--diff-from HEAD` の `currentViolations` に固定し、全体監査値は監視値として分離記録 |
| 教訓   | 監査値は「current=合否」「baseline=既存負債」の2軸で扱うと判断が安定する                        |

### 同種課題向け簡潔解決手順（5ステップ）

1. `channels.ts` を正本にして契約数・型・方向（invoke/on）を確定する。
2. IPCハンドラーは全invokeで `validateIpcSender` + P42 3段バリデーションを適用する。
3. 仕様同期は `interfaces/security/task/lessons` を SubAgent 分担で同時に更新する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. `spec-update-summary.md` と `unassigned-task-detection.md` に最終数値・時刻を記録して完了判定する。

### 成果物

| 成果物               | パス                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/`                                              |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/unassigned-task-detection.md` |
| 整合性監査台帳       | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/elegant-solution-audit.md`    |

---

## 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### コンテキスト
- 対象: ApiKeysSection `apiKey.list()` 戻り値の契約防御
- 期間: 2026-03-07
- カテゴリ: Renderer 境界防御 / Main バリデーション / パターン統一

### 実装内容
1. **Renderer 層（ApiKeysSection/index.tsx）**: `normalizeProviders` type predicate フィルタ追加。`result.data?.providers` の nullish チェック + 要素 shape 検証（`provider`/`status` フィールド必須）
2. **Main 層（apiKeyHandlers.ts）**: `apiKey:list` ハンドラのレスポンス生成前に `Array.isArray(result?.providers)` バリデーション追加
3. **パターン統一（profileHandlers.ts）**: 3箇所の `identities ?? []` → `Array.isArray(user.identities) ? user.identities : []` に統一
4. **テスト**: 20件追加（Renderer 7件 + apiKeyHandlers 7件 + profileHandlers 6件）、全122件 PASS
5. **カバレッジ**: Statements 93.17% / Branches 86.23% / Functions 91.66%

### 苦戦箇所

#### S1: type predicate 内での型キャスト vs in 演算子
- **症状**: `normalizeProviders` 内で `(item as Record<string, unknown>).provider` を使用したが、Phase 8 で P19（型キャストバイパス）違反と判定
- **根本原因**: `as Record<string, unknown>` は実行時検証をバイパスする型アサーション。`in` 演算子は実行時チェックを伴う型ナロイング
- **解決策**: `"provider" in item && typeof item.provider === "string"` に変更。`in` 演算子で TypeScript の型ナロイングと実行時検証を同時に実現
- **再発条件**: type predicate でオブジェクトプロパティの存在を検証する場合
- **再利用手順**:
  1. `as` キャストの代わりに `in` 演算子を使用
  2. `in` 演算子の後に `typeof` で型検証
  3. P19 準拠を ESLint rule で強制（将来）

#### S2: Main ハンドラの直接テスト困難性
- **症状**: `apiKeyHandlers.ts` の list ハンドラは `ipcMain.handle` + `withValidation` でラップされており、ハンドラ関数を直接テストできない
- **根本原因**: ハンドラ登録が `registerApiKeyHandlers()` 関数内にカプセル化されており、個別のハンドラ関数をエクスポートしていない
- **解決策**: `ipcMain.handle` をモックし、登録時のコールバック関数を取得してテストする間接テストパターンを採用
- **再発条件**: `withValidation` ラッパーを使う IPC ハンドラの新規テスト作成時
- **再利用手順**:
  1. `vi.mock("electron")` で ipcMain をモック
  2. `registerXxxHandlers()` を呼び出し
  3. `ipcMain.handle.mock.calls` から対象チャネルのコールバックを取得
  4. コールバックを直接呼び出してバリデーションロジックをテスト

#### S3: `?? []` vs `Array.isArray` の防御力の差
- **症状**: `profileHandlers.ts` で `identities ?? []` が使われていたが、`identities` が文字列やオブジェクト等の非配列値の場合に防御できない
- **根本原因**: Nullish coalescing (`??`) は `null`/`undefined` のみ防御。P48 では全型に対する実行時検証が求められる
- **解決策**: `Array.isArray(user.identities) ? user.identities : []` に統一
- **再発条件**: 外部データ（IPC レスポンス、DB クエリ結果）から配列を取得する場合
- **再利用手順**:
  1. `grep -rn "?? \[\]" apps/desktop/src/` で全箇所を検出
  2. 外部データ由来の箇所を `Array.isArray` に置換
  3. 内部コード由来（確実に null/undefined のみ）は `?? []` を維持

#### S4: IPC契約ドリフト（仕様表の旧値残存）
- **症状**: API仕様書は更新済みだが、実装変更後に戻り値型テーブルだけ旧値が残るドリフトが発生
- **根本原因**: 「実装コード」と「仕様表」の両方を同時に検証する手順を固定していなかった
- **解決策**: `api-ipc-system.md` の `apiKey:list` を `IPCResponse<ProviderListResult>` へ更新し、フィールド表 (`providers/registeredCount/totalCount`) を追加
- **標準ルール**: IPC契約変更時は「型名 + フィールド表 + 完了タスク台帳」を同一コミット単位で更新する

#### S5: Phase 11 実画面証跡不足
- **症状**: Phase 11 が自動テスト代替に寄り、実画面証跡が不足しやすい
- **根本原因**: UI構造変更なしという前提で screenshot を省略する運用が残っていた
- **解決策**: `capture-task-06-settings-apikey-contract-guard-phase11.mjs` を追加し、TC-11-01〜03 を取得して manual-test-result へ証跡リンクを記録
- **標準ルール**: ユーザーが画面検証を要求した場合、`SCREENSHOT` を必須に切り替える

#### S6: Phase 11 証跡表ヘッダの validator 不一致
- **症状**: `validate-phase11-screenshot-coverage` が `manual-test-result.md` の証跡列を抽出できず失敗
- **根本原因**: 証跡テーブルが validator 期待ヘッダ（`テストケース` / `証跡`）を満たしていなかった
- **解決策**: Phase 11成果物に validator互換テーブルを追加し、TC-11-01〜03 の `.png` を1:1で紐付け
- **再発条件**: 手動テスト結果の表形式を独自変更した場合
- **標準ルール**: Phase 11完了前に `validate-phase11-screenshot-coverage` を必ず実行し、表形式を機械検証で固定

#### S7: screenshot 再取得時の依存欠落（Rollup optional dependency）
- **症状**: capture script 実行時に `Cannot find module @rollup/rollup-darwin-x64` で停止
- **根本原因**: worktree の optional dependency が欠落したまま Vite 起動を試行した
- **解決策**: `pnpm install` 後に capture script を再実行し、`phase11-capture-metadata.json` を更新
- **再発条件**: worktree切替直後や node_modules 再構成後に preview/capture を即実行する場合
- **標準ルール**: screenshot 再取得前に依存解決（`pnpm install`）と preflight（preview疎通）を先に実施

### 同種課題の5分解決カード

| ステップ | 操作 | 目的 |
|----------|------|------|
| 1 | `grep -rn "result.data\." apps/desktop/src/renderer/` で Renderer 側の data アクセスを検索 | 未防御の shape アクセスを発見 |
| 2 | `result?.data` + `Array.isArray(result.data.xxx)` の2段チェックを追加 | nullish + 非配列を同時に防御 |
| 3 | type predicate フィルタで要素 shape を検証（`in` 演算子 + `typeof`） | malformed 要素を安全に除外 |
| 4 | Main ハンドラ側にも `Array.isArray` バリデーションを追加 | 多層防御の実現 |
| 5 | テスト追加（undefined/null/空配列/malformed/reject の5パターン） | 回帰防止 |

### 検証ゲート
- `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/`
- `cd apps/desktop && pnpm exec tsc --noEmit`

### 同期先
- `references/security-electron-ipc.md`: apiKeyAPI セクション追加
- `references/ui-ux-settings.md`: ApiKeysSection 異常系表示仕様
- `.claude/rules/06-known-pitfalls.md`: P49 候補（type predicate の `as` vs `in`）

## TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 教訓

### 実装内容サマリー

`registerAllIpcHandlers()` の個別ハンドラ登録が例外を投げた場合でも、後続のハンドラ登録を継続する Graceful Degradation パターンを導入。`safeRegister()` 内部ヘルパーで個別 try-catch を行い、失敗情報を `IpcHandlerRegistrationResult` として構造化して返却する。

| 変更ファイル | 変更内容 |
|---|---|
| `apps/desktop/src/main/ipc/index.ts` | `safeRegister()`, `sanitizeRegistrationErrorMessage()`, `track()` 追加。戻り値を `IpcHandlerRegistrationResult` に変更 |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | 19テスト新規作成（全PASS） |

### 苦戦箇所

#### S-GD-1: setupThemeWatcher が safeRegister パターンに適合しない

- **再発条件**: ハンドラ登録関数の戻り値（unsubscribe function 等）をモジュールスコープ変数に保持する必要がある場合
- **症状**: `safeRegister()` は戻り値を破棄するため、`setupThemeWatcher` の unsubscribe 関数をキャプチャできない
- **解決策**: `setupThemeWatcher` は個別の try-catch で囲み、戻り値を `themeWatcherUnsubscribe` に代入する。`safeRegister` との使い分けを設計書で明示する
- **再利用**: 戻り値が必要なハンドラ登録は `safeRegister` ではなく個別 try-catch を使用する。設計時に戻り値の要否を明確にする

#### S-GD-2: track() クロージャの成功カウント管理

- **再発条件**: 複数のハンドラを一括で登録する関数（例: `registerSkillHandlers` 1関数で複数チャネルを登録）の成功カウント
- **症状**: `safeRegister` 呼び出し元で成功数を手動管理するとカウント漏れが発生しやすい
- **解決策**: `track()` 内部クロージャで `safeRegister` の成功/失敗を自動追跡し、最終的に `IpcHandlerRegistrationResult` として集約する
- **再利用**: 複数の独立操作の成功/失敗を集約する場合、クロージャで状態を閉じ込めるパターンを適用する

#### S-GD-3: sanitizeRegistrationErrorMessage でのパスマスク

- **再発条件**: エラーメッセージにユーザーのホームディレクトリパスが含まれる場合（NFR-02 プライバシー保護）
- **症状**: `os.homedir()` が `/Users/username` を返すが、エラーメッセージ中のパスは正規表現のメタ文字を含む可能性がある
- **解決策**: `escapeRegExp()` でホームディレクトリパスをエスケープしてから `RegExp` で置換。`~` にマスクする
- **再利用**: ログ出力にファイルパスが含まれる場合は必ず `sanitize` 処理を適用する。P20（テスト環境ログ汚染）と組み合わせて運用する

#### S-GD-4: agentHandlers.test.ts の既存テスト失敗との分離

- **再発条件**: IPC テストスイート全体実行時に、変更と無関係なテストファイルが Vite 依存解決エラーで失敗する
- **症状**: `agentHandlers.test.ts` の 16 テストが `resolvePackageEntry` エラーで失敗。Graceful Degradation 変更とは無関係
- **解決策**: 変更対象のテストファイルを `--testPathPattern` で絞って実行し、無関係な失敗を分離する。全体テスト失敗はベースブランチでも再現することを確認し、変更起因でないことを証明する
- **再利用**: IPC テスト追加時は対象テストファイルのみを先に実行し、全体テスト失敗との混同を避ける

### 同種課題向け再利用手順

1. **設計時**: 各ハンドラ登録関数の「戻り値の要否」と「失敗時の影響範囲」を明確にする
2. **実装時**: 戻り値不要 → `safeRegister`、戻り値必要 → 個別 try-catch の使い分けを適用
3. **テスト時**: `vi.hoisted()` でモック変数を宣言し、30+ のハンドラ登録関数を網羅的にモック化
4. **検証時**: 対象テストファイルのみを先に実行し、既存テスト失敗との混同を回避
5. **ログ検証**: `sanitizeRegistrationErrorMessage` のパスマスク動作を専用テスト（T-18相当）で確認

### 関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |
| UT-IMP-WORKFLOW-STALE-VALIDATOR-001 | index.md / artifacts.json / phase-*.md stale 状態一括検出バリデータ | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-workflow-stale-validator.md` |
| UT-IMP-SKILL-CONFLICT-MARKER-LINT-001 | SKILL.md / LOGS.md conflict marker 検出 lint | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-skill-conflict-marker-lint.md` |

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装教訓（2026-03-10）

### 概要

AuthGuard タイムアウトフォールバック + Settings 認証除外の実装。認証初期化がハングした場合に10秒タイムアウトでフォールバック UI を表示し、Settings 画面は AuthGuard をバイパスしてアクセス可能にする。

### 苦戦箇所

#### 1. App.tsx の AuthGuard 構造変換の複雑さ

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存の `<AuthGuard>` が全ルートを一括ラップしていたため、Settings だけをバイパスするにはルート構造全体のリファクタリングが必要だった |
| 再発条件 | 認証除外ビューを追加する際に、catch-all route の構造を変更する必要がある場合 |
| 解決策 | catch-all route の `renderCatchAllElement()` を抽出し、`currentView === "settings"` の条件分岐で AuthGuard バイパスを実現。直接 URL ルート（`/agent`, `/chat/*`, `/advanced/*`）は個別に `<AuthGuard>` でラップ |
| 標準ルール | 認証除外ビューを追加するときは、catch-all route と直接 URL route の両方で AuthGuard の適用範囲を確認する |

```typescript
// catch-all route での条件分岐パターン
if (currentView === "settings") {
  return viewContent; // AuthGuard バイパス
}
return <AuthGuard>{viewContent}</AuthGuard>;
```

#### 2. useAuthState タイマー管理と P13 準拠

| 項目 | 内容 |
| --- | --- |
| 課題 | setTimeout + Promise + 再スケジュールパターンでテストが無限ループする P13 問題。`vi.runAllTimers()` を使うと無限ループする |
| 再発条件 | タイムアウト機構をテストする際に `vi.runAllTimers()` 系の API を使用する場合 |
| 解決策 | `vi.advanceTimersByTime(10_000)` で1ステップずつ進める。useEffect のクリーンアップで `clearTimeout` を確実に呼ぶ |
| 標準ルール | タイマーテストでは `vi.advanceTimersByTime()` を使用し、`vi.runAllTimers()` は避ける（P13 準拠） |

```typescript
// P13 準拠のタイマーテストパターン
vi.useFakeTimers();
act(() => {
  vi.advanceTimersByTime(10_000);
});
// タイムアウト後の状態を検証
expect(result.current.authState).toBe("timed-out");
```

#### 3. getAuthState の判定優先順位設計

| 項目 | 内容 |
| --- | --- |
| 課題 | `isTimedOut` と `isLoading` の組み合わせ条件の優先順位を間違えると、タイムアウト後に認証完了しても自動遷移しない |
| 再発条件 | 複数の boolean フラグの組み合わせで状態を決定するロジックを設計する場合 |
| 解決策 | `isTimedOut && isLoading` を最優先に判定。`isLoading=false` になれば自動的に `authenticated` or `unauthenticated` に遷移 |
| 標準ルール | 状態判定は「最も特殊な条件」から順に評価する。タイムアウトは「ローディング中のみ有効」という制約を明示する |

```typescript
// 判定優先順位（上から順に評価）
function getAuthState(isTimedOut: boolean, isLoading: boolean, isAuthenticated: boolean): AuthState {
  if (isTimedOut && isLoading) return "timed-out";   // (1) 最優先: タイムアウト中
  if (isLoading) return "checking";                   // (2) ローディング中
  if (isAuthenticated) return "authenticated";         // (3) 認証済み
  return "unauthenticated";                            // (4) 未認証
}
```

#### 4. Settings bypass のセキュリティ境界

| 項目 | 内容 |
| --- | --- |
| 課題 | Settings を AuthGuard 外に出すと、未認証状態で API キー設定画面にアクセス可能になるセキュリティ考慮が必要 |
| 再発条件 | 認証ガードから特定ビューを除外する設計判断を行う場合 |
| 解決策 | API キー操作はすべて IPC 経由で Main Process 管理。Renderer 側に機密データは直接保持されない。direct URL routes は全て AuthGuard 配下に維持 |
| 標準ルール | 最小権限（Settings shell のみバイパス）+ 多層防御（IPC + Main Process バリデーション維持）を徹底する |

#### 5. バックグラウンドテスト実行のタイムアウト（exit code 144）

| 項目 | 内容 |
| --- | --- |
| 課題 | サブエージェントで Vitest 実行すると exit code 144（SIGTERM）で中断される |
| 再発条件 | サブエージェントにテスト実行を委譲し、タイムアウトが不十分な場合 |
| 解決策 | メインフローでテスト実行する。サブエージェントにテスト実行を委譲する場合はタイムアウトを十分に確保するか、テスト対象を限定する |
| 標準ルール | 104件以上のテストスイートはサブエージェントではなくメインフローで実行する |

### 同種課題の5分解決カード

```
症状: AuthGuard（または類似のブロッキングコンポーネント）が無限ローディング状態
根本原因: 認証初期化のハング（IPC/ネットワーク）
5手順:
  1. useAuthState にタイムアウト state を追加（useState + useEffect + setTimeout）
  2. getAuthState の判定ロジックに isTimedOut 条件を最優先で追加
  3. フォールバック UI（リトライ + 代替導線）を作成
  4. ブロッキング対象から除外すべきビューを条件分岐で bypass
  5. テスト: vi.advanceTimersByTime() でタイマーを制御（P13準拠）
検証ゲート: 104テスト全PASS、AC-1〜AC-8全達成
同期先: architecture-auth-security.md, ui-ux-navigation.md, arch-state-management.md
```

### 再利用手順（4ステップ）

1. 対象コンポーネントの状態遷移図を作成し、タイムアウト状態を追加する。
2. 純粋関数（getAuthState 相当）で判定ロジックをテスタブルに実装する。
3. bypass 対象のビューを条件分岐で分離する（catch-all route パターン）。
4. P13/P39/P31 準拠でテストを実装する（fake timers + fireEvent + 個別セレクタ）。

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査教訓（2026-03-10）

### 苦戦箇所: Settings bypass と未認証 reset が相殺する

| 項目 | 内容 |
| --- | --- |
| 課題 | `currentView === "settings"` の bypass を入れても、未認証時 `setCurrentView("dashboard")` が残ると Settings へ到達しても即座に戻される |
| 再発条件 | bypass 判定と navigation reset 判定を別々の層で更新する |
| 対処 | `shouldResetUnauthenticatedView` を追加し、公開ビュー配列で `settings` を除外した |
| 標準ルール | 認証除外ビューを追加するときは「描画条件」と「reset 条件」を同時に監査する |

### 苦戦箇所: ユーザー明示の screenshot 要求に P53 代替を残してしまう

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存成果物に「CLI なのでコード検証で代替」と残っていた |
| 再発条件 | screenshot 制約を一般ルールで処理し、ユーザー要求の優先度を下げる |
| 対処 | 専用 harness route と capture script で screenshot 4件を実取得し、Phase 11 文書を差し替えた |
| 標準ルール | ユーザーが screenshot を要求したら `screenshot-plan.json` / capture metadata / coverage validator まで完了させる |

### 苦戦箇所: worktree で optional dependency が欠ける

| 項目 | 内容 |
| --- | --- |
| 課題 | vitest / Playwright 起動前に Rollup optional dependency 欠損で失敗しうる |
| 再発条件 | 新しい worktree で install を省略する |
| 対処 | `pnpm install --frozen-lockfile` を先に実行した |
| 標準ルール | Phase 11/12 の再監査を始める前に install preflight を入れる |

### 同種課題の簡潔解決手順（4ステップ）

1. bypass 対象ビューがあるなら、描画条件と reset 条件を両方 `rg` で洗う。
2. screenshot 要求があるなら、専用 harness と capture metadata を先に作る。
3. worktree では `pnpm install --frozen-lockfile` を preflight として実行する。
4. workflow outputs、system spec、LOGS/SKILL を同一ターンで閉じる。

---
