# Phase 12: ドキュメント更新 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 12                                |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 作成日       | 2026-02-14                        |

## 目的

Phase 1-11 で実装・検証した IPC ハンドラ二重登録防止ロジックのドキュメント化、システム仕様書の更新、および未タスクの検出を実施する。`unregisterAllIpcHandlers()` 関数の追加と `activate` イベントハンドラの修正内容を仕様書に反映し、IPC ハンドラライフサイクル管理パターンとして記録する。

---

## 事前チェック【必須】

Phase 12 は漏れが最も発生しやすい Phase である。作業開始前に `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を全て確認すること。

| Pitfall ID | 内容                                         | 対策                                                                          | 確認タイミング  |
| ---------- | -------------------------------------------- | ----------------------------------------------------------------------------- | --------------- |
| P1         | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements と task-specification-creator の両方を同時に更新する  | Step 1-A 完了時 |
| P2         | topic-map.md 再生成忘れ                      | セクションの追加・削除・更新があれば必ず再生成する                            | Step 1-D 完了時 |
| P3         | 未タスク管理の3ステップ不完全                | (1)指示書 (2)task-workflow.md登録 (3)関連仕様書リンクの全3ステップを完了する  | Task 4 完了時   |
| P4         | documentation-changelog への早期「完了」記載 | 全 Step 確認完了後に初めて「完了」と記載する                                  | Task 3 完了時   |
| P25        | LOGS.md 2ファイル更新漏れ（P1再発）          | P1と同じ対策を二重チェックする                                                | Step 1-A 完了時 |
| P26        | システム仕様書更新遅延                       | Phase 12 完了時点でシステム仕様書を更新する（PRマージを待たない）             | Step 2 完了時   |
| P27        | topic-map.md 再生成トリガーの判断ミス        | 仕様書に変更があれば無条件で再生成する                                        | Step 1-D 完了時 |
| P28        | スキルフィードバックレポート未作成           | 改善点がなくても「改善点なし」としてレポートを作成する                        | Task 5 完了時   |
| P29        | SKILL.md 変更履歴の更新漏れ                  | LOGS.md とは別に SKILL.md の変更履歴テーブルも更新する                        | Step 1-A 完了時 |
| P30        | 未タスク検出時の関連ファイル調査不足         | `grep -rn` で同様のパターンをプロジェクト全体から検索する                     | Task 4 完了時   |
| P31        | Phase 12のシステム仕様書更新漏れ（複数）     | IPC 関連の更新対象ファイル5件を全て確認する                                   | Step 2 完了時   |
| P37        | ドキュメント数値の早期固定                   | テスト数は `grep -c "it(" *.test.ts` で実測値を使用する                       | Task 1 完了時   |
| P38        | 未タスク配置ディレクトリ間違い               | `docs/30-workflows/unassigned-task/` に配置する（親タスクの tasks/ ではない） | Task 4 完了時   |

---

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。

| パート | 対象読者         | 内容                                |
| ------ | ---------------- | ----------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）  |
| Part 2 | 開発者・技術者   | 技術的な詳細（型定義・API・使用例） |

#### Part 1: 中学生レベル概念説明【必須要件】

- 日常生活での例え話を**必ず**含める
  - 推奨例: 「お店の入口のドアマンが2人立っている状態を想像してください。お客さんが入ろうとすると、2人のドアマンが同時にドアを開けようとして混乱します。解決策は簡単で、新しいドアマンが来る前に、前のドアマンに『もう帰っていいよ』と伝えてから交代させる仕組みを作りました」
  - 別の推奨例: 「学校の日直を想像してください。月曜日の日直が『田中くん』だとします。火曜日に『佐藤さん』が日直になるとき、もし田中くんが帰らずに教室に残ったまま佐藤さんも来ると、誰が日直なのか混乱します。そこで、新しい日直が来る前に、前の日直には『交代だよ、ありがとう』と伝えて帰ってもらうルールを作りました」
- 専門用語は使わない（使う場合は即座に説明する）
  - 例: 「IPC ハンドラ（プログラム同士が話し合うときの『受付係』のこと）」
- 「なぜ問題が起きたのか」を先に説明してから「どう直したか」を説明する
- 図表より文章での説明を優先する

**Part 1 構成テンプレート**:

```markdown
## Part 1: この修正は何をしたのか（やさしい説明）

### 1.1 何が問題だったのか

[日常生活に例えた問題の説明]

### 1.2 日常生活での例え

[具体的な例え話 - ドアマンの交代、または日直の交代]

### 1.3 どう直したのか

[日常生活の例えを使った解決策の説明]

### 1.4 直した後どうなったか

| 修正前の状態                               | 修正後の状態                                         |
| ------------------------------------------ | ---------------------------------------------------- |
| ドックアイコンクリックでエラーが発生する   | ドックアイコンクリックで問題なくウィンドウが復帰する |
| 受付係が2人になって混乱する                | 前の受付係が退場してから新しい受付係が着任する       |
| macOS でウィンドウを閉じて再開すると壊れる | 何度閉じて再開しても正常に動作する                   |
```

#### Part 2: 開発者向け技術詳細【必須要件】

以下の技術情報を全て含めること:

- **修正対象ファイル一覧**: 各ファイルの変更内容サマリー
  - `apps/desktop/src/main/index.ts`: activate イベントハンドラに `unregisterAllIpcHandlers()` 呼び出しを追加
  - `apps/desktop/src/main/ipc/index.ts`: `unregisterAllIpcHandlers()` 関数を新規追加・エクスポート
- **関数インターフェース定義**: `unregisterAllIpcHandlers()` の型定義と引数・戻り値
  ```typescript
  /**
   * 全ての IPC ハンドラを解除する。
   * activate イベントでの再登録前に呼び出す。
   * IPC_CHANNELS の全チャンネルに対して ipcMain.removeHandler() と
   * ipcMain.removeAllListeners() を実行する。
   */
  export function unregisterAllIpcHandlers(): void;
  ```
- **activate イベントでの呼び出しフロー**: unregister -> createWindow -> register の実行順序
  ```
  app.on("activate")
    -> BrowserWindow.getAllWindows().length === 0 を確認
    -> unregisterAllIpcHandlers()    // 全ハンドラ解除
    -> mainWindowRef = createWindow() // 新ウィンドウ作成
    -> registerAllIpcHandlers(mainWindowRef) // 新参照で再登録
  ```
- **Electron API の二重登録挙動の違い**:
  | API | 二重登録時の挙動 | 解除 API |
  | ------------------ | ------------------------------------- | --------------------------------- |
  | `ipcMain.handle()` | 例外送出（同一チャンネルに2つ目不可） | `ipcMain.removeHandler(channel)` |
  | `ipcMain.on()` | 許可（リスナーが複数登録される） | `ipcMain.removeAllListeners(channel)` |
- **エッジケース**:
  - `ipcMain.removeHandler()` が未登録チャンネルに対して呼ばれた場合: エラーを送出しない（安全）
  - activate が連続で発火した場合: `BrowserWindow.getAllWindows().length === 0` ガードにより二重実行を防止
  - Windows/Linux 環境での `activate` イベント: macOS 固有のため発火しない。`window-all-closed` で `app.quit()` が呼ばれるため影響なし
  - `setupThemeWatcher` で登録された `nativeTheme` リスナーの解除: `unregisterAllIpcHandlers()` 内で `nativeTheme.removeAllListeners("updated")` を実行
  - `registerAuthFallbackHandlers()` の条件分岐: `IPC_CHANNELS` 全走査のため、どのパスで登録されたハンドラも確実に解除される
- **セキュリティ上の注意点**:
  - 4層防御（L1ホワイトリスト, L2 Sender検証, L3引数バリデーション, L4エラーサニタイズ）は全て維持されている
  - unregister -> register の間に極めて短いハンドラ未登録期間が発生するが、ウィンドウが存在しないため Renderer からのリクエストは到達しない
  - 仮にリクエストが到達した場合、`Error: No handler registered` が返され、フェイルセキュアとして機能する
- **テスト数**: Phase 4 で作成したテスト（`ipc-double-registration.test.ts`）の `it()` ブロック数を `grep -c "it(" apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` で実測して記載する（P37 対策）

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システムドキュメント更新【必須】

> **参照**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

#### Step 1-A: タスク完了記録【必須】

以下の全項目を実行する。1つでも漏れがあれば Phase 12 は未完了とする。

- [ ] 該当仕様書に「完了タスク」セクションを追加する
  - 対象候補: `security-electron-ipc.md`、`architecture-overview.md`、`architecture-implementation-patterns.md`
  - テンプレートは `spec-update-workflow.md` の「タスク完了ステータス更新」セクションに準拠
  - テスト結果サマリー表（機能テスト / エラーハンドリング / リグレッション / 統合テスト連携）を含む
  - 成果物テーブル（テスト結果レポート / 実装ガイド）を含む
- [ ] 「関連ドキュメント」セクションに実装ガイドへのリンクを追加する
  - リンクパス: `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/implementation-guide.md`
- [ ] 「変更履歴」セクションにバージョン番号を追記する
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加する
  - パス: `.claude/skills/aiworkflow-requirements/LOGS.md`
  - 形式: `## 2026-02-14: IPC ハンドラ二重登録例外の修正（UT-FIX-IPC-HANDLER-DOUBLE-REG-001）`
  - 内容: タスクID、操作（update-spec）、対象ファイル一覧、結果（success）、実装内容概要
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加する（**2ファイル目 - P1/P25 対策**）
  - パス: `.claude/skills/task-specification-creator/LOGS.md`
  - 内容: コンテキスト（スキル名、タスクID、Phase 1-12/13）、成果（テスト数、実装内容）、結果
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブルにバージョンを追記する（**P29 対策**）
  - パス: `.claude/skills/aiworkflow-requirements/SKILL.md`
- [ ] `task-specification-creator/SKILL.md` の変更履歴テーブルにバージョンを追記する（**P29 対策**）
  - パス: `.claude/skills/task-specification-creator/SKILL.md`

#### Step 1-B: 実装状況テーブル更新【該当する場合】

本タスクは IPC ハンドラ登録パターンの変更を含むため、以下の確認を実施する。

- [ ] `architecture-overview.md` の IPC ハンドラ登録一覧に `unregisterAllIpcHandlers()` のエントリが必要か判断する
- [ ] `api-endpoints.md` の実装ステータスに更新が必要か判断する
- [ ] 判断結果を documentation-changelog.md に記録する

#### Step 1-C: 関連タスクテーブル更新【必須】

以下のコマンドで関連仕様書を検索し、見つかった箇所のステータスを「完了」に更新する。

```bash
grep -rn "UT-FIX-IPC-HANDLER-DOUBLE-REG-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-FIX-IPC-HANDLER-DOUBLE-REG-001" .claude/skills/task-specification-creator/references/
```

IPC 関連タスクのため、以下のファイルを重点的に確認する（P31 対策: Phase 12 の更新漏れ防止）:

| ファイル                                  | 確認内容                                                    |
| ----------------------------------------- | ----------------------------------------------------------- |
| `task-workflow.md`                        | 残課題テーブルに UT-FIX-IPC-HANDLER-DOUBLE-REG-001 があるか |
| `security-electron-ipc.md`                | 関連タスクテーブルに記載があるか                            |
| `architecture-implementation-patterns.md` | 関連タスクテーブルに記載があるか                            |
| `api-ipc-agent.md`                        | IPC チャンネル関連の完了タスクテーブルに記載があるか        |
| `interfaces-agent-sdk-skill.md`           | インターフェース関連の完了タスクテーブルに記載があるか      |

- [ ] 上記全ファイルの関連タスクテーブルを確認し、該当箇所のステータスを「完了」に更新した
- [ ] documentation-changelog.md に確認結果を記録した

#### Step 1-D: topic-map.md 再生成【必須 - P2/P27 対策】

仕様書にセクション追加・削除・更新があった場合、行番号を再同期する。仕様書に何らかの変更があれば必ず実行する（P27: セクション更新も再生成トリガーに含める）。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `generate-index.js` を実行して `topic-map.md` を再生成した
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認した

#### Step 1-E: 未タスク指示書の整合性検証【Task 4 で未タスク検出時のみ】

Task 4 で未タスクを1件以上検出した場合、以下を実施する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- [ ] `verify-unassigned-links.js` を実行し、`task-workflow.md` 内の未タスクリンク参照切れが0件であることを確認した（`ALL_LINKS_EXIST` が出力されること）
- [ ] 指示書が `docs/30-workflows/unassigned-task/` に物理的に存在することを `ls` コマンドで確認した

#### Step 2: システム仕様更新【条件付き - P26/P31 対策】

本タスクは IPC ハンドラ登録に関するアーキテクチャ変更（`unregisterAllIpcHandlers()` 関数の新規追加）を含むため、以下の各ファイルの更新要否を判断する。PRマージを待たずに Phase 12 完了時点で更新する（P26 対策）。

| #   | 更新対象ファイル                          | 更新内容                                                                                              | 更新要否 |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| 1   | `security-electron-ipc.md`                | IPC ハンドラライフサイクル管理セクションの追加（二重登録防止パターン、unregister -> register フロー） | 要確認   |
| 2   | `architecture-implementation-patterns.md` | 「IPC ハンドラ二重登録防止パターン」セクションの新規追加                                              | 要確認   |
| 3   | `architecture-overview.md`                | IPC ハンドラ登録一覧に `unregisterAllIpcHandlers` のエントリを追加                                    | 要確認   |
| 4   | `task-workflow.md`                        | 残課題テーブルの更新、完了タスクセクションへの UT-FIX-IPC-HANDLER-DOUBLE-REG-001 追加                 | 必須     |
| 5   | `lessons-learned.md`                      | 「ipcMain.handle() の二重登録は例外を送出する（ipcMain.on() とは異なる）」教訓の追加                  | 要確認   |

**更新判断基準**:

| 更新が必要な場合                             | 更新が不要な場合        |
| -------------------------------------------- | ----------------------- |
| 新規関数（`unregisterAllIpcHandlers`）の追加 | 内部ロジックのみの変更  |
| ハンドラ登録パターンの変更                   | 既存 API の引数追加なし |
| ライフサイクル管理の新規導入                 | テストのみの変更        |
| 他コンポーネントが参照するパターンの追加     | ドキュメント誤記修正    |

**セキュリティ関連更新（`security-electron-ipc.md`）の記載テンプレート**:

```markdown
### IPC ハンドラライフサイクル管理

#### 二重登録防止パターン（UT-FIX-IPC-HANDLER-DOUBLE-REG-001）

macOS の `activate` イベントでウィンドウを再作成する際、IPC ハンドラの再登録前に
全ハンドラを解除する。

| ステップ | API                                  | 目的                                 |
| -------- | ------------------------------------ | ------------------------------------ |
| 1        | `unregisterAllIpcHandlers()`         | 全チャンネルのハンドラ・リスナー解除 |
| 2        | `createWindow()`                     | 新しい BrowserWindow を作成          |
| 3        | `registerAllIpcHandlers(mainWindow)` | 新しい参照で全ハンドラを再登録       |
```

**実装パターン関連更新（`architecture-implementation-patterns.md`）の記載テンプレート**:

```markdown
### IPC ハンドラ二重登録防止パターン

#### 問題

`ipcMain.handle()` は同一チャンネルに2つ目のハンドラ登録を試みると例外を送出する。
macOS の `activate` イベントで `registerAllIpcHandlers()` を再実行すると、この例外が発生する。

#### 解決策

`IPC_CHANNELS` 定数から全チャンネル名を取得し、`ipcMain.removeHandler()` と
`ipcMain.removeAllListeners()` で一括解除してから再登録する。

#### コード例

// [activate イベントでの使用例を記載]
```

- [ ] 上記テーブルの5ファイルについて更新要否を判断し、必要なファイルを更新した
- [ ] 更新結果（更新した / 更新不要 + 理由）を documentation-changelog.md に記録した
- [ ] 「更新不要」と判断した場合はその理由を documentation-changelog.md に明記した

**成果物**: 更新された各仕様書

---

### Task 3: ドキュメント更新履歴 & artifacts.json 更新【必須 - P4 対策】

**重要**: 全 Step の確認が完了するまで「完了」と記載しない（P4 対策）。各 Step の確認結果を逐次記録し、最後に全体を確認してから「完了」とする。

#### 3-1: documentation-changelog.md 作成

更新した全仕様書の変更内容を記録する。各 Step の完了結果を詳細に記録し、漏れを可視化する。

```markdown
# ドキュメント更新履歴 - UT-FIX-IPC-HANDLER-DOUBLE-REG-001

## 更新日: 2026-02-14

## Step 1-A: タスク完了記録

| 対象ファイル                        | 更新内容                 | ステータス |
| ----------------------------------- | ------------------------ | ---------- |
| [該当仕様書名]                      | 完了タスクセクション追加 | {{STATUS}} |
| aiworkflow-requirements/LOGS.md     | タスク完了エントリ追加   | {{STATUS}} |
| task-specification-creator/LOGS.md  | タスク完了記録追加       | {{STATUS}} |
| aiworkflow-requirements/SKILL.md    | 変更履歴更新             | {{STATUS}} |
| task-specification-creator/SKILL.md | 変更履歴更新             | {{STATUS}} |

## Step 1-B: 実装状況テーブル

| 対象ファイル             | 更新要否  | 更新内容           | ステータス |
| ------------------------ | --------- | ------------------ | ---------- |
| architecture-overview.md | {{要/否}} | {{内容または理由}} | {{STATUS}} |
| api-endpoints.md         | {{要/否}} | {{内容または理由}} | {{STATUS}} |

## Step 1-C: 関連タスクテーブル

| 対象ファイル                            | 該当有無  | 更新内容 | ステータス |
| --------------------------------------- | --------- | -------- | ---------- |
| task-workflow.md                        | {{有/無}} | {{内容}} | {{STATUS}} |
| security-electron-ipc.md                | {{有/無}} | {{内容}} | {{STATUS}} |
| architecture-implementation-patterns.md | {{有/無}} | {{内容}} | {{STATUS}} |
| api-ipc-agent.md                        | {{有/無}} | {{内容}} | {{STATUS}} |
| interfaces-agent-sdk-skill.md           | {{有/無}} | {{内容}} | {{STATUS}} |

## Step 1-D: topic-map.md 再生成

| 対象                   | ステータス |
| ---------------------- | ---------- |
| generate-index.js 実行 | {{STATUS}} |
| 行番号の正確性確認     | {{STATUS}} |

## Step 1-E: 未タスク指示書整合性（該当時のみ）

| 対象                            | ステータス |
| ------------------------------- | ---------- |
| verify-unassigned-links.js 実行 | {{STATUS}} |
| 物理ファイル存在確認            | {{STATUS}} |

## Step 2: システム仕様更新

| 対象ファイル                            | 更新要否  | 更新内容           | ステータス |
| --------------------------------------- | --------- | ------------------ | ---------- |
| security-electron-ipc.md                | {{要/否}} | {{内容または理由}} | {{STATUS}} |
| architecture-implementation-patterns.md | {{要/否}} | {{内容または理由}} | {{STATUS}} |
| architecture-overview.md                | {{要/否}} | {{内容または理由}} | {{STATUS}} |
| task-workflow.md                        | 必須      | {{内容}}           | {{STATUS}} |
| lessons-learned.md                      | {{要/否}} | {{内容または理由}} | {{STATUS}} |

## 全体ステータス

全 Step の確認が完了した時点で記入する（P4 対策）:

- 全 Step 完了確認: {{完了/未完了}}
- 最終確認日時: {{DATETIME}}
```

#### 3-2: artifacts.json 更新

- `artifacts.json` の Phase 12 ステータスを `completed` に更新する
- 全 Phase（1-12）の成果物パスが登録されていることを確認する
- Phase 12 の成果物として以下の4ファイルが登録されていることを確認する:
  1. `outputs/phase-12/implementation-guide.md`
  2. `outputs/phase-12/documentation-changelog.md`
  3. `outputs/phase-12/unassigned-task-detection.md`
  4. `outputs/phase-12/skill-feedback-report.md`

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出【必須 - 0件でも出力必須】

以下の6つのソースから未タスクを検出する。0件の場合でも「0件」と明記したレポートを作成する。

| #   | 検出ソース                | 確認項目                                                      |
| --- | ------------------------- | ------------------------------------------------------------- |
| 1   | Phase 3 設計レビュー結果  | MINOR 判定の指摘事項が全て対応済みか確認する                  |
| 2   | Phase 10 最終レビュー結果 | MINOR 判定の指摘事項が全て未タスク化済みか確認する            |
| 3   | Phase 11 手動テスト結果   | スコープ外の発見事項が記録されているか確認する                |
| 4   | 各 Phase 成果物           | 「将来対応」「TODO」「FIXME」マークの項目を検出する           |
| 5   | コードベース              | 修正対象ファイル周辺の TODO/FIXME/HACK/XXX コメントを検出する |
| 6   | 元タスク仕様書（#815）    | スコープ外と判断した項目を未タスク候補として記録する          |

**検出コマンド**:

```bash
# 修正対象ファイルの TODO/FIXME 検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/index.ts apps/desktop/src/main/ipc/index.ts

# IPC 関連全体の TODO/FIXME 検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/ --include="*.ts"

# テストファイルの TODO/FIXME 検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/__tests__/ --include="*.ts"

# P30 対策: 同様のパターンを持つ関連ファイルも調査
grep -rn "ipcMain.handle\|ipcMain.on" apps/desktop/src/main/ --include="*.ts" | grep -v "removeHandler\|removeAllListeners\|__tests__"
```

**検出時の3ステップ（P3/P38 対策 - 全ステップ完了必須）**:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（**P38 対策: 親タスクの tasks/ ではなく unassigned-task/ に配置する**）
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース                | 検出数  |
| --------------------- | ------- |
| Phase 3 レビュー結果  | 0件     |
| Phase 10 レビュー結果 | 0件     |
| Phase 11 テスト結果   | 0件     |
| Phase 成果物 TODO     | 0件     |
| コードベース          | 0件     |
| 元タスク仕様書        | 0件     |
| **合計**              | **0件** |

## 検出タスク一覧

**検出タスクなし**

全ソースを確認した結果、未タスクとして記録すべき項目は検出されなかった。
```

- [ ] 未タスク検出レポートを作成した（0件でも作成必須）
- [ ] 検出ソース6項目を全て確認した記録がレポートに含まれている
- [ ] 検出した未タスクについて3ステップ全てを完了した（検出時のみ）
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（検出時のみ - P38 対策）
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新した

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成【必須 - P28 対策】

改善点がなくても「改善点なし」としてレポートを作成する。以下の5つの確認観点を全て記録する。

| #   | 確認観点             | 記録内容                                                                                                                                |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ワークフロー改善点   | Phase 1-13 の実行で改善できるワークフロー（タスク仕様書生成の精度向上、Phase 間の依存関係の明確化）                                     |
| 2   | 技術的教訓           | 実装中に得た技術的知見（`ipcMain.handle()` と `ipcMain.on()` の二重登録挙動の違い、`IPC_CHANNELS` 定数の網羅性確認方法）                |
| 3   | 新規 Pitfall 候補    | P5 拡張: `ipcMain.handle()` の二重登録は `ipcMain.on()` と異なり例外を送出する点の明確化。06-known-pitfalls.md への追記が必要か判断する |
| 4   | スキル定義の改善提案 | タスク仕様書作成スキルの改善提案（IPC 関連バグ修正タスクのテンプレート追加の必要性）                                                    |
| 5   | 苦戦箇所の記録       | 実装中に時間がかかった箇所とその理由（全チャンネルの列挙、既存 unregister 関数の有無調査）                                              |

**レポート構成テンプレート**:

```markdown
# スキルフィードバックレポート - UT-FIX-IPC-HANDLER-DOUBLE-REG-001

## 1. ワークフロー改善点

{{改善点がある場合は具体的に記載 / 改善点なしの場合は「改善点なし」と記載}}

## 2. 技術的教訓

### 2.1 ipcMain.handle() と ipcMain.on() の二重登録挙動

| API              | 二重登録時の挙動 | 影響                             |
| ---------------- | ---------------- | -------------------------------- |
| ipcMain.handle() | 例外送出         | アプリケーションがクラッシュする |
| ipcMain.on()     | リスナー追加     | 同一イベントが複数回処理される   |

### 2.2 IPC_CHANNELS 定数の網羅性確認方法

{{確認方法の説明}}

## 3. 新規 Pitfall 候補

{{P5 拡張の必要性判断結果}}

## 4. スキル定義の改善提案

{{提案がある場合は具体的に記載 / 提案なしの場合は「提案なし」と記載}}

## 5. 苦戦箇所の記録

{{時間がかかった箇所とその理由}}
```

- [ ] スキルフィードバックレポートが出力されている（改善点なしでも作成必須）
- [ ] 5つの確認観点全てに対する記録がある
- [ ] 新規 Pitfall 候補（P5 拡張）の検討結果が明記されている
- [ ] 苦戦箇所をシステム仕様書（`lessons-learned.md`）に記録すべきか判断した

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

### 前Phase成果物

| 資料名                   | パス                               | 説明                          |
| ------------------------ | ---------------------------------- | ----------------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`          | FR, NFR, AC の定義            |
| Phase 2 設計             | `phase-2-design.md`                | A/B/C 案比較、A案選定理由     |
| Phase 3 設計レビュー     | `phase-3-design-review.md`         | レビュー判定結果              |
| Phase 4 テスト作成       | `phase-4-test-creation.md`         | テストケース TC-01〜TC-08     |
| Phase 5 実装             | `phase-5-implementation.md`        | unregisterAllIpcHandlers 追加 |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`        | 追加テストケース              |
| Phase 7 カバレッジ確認   | `phase-7-coverage-verification.md` | カバレッジ基準達成確認        |
| Phase 8 リファクタリング | `phase-8-refactoring.md`           | コード品質改善                |
| Phase 9 品質検証         | `phase-9-quality-assurance.md`     | Lint/型チェック/テスト        |
| Phase 10 最終レビュー    | `phase-10-final-review.md`         | AC-1〜AC-5 達成確認           |
| Phase 11 手動テスト      | `phase-11-manual-testing.md`       | 手動テスト12項目              |
| Phase 12 本仕様書        | `phase-12-documentation.md`        | 本文書                        |

### ルール・ガイドライン

| 資料名                  | パス                                                                           | 説明                        |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12 必須タスク定義     |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P31, P37-P38     |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2 の詳細定義 |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 完了条件チェックリスト      |

### システム仕様（aiworkflow-requirements）

| 参照資料                              | パス                                                                                        | 内容                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| アーキテクチャ概要                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | IPC ハンドラ登録一覧                 |
| 実装パターン集                        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC 二重登録防止パターン追加先       |
| セキュリティ Electron IPC             | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ要件・ライフサイクル |
| タスクワークフロー                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題テーブル更新先                 |
| 教訓集                                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 実装教訓記録先                       |
| LOGS.md (aiworkflow-requirements)     | `.claude/skills/aiworkflow-requirements/LOGS.md`                                            | タスク完了記録（1/2）                |
| LOGS.md (task-specification-creator)  | `.claude/skills/task-specification-creator/LOGS.md`                                         | タスク完了記録（2/2）                |
| SKILL.md (aiworkflow-requirements)    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                           | 変更履歴（1/2）                      |
| SKILL.md (task-specification-creator) | `.claude/skills/task-specification-creator/SKILL.md`                                        | 変更履歴（2/2）                      |

---

## 実行手順

### Step 1: 事前チェック

06-known-pitfalls.md の Phase 12 関連項目（P1, P2, P3, P4, P25, P26, P27, P28, P29, P30, P31, P37, P38）を読み、全項目の対策を把握する。

### Step 2: Task 1 実行 - 実装ガイド作成

1. Part 1（中学生向け）を作成する。日常生活の例え話（ドアマンの交代 or 日直の交代）を必ず含める
2. Part 2（技術者向け）を作成する。修正対象ファイル一覧、`unregisterAllIpcHandlers()` の型定義、activate イベントフロー、エッジケース、セキュリティ注意点を記載する
3. テスト数を `grep -c "it(" apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` で実測して記載する（P37 対策: Phase 4 の想定値を使い回さない）

### Step 3: Task 2 実行 - システムドキュメント更新

Step 1-A（タスク完了記録）-> Step 1-B（実装状況テーブル）-> Step 1-C（関連タスクテーブル）-> Step 1-D（topic-map 再生成）-> Step 2（システム仕様更新）の順に実行する。

**実行順序の厳守が必要な理由**: Step 1-A で追加したセクションの行番号が Step 1-D の topic-map 再生成に反映されるため、Step 1-A を先に完了させる。

### Step 4: Task 3 実行 - 更新履歴と artifacts.json

1. documentation-changelog.md を作成し、各 Step の完了結果を**逐次**記録する
2. 全 Step 確認後に初めて「完了」と記載する（P4 対策）
3. artifacts.json の Phase 12 ステータスを `completed` に更新する
4. 全 Phase（1-12）の成果物パスが artifacts.json に登録されていることを確認する

### Step 5: Task 4 実行 - 未タスク検出

1. 検出ソース6項目を全て確認する
2. 修正対象ファイルだけでなく、同様パターンの関連ファイルも調査する（P30 対策）
3. 結果を記録する（0件でもレポート作成必須）
4. 検出時は3ステップを全て完了する（P3 対策）
5. 指示書は `docs/30-workflows/unassigned-task/` に配置する（P38 対策）
6. `verify-unassigned-links.js` を実行して参照切れがないことを確認する（Step 1-E）

### Step 6: Task 5 実行 - スキルフィードバック

1. 5つの確認観点（ワークフロー改善、技術的教訓、新規 Pitfall 候補、スキル改善提案、苦戦箇所）を全て記録する
2. 改善点なしでもレポートを作成する（P28 対策）
3. P5 拡張（ipcMain.handle() vs ipcMain.on() の二重登録挙動差異）の 06-known-pitfalls.md への追記要否を判断する

---

## アーキテクチャ層別ドキュメント対応表

実装ガイド Part 2 および Step 2 で以下の層別にドキュメントを作成・更新する:

| 層               | ドキュメント内容                                                | 更新対象仕様書                            |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------- |
| Main Process     | activate イベントハンドラの修正、IPC ハンドラライフサイクル管理 | `architecture-overview.md`                |
| IPC 通信         | `unregisterAllIpcHandlers()` の定義と使用パターン               | `architecture-implementation-patterns.md` |
| セキュリティ     | IPC ハンドラ登録の安全性（二重登録防止、4層防御維持）           | `security-electron-ipc.md`                |
| ナレッジ         | ipcMain.handle() と ipcMain.on() の挙動差異                     | `lessons-learned.md`                      |
| プロジェクト管理 | 完了タスク記録、残課題更新                                      | `task-workflow.md`                        |

---

## 多角的チェック観点

本タスクに該当する観点を判断し、必要な仕様書を参照・更新する。

| 観点               | 該当判断                                | 仕様参照先                                          |
| ------------------ | --------------------------------------- | --------------------------------------------------- |
| セキュリティ       | 該当: IPC ハンドラ登録パターンの変更    | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ     | 該当: Main Process のライフサイクル変更 | `aiworkflow-requirements: architecture-overview.md` |
| エラーハンドリング | 該当: ipcMain.handle() の二重登録例外   | `aiworkflow-requirements: error-handling.md`        |
| UI/UX              | 非該当: フロントエンド実装なし          | -                                                   |
| API設計            | 間接的に該当: IPC ハンドラ API の追加   | `aiworkflow-requirements: api-ipc-agent.md`         |
| データ整合性       | 非該当: 永続化やDB操作なし              | -                                                   |

| 層                         | 該当判断                                  | 仕様参照先                                                     |
| -------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| バックエンド（Main）       | 該当: activate イベント・IPC ハンドラ管理 | `aiworkflow-requirements: architecture-*.md`                   |
| IPC通信                    | 該当: ハンドラの解除・再登録フロー        | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 間接的に該当: チャンネル定義は変更なし    | `aiworkflow-requirements: security-api-electron.md`            |
| フロントエンド（Renderer） | 非該当: Renderer 側の変更なし             | -                                                              |
| ローカルストレージ         | 非該当: 永続化なし                        | -                                                              |

---

## サブタスク管理

| #   | サブタスク                                                 | 依存関係          |
| --- | ---------------------------------------------------------- | ----------------- |
| 1   | 事前チェック（06-known-pitfalls.md の確認）                | なし              |
| 2   | Task 1: 実装ガイド作成（Part 1 + Part 2）                  | #1 完了後         |
| 3   | Task 2 Step 1-A: タスク完了記録（LOGS.md x2, SKILL.md x2） | #1 完了後         |
| 4   | Task 2 Step 1-B: 実装状況テーブル更新                      | #3 完了後         |
| 5   | Task 2 Step 1-C: 関連タスクテーブル更新                    | #3 完了後         |
| 6   | Task 2 Step 1-D: topic-map.md 再生成                       | #3, #4, #5 完了後 |
| 7   | Task 2 Step 2: システム仕様更新（5ファイル確認）           | #6 完了後         |
| 8   | Task 3: documentation-changelog.md と artifacts.json 更新  | #2-#7 完了後      |
| 9   | Task 4: 未タスク検出（0件でもレポート作成）                | #7 完了後         |
| 10  | Task 4 Step 1-E: 未タスク指示書整合性検証（検出時のみ）    | #9 完了後         |
| 11  | Task 5: スキルフィードバックレポート作成                   | #7 完了後         |
| 12  | 完了条件の全項目検証                                       | #8-#11 完了後     |

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 12 ステータスが `completed` に更新されている
- [ ] Phase末端で完了を明記している

---

## 成果物

| 成果物               | パス                                                                       | 必須 | 説明                               |
| -------------------- | -------------------------------------------------------------------------- | ---- | ---------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                                 | 必須 | Part 1（概念）+ Part 2（技術詳細） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`                              | 必須 | 全 Step の完了結果記録             |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`                            | 必須 | 0件でも作成必須                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`                                | 必須 | 改善点なしでも作成必須             |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/UT-FIX-IPC-HANDLER-DOUBLE-REG-001-*.md` | 条件 | 未タスク検出時のみ作成             |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（中学生向け）に日常生活の例え話が記載されている
- [ ] Part 1 で専門用語を使う場合は即座に説明が付いている
- [ ] Part 1 で「なぜ問題が起きたのか」->「どう直したか」の順序で説明されている
- [ ] Part 2（技術者向け）に修正対象ファイル一覧（`main/index.ts`, `main/ipc/index.ts`）が記載されている
- [ ] Part 2 に `unregisterAllIpcHandlers()` の関数シグネチャと JSDoc が記載されている
- [ ] Part 2 に activate イベントでの呼び出しフロー（unregister -> createWindow -> register）が記載されている
- [ ] Part 2 に Electron API の二重登録挙動の違い（handle vs on）が記載されている
- [ ] Part 2 にエッジケース（未登録チャンネルへの removeHandler、activate 連続発火、Windows/Linux 互換性）が記載されている
- [ ] Part 2 にセキュリティ注意点（4層防御維持、unregister-register 間のフェイルセキュア）が記載されている
- [ ] テスト数が `grep -c "it("` による実測値で記載されている（P37 対策）

### Task 2: システムドキュメント更新

- [ ] **【Step 1-A】** 該当仕様書に「完了タスク」セクションを追加した（テスト結果サマリー表・成果物テーブルを含む）
- [ ] **【Step 1-A】** 「関連ドキュメント」セクションに実装ガイドへのリンクを追加した
- [ ] **【Step 1-A】** 「変更履歴」にバージョン番号を追記した
- [ ] **【Step 1-A】** `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] **【Step 1-A】** `task-specification-creator/LOGS.md` にタスク完了記録を追加した（**P1/P25 対策: 2ファイル目**）
- [ ] **【Step 1-A】** `aiworkflow-requirements/SKILL.md` の変更履歴を更新した（**P29 対策**）
- [ ] **【Step 1-A】** `task-specification-creator/SKILL.md` の変更履歴を更新した（**P29 対策**）
- [ ] **【Step 1-B】** 実装状況テーブルの更新要否を判断し、必要な場合は更新した（結果を documentation-changelog.md に記録済み）
- [ ] **【Step 1-C】** `grep -rn "UT-FIX-IPC-HANDLER-DOUBLE-REG-001"` で関連仕様書を全件検索し、見つかった箇所のステータスを「完了」に更新した
- [ ] **【Step 1-C】** IPC 関連の重点確認対象5ファイル（task-workflow.md, security-electron-ipc.md, architecture-implementation-patterns.md, api-ipc-agent.md, interfaces-agent-sdk-skill.md）を全て確認した
- [ ] **【Step 1-D】** `generate-index.js` を実行して `topic-map.md` を再生成した（**P2/P27 対策**）
- [ ] **【Step 1-D】** 再生成された topic-map.md の行番号が正確であることを確認した
- [ ] **【Step 2】** IPC 関連更新対象ファイル5件の更新要否を全て判断した（**P26/P31 対策**）
- [ ] **【Step 2】** `task-workflow.md` の残課題テーブルと完了タスクセクションを更新した
- [ ] **【Step 2】** 更新結果を documentation-changelog.md に記録した（「更新不要」の場合は理由を明記）

### Task 3: ドキュメント更新履歴

- [ ] `documentation-changelog.md` が作成されている
- [ ] 全 Step（1-A, 1-B, 1-C, 1-D, 1-E, 2）の完了結果が各ファイル単位で詳細に記録されている
- [ ] 全 Step 確認完了後に初めて「完了」と記載されている（**P4 対策**）
- [ ] `artifacts.json` の Phase 12 ステータスが `completed` に更新されている
- [ ] `artifacts.json` に全 Phase（1-12）の成果物パスが登録されている
- [ ] Phase 12 の成果物4ファイルが artifacts.json に全て登録されている

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが `outputs/phase-12/unassigned-task-detection.md` に出力されている（**0件でも作成必須**）
- [ ] 検出ソース6項目（Phase 3 レビュー, Phase 10 レビュー, Phase 11 テスト, Phase 成果物, コードベース, 元仕様書）を全て確認した記録がある
- [ ] 修正対象ファイルだけでなく、同様パターンの関連ファイルも調査した記録がある（**P30 対策**）
- [ ] 検出した未タスクについて3ステップ全てを完了した（**P3/P38 対策**: 検出時のみ）
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（検出時のみ - **P38 対策**）
- [ ] `verify-unassigned-links.js` の実行結果が `ALL_LINKS_EXIST` である（検出時のみ）

### Task 5: スキルフィードバック

- [ ] スキルフィードバックレポートが `outputs/phase-12/skill-feedback-report.md` に出力されている（**P28 対策: 改善点なしでも作成必須**）
- [ ] 5つの確認観点（ワークフロー改善、技術的教訓、新規 Pitfall 候補、スキル改善提案、苦戦箇所）全ての記録がある
- [ ] 新規 Pitfall 候補（P5 拡張: ipcMain.handle() vs ipcMain.on() の挙動差異）の検討結果が明記されている
- [ ] 苦戦箇所を `lessons-learned.md` に記録すべきか判断し、その結果が記載されている

### 全体

- [ ] **本Phase内の全タスク（Task 1〜5）を100%実行完了**
- [ ] ESLint キャッシュをクリアして lint を再実行した（`rm -rf node_modules/.cache/eslint-* && pnpm lint --cache=false`）
- [ ] コメントフォーマット（JSDoc 形式）が統一されている

---

## 次のPhase

Phase 13: PR作成（`phase-13-pr-creation.md`）
