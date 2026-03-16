# Phase 1: 要件定義 - TASK-SKILL-LIFECYCLE-06「信頼・権限・ガバナンス統合」

## メタ情報

| 項目         | 値                                                                              |
| ------------ | ------------------------------------------------------------------------------- |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                                         |
| Phase        | 1: 要件定義                                                                     |
| ステータス   | 進行中                                                                          |
| 担当         | 設計専門エージェント                                                            |
| 依存タスク   | TASK-SKILL-LIFECYCLE-03（Runtime Routing）、TASK-SKILL-LIFECYCLE-05（利用導線） |
| ブロック対象 | TASK-SKILL-LIFECYCLE-08（スキル公開・バージョン互換）                           |
| 作成日       | 2026-03-16                                                                      |
| 仕様書分類   | 設計タスク（実装なし）                                                          |

---

## 目的

スキル実行・再利用・共有の全導線にわたり、以下の4つの問いに答える設計定義を行う。

1. **どこで権限を求めるか** — 権限確認の挿入タイミングと契約境界
2. **何を危険操作とみなすか** — 危険操作の分類基準と境界条件
3. **履歴をどう管理し取り消せるか** — 承認履歴の構造と撤回方針
4. **説明責任をどう組み込むか** — 実行導線への説明責任の組み込み点

本タスクは「使えるが危険」な導線を防ぐ補助レイヤであり、実装コードを生成せず、**設計仕様・インターフェース契約・判断基準の文書化**を成果物とする。

---

## 実行タスク

### Task 1: 危険操作・機密操作の対象定義

既存の `DANGEROUS_PATTERNS` と `ALLOWED_TOOLS_WHITELIST` を出発点として、以下を整理する。

- Critical / High / Medium / Low の4リスクレベルの判定基準を条件式で定義する
  - Critical: `rm -rf /`、`sudo`、`chmod 777`、`dd if=`、`mkfs` を含む不可逆的システム破壊
  - High: ネットワーク越しのデータ送信、ホームディレクトリ外への書き込み、`~/.ssh/`、`~/.aws/` 等の機密パスへのアクセス
  - Medium: ルートディレクトリへの書き込み、環境変数変更、パッケージインストール
  - Low: 読み取り専用ファイルアクセス、ローカル一時ファイル操作
- 公開前確認の対象スキルの条件（スキルが外部送信・ファイル破壊・システム変更のいずれかを含む場合は必須ゲート）
- SubAgent / Codex が内部ロールとして扱われるため、UIの権限選択ダイアログには表示しないことの明示

### Task 2: 権限状態の4モードと判断フロー定義

`PermissionResolver` の既存契約（8ステップフロー）を前提に、以下を定義する。

- 権限状態の4モード定義:
  - `approved`: 恒久許可（`PermissionStore.allowTool` により永続化）
  - `denied`: 恒久拒否（`PermissionStore.allowTool` の反転として実装）
  - `approved_once`: 今回のみ許可（セッションスコープ、electron-store に非保存）
  - `pending`: 未決定（ダイアログ表示待ち）
- リスクレベル別のデフォルト権限状態（Critical はデフォルト `denied`、High は `pending`、Medium/Low は `approved_once`）
- タイムアウト発生時（DEFAULT_TIMEOUT_MS = 300000ms 経過）のフォールバック挙動（`denied` として処理）
- 権限決定のキャッシュ有効期間と再確認条件（恒久許可でもスキルバージョン変更時は再確認）

### Task 3: 承認履歴の構造と取り消し方針定義

既存の `PERMISSION_HISTORY_MAX_ENTRIES = 1000` を前提に、以下を定義する。

- 履歴エントリの必須フィールド: `id`、`toolName`、`skillId`、`skillVersion`、`decision`（approved/denied/approved_once）、`timestamp`、`riskLevel`、`triggerContext`（手動実行/自動実行/preflight）
- 取り消し（revoke）操作の条件:
  - `approved` 状態のツールのみ取り消し対象
  - `denied` 状態は取り消し不可（再許可操作で上書き）
  - `approved_once` はセッション終了で自動失効
- 取り消し後の既存実行中スキルへの影響: 実行中のスキルは完了まで継続、次回呼び出し時から適用
- 履歴の上限（1000件）超過時の挙動: 最古エントリを削除（FIFO）
- 一括クリア操作（`clearAll`）の呼び出し条件: 設定画面からの明示的操作のみ、自動クリアなし

### Task 4: Task-03/05 の導線への権限確認挿入タイミング定義

**Task-03（Runtime Routing）との接続:**

- `execute` 入口での preflight チェック実行タイミング（スキル実行前、ツール呼び出し前の2段階）
- `PermissionResolver.waitForResponse` が呼ばれるのはツール呼び出し前のみ（preflight は同期的に `PermissionStore.isToolAllowed` で判定）
- `approved_once` のスコープはスキル実行セッション単位（`sessionId` で管理）
- Runtime Routing の internal role（Planner/Executor/Improver）はUIのモード切替にせず、権限ダイアログにも表示しない

**Task-05（利用導線 CTA）との接続:**

- `ScoringGate` が `NEEDS_IMPROVEMENT` の場合、実行 CTA を表示するが権限確認ダイアログに追加警告を挿入する
- `ScoringGate` が `USE_ALLOWED` 以上の場合、通常の権限フロー
- スキルに High/Critical リスクツールが含まれる場合、`ScoringGate` に関わらず権限確認を必須とする
- 改善推奨スキルの実行時には「このスキルは改善が推奨されています」の説明責任テキストを権限ダイアログに含める

### Task 5: Task-08（公開/共有ガード）への安全性契約整理

Task-08 が参照する安全性ゲートの入力仕様を定義する（Task-08 の実装は本タスクスコープ外）。

- 公開前チェックで必須となる条件:
  - スキルに Critical または High リスクツールが1件以上含まれる場合は公開不可
  - 承認履歴に `denied` が50%以上含まれるスキルは公開警告を表示（ブロックではない）
  - `approved_once` のみで動作するスキルは「未検証」ラベルを付与
- Task-08 へ渡す安全性契約オブジェクトの型定義（インターフェース仕様）:
  ```
  SkillSafetyContract {
    skillId: string
    skillVersion: string
    maxRiskLevel: "critical" | "high" | "medium" | "low"
    hasOnlyOncePerm: boolean       // approved_once のみで動作するか
    deniedRatio: number            // 承認拒否率 0.0-1.0
    requiresExplicitConsent: boolean // 公開前に明示同意が必要か
  }
  ```

---

## 参照資料

| 参照資料                              | パス                                                                                                        | 説明                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| aiworkflow resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                            | 権限/CTA/公開前ガードで読むべき正本仕様の抽出起点      |
| security-skill-execution              | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                             | DANGEROUS_PATTERNS, ALLOWED_TOOLS_WHITELIST            |
| security-api-electron                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                | IPC境界と権限判定のセキュリティ境界を確認              |
| interfaces-agent-sdk-executor-details | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                | PermissionResolver 8ステップフロー, DEFAULT_TIMEOUT_MS |
| ui-ux-settings-core                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                                  | Permission History Panel, 仮想スクロール仕様           |
| ui-ux-agent-execution                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                | PermissionDialog と実行中表示のUI責務確認              |
| workflow-skill-lifecycle-04           | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | ScoringGate/evaluatePrompt 契約の正本確認              |
| workflow-skill-lifecycle-05           | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | CTA導線とINS-01/03接続条件の正本確認                   |
| task-03 phase-2 設計                  | `../../../completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/phase-2-design.md`                | Runtime Routing preflight/permission 契約              |
| task-05 phase-2 設計                  | `../../../completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`                | ScoringGate, CTA制御, 利用導線前提                     |

---

## aiworkflow-requirements 抽出セット（resource-map起点）

| 関心ごと         | 抽出した正本仕様                                                                                                 | この Phase で使う観点             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Permission 境界  | `security-skill-execution.md`, `interfaces-agent-sdk-executor-details.md`, `security-api-electron.md`            | 危険操作分類・timeout・IPC境界    |
| 履歴/状態管理    | `ui-ux-settings-core.md`, `ui-ux-agent-execution.md`                                                             | Permission History と表示責務     |
| CTA/Scoring 接続 | `workflow-skill-lifecycle-evaluation-scoring-gate.md`, `workflow-skill-lifecycle-created-skill-usage-journey.md` | INS-01/03 条件と ScoringGate 連動 |

---

## 実行手順

### Step 1: 既存仕様の現状把握（所要: 約30分）

1. `indexes/resource-map.md` を読み込み、Permission/CTA/公開前ガードの抽出対象仕様を確定する
2. `security-skill-execution.md` を読み込み、`DANGEROUS_PATTERNS.BASH_COMMANDS`（24パターン）と `DANGEROUS_PATTERNS.PROTECTED_PATHS`（25パターン）を全件確認する
3. `interfaces-agent-sdk-executor-details.md` を読み込み、`PermissionResolver` の8ステップフローと全メソッドシグネチャを確認する
4. `ui-ux-settings-core.md` と `ui-ux-agent-execution.md` を読み込み、Permission History Panel と PermissionDialog の既存UI仕様を確認する
5. `workflow-skill-lifecycle-evaluation-scoring-gate.md` と `workflow-skill-lifecycle-created-skill-usage-journey.md` を読み込み、ScoringGate と CTA 導線の正本契約を確認する
6. Task-03 phase-2 設計を読み込み、preflight と permission の既存契約を確認する
7. Task-05 phase-2 設計を読み込み、ScoringGate の定義と CTA 制御フローを確認する

### Step 2: ギャップ分析（所要: 約60分）

以下の問いに対して、既存仕様でカバーされている部分と未定義の部分を明示する。

| 問い                               | 既存仕様でのカバー状況 | 未定義・要定義事項     |
| ---------------------------------- | ---------------------- | ---------------------- |
| approved_once のスコープ境界       | 未定義                 | セッション単位の定義   |
| riskLevel と権限デフォルトの対応   | 未定義                 | レベル別デフォルト状態 |
| スキルバージョン変更時の再確認条件 | 未定義                 | バージョン比較ロジック |
| Task-08 への安全性契約型           | 未定義                 | SkillSafetyContract    |
| 説明責任テキストの挿入ルール       | 未定義                 | ScoringGate連動ルール  |

### Step 3: 受入基準ごとの設計要件整理（所要: 約60分）

各 AC に対して、設計定義の完了条件を明確化する。

- **AC-1（危険操作の権限境界）**: `DANGEROUS_PATTERNS` の各パターンにリスクレベルを付与し、レベル別の権限デフォルト状態を定義表として出力する
- **AC-2（承認履歴と取り消し方針）**: 履歴エントリの必須フィールド仕様、FIFO上限ポリシー、取り消し条件を定義書として出力する
- **AC-3（実行導線への説明責任）**: Task-03/05 の各挿入ポイントと挿入条件の一覧表を出力する
- **AC-4（共有前安全性ゲート）**: `SkillSafetyContract` インターフェース仕様と公開可否判定ロジックを出力する

### Step 4: 要件定義書の成果物作成（所要: 約60分）

Step 1-3 の分析結果をもとに、`outputs/phase-1/` 配下に成果物を作成する。

---

## 統合テスト連携

本タスクは設計専用タスクのため、実装テストコードは生成しない。ただし、以下の検証可能性の観点を成果物に含める。

- **権限境界の検証可能性**: 各リスクレベルの判定条件を「テスト可能な条件式」で記述する（「危険なコマンドを含む」ではなく「`DANGEROUS_PATTERNS.BASH_COMMANDS` の正規表現パターンに1件以上マッチする」と記述）
- **承認履歴の検証可能性**: `PERMISSION_HISTORY_MAX_ENTRIES` 超過時のFIFO挙動を「1001件目追加時に先頭エントリが削除される」と具体的に記述
- **説明責任テキストの検証可能性**: 挿入条件を「`ScoringGate === NEEDS_IMPROVEMENT` かつ権限ダイアログ表示時」と条件式で記述

---

## 多角的チェック観点

成果物レビュー時に以下の観点で確認する。

### セキュリティ観点

- `approved_once` がセッションをまたいで永続化されていないか
- Critical リスクツールに対して `approved` への昇格経路がないか（恒久許可禁止）
- `SkillSafetyContract` の `requiresExplicitConsent` が Critical/High スキルで必ず `true` になる条件が定義されているか

### UX/説明責任観点

- 権限ダイアログに表示する説明責任テキストが「なぜ危険か」を具体的に示しているか（「危険な操作を含みます」ではなく「このスキルは `/Users/` 配下の全ファイルを削除できます」レベルの具体性）
- 承認履歴の取り消し操作が3タップ以内で完了できる導線設計か

### Task-08 接続観点

- `SkillSafetyContract` の全フィールドが Task-08 側で消費可能な型定義になっているか
- 公開不可条件（Critical/High リスク含有）と公開警告条件（denied率50%以上）の閾値に設計根拠があるか

### 既存システム整合性観点

- 定義する権限フローが `PermissionResolver` の既存8ステップフローを破壊していないか
- `PermissionStore.revokeTool` の `boolean` 戻り値（O(1)）と取り消し方針が矛盾していないか
- `ALLOWED_TOOLS_WHITELIST`（11ツール）の全ツールについてリスクレベルが付与されているか

---

## サブタスク管理

| サブタスク ID | 内容                                    | 依存      | ステータス |
| ------------- | --------------------------------------- | --------- | ---------- |
| ST-06-1-1     | 既存仕様の現状把握（Step 1）            | なし      | 未着手     |
| ST-06-1-2     | ギャップ分析（Step 2）                  | ST-06-1-1 | 未着手     |
| ST-06-1-3     | 受入基準ごとの設計要件整理（Step 3）    | ST-06-1-2 | 未着手     |
| ST-06-1-4     | 危険操作リスクレベル定義書（成果物1）   | ST-06-1-3 | 未着手     |
| ST-06-1-5     | 権限状態フロー定義書（成果物2）         | ST-06-1-3 | 未着手     |
| ST-06-1-6     | 承認履歴・取り消し方針定義書（成果物3） | ST-06-1-3 | 未着手     |
| ST-06-1-7     | Task-03/05 挿入ポイント一覧（成果物4）  | ST-06-1-3 | 未着手     |
| ST-06-1-8     | SkillSafetyContract 仕様書（成果物5）   | ST-06-1-3 | 未着手     |

---

## 成果物

成果物は全て `outputs/phase-1/` 配下に配置する。

| 成果物 ID | ファイルパス                                      | 内容                                                                     |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| OUT-1     | `outputs/phase-1/risk-level-classification.md`    | 危険操作リスクレベル定義（BASH_COMMANDSとPROTECTED_PATHSのレベル付与表） |
| OUT-2     | `outputs/phase-1/permission-state-flow.md`        | 権限状態4モードの定義と判断フロー（PermissionResolver連携）              |
| OUT-3     | `outputs/phase-1/approval-history-policy.md`      | 承認履歴の必須フィールド仕様・FIFO上限ポリシー・取り消し方針             |
| OUT-4     | `outputs/phase-1/accountability-insertion-map.md` | Task-03/05 への説明責任挿入ポイント一覧と挿入条件                        |
| OUT-5     | `outputs/phase-1/skill-safety-contract.md`        | Task-08 へ渡す SkillSafetyContract インターフェース仕様                  |

---

## 完了条件

以下の全チェックボックスを満たすことで Phase 1 完了とする。

- [ ] **AC-1対応**: `outputs/phase-1/risk-level-classification.md` に全24 BASH_COMMANDSパターンと全25 PROTECTED_PATHSパターンのリスクレベル付与表が存在する
- [ ] **AC-1対応**: リスクレベル別のデフォルト権限状態（Critical=denied, High=pending, Medium/Low=approved_once）が定義されている
- [ ] **AC-2対応**: `outputs/phase-1/approval-history-policy.md` に履歴エントリの必須フィールド（7フィールド）が定義されている
- [ ] **AC-2対応**: 取り消し条件（approved のみ対象・denied は再許可で上書き・approved_once はセッション失効）が明記されている
- [ ] **AC-3対応**: `outputs/phase-1/accountability-insertion-map.md` に Task-03 と Task-05 それぞれの挿入ポイントと挿入条件が一覧化されている
- [ ] **AC-4対応**: `outputs/phase-1/skill-safety-contract.md` に `SkillSafetyContract` の全フィールドの型と説明が定義されている
- [ ] **AC-4対応**: 公開不可条件と公開警告条件の閾値（Critical/High 含有で不可、denied率50%以上で警告）に設計根拠が記述されている
- [ ] 全5成果物ファイルが `outputs/phase-1/` 配下に存在する
- [ ] 各成果物に「テスト可能な条件式」での記述が含まれている（曖昧表現なし）
- [ ] `多角的チェック観点` の全項目についてレビューコメントが記録されている

---

## タスク100%実行確認【必須】

Phase 1 完了前に以下を必ず確認する。

1. **成果物5件の存在確認**: `ls outputs/phase-1/` を実行し、OUT-1〜OUT-5 の全ファイルが存在することを確認する
2. **曖昧表現の排除確認**: 各成果物ファイルで曖昧語リスト（4語）が0件であることを `grep` で確認する（技術用語は除外ルールを明記する）
3. **受入基準の充足確認**: AC-1〜AC-4 それぞれに対して完了条件チェックボックスが全てチェック済みであることを確認する
4. **依存タスク契約の整合確認**: Task-03 の preflight 契約と Task-05 の ScoringGate 定義が成果物内で正確に参照されていることを確認する
5. **Task-08 渡し仕様の完全性確認**: `SkillSafetyContract` の全フィールドが Task-08 の公開判定ロジックで消費されることを成果物内で示していることを確認する

---

## 次 Phase

Phase 2: 設計

- 成果物パス: `phase-2-design.md`
- 前提条件: Phase 1 完了条件が全て満たされていること
- 主な活動:
  - `SkillSafetyContract` インターフェースの正式 TypeScript 型定義の設計
  - `PermissionStore` への `riskLevel` フィールド拡張設計（後方互換性を維持）
  - `approval_once` のセッション管理設計（`sessionId` の生成・伝播・失効）
  - Permission History Panel への `riskLevel` フィルタ追加の UI 設計
  - Task-03/05/08 との接続インターフェース設計
