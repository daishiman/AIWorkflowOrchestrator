# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 3                                            |
| Phase名    | 設計レビュー                                 |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）         |
| 後続Phase  | Phase 4（テスト作成）                        |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を突き合わせ、Workspace Chat Panel の同期設計が要件を満たし、system spec と矛盾せず、実装フェーズでの手戻りが発生しないことを検証する。判定基準は `review-gate-criteria.md` に準拠する。

## 実行タスク

### T3-1: Phase 1-2 成果物の整合性検証

Phase 1 の要件・gap・非機能要件と Phase 2 の設計が 1:1 で対応しているかを検証する。

| Phase 1 成果物               | 対応する Phase 2 設計               | 検証ポイント                                               |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| T1-1 inventory（6 機能）     | T2-4 flow 設計                      | 6 機能全ての current path がフロー図に含まれているか       |
| T1-2 authority（5 関心ごと） | T2-1 authority 設計                 | 5 関心ごとの判定主体が設計で確定されているか               |
| T1-3 gap（3 カテゴリ）       | T2-5 error policy + T2-1 authority  | 全 gap に対する解決策が設計に含まれているか                |
| T1-4 非機能要件（3 項目）    | T2-2 IPC 契約 + T2-3 state 管理     | latency / size limit / 永続化タイミングが反映されているか  |
| 完了条件: authority 列挙     | T2-1 authority テーブル             | Phase 1 で列挙した authority と Phase 2 の配置が一致するか |
| 完了条件: gap → 後続設計割当 | T2-5 error policy / T2-7 compact UX | 全 gap が具体的な設計タスクに割り当てられているか          |

### T3-2: レビュー観点の逐次検証

review-gate-criteria.md のレビュー観点に沿い、PASS / MINOR / MAJOR の判定根拠を整理する。

### T3-3: 契約品質チェック（設計タスク向け追加観点）

review-gate-criteria.md の「設計タスク専用: 契約品質チェック」を実施する。

| チェック項目             | 確認対象                                                | 判定基準                                                   |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| 前提条件/事後条件        | T2-2 IPC 契約の StreamChatRequest / CancelStreamRequest | 各フィールドの required / optional が明記されているか      |
| IPC ハンドラの Port 依存 | T2-1 authority の判定ロジック配置先                     | 具象クラスではなく Port / Interface 経由か（P61 対策）     |
| DI 境界表                | T2-1 authority テーブル + T2-3 state 管理               | どの層がどのインターフェースに依存するかが記載されているか |
| 受入基準トレーサビリティ | Phase 1 完了条件 vs Phase 2 完了条件                    | Phase 1 の受入基準と Phase 2 の設計が 1:1 で対応するか     |

## レビュー観点チェックリスト

### RV-01: streaming と file context の責務が混線していないか

- **検証対象**: Phase 2 T2-1 authority 設計
- **確認内容**: streaming は Main Process の LLMAdapter 責務、file context は Renderer の buildFileContextBlock 責務として分離されているか。file read failure が streaming 障害と誤認される経路がないか
- **照合先**: `architecture-overview.md` のレイヤー依存方向、Phase 2 設計方針「streaming と file context は別責務」

### RV-02: cancel 時に stale content や誤完了表示が残らないか

- **検証対象**: Phase 2 T2-5 error policy（cancel 時: silent）+ T2-4 cancel フロー
- **確認内容**: cancel 後に streamContent がクリアされ、isStreaming が false に戻り、直前の streaming chunk が assistantMessage として保存されないか。cancel と stream 完了の race condition が考慮されているか
- **照合先**: `llm-streaming.md` の cancel protocol

### RV-03: selected config と access capability の判定順が UI と矛盾しないか

- **検証対象**: Phase 2 T2-3 state 管理設計 + T2-1 authority 設計
- **確認内容**: access capability 判定（Main Process）-> selected config 検証（Main Process）-> UI 反映（Renderer）の順序が設計で固定されているか。Renderer 側で独自の capability 判定が残存していないか
- **照合先**: `design-audit-matrix.md` の「local 判定禁止」方針

### RV-04: guidance と fail-fast が不足していないか

- **検証対象**: Phase 2 T2-5 error policy
- **確認内容**: API key 不足 / provider 未設定 / model 未選択 / network error / file read failure の全ケースで、fail-fast（即時停止）か guidance（次アクション提示）かが明確に定義されているか。unavailable / blocked 状態で「次に何をすべきか」が表示されるか
- **照合先**: `ui-ux-realization.md` の画面状態マトリクス、マイクロコピー原則

### RV-05: IPC 契約の型定義が Phase 1 要件と整合するか

- **検証対象**: Phase 2 T2-2 IPC 契約設計
- **確認内容**: `llm:stream-chat` / `llm:cancel-stream` / `conversation:create` / `conversation:addMessage` の引数型・戻り値型・エラー型が Phase 1 で列挙した inventory（6 機能）と authority（5 関心ごと）を網羅しているか
- **照合先**: `interfaces-llm.md` / `llm-streaming.md` の正本型定義

### RV-06: compact UX で CTA と状態説明が切れていないか

- **検証対象**: Phase 2 T2-7 compact UX 設計
- **確認内容**: panel 幅 <=360px で file context chips / composer actions / guidance block / terminal button の表示が切れず、keyboard 操作で全 CTA に到達可能か。breakpoint の判定方法（ResizeObserver）が定義されているか
- **照合先**: `ui-ux-realization.md` のアクセシビリティ / 操作性セクション

### RV-07: terminal transcript の手動共有契約が親パック正本と矛盾しないか

- **検証対象**: Phase 2 T2-6 transcript 受け取り設計
- **確認内容**: 共有操作 3 系統（選択範囲 / 直近出力 / session 全体）、provenance chip 表示、禁止事項（auto-send / hidden parsing / silent summarization）が `ui-ux-realization.md` の「Transcript -> Chat 手動連携ルール」と一致するか
- **照合先**: `ui-ux-realization.md` の Terminal 常設ルール + Transcript -> Chat 手動連携ルール

### RV-08: P62 対策（DEFAULT_CONFIG fallback 禁止）が設計に反映されているか

- **検証対象**: Phase 2 T2-1 authority 設計 + T2-5 error policy
- **確認内容**: Main Process の `llm:stream-chat` handler が selectedModelId / selectedProviderId を検証し、未設定時に DEFAULT_CONFIG へ暗黙 fallback せず VALIDATION_ERROR を返すか。Renderer 側でも selectedModelId === null 時に送信ボタンを非活性化する二重防御が設計されているか
- **照合先**: P62（06-known-pitfalls.md）、Phase 2 設計方針「selected config authority は Main Process」

### RV-09: 状態遷移テーブルの遷移条件に抜けがないか

- **検証対象**: Phase 2 状態遷移テーブル
- **確認内容**: 全 8 状態（zero / ready / streaming / cancelled / guidance / handoff / compact / blocked）間の遷移が定義されているか。到達不能状態や脱出不能状態がないか。compact は直交状態（他状態と同時に成立）として正しく扱われているか
- **照合先**: `ui-ux-realization.md` UX-04 screenshot 契約の必須状態

## レビューゲート

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

### 判定基準

| 判定              | 条件                                                                       | 次のアクション                                 |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| PASS              | RV-01〜RV-09 全項目で重大な問題がない                                      | Phase 4（テスト作成）に進む                    |
| MINOR             | 軽微な指摘がある（UI 文言調整、テーブル補足、命名不備）                    | 指摘を記録し、未タスク仕様書に変換して次へ進む |
| MAJOR（要件問題） | Phase 1 の要件定義に不足・矛盾がある（gap 漏れ、非機能要件未定義）         | Phase 1（要件定義）へ戻る                      |
| MAJOR（設計問題） | Phase 2 の設計に責務混線・契約不整合がある（authority 誤配置、IPC 非互換） | Phase 2（設計）へ戻る                          |

### 戻り先決定基準

| 問題の種類        | 戻り先              | 具体例                                       |
| ----------------- | ------------------- | -------------------------------------------- |
| 要件の問題        | Phase 1（要件定義） | gap が漏れている、非機能要件が未定義         |
| 設計の問題        | Phase 2（設計）     | authority 配置が誤り、IPC 契約が既存と非互換 |
| 要件 + 設計の問題 | Phase 1（要件定義） | スコープ自体の見直しが必要                   |

### MINOR 判定時のフロー

```
レビューで MINOR 判定
    |
    v
指摘事項を分析
    |
    v
未タスク指示書を docs/30-workflows/unassigned-task/ に作成
    |
    v
task-workflow.md 残課題テーブルに登録
    |
    v
関連仕様書に参照リンク追加
    |
    v
Phase 4 に進む
```

### エスカレーション条件

以下の場合はユーザーにエスカレーションする。

1. 戻り先の判断が困難な場合
2. 複数フェーズにまたがる問題の場合
3. 要件自体の見直しが必要な場合
4. セキュリティ上の重大な懸念が発見された場合

## 参照資料

### 前提成果物

| 参照資料                                | パス                                           | 内容                                                    |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Phase 1（要件定義）仕様書               | `phase-1-requirements.md`                      | 実行タスク T1-1〜T1-4、完了条件、P50 チェックを確認する |
| Phase 1 成果物: 要件整理                | `outputs/phase-1/requirements-definition.md`   | inventory / authority / gap / 非機能要件を確認する      |
| Phase 1 成果物: スコープ定義            | `outputs/phase-1/scope-definition.md`          | 対象範囲と除外範囲を確認する                            |
| Phase 2（設計）仕様書                   | `phase-2-design.md`                            | T2-1〜T2-7 の設計内容を確認する                         |
| Phase 2 成果物: 設計サマリー            | `outputs/phase-2/design-summary.md`            | 責務境界、依存関係、接続順序を確認する                  |
| Phase 2 成果物: 契約一覧                | `outputs/phase-2/contract-matrix.md`           | IPC / state / runtime 契約を確認する                    |
| Phase 2 成果物: UI/UX 実体化            | `outputs/phase-2/ui-ux-realization.md`         | 5 領域構成、状態遷移、CTA 条件を確認する                |
| Phase 2 成果物: transcript 受け取り設計 | `outputs/phase-2/transcript-ingestion-flow.md` | provenance chip と composer 反映を確認する              |
| Phase 2 成果物: state 管理設計          | `outputs/phase-2/state-management-design.md`   | Zustand / local の配置判断を確認する                    |
| Phase 2 成果物: IPC 契約設計            | `outputs/phase-2/ipc-contract-design.md`       | IPC チャンネルの型定義と error code を確認する          |

### ソースコード

| 参照資料                   | パス                                                                                | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | workspace chat UI surface を確認する                              |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する        |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する |

### システム仕様（aiworkflow-requirements）

> 設計が system spec と整合しているかの照合に使用する。

| 参照資料                 | パス                                                                            | 照合内容                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | T2-2 IPC 契約のインデックス（詳細型定義は llm-ipc-types.md を参照）                                 |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | AIChatRequest / LLMProvider 実型定義、`providerId`/`modelId` バリデーション規則が T2-2 と一致するか |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | StreamChunk 型（"content"\|"error"\|"done"）/ cancel protocol が T2-2 と一致するか                  |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 5 領域構成と状態が正本と整合するか                                                                  |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | T2-3 state 配置が正本と矛盾しないか                                                                 |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証 / error masking が設計に含まれているか                                                  |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | T2-5 error policy の fail-fast / guidance / silent / blocked 分類が error-handling 正本と整合するか |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | RV-04 guidance 導線（Settings 遷移 / terminal handoff）が ui-ux-navigation 正本と矛盾しないか       |

### レビュー基準

| 参照資料             | パス                                                                           | 内容                                |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR の判定基準正本 |

### 親パック正本

| 参照資料          | パス                                                                       | 内容                                                        |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| パック index      | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | access matrix 方針と Task08 の責務定義                      |
| UI/UX realization | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`   | Workspace Chat Panel の UI/UX 正本（UX-04 screenshot 契約） |
| design audit      | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 設計監査結論と local 判定禁止方針                           |

## 実行手順

### ステップ1: 前提成果物の確認

1. Phase 1 仕様書（`phase-1-requirements.md`）を読み、T1-1〜T1-4 の実行タスクと完了条件を把握する
2. Phase 1 成果物（`outputs/phase-1/requirements-definition.md` / `scope-definition.md`）を読み、inventory / authority / gap / 非機能要件の具体内容を把握する
3. Phase 2 仕様書（`phase-2-design.md`）を読み、T2-1〜T2-7 の設計内容を把握する
4. Phase 2 成果物 6 ファイルを全て読み、設計の詳細を把握する

### ステップ2: T3-1 Phase 1-2 整合性検証

Phase 1 の 6 項目と Phase 2 の対応設計を 1:1 で突き合わせ、漏れ・矛盾を検出する。

### ステップ3: T3-2 レビュー観点の逐次検証

RV-01〜RV-09 の 9 項目を順番に検証する。各項目で検証対象の Phase 2 設計成果物を読み、照合先の正本と突き合わせ、発見した指摘を severity（MAJOR / MINOR）と判定根拠と共に記録する。

### ステップ4: T3-3 契約品質チェック

review-gate-criteria.md の「設計タスク専用: 契約品質チェック」の 4 項目を実施する。

### ステップ5: system spec との整合確認

aiworkflow-requirements の正本 5 ファイルと Phase 2 の設計を照合し、IPC 契約、UI 状態、state 管理、security のズレを検出する。

### ステップ6: 判定と成果物作成

1. 全指摘を severity 別に集計する
2. MAJOR 指摘が 1 件以上: MAJOR 判定 -> 戻り先を決定
3. MAJOR 指摘が 0 件、MINOR 指摘あり: MINOR 判定 -> 指摘を未タスク仕様書に変換
4. 全指摘が 0 件: PASS 判定
5. 判定根拠を `outputs/phase-3/design-review-report.md` に記録する

### ステップ7: 完了条件と次 Phase への handoff 確認

完了条件チェックリストを全項目確認し、Phase 4 への引き渡し情報を記録する。

## 統合テスト連携

Phase 2 で定義した 9 つの統合テスト契約（stream / cancel / selected files / mention / conversation / access capability / selected config / compact UX / transcript share）が、Phase 1 の要件と整合しているかをレビューする。

| テスト契約        | Phase 1 の対応要件                  | Phase 2 の対応設計           | 整合確認ポイント                                           |
| ----------------- | ----------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| stream            | T1-1 inventory: stream              | T2-4 メッセージ送信フロー    | chunk 受信 -> 表示 -> message 追加の経路が一致するか       |
| cancel            | T1-1 inventory: cancel              | T2-4 cancel フロー           | AbortController の lifecycle が設計通りか                  |
| selected files    | T1-1 inventory: selected files      | T2-4 file attach フロー      | context chips -> buildFileContextBlock の経路が一致するか  |
| mention           | T1-1 inventory: mention             | T2-4 mention フロー          | '@' 検出 -> 候補 -> 選択 -> attachContextFile が一致するか |
| conversation      | T1-1 inventory: conversation 保存   | T2-4 メッセージ送信フロー    | create -> addMessage の永続化タイミングが一致するか        |
| access capability | T1-2 authority: access capability   | T2-1 authority 設計          | Main Process 判定 -> Renderer 消費の経路が一致するか       |
| selected config   | T1-2 authority: provider / model    | T2-1 authority + T2-5 error  | P62 fallback 禁止が二重防御で実現されているか              |
| compact UX        | T1-4 非機能要件                     | T2-7 compact UX 設計         | breakpoint と layout 切替ルールが定義されているか          |
| transcript share  | （親パック UI/UX realization 由来） | T2-6 transcript 受け取り設計 | 手動共有 3 系統と禁止事項が定義されているか                |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 確認内容                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| UI/UX              | Phase 2 の 5 領域構成・状態遷移・CTA 条件が親パック ui-ux-realization.md の UX-04 契約と矛盾しないか                    |
| アーキテクチャ     | streaming / context / conversation の 3 責務が Electron 3 プロセスモデルの層境界を越えていないか                        |
| API 設計           | T2-2 の IPC 型定義が interfaces-llm.md / llm-streaming.md の正本と互換か、P42 準拠の .trim() バリデーションが含まれるか |
| エラーハンドリング | T2-5 error policy の fail-fast / guidance / silent / blocked の 4 分類が全エラー種別をカバーしているか                  |
| セキュリティ       | sender 検証 / path traversal 防止 / error masking / transcript auto-send 禁止が設計に含まれているか                     |
| 状態管理           | T2-3 の Zustand / local 判断基準が arch-state-management.md の配置原則と一致するか                                      |
| P62 対策           | DEFAULT_CONFIG fallback 禁止が Main handler + Renderer 送信ボタンの二重防御で実現されているか                           |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物           | パス                                      | 内容                                                                |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR の判定根拠、全指摘の severity と詳細を記録する |

## 完了条件

- [ ] T3-1: Phase 1-2 成果物の整合性検証が完了し、6 項目全ての対応関係が確認されている
- [ ] T3-2: RV-01〜RV-09 の全 9 項目に判定根拠が記録されている
- [ ] T3-3: 契約品質チェック 4 項目（前提条件 / Port 依存 / DI 境界 / 受入基準トレーサビリティ）が実施されている
- [ ] MAJOR 指摘が 0 件である
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている（P3 準拠: 3 ステップ完了）
- [ ] Task01 の access matrix 契約との矛盾がない
- [ ] 親パック正本（ui-ux-realization.md / design-audit-matrix.md）との整合が確認されている
- [ ] system spec 7 ファイル（interfaces-llm / llm-ipc-types / llm-streaming / ui-ux-feature-components / arch-state-management / security-electron-ipc / error-handling / ui-ux-navigation）との整合確認が記録されている（注: interfaces-llm.md はインデックス、実IPC型定義は llm-ipc-types.md を参照）
- [ ] レビューゲート判定結果（PASS / MINOR / MAJOR）が `outputs/phase-3/design-review-report.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘は、以下のテーブルで追跡計画を明示する。

| MINOR ID  | 指摘内容         | 解決予定Phase    | 解決確認Phase     | 備考                                     |
| --------- | ---------------- | ---------------- | ----------------- | ---------------------------------------- |
| CHAT-M-01 | （実行時に記録） | Phase 5 または 8 | Phase 9 または 10 | 例: マイクロコピー文言調整、テーブル補足 |

- 「解決予定Phase」を Phase 3 時点で決定し、追跡の見通しを立てる
- 「解決確認Phase」は Phase 9（品質検証）または Phase 10（最終レビュー）で記録する
- MINOR 件数が 0 件の場合は「指摘なし（0件）」と明記する

## Simpler Alternative 検討結果

phase-template-core.md の「simpler alternative を検討した結果を記録する」要件に基づき、以下の代替設計を評価する。

| 代替案 ID | 内容                                                                                  | 採用/不採用 | 判断根拠                                                                                                          |
| --------- | ------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| ALT-01    | transcript 受け取り設計（T2-6）を後続タスクに延期する                                 | **不採用**  | ui-ux-realization.md の親パック正本で Task08 のスコープとして定義済み。延期すると親パックとの整合が崩れる         |
| ALT-02    | conversation 永続化の IPC 型定義を「既存 IPC そのまま利用」として省略する             | **不採用**  | 引数型未定義では P60（IPC テスト応答形式不一致）が発生。Phase 2 で型を確定させる必要がある                        |
| ALT-03    | DI 境界を Port/Interface なし（具象クラス直接参照）で実装する                         | **不採用**  | P61 対策として IPC ハンドラの依存先を Port にすることが必須。具象依存では Phase 4 のモック差し替えが困難          |
| ALT-04    | compact UX（T2-7）の breakpoint を CSS media query だけで実装し ResizeObserver 不使用 | **保留**    | CSS media query はウィンドウ幅基準。panel 幅が必要な場合 ResizeObserver が必要だが実装コストが高ければ Phase 8 へ |

## Phase 4 開始条件 / Phase 13 Blocked 条件

### Phase 4 開始条件（全て充足で Phase 4 へ進む）

- [ ] Phase 3 のレビューゲートが PASS または MINOR 解決済みである
- [ ] RV-01〜RV-09 の全 9 項目に判定根拠が記録されている
- [ ] MAJOR 指摘が 0 件である
- [ ] MINOR 指摘がある場合、全て `docs/30-workflows/unassigned-task/` に指示書が作成されている（P3 準拠: 3 ステップ完了）
- [ ] Phase 1 の受入基準 AC-01〜AC-06 が全て充足されていることが T3-1 で確認されている
- [ ] `StreamChatRequest.providerId` が required（省略不可）として Phase 2 に反映されている

### Phase 13 Blocked 条件（以下のいずれかが未解決の場合は Phase 13 に進まない）

- Phase 1 の gap（local-only state / fail-fast 欠如 / guidance 不足）に対応する実装が Phase 5 で完了していない
- `llm:stream-chat` の P62 対策（DEFAULT_CONFIG fallback 禁止）が Main Process ハンドラと Renderer 送信ボタンの両方で実装されていない
- UX-04 Screenshot 契約（zero state / streaming / compact width / guidance の 4 状態）が Phase 11 手動テストで未確認

## サブタスク管理

| サブタスクID | 内容                       | 依存先         | ステータス  |
| ------------ | -------------------------- | -------------- | ----------- |
| ST-3-1       | Phase 1-2 成果物の読み込み | なし           | not_started |
| ST-3-2       | T3-1 整合性検証            | ST-3-1         | not_started |
| ST-3-3       | T3-2 レビュー観点検証      | ST-3-1         | not_started |
| ST-3-4       | T3-3 契約品質チェック      | ST-3-1         | not_started |
| ST-3-5       | system spec 整合確認       | ST-3-3         | not_started |
| ST-3-6       | 判定・成果物作成           | ST-3-2〜ST-3-5 | not_started |
| ST-3-7       | 完了条件確認・handoff 記録 | ST-3-6         | not_started |

## タスク 100% 実行確認【必須】

以下のコマンドで成果物の存在と完了条件の充足を検証する。

```bash
# 1. 成果物ファイルの存在確認
ls -la outputs/phase-3/design-review-report.md

# 2. 判定結果の記録確認
grep -c "PASS\|MINOR\|MAJOR" outputs/phase-3/design-review-report.md

# 3. Phase 1-2 整合性検証の記録確認
grep -c "整合性検証\|Phase 1.*Phase 2" outputs/phase-3/design-review-report.md

# 4. レビュー観点の網羅確認（RV-01〜RV-09 の 9 項目）
grep -c "RV-0[1-9]" outputs/phase-3/design-review-report.md

# 5. 契約品質チェックの記録確認
grep -c "前提条件\|Port 依存\|DI 境界\|トレーサビリティ" outputs/phase-3/design-review-report.md

# 6. system spec 整合確認の記録確認
grep -c "interfaces-llm\|llm-streaming\|ui-ux-feature\|arch-state\|security-electron" outputs/phase-3/design-review-report.md

# 7. MINOR 指摘の未タスク変換確認（MINOR 判定の場合のみ）
ls -la docs/30-workflows/unassigned-task/
```

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
- Phase 4 へ引き渡す情報: 設計レビュー報告（判定結果、全指摘リスト、system spec 整合確認結果）
