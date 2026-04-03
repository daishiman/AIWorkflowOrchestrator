# TASK-SDK-SC-03: External API Support（外部APIサポート） - タスク指示書

## メタ情報

```yaml
issue_number: 1853
task_id: UT-SDK-SC-03-001
task_name: External API Support（外部APIサポート）
category: 要件
target_feature: skill-creator / external-api-support
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SDK-SC-01 Phase 12 後続分解
created_date: 2026-04-03
dependencies: [TASK-SDK-SC-01]
spec_path: docs/30-workflows/unassigned-task/task-sdk-sc-03-external-api-support.md
```

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-SDK-SC-03-001                        |
| タスク名     | External API Support（外部APIサポート） |
| 分類         | 要件                                    |
| 対象機能     | skill-creator / external-api-support    |
| 優先度       | 中                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 未実施                                  |
| 発見元       | TASK-SDK-SC-01 Phase 12 後続分解        |
| 発見日       | 2026-04-03                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

一部のスキル生成では、外部 API の URL や認証情報をその場で確定しないと、生成物が実用にならない。  
SDK Session Bridge だけでは対話は成立するが、外部 API 設定の受け取り口がないため、実運用向けのスキル生成には不足がある。

### 1.2 問題点・課題

- 外部 API 設定を受け取る UI がない
- HTTP アダプタが未整備で、認証方式やタイムアウトの扱いが統一されていない
- API キーなどの秘密情報をログへ出力しない保証がない
- `external-api-config-required` のイベントと shared 型の契約が未確定

### 1.3 放置した場合の影響

- 外部連携前提のスキルが生成できない
- 認証情報の扱いがバラつき、セキュリティ事故の原因になる
- イベント名や payload 形状の drift が再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

外部 API 設定の収集・検証・接続を統一し、生成中のスキルに安全な形で注入できるようにする。

### 2.2 最終ゴール

- URL / method / authType / headers を UI で入力できる
- `none` / `api-key` / `bearer` / `basic` を扱える
- 30 秒タイムアウトで失敗を検出できる
- HTTPS でない URL に警告を出せる
- API キーをログに出力しない

### 2.3 スコープ

#### 含むもの

- `HttpExternalApiAdapter.ts`
- `skillCreatorExternalApi.ts`
- `ExternalApiConfigForm.tsx`
- `SKILL_CREATOR_EXTERNAL_API_CHANNELS`
- テストと契約更新

#### 含まないもの

- 任意プロバイダー SDK の全面実装
- Conversation UI の再設計
- スキル出力保存やレジストリ統合

### 2.4 成果物

- `packages/shared/src/types/skillCreatorExternalApi.ts`
- `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`
- `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx`
- `packages/shared/src/ipc/channels.ts` の追記
- 関連テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-SC-01` が完了していること
- 外部 API 設定のイベント名と shared 型の責務境界が決まっていること

### 3.2 依存タスク

- `TASK-SDK-SC-01`

### 3.3 必要な知識

- Electron Main / Renderer / shared の契約分離
- `fetch` と `AbortController` によるタイムアウト実装
- 認証情報をログへ残さない安全設計

### 3.4 推奨アプローチ

1. 先に shared 型と IPC チャネルを固定する
2. 次に HTTP アダプタの認証/タイムアウトを実装する
3. 最後に UI フォームから `CONFIGURE_API` を送信する
4. secrets を含む値はテストとログ出力で必ずマスクする

### 3.5 苦戦箇所

| ID    | 内容                                                      | 対策                                                     |
| ----- | --------------------------------------------------------- | -------------------------------------------------------- |
| U03-1 | 認証方式が増えるほど入力項目と送信 payload が膨らみやすい | `authType` ごとにフォームを分岐し、共通項目を固定する    |
| U03-2 | 秘密情報のログ漏れが起きやすい                            | エラー文字列の整形を集中化し、キー値をマスクする         |
| U03-3 | UI と Main で payload 形状がズレやすい                    | shared 型を SSoT にして、Renderer では型変換を最小化する |
| U03-4 | タイムアウト時のエラー種別が曖昧になりやすい              | `ExternalApiTimeoutError` と HTTP エラーを明確に分ける   |

---

## 4. 実行手順

### Phase構成

- Phase 1: 要件固定
- Phase 2: 型とチャネル設計
- Phase 3: 実装・テスト
- Phase 4: ドキュメント・Issue 反映

### Phase 1: 要件固定

#### 目的

外部 API に必要な入力項目と安全条件を固定する。

#### 手順

1. 対応する auth 種別を決める
2. タイムアウトと警告条件を決める
3. UI の必須項目を列挙する

#### 成果物

- 要件一覧
- エラー条件一覧

#### 完了条件

- 何を入力して何を検証するか説明できる

### Phase 2: 型とチャネル設計

#### 目的

共有型と IPC チャネルを確定する。

#### 手順

1. `skillCreatorExternalApi.ts` を定義する
2. `channels.ts` に外部 API 用チャネルを追加する
3. payload 形状を renderer / main で一致させる

#### 成果物

- shared 型
- IPC チャネル

#### 完了条件

- shared 型だけ見ても利用契約が分かる

### Phase 3: 実装・テスト

#### 目的

HTTP アダプタと UI フォームを実装する。

#### 手順

1. `HttpExternalApiAdapter` を作る
2. `ExternalApiConfigForm` を作る
3. タイムアウト、警告、秘密情報マスクをテストする

#### 成果物

- TypeScript 実装
- 単体テスト

#### 完了条件

- typecheck / lint / test が通る

### Phase 4: ドキュメント・Issue 反映

#### 目的

仕様変更を追跡可能にする。

#### 手順

1. 参照ドキュメントを更新する
2. GitHub Issue を作成する
3. issue_number を仕様書へ反映する

#### 成果物

- issue_number 付き指示書
- Issue

#### 完了条件

- 共有型・UI・実装の整合が文書化されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `IExternalApiAdapter` 相当の契約が定義されている
- [ ] `ExternalApiConfig` が定義されている
- [ ] 4 種類の認証方式を扱える
- [ ] タイムアウトと警告ログが機能する

### 品質要件

- [ ] API キーがログに出ない
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] Vitest が全件 PASS

### ドキュメント要件

- [ ] shared 型と IPC チャネルの更新箇所が明記されている
- [ ] Issue 反映後に issue_number が埋まる

---

## 6. 検証方法

### テストケース

- `none` / `api-key` / `bearer` / `basic` の各 auth を送れる
- 30 秒タイムアウトで `ExternalApiTimeoutError` が出る
- HTTPS でない URL で警告が出る
- API キーがログに残らない

### 検証手順

1. ローカルで HTTP アダプタをテストする
2. UI から `CONFIGURE_API` を発行する
3. ログに秘密情報が出ないことを確認する

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                            |
| ------------------------- | ------ | -------- | ------------------------------- |
| 認証入力が肥大化する      | 中     | 中       | authType ごとにフォームを分ける |
| 秘密情報漏えいが起きる    | 高     | 低       | ログ整形とマスクを共通化する    |
| チャネル契約が drift する | 高     | 中       | shared 型を単一の正本にする     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-01-seq-task-01-sdk-session-bridge/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/index.md`
- `packages/shared/src/types/skillCreatorSession.ts`
- `packages/shared/src/ipc/channels.ts`

### 参考資料

- `task-specification-creator` の未完了タスクテンプレート
- `github-issue-manager` の Issue 生成スクリプト

---

## 9. 備考

### 補足事項

- このタスクは「対話に必要な追加設定を安全に集める」ための補助タスクである
- 外部 API は実装対象を増やしすぎず、まず HTTP 系の共通契約を固める
