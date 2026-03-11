# APIキー連動3点セット回帰ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1155
```

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001                                          |
| タスク名     | APIキー連動3点セット回帰ガード                                                    |
| 分類         | 改善                                                                              |
| 対象機能     | `ai.chat` / `llm:set-selected-config` / `apiKey:*` / `auth-key:exists` / Settings |
| 優先度       | 中                                                                                |
| 見積もり規模 | 中規模                                                                            |
| ステータス   | 完了（Phase 12完了に伴い completed-tasks へ移管）                                 |
| 発見元       | `TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001` の実装教訓整理 + ユーザー再依頼       |
| 発見日       | 2026-03-11                                                                        |
| 完了日       | 2026-03-11                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001` では、次の 3 つのドリフトを同時に解消した。

1. `apiKey:save/delete` 後に `LLMAdapterFactory.clearInstance(provider)` を呼ばず、旧 adapter が残る
2. Renderer の LLM 選択状態が Main 側 `ai.chat` に同期されず、provider/model 解決がずれる
3. `auth-key:exists` が boolean のみで、Settings が `saved` / `env-fallback` を曖昧表示する

現在のテストは Main / Preload / Renderer ごとに個別に存在するが、上記 3 点を 1 つの回帰マトリクスとして束ねて検証する仕組みはまだない。

### 1.2 問題点・課題

- 回帰テストが層ごとに分散しており、`cache clear` / `選択同期` / `source 表示` のどれか 1 つが抜けても発見が遅れやすい
- 今後 provider 追加や auth 周辺修正が入った際、実装修正は一部だけ正しくても「全体として整合しているか」を即断しづらい
- system spec には 3 点セットの知見を残せたが、実装修正の入口となる自動ガードがないため、次回も差分調査から入りやすい

### 1.3 放置した場合の影響

- 「設定したキーが使われない」「表示だけ合っていて実行先が違う」系の不整合が再発しやすい
- 修正時に Main / Preload / Renderer / spec を毎回手で横断確認する必要があり、初動が遅い
- 既存の分散テストが通っていても、統合的な契約崩れを見逃す可能性が残る

---

## 2. 何を達成するか（What）

### 2.1 目的

APIキー連動で重要だった 3 契約を、単一の回帰ガードとして再利用可能にする。

### 2.2 最終ゴール

- `apiKey:save/delete -> adapter cache clear` を固定する回帰テストがある
- `llm:set-selected-config -> ai.chat fallback 解決` を固定する回帰テストがある
- `auth-key:exists.source -> Settings 表示` を固定する回帰テストがある
- 上記 3 点を「APIキー連動3点セット」として 1 つの実行入口、または 1 つのマトリクスで確認できる
- system spec と task-spec の両方から、そのガードへ短手順で到達できる

### 2.3 スコープ

#### 含むもの

- Main/IPC 層の `cache clear` と `provider/model` 解決順を束ねた回帰テスト
- Renderer 層の `source` 表示と `authMode=api-key` 表示条件を束ねた回帰テスト
- provider / auth source の代表マトリクス設計
- 実行コマンドと system spec 参照導線の整備

#### 含まないもの

- Playwright による全面 E2E の追加
- 各 LLM provider 実 API を叩く統合試験
- 新しい auth mode や provider 機能自体の追加
- Settings UI の再デザイン

### 2.4 成果物

| 成果物                         | 説明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| APIキー連動3点セット回帰テスト | `cache clear` / `選択同期` / `source 表示` をまとめた guard  |
| テスト補助ヘルパー             | provider / auth source マトリクスを再利用する helper         |
| 実行コマンド追記               | task-workflow / workflow spec / 実装ガイドから辿れる実行導線 |
| system spec 同期               | 関連未タスクと guard 目的の明文化                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001` の実装内容が main/preload/renderer に反映済みであること
- `apps/desktop` の targeted tests が安定して再実行できること
- `aiworkflow-requirements` 側に APIキー連動 workflow spec が存在すること

### 3.2 依存タスク

| タスクID                                  | ステータス |
| ----------------------------------------- | ---------- |
| TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 | 完了       |

### 3.3 必要な知識

- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/main/ipc/apiKeyHandlers.ts`
- `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`
- `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md`

### 3.4 推奨アプローチ

1. まず 3 契約を `保存/削除`, `選択同期`, `状態表示` の 3 軸へ分ける
2. 各軸の既存テストを流用できる部分と、横断 guard が必要な部分を切り分ける
3. `provider`（4種）と `source`（saved/env-fallback/not-set）の最小マトリクスを定義する
4. 個別 unit test を増やすだけでなく、1 コマンドで 3 軸を再確認できる入口を用意する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                                                                 | 解決策                                                                      | 教訓                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| APIキー更新後の stale adapter              | `apiKey:save/delete` は通るのに旧キーで実行される不整合を追跡した        | `LLMAdapterFactory.clearInstance(provider)` を保存/削除成功後に必ず実行した | 認証情報更新は永続化だけで閉じず、runtime cache invalidation とセットで guard 化する  |
| `ai.chat` の provider/model 解決先ドリフト | Renderer の選択状態と Main の実行設定が別管理だった                      | `llm:set-selected-config` を追加し、選択変更時に Main へ同期した            | Main 実行主体の導線は「UI状態同期IPC + 実行時 fallback 解決」の両方をまとめて検証する |
| `auth-key:exists` の情報不足               | `exists` だけでは UI が `saved` と `env-fallback` を安定表示できなかった | `source` を追加し、Settings は `source` 優先表示へ切り替えた                | UI が複数状態を出す場合は、boolean ではなく判定根拠フィールドを guard 対象にする      |

### 3.6 システム仕様書参照テーブル

| 観点         | 参照先                                               | 確認内容                                                      |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------- |
| 再利用導線   | `workflow-apikey-chat-tool-integration-alignment.md` | 3点セットの全体像、責務分離、短手順                           |
| API/IPC      | `api-ipc-system.md`                                  | `AI_CHAT` 解決順、`llm:set-selected-config`、cache clear 契約 |
| 型定義       | `llm-ipc-types.md`                                   | `AIChatRequest.providerId/modelId`、同期 request              |
| 認証型       | `interfaces-auth.md`                                 | `AuthKeyExistsResponse.source` 契約                           |
| UI表示       | `ui-ux-settings.md`                                  | `authMode=api-key` 時の表示条件、`source` 優先表示            |
| セキュリティ | `security-electron-ipc.md`                           | `source` は返すがキー実値は返さない境界                       |
| 台帳/教訓    | `task-workflow.md`, `lessons-learned.md`             | 検証証跡、苦戦箇所、再発防止ルール                            |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                | 実行内容                                             | 完了条件                                          |
| ----- | ------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| A     | マトリクス定義      | provider / source / update action の最小ケースを定義 | 3軸の代表ケースが一覧化されている                 |
| B     | Main/IPC guard 実装 | `cache clear` と `AI_CHAT` 解決順の回帰を追加        | save/delete と explicit/fallback 解決が固定される |
| C     | Renderer guard 実装 | `source` 表示と `authMode` 表示条件の回帰を追加      | Settings 表示の揺れを再現なく検出できる           |
| D     | 実行入口と仕様同期  | 実行コマンドと関連仕様書の導線を更新                 | 1 コマンド or 1 テスト群で再確認できる            |

### Phase A: マトリクス定義

1. provider 4種（`openai` / `anthropic` / `google` / `xai`）の代表モデルを固定する
2. auth source 3種（`saved` / `env-fallback` / `not-set`）を UI 表示観点で固定する
3. `save` / `delete` / explicit request / fallback request のどこを guard 対象にするか決める

### Phase B: Main/IPC guard 実装

1. `apiKey:save/delete` 成功後に `clearInstance(provider)` が呼ばれることを provider 横断で確認する
2. `AIChatRequest.providerId/modelId` 指定あり/なしの両ケースで、解決順が期待どおりになることを確認する
3. `providerId` と `modelId` の片指定 fail-fast を guard に含める

### Phase C: Renderer guard 実装

1. `auth-key:exists.source` の 3 状態と Settings 表示の対応を固定する
2. `authMode === "api-key"` のときだけ `AuthKeySection` が表示されることを guard に含める
3. `source` が返る場合は `hasCredentials` より優先されることを guard に含める

### Phase D: 実行入口と仕様同期

1. 3 点セット guard の実行コマンドを workflow spec と task-workflow に明記する
2. 実装ガイドまたは quick reference に「この系統は guard を先に回す」導線を追記する
3. 変更後は system spec と未タスク台帳を同一ターンで同期する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `apiKey:save/delete -> clearInstance(provider)` を provider 横断で検証できる
- [ ] `AI_CHAT` の explicit 指定 / Main fallback / 片指定 fail-fast を 1 つの guard 群で検証できる
- [ ] `auth-key:exists.source` の 3 状態と Settings 表示対応を guard 化できる
- [ ] `authMode=api-key` 表示条件を回帰検知できる

### 品質要件

- [ ] 既存の分散テストと責務が重複しすぎず、「横断 guard」として役割が分かれている
- [ ] provider / source の代表マトリクスが過不足なく説明できる
- [ ] guard 実行コマンドがドキュメントから一意に辿れる

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に本未タスクへの導線がある
- [ ] `workflow-apikey-chat-tool-integration-alignment.md` に関連未タスクが追記されている
- [ ] 少なくとも 1 つの domain spec（`api-ipc-system.md`）に関連未タスクが追記されている

---

## 6. 検証方法

### テストケース

| ID    | テストケース                                              | 期待結果                                 |
| ----- | --------------------------------------------------------- | ---------------------------------------- |
| TC-01 | `apiKey:save` 後に `clearInstance(provider)` が呼ばれる   | provider ごとに cache clear が固定される |
| TC-02 | `apiKey:delete` 後に `clearInstance(provider)` が呼ばれる | 削除後も stale adapter が残らない        |
| TC-03 | `AIChatRequest.providerId/modelId` 指定時は request 優先  | Main fallback より request が優先される  |
| TC-04 | `providerId/modelId` 未指定時は Main fallback             | `llm:set-selected-config` の結果を使う   |
| TC-05 | `providerId/modelId` 片指定は fail-fast                   | 実行前にエラーを返す                     |
| TC-06 | `auth-key:exists.source=saved`                            | Settings が `saved` を表示する           |
| TC-07 | `auth-key:exists.source=env-fallback`                     | Settings が `env-fallback` を表示する    |
| TC-08 | `auth-key:exists.source=not-set`                          | Settings が `not-set` を表示する         |
| TC-09 | `authMode !== api-key`                                    | `AuthKeySection` が非表示になる          |

### 検証手順

```bash
# 未タスク指示書の配置・品質確認
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md

# 未タスクリンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 実装時の回帰 guard 実行候補
cd apps/desktop && pnpm exec vitest run \
  src/main/ipc/__tests__/aiHandlers.llm.test.ts \
  src/main/ipc/__tests__/authKeyHandlers.test.ts \
  src/main/handlers/__tests__/llm.test.ts \
  src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                          |
| -------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------- |
| 既存 unit test と役割が重複し、守備範囲が曖昧になる      | 中     | 中       | 3点セット横断でしか検出できない条件に限定する                 |
| provider 数が増え、マトリクスが肥大化する                | 中     | 中       | 全 provider 全条件ではなく代表モデル + 共通 helper で圧縮する |
| UI 表示テストだけ増えて Main 契約 guard が弱いままになる | 高     | 中       | Main/IPC と Renderer の 2 層を同一未タスク内で扱う            |
| 文書だけ更新されて guard 実装が後回しになる              | 中     | 中       | task-workflow と domain spec の両方へ未タスク導線を固定する   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 関連コード

- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/main/ipc/apiKeyHandlers.ts`
- `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- `apps/desktop/src/main/handlers/llm.ts`
- `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

---

## 9. 備考

### 発見理由

元の Phase 12 では blocking 未タスク 0 件として閉じたが、ユーザーから「今回苦戦した箇所を将来の短手順に変換したい」という追加要求があり、既存の分散テストだけでは守り切れていない再利用課題を正式な未タスクとして切り出した。

### 位置づけ

本未タスクは「現機能の不具合修正」ではなく、「同種課題の再発初動を短縮する回帰 guard」の整備である。
