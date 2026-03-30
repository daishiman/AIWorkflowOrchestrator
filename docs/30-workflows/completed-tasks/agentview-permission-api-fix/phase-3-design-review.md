# Phase 3: 設計レビュー

## メタ情報

| 項目      | 内容                             |
| --------- | -------------------------------- |
| Phase     | 3                                |
| 名称      | 設計レビュー                     |
| 前提Phase | Phase 2                          |
| 成果物    | レビューチェックリスト、承認記録 |

## 目的

Phase 2 の設計が Phase 1 の要件を全て満たしていることを検証し、実装前に設計上の問題を検出する。

## 実行タスク

### タスク 3-1: 要件カバレッジの検証

Phase 1 の各 FR が Phase 2 の設計で対応されていることを確認する：

| FR    | 設計での対応箇所    | カバー状態                                  |
| ----- | ------------------- | ------------------------------------------- |
| FR-01 | 箇所A（タスク 2-2） | 対応済み: `window.permissionAPI` に変更     |
| FR-02 | 箇所A（タスク 2-2） | 対応済み: ローカル `PermissionApi` 型を削除 |
| FR-03 | 箇所B（タスク 2-3） | 対応済み: `getAllowedTools()` に変更        |
| FR-04 | 箇所C（タスク 2-4） | 対応済み: `setMode()` 呼び出しを削除        |
| FR-05 | 箇所C（タスク 2-4） | 対応済み: `clearAll()` に変更               |

### タスク 3-2: 型整合性の検証

以下の型の整合性を確認する：

1. `getPermissionApi()` の戻り値型 `typeof window.permissionAPI | undefined` が、呼び出し側で `?.` ガードされていること
2. `getAllowedTools()` の戻り値 `{ tools: AllowedToolEntry[] }` から `.tools.length` を取得するコードが型安全であること
3. `clearAll()` の戻り値 `{ success: boolean; clearedCount: number }` を使用していないこと（戻り値は破棄するため問題なし）

### タスク 3-3: エラーハンドリングの検証

| 関数                           | エラー時の挙動                      | 妥当性                                           |
| ------------------------------ | ----------------------------------- | ------------------------------------------------ |
| `getPermissionApi()`           | `try-catch` で `undefined` を返す   | 妥当: preload 未初期化環境でも安全               |
| `loadPermissions()`            | `catch` ブロックで既定値のまま表示  | 妥当: 既存挙動を維持                             |
| `handlePermissionModeChange()` | エラーなし（同期関数）              | 妥当: IPC 呼び出しを削除したためエラー発生しない |
| `handleResetRemembered()`      | `catch` ブロックで Toast エラー表示 | 妥当: 既存挙動を維持                             |

### タスク 3-4: 後方互換性の検証

1. `AgentPermissionMode` 型は変更しない → AdvancedSettingsPanel の props インターフェースに影響なし
2. `permissionMode` の初期値 `"default"` は維持 → UI の初期表示に影響なし
3. `rememberedCount` のデータソースが変わる（`getRemembered()` → `getAllowedTools()`）が、表示上は同じ「件数」を示すため UI に違和感なし

### タスク 3-5: セキュリティレビュー

1. `window.permissionAPI` は contextBridge.exposeInMainWorld で公開された安全な API である
2. `clearAll()` の呼び出しはユーザーの明示的なボタン操作によるものであり、意図しない許可クリアは発生しない
3. IPC チャンネル名は `IPC_CHANNELS.PERMISSION_CLEAR_ALL` として preload/index.ts で定義済みであり、未知のチャンネルへのアクセスは発生しない

### タスク 3-6: レビューチェックリスト

- [ ] 全 FR が設計でカバーされている
- [ ] 型の整合性に問題がない
- [ ] エラーハンドリングが妥当である
- [ ] 後方互換性が維持されている
- [ ] セキュリティ上の問題がない
- [ ] テストへの影響が分析されている（タスク 2-5）
- [ ] 変更対象ファイルが最小限である（AgentView/index.tsx の1ファイルのみ）

### タスク 3-7: 30種の思考法レビュー

| 思考法               | 現行仕様書の弱点                                     | エレガントな判断                                        |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| 批判的思考           | source file を system spec と誤認しやすい            | aiworkflow 正本参照を明示する                           |
| 演繹思考             | preload 契約から Renderer 実装へ落とし込む導線が弱い | `window.permissionAPI` を唯一解とする                   |
| 帰納的思考           | 正常例の活用が弱い                                   | `PermissionSettings` を current fact の根拠に使う       |
| アブダクション       | TypeError の因果説明が浅い                           | contract drift を主因と特定する                         |
| 垂直思考             | 判断順序が曖昧                                       | path, type, method, UI state の順で固定する             |
| 要素分解             | API path, type, method, UI state が混在              | 4要素に分離して設計する                                 |
| MECE                 | 修正対象と将来タスクの境界が曖昧                     | bugfix と mode persistence を分離する                   |
| 2軸思考              | 契約変更と UI 変更の優先順位がない                   | public contract 変更なし / UI 局所修正で整理する        |
| プロセス思考         | Phase 11-13 の downstream 影響が弱い                 | manual evidence と approval gate を前倒しで固定する     |
| メタ思考             | workflow pack 自体の欠落が見落とされていた           | 骨格不足も修正対象に含める                              |
| 抽象化思考           | 個別バグ説明に閉じている                             | Renderer と preload の責務境界問題として扱う            |
| ダブルループ思考     | 「どう直すか」に偏る                                 | drift を生む参照規律まで見直す                          |
| ブレインストーミング | 代替案の比較が不足                                   | 直接修正 / adapter / 新規 IPC の3案を並べる             |
| 水平思考             | Settings 実装からの横展開が弱い                      | 既存 contract 利用パターンを横展開する                  |
| 逆説思考             | mode IPC を足したくなる                              | 足さない方が scope と risk を抑えられる                 |
| 類推思考             | 類似 UI との比較が弱い                               | PermissionSettings と同じ contract を採用する           |
| if思考               | preload 未初期化時の扱いが弱い                       | `undefined` fallback を残す                             |
| 素人思考             | なぜ old path がだめか伝わりにくい                   | “住所違い” で説明する                                   |
| システム思考         | Renderer / preload / main の境界整理が弱い           | public surface を中心に説明する                         |
| 因果関係分析         | error と UI state の因果が曖昧                       | old path -> undefined -> TypeError を明記する           |
| 因果ループ           | 一時しのぎだと再発しやすい                           | 正本参照不足 -> drift 再発ループを断つ                  |
| トレードオン思考     | mode persistence を同時投入したくなる                | scope 増大を避け bugfix 完遂を優先する                  |
| プラスサム思考       | bugfix と docs quality が別扱い                      | workflow pack 改善で再発防止価値も取る                  |
| 価値提案思考         | 誰のコストが下がるかが弱い                           | 開発者の調査コストと実行時障害を同時に下げる            |
| 戦略的思考           | follow-up formalize がない                           | mode 永続化を独立 task として切り出す                   |
| why思考              | なぜ local state に留めるかが弱い                    | public contract 非存在だからと明示する                  |
| 改善思考             | 欠落 section が散発的                                | 共通骨格を全Phaseへ補う                                 |
| 仮説思考             | テスト失敗パターンの想定が弱い                       | mock contract drift と fallback path を重点化する       |
| 論点思考             | “API mismatch” と “UI persistence” が混ざる          | 論点を contract alignment に固定する                    |
| KJ法                 | 指摘が断片的に散る                                   | contract / workflow / verification / close-out に束ねる |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                        | パス                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| AgentView / organism 構成     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components-core.md`              |
| Permission UI / IPC 契約      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                |
| Permission execution security | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`           |
| AgentView 周辺導線            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md` |
| Phase 1                       | `docs/30-workflows/agentview-permission-api-fix/phase-1-requirements.md`                  |
| Phase 2                       | `docs/30-workflows/agentview-permission-api-fix/phase-2-design.md`                        |

## 成果物

| 成果物           | 配置先                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| 設計レビュー結果 | `docs/30-workflows/agentview-permission-api-fix/phase-3-design-review.md` |

## 完了条件

- [ ] タスク 3-6 のレビューチェックリストが全て確認済みになった
- [ ] Phase 2 の設計に修正が不要であることを確認した（修正が必要な場合は Phase 2 を更新してから承認）

## 統合テスト連携

| 観点             | 内容                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| テスト観点確定   | AC-01〜AC-06 の各項目が Phase 4〜11 のどこで検証されるかを確定する                      |
| 失敗パターン固定 | `permissionAPI` 不在、`getAllowedTools()` 失敗、`clearAll()` 失敗時の期待挙動を固定する |
| Gate条件         | Phase 4 以降は本レビューで承認した責務境界を崩さないことを条件に進む                    |

## 4条件レビュー

| 条件         | 判定 | 根拠                                                                        |
| ------------ | ---- | --------------------------------------------------------------------------- |
| 矛盾なし     | PASS | preload 正本にない `getMode` / `setMode` を削除対象として明示している       |
| 漏れなし     | PASS | APIパス、件数取得、リセット、ローカル state、テスト影響を包含している       |
| 整合性あり   | PASS | renderer 利用契約を `PermissionAPI` の既存公開面へ揃えている                |
| 依存関係整合 | PASS | AgentView が preload の既存責務を超えて永続化責務を持たない設計に戻している |

## 30種の思考法レビュー

| 思考法               | 本タスクでの結論                                                                   |
| -------------------- | ---------------------------------------------------------------------------------- |
| 批判的思考           | `window.electronAPI.permissions` 前提は事実で裏付けられないため棄却する            |
| 演繹思考             | preload 正本が `window.permissionAPI` なら renderer も同契約へ従うべきである       |
| 帰納的思考           | `PermissionSettings` が既に正しい利用例なので AgentView も同型に揃える             |
| アブダクション       | TypeError の最短原因は「存在しないネストパス参照」である                           |
| 垂直思考             | 変更は `AgentView/index.tsx` 周辺へ限定し、波及を増やさない                        |
| 要素分解             | APIパス、件数取得、リセット、権限モード、テスト、close-out に分解した              |
| MECE                 | 直接修正・参照正本・将来タスクを重複なく分けた                                     |
| 2軸思考              | 「今直すべき / 将来切り出す」「public contract / local state」で整理した           |
| プロセス思考         | Phase 1→13 の進行と gate 条件を再整備した                                          |
| メタ思考             | バグ修正だけでなく workflow pack の構造欠落自体を問題として扱った                  |
| 抽象化思考           | 本質を「renderer と preload 契約の不一致」と定義した                               |
| ダブル・ループ思考   | API追加で合わせるのではなく、期待の持ち方自体を修正した                            |
| ブレインストーミング | API追加、UI削除、local state 維持の3案を比較した                                   |
| 水平思考             | `PermissionSettings` を参照実装として横展開した                                    |
| 逆説思考             | 「足りない API を作る」より「不要な期待を捨てる」方がエレガントと判断した          |
| 類推思考             | 住所違いの窓口参照という比喩で close-out 説明を整理した                            |
| if思考               | 将来 `AgentPermissionAPI` を追加するなら Step 2 必須と条件化した                   |
| 素人思考             | ユーザー視点では「件数が見える」「リセットできる」「落ちない」が価値の中心と捉えた |
| システム思考         | renderer / preload / main / docs pack の連鎖不整合として扱った                     |
| 因果関係分析         | 誤パス参照 → undefined → TypeError という因果を固定した                            |
| 因果ループ           | docs 省略 → validator 警告 → close-out 漏れ再発のループを断った                    |
| トレードオン思考     | UI を残しつつ永続化を切り離し、最小修正で価値を確保した                            |
| プラスサム思考       | バグ修正と task-spec 準拠改善を同一 wave で達成した                                |
| 価値提案思考         | ユーザー価値は新機能追加ではなく既存導線の信頼回復にある                           |
| 戦略的思考           | 今回は bugfix、将来は permission mode 永続化タスクへ分離する                       |
| why思考              | なぜ落ちるかを「誤った期待契約」にまで掘り下げた                                   |
| 改善思考             | 必須構造不足を埋め、validator で再発しない pack にした                             |
| 仮説思考             | `permissionAPI` 参照へ戻せば件数表示とリセットも整合する仮説を採用した             |
| 論点思考             | 論点を「契約修正」「UI責務」「Phase 12/13 整理」に絞った                           |
| KJ法                 | 実装修正、検証整備、close-out 整備、将来タスクにクラスタリングした                 |

## 実行手順

### ステップ1: 要件と設計のトレースを確認する

FR/NFR/AC が設計要素へ漏れなく結び付いているかを確認する。

### ステップ2: スコープ超過を除去する

`PermissionAPI` 拡張や main 側変更のような、本タスクに不要な波及を排除する。

### ステップ3: Phase 4 以降へ進めるか判定する

重大な設計欠陥がなければ Phase 4 へ進め、あれば Phase 2 差し戻し理由を記録する。

## 統合テスト連携

- Phase 4/6 で検証すべき成功系・失敗系・API不在系の観点が十分か確認する。
- Phase 9/10 で参照する acceptance matrix をここで確定する。

## 多角的チェック観点

| 観点       | 本Phaseでの確認内容                        |
| ---------- | ------------------------------------------ |
| 論理整合性 | 要件と設計に矛盾がないか                   |
| 依存関係   | Renderer 変更だけで閉じるか                |
| 最小複雑性 | 新規API追加ではなく既存API参照修正で十分か |
| 将来拡張   | follow-up task 分離が妥当か                |

## サブタスク管理

1. 要件との照合
2. 設計妥当性レビュー
3. リスク整理
4. 差し戻し要否判定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase 4 へ進める判断根拠を残した
- [ ] blocker がある場合は明文化した

## 次のPhase

Phase 4: テスト作成
