# UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001: authCallbackServer ライフサイクル契約ガード

## メタ情報

```yaml
issue_number: 921
task_id: UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001
task_name: authCallbackServer ライフサイクル契約ガード
task_type: 改善
target_feature: OAuth認証コールバックローカルHTTPサーバー（timeout/wait/stop責務境界）
priority: 中
scale: 中規模
status: 完了
source_phase: TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 Phase 12（実装苦戦箇所の再発防止）
created_date: 2026-02-28
completed_date: 2026-02-28
dependencies:
  - TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001
```

| 項目         | 値                                                     |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001      |
| タスク名     | authCallbackServer ライフサイクル契約ガード            |
| 分類         | 改善                                                   |
| 対象機能     | OAuth認証コールバックローカルHTTPサーバー              |
| 優先度       | 中                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | 完了                                                   |
| 発見元       | TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 Phase 12 |
| 発見日       | 2026-02-28                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001` で、`waitForCallback()` timeout 時に `stop()` を呼んでしまう責務混在を修正し、ワーカー終了時の不安定要因を解消した。現在はテストと運用ルールで再発防止しているが、契約違反を機械的に検出するガードが不足している。

### 1.2 問題点・課題

| 課題  | 内容                                                                          |
| ----- | ----------------------------------------------------------------------------- | --- | -------------------------------------------------- |
| 課題1 | timeout系APIに停止副作用が再混入しても、実装レビュー依存でしか検出できない    |
| 課題2 | `stop()` の冪等要件（`!server                                                 |     | !server.listening`）が将来変更で崩れるリスクがある |
| 課題3 | Phase 12 の再監査で得た苦戦箇所が、後続タスクの実装手順に強制適用されていない |

### 1.3 放置した場合の影響

- auth callback 終了フローの不安定化が再発し、認証完了後にワーカーが残留する可能性がある
- timeout/stop責務の設計ドリフトが起きても検知が遅れる
- 同種課題で毎回調査コストが発生し、修正速度が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

authCallbackServer の `waitForCallback`/`stop` 契約を明文化し、契約違反をテストと仕様同期で即検出できる状態にする。

### 2.2 最終ゴール

1. `waitForCallback()` は timeout 時にエラー返却のみ行い、停止副作用を持たないことを契約テストで固定する
2. `stop()` は未起動・停止済み・多重呼び出しで常に成功することを冪等テストで固定する
3. `aiworkflow-requirements` の関連仕様（security/task-workflow/lessons）に未タスク運用が同期される

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/auth/authCallbackServer.ts` 契約の維持ガード追加
- `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts` 契約テスト追加
- `aiworkflow-requirements` の未タスク台帳・教訓リンクの更新

#### 含まないもの

- OAuthプロバイダー追加
- 認証UI変更
- ネットワーク再試行機構の実装

### 2.4 成果物

- ライフサイクル契約テスト追加（timeout副作用禁止 + stop冪等保証）
- 仕様同期差分（`task-workflow.md` / `security-implementation.md`）
- Phase 12 検証証跡（リンク整合・未タスク監査）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001` の修正が mainline に存在する
- `pnpm --filter @repo/desktop exec vitest` が実行可能
- `task-specification-creator` の未タスク監査スクリプトを利用できる

### 3.2 依存タスク

| タスクID                                      | 依存内容                           | 状態   |
| --------------------------------------------- | ---------------------------------- | ------ |
| TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 | timeout/stop責務分離の基盤実装     | 完了   |
| UT-PROTOCOL-URL-001                           | Auth callback 系の共通再発防止知見 | 未実施 |

### 3.3 必要な知識

- Node.js HTTPサーバーの `listen` / `close` ライフサイクル
- 非同期テスト設計（timeout/cleanup/finally）
- Phase 12 の未タスク監査運用（current/baseline 分離）

### 3.4 システム仕様書参照（aiworkflow-requirements）

| 仕様書                                                                               | 参照目的                                        |
| ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/security-implementation.md`       | auth callback server の timeout/stop 契約を確認 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 未タスク台帳登録・追跡ルールを確認              |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 同種課題の再発条件と解決手順を再利用            |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 9セクション構造・品質要件の準拠確認             |

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                                                                                                    | 解決策                                                            | 教訓                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| timeout時に待機APIが停止責務まで持っていた | `TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001` 実装時に、timeout失敗と停止処理が結合して終了順序が不安定化 | timeoutハンドラから `stop()` を排除し、停止は呼び出し側責務へ分離 | timeout系APIは副作用なしを原則化し、責務境界を先に固定する |
| `stop()` 多重実行で終了経路が揺れる        | `server.listening` を見ない停止処理で、停止済みケースに例外経路が混入                                       | `!server                                                          |                                                            | !server.listening` で早期returnし、`server.close` は best-effort で吸収 | 停止APIは idempotent を第一要件にして仕様化する |
| 監査スクリプト所在の誤認                   | 検証コマンドを記憶ベースで実行し、`task-specification-creator/scripts` 正本を外しやすい                     | `rg --files .claude/skills` で実体解決後に監査実行                | Phase 12 監査は「実体探索→実行」を固定手順にする           |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約定義の固定
- Phase B: 契約テストの追加
- Phase C: 仕様同期と監査

### Phase A: 契約定義の固定

#### 目的

wait/stop の責務境界を仕様とテスト観点で固定する。

#### 手順

1. `authCallbackServer.ts` の公開契約（waitは待機、stopは停止）をチェックリスト化する
2. timeout・callback受信・明示停止の3経路で副作用を表に整理する
3. `security-implementation.md` と契約表現が一致していることを確認する

#### 成果物

- 契約チェックリスト（作業メモまたは検証ノート）

#### 完了条件

- wait/stop 契約の曖昧点がゼロ

### Phase B: 契約テストの追加

#### 目的

責務混在の再発をテストで即検知できるようにする。

#### 手順

1. timeout後に `server.isRunning` が維持されることを検証するテストを追加する
2. `stop()` を複数回連続実行しても成功するテストを追加する
3. callback受信後の `stop()` が安定して成功するテストを追加する

#### 成果物

- 契約テスト追加差分

#### 完了条件

- 新規契約テストが全てPASS

### Phase C: 仕様同期と監査

#### 目的

実装・未タスク・システム仕様の追跡可能性を統一する。

#### 手順

1. `task-workflow.md` の残課題ステータスを更新する
2. 必要に応じて `security-implementation.md` の関連未タスク参照を更新する
3. `verify-unassigned-links` と `audit-unassigned-tasks` を実行し証跡を残す

#### 成果物

- 仕様更新差分
- 監査ログ

#### 完了条件

- `verify-unassigned-links` で missing=0
- `audit --target-file` で currentViolations=0

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] timeout時に `waitForCallback()` が停止副作用を持たないことをテストで保証
- [ ] `stop()` の冪等性をテストで保証
- [ ] callback成功後のクリーンアップ経路をテストで保証

### 品質要件

- [ ] 契約テストが flake なく安定実行できる
- [ ] wait/stop 契約が `security-implementation.md` と一致
- [ ] 再発条件と対処が `lessons-learned.md` と矛盾しない

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/unassigned-task/` に存在
- [ ] `task-workflow.md` 残課題テーブルに登録済み
- [ ] 未タスク監査結果（target-file）が PASS

---

## 6. 検証方法

### テストケース

| #   | 検証項目            | 期待結果                                                     |
| --- | ------------------- | ------------------------------------------------------------ |
| 1   | timeout後の状態確認 | `waitForCallback()` は reject するがサーバーは自動停止しない |
| 2   | stop多重実行        | 2回以上の `stop()` が例外なしで完了する                      |
| 3   | callback受信後stop  | callback成功後の `stop()` が安定して成功する                 |
| 4   | 未タスク監査        | 指定ファイル監査で `currentViolations=0`                     |

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/auth/__tests__/authCallbackServer.test.ts

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-auth-callback-lifecycle-contract-guard-001.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                                     |
| ------------------------------------ | ------ | -------- | ------------------------------------------------------------------------ |
| 既存テストと責務が重複し保守が煩雑化 | 中     | 中       | 「契約テスト（責務境界）」と「機能テスト（正常系）」を分離して命名する   |
| timeout依存テストが不安定化          | 中     | 低       | タイムアウト値を短縮し、`afterEach` の明示停止でクリーンアップを固定する |
| 仕様更新が片側のみになりドリフト再発 | 中     | 中       | `security` と `task-workflow` を同ターン更新し、監査4点セットで閉じる    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/documentation-changelog.md`
- `.claude/skills/aiworkflow-requirements/references/security-implementation.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `apps/desktop/src/main/auth/authCallbackServer.ts`
- `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし（Phase 12 の苦戦箇所分析から派生）。

### 補足事項

本タスクは機能追加ではなく「責務境界の退行防止」が主目的である。実装時は `waitForCallback` と `stop` の責務を混在させないことを最優先にする。
