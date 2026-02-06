# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 12                      |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

**IMPORTANT**: Phase 12は4つの必須タスクで構成される。全て完了必須。

---

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成） - 概念的説明 + 技術的詳細
- Task 2: システム仕様書更新（4サブステップ） - タスク完了記録 + 実装状況更新 + 関連タスク更新 + システム仕様更新
- Task 3: ドキュメント更新履歴作成 - documentation-changelog.md
- Task 4: 未タスク検出レポート作成（0件でも出力必須） - Phase 3/10/11結果とTODO/FIXMEの検出

---

## 参照資料

| 参照資料                        | パス                                                                                | 内容                       |
| ------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| Phase 10レビュー結果            | `outputs/phase-10/final-review-result.md`                                           | MINOR指摘事項の確認        |
| Phase 11手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                            | 手動テスト発見事項         |
| Phase 3設計レビュー結果         | `outputs/phase-3/design-review-result.md`                                           | MINOR指摘の確認            |
| Phase 5実装サマリー             | `outputs/phase-5/implementation-summary.md`                                         | 実装内容の確認             |
| 認証インターフェース仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`              | DEBT-SEC-001/002/003の定義 |
| 認証セキュリティ仕様            | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`   | 認証基盤設計               |
| セキュリティ実装仕様            | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`      | PKCE/State実装の記録先     |
| 実装ガイドテンプレート          | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | テンプレート               |
| 仕様更新ワークフロー            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | 仕様更新手順               |
| aiworkflow-requirements LOGS    | `.claude/skills/aiworkflow-requirements/LOGS.md`                                    | タスク完了エントリ先       |
| task-specification-creator LOGS | `.claude/skills/task-specification-creator/LOGS.md`                                 | タスク完了記録先           |
| topic-map                       | `.claude/skills/aiworkflow-requirements/references/topic-map.md`                    | セクションエントリ先       |

---

## 実行手順

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。

#### Part 1: 概念的説明（中学生レベル）

日常の例え話で概念を説明する:

| 技術概念                            | 例え話                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| PKCE（Proof Key for Code Exchange） | 暗号化された合言葉で本人確認する仕組み。宅配便の受け取りに例えると、注文時に自分だけが知っている合言葉を決め、届いた人が合言葉を言えるか確認する |
| ローカルHTTPサーバー                | 自分だけの郵便受け。家の前に設置して、自分宛の手紙（認証結果）だけを受け取る。他の人は使えない                                                   |
| State parameter                     | 注文番号で正しい荷物か確認する仕組み。ネット通販で注文番号があれば、届いた荷物が自分の注文したものか確認できる                                   |
| Authorization Code Flow             | お店（Google）が「この人は本人です」という証明書（コード）を渡し、それをアプリが受け取って確認する流れ                                           |

**記載内容**:

- 認証フローの全体像（図解）
- なぜImplicit FlowからPKCEに移行するのか（セキュリティ向上の理由）
- 各コンポーネントの役割

#### Part 2: 技術者レベル

**記載内容**:

1. **TypeScriptインターフェース一覧**
   - `PKCEPair`: `{ codeVerifier: string; codeChallenge: string }`
   - `AuthCallbackResult`: `{ code: string; state: string }`
   - `AuthCallbackServer`: `{ start(): Promise<{port: number}>; stop(): Promise<void>; waitForCallback(): Promise<AuthCallbackResult> }`
   - `AuthFlowState`: `'idle' | 'authenticating' | 'success' | 'error'`

2. **API仕様**
   - IPCチャネル: `auth:start-oauth-flow`, `auth:callback-port`
   - リクエスト/レスポンス型定義

3. **コード例**
   - PKCE生成の使用例
   - HTTPサーバー起動の使用例
   - オーケストレーターの呼び出し例

4. **設定値一覧**

   | 設定項目              | 値                | 変更可否 | 備考                     |
   | --------------------- | ----------------- | -------- | ------------------------ |
   | HTTPサーバーホスト    | `127.0.0.1`       | 不可     | セキュリティ要件         |
   | HTTPサーバーポート    | 動的割り当て（0） | 不可     | OS自動割り当て           |
   | 認証タイムアウト      | 300,000ms（5分）  | 可       | 環境変数で変更可能       |
   | PKCE code_verifier長  | 64文字            | 可       | 43-128の範囲（RFC 7636） |
   | State parameterサイズ | 32バイト          | 不可     | CSRF対策の最低要件       |
   | HTTPサーバー停止待機  | 30,000ms（30秒）  | 可       | コールバック後の猶予時間 |

**成果物配置先**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップ（4サブステップ）で実行**:

#### Step 1-A: タスク完了記録【必須・全タスク】

| 項目                               | 更新内容                                                       | ステータス |
| ---------------------------------- | -------------------------------------------------------------- | ---------- |
| interfaces-auth.md                 | 「完了タスク」セクションにTASK-AUTH-CALLBACK-001完了記録を追加 | [ ]        |
| aiworkflow-requirements/LOGS.md    | タスク完了エントリを追加                                       | [ ]        |
| task-specification-creator/LOGS.md | タスク完了記録を追加                                           | [ ]        |
| topic-map.md                       | PKCE認証フロー関連の新規セクションエントリを追加               | [ ]        |

```markdown
## 完了タスク

### タスク: TASK-AUTH-CALLBACK-001 - OAuth認証コールバックPKCE移行（完了日記入）

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| タスクID   | TASK-AUTH-CALLBACK-001                                            |
| ステータス | **完了**                                                          |
| 機能名     | auth-callback-urlscheme                                           |
| テスト数   | N（自動）+ 9（手動）                                              |
| 主な成果   | PKCE + ローカルHTTPサーバー方式への移行、DEBT-SEC-001/002/003解消 |
```

#### Step 1-B: 実装状況テーブル更新

interfaces-auth.mdの技術的負債テーブルを更新:

| 項目         | 変更前 | 変更後   |
| ------------ | ------ | -------- |
| DEBT-SEC-001 | 未着手 | **完了** |
| DEBT-SEC-002 | 未着手 | **完了** |
| DEBT-SEC-003 | 未着手 | **完了** |

#### Step 1-C: 関連タスクテーブル更新

以下のファイルで `TASK-AUTH-CALLBACK-001` またはDEBT-SEC関連の参照を検索し、ステータスを更新する:

```bash
grep -rn "AUTH-CALLBACK-001\|DEBT-SEC-001\|DEBT-SEC-002\|DEBT-SEC-003" \
  .claude/skills/aiworkflow-requirements/references/
```

**更新対象候補**:

- `architecture-auth-security.md`: 認証フロー関連タスクのステータス
- `interfaces-auth.md`: DEBT-SEC関連の実装ステータス
- `security-implementation.md`: セキュリティ実装タスクのステータス

#### Step 2: システム仕様更新

**更新要否判断**:

| 変更内容                   | 更新必要 | 理由                         |
| -------------------------- | -------- | ---------------------------- |
| PKCEPair型追加             | 必要     | 新規インターフェース         |
| AuthCallbackResult型追加   | 必要     | 新規インターフェース         |
| AuthCallbackServer型追加   | 必要     | 新規インターフェース         |
| AuthFlowOrchestrator追加   | 必要     | 新規アーキテクチャパターン   |
| ハイブリッド認証フロー追加 | 必要     | アーキテクチャパターン追加   |
| ローカルHTTPサーバー記述   | 必要     | 新規コンポーネント           |
| IPCチャネル追加            | 必要     | 新規定数追加                 |
| PKCE/State実装の記録       | 必要     | セキュリティ実装パターン追加 |

**更新対象ファイルと内容**:

| ファイル                         | 更新内容                                               |
| -------------------------------- | ------------------------------------------------------ |
| `interfaces-auth.md`             | PKCEPair, AuthCallbackResult, AuthCallbackServer型追加 |
| `architecture-auth-security.md`  | ハイブリッド認証フロー追加、ローカルHTTPサーバー記述   |
| `security-implementation.md`     | PKCE/State実装の記録                                   |
| `api-endpoints.md`（該当あれば） | 新規IPCチャネル（auth:start-oauth-flow等）追加         |

**更新原則**:

- 概要のみ記載、Single Source of Truth遵守
- 詳細は実装ガイド（Part 2）を参照させる

---

### Task 3: ドキュメント更新履歴作成【必須】

`documentation-changelog.md` を作成する:

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/auth-callback-urlscheme

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/auth-callback-urlscheme \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新（Phase 12のステータスをcompletedに）
- 更新したドキュメントと変更内容を一覧化

**記載内容**:

| 更新対象ドキュメント            | 変更種別 | 変更内容                                               |
| ------------------------------- | -------- | ------------------------------------------------------ |
| `interfaces-auth.md`            | 追加     | PKCEPair, AuthCallbackResult, AuthCallbackServer型追加 |
| `architecture-auth-security.md` | 追加     | ハイブリッド認証フロー、ローカルHTTPサーバー記述       |
| `security-implementation.md`    | 追加     | PKCE/State実装の記録                                   |
| `LOGS.md`（両方）               | 追加     | TASK-AUTH-CALLBACK-001完了エントリ                     |
| `topic-map.md`                  | 追加     | PKCE認証フロー関連エントリ                             |

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**成果物配置先**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポート作成【必須】

**0件でも出力必須**。

**検出ソース**:

| #   | ソース                 | 確認項目                      | 確認方法                   |
| --- | ---------------------- | ----------------------------- | -------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/` を確認  |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/` を確認 |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/` を確認 |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | outputs/ 全体を検索        |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | 実装ファイルをgrep         |

**検出手順**:

```bash
# コードベースのTODO/FIXME検索
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/main/auth/ \
  apps/desktop/src/main/ipc/authHandlers.ts \
  apps/desktop/src/main/protocol/customProtocol.ts \
  apps/desktop/src/renderer/utils/devMockAuth.ts \
  packages/shared/types/ \
  packages/shared/constants/ipcChannels.ts \
  --include="*.ts" --include="*.tsx"

# Phase成果物の将来対応検索
grep -rn "将来対応\|TODO\|FIXME\|今後" \
  docs/30-workflows/auth-callback-urlscheme/outputs/
```

**レポートフォーマット**:

```markdown
# 未タスク検出レポート

## 検出サマリー

| ソース                 | 検出件数 |
| ---------------------- | -------- |
| Phase 3レビュー結果    | N件      |
| Phase 10レビュー結果   | N件      |
| Phase 11手動テスト結果 | N件      |
| Phase成果物TODO/FIXME  | N件      |
| コードベースTODO/FIXME | N件      |
| **合計**               | **N件**  |

## 検出詳細

（検出された未タスクを1件ずつ記載。0件の場合も「検出なし」と明記）
```

**成果物配置先**: `outputs/phase-12/unassigned-task-detection.md`

---

## アーキテクチャ層別ドキュメント

実装ガイドPart 2では、以下の層別にドキュメントを作成する:

| 層               | ドキュメント内容                                       | 更新対象                                 |
| ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| Main Process     | PKCE生成、HTTPサーバー、オーケストレーター設計         | `architecture-auth-security.md`          |
| IPC通信          | auth:start-oauth-flow, auth:callback-port チャネル定義 | `interfaces-auth.md`, `api-endpoints.md` |
| Preload          | ホワイトリスト更新内容、セキュリティ考慮事項           | `security-api-electron.md`               |
| Renderer Process | AuthFlowState型、認証状態UI表示                        | `interfaces-auth.md`                     |
| セキュリティ     | PKCE実装、State検証、127.0.0.1バインド                 | `security-implementation.md`             |

---

## 統合テスト連携

本Phaseはドキュメント作成のため、統合テスト連携は実行対象外。
ただし、以下の観点がドキュメントに正確に記載されていることを確認する:

| 確認観点               | 記載内容                         |
| ---------------------- | -------------------------------- |
| PKCE認証フロー全体像   | 実装ガイドPart 1 + Part 2に記載  |
| セキュリティ実装詳細   | security-implementation.mdに記載 |
| IPC通信仕様            | interfaces-auth.mdに記載         |
| エラーハンドリング仕様 | 実装ガイドPart 2に記載           |

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 必須 | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（0件でも出力）   |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した**
- [ ] **【Task 2 Step 1-B】interfaces-auth.mdの「DEBT-SEC-001/002/003」を「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（architecture-auth-security.md等）**
- [ ] **【Task 2 Step 2】システム仕様更新（新規インターフェース: PKCEPair, AuthCallbackServer, AuthFlowOrchestrator）を実施した**
- [ ] **【Task 2 Step 2】interfaces-auth.md: PKCE関連型追加、AuthCallbackResult型追加**
- [ ] **【Task 2 Step 2】architecture-auth-security.md: ハイブリッド認証フロー追加、ローカルHTTPサーバー記述**
- [ ] **【Task 2 Step 2】security-implementation.md: PKCE/State実装の記録**
- [ ] **アーキテクチャ層別のドキュメントが作成されている**
- [ ] **documentation-changelog.mdが作成されている**
- [ ] **artifacts.jsonが更新されている**
- [ ] **未タスク検出レポートが出力されている**【必須・0件でも出力】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                          |
| `complete-phase.js`                   | 手動でartifacts.jsonを更新                                                      |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認しunassigned-task-detection.mdを作成 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                              |

---

## タスク100%実行確認

- [ ] Task 1: 実装ガイド作成（Part 1 + Part 2） - 完了
- [ ] Task 2: システム仕様書更新（Step 1-A + 1-B + 1-C + Step 2） - 完了
- [ ] Task 3: ドキュメント更新履歴作成（documentation-changelog.md + artifacts.json更新） - 完了
- [ ] Task 4: 未タスク検出レポート作成（0件でも出力必須） - 完了

---

## 次のPhase

[Phase 13: PR作成](phase-13-pr-creation.md)
