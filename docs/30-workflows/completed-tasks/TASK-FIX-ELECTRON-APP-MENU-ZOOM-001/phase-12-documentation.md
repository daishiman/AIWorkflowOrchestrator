# Phase 12: ドキュメント作成

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                  |
| Phase      | 12 / 13                                                              |
| 作成日     | 2026-03-16                                                           |
| 担当       | spec-phase11-13                                                      |
| 依存 Phase | Phase 11（手動テスト）— PASS 済み                                    |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-12-documentation.md` |

---

## 目的

Phase 5 で実装した `createApplicationMenu()` を中心とした変更内容について、以下の 5 つのドキュメントを作成・更新する。これにより、実装の意図・判断経緯・影響範囲が将来の開発者に正確に伝わる状態にする。

---

## 実行タスク

| No. | タスク名                         | 目的                                                              | 省略可否 |
| --- | -------------------------------- | ----------------------------------------------------------------- | -------- |
| 1   | 実装ガイド作成                   | 概念説明（中学生向け）と開発者向け実装詳細を記録する              | 省略不可 |
| 2   | システム仕様書更新               | LOGS.md（2箇所）・SKILL.md 変更履歴・関連仕様書・topic-map を更新 | 省略不可 |
| 3   | documentation-changelog 作成     | 全 Step の完了結果を事後記録する                                  | 省略不可 |
| 4   | 未タスク検出レポート作成         | 0件の場合もサマリーを作成する                                     | 省略不可 |
| 5   | スキルフィードバックレポート作成 | 改善点なしの場合も作成する                                        | 省略不可 |

> **警告（P4 対策）**: documentation-changelog.md には各 Step の実行が完了した後に結果を記録する。実行前に「完了」と記載しない。

---

## 参照資料

| 資料                                                                           | 参照理由                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`             | 要件（FR/NFR/AC）の参照                       |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`                   | 設計詳細・実装イメージの参照                  |
| `apps/desktop/src/main/index.ts`                                               | 実際の実装コードの参照                        |
| `.claude/rules/05-task-execution.md`                                           | Phase 12 チェックリストの参照                 |
| `.claude/rules/06-known-pitfalls.md#P1-P4`                                     | LOGS.md 2箇所更新・topic-map 再生成の注意事項 |
| `.claude/rules/06-known-pitfalls.md#P25-P29`                                   | システム仕様書更新漏れの防止                  |
| `.claude/rules/06-known-pitfalls.md#P43`                                       | サブエージェント rate limit 中断への対応      |
| `.claude/rules/06-known-pitfalls.md#P51`                                       | サブエージェントの早期完了記載の防止          |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | システム仕様書更新ワークフロー                |

---

## 実行手順

### Task 1: 実装ガイド作成

**成果物**: `docs/30-workflows/electron-app-menu-zoom/outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生向け概念説明（日常のたとえを使う）

以下の内容を `implementation-guide.md` に記載する。

**テーマ: メニューは「レストランのメニュー表」**

> レストランに入ったとき、メニュー表がないとお客さんは「何を注文できるか」分かりません。店員さんに聞けばハンバーグを出してくれるかもしれませんが、Ctrl キーでズームインできることを知っているお客さん（ユーザー）だけが注文できる状態です。
>
> Electron アプリも同じです。`Menu.buildFromTemplate()` を呼ぶ前は、アプリに「メニュー表」がありませんでした。だから `Cmd+-` を押しても「ズームアウト注文」を受け付ける窓口がなく、何も起きませんでした。
>
> 今回の修正では、アプリにメニュー表（`createApplicationMenu()`）を追加しました。これにより、OS（macOS/Windows/Linux）がキーボードショートカットを受け取ったとき、そのショートカットに対応するメニュー項目（`role: "zoomOut"` など）を見つけて処理できるようになりました。
>
> macOS には「アプリ名メニュー」「編集」「表示」「ウィンドウ」の 4 つのメニューがある（Apple HIG の標準）。Windows/Linux には「表示」メニューだけを用意する（シンプル構成）。このプラットフォーム別の対応も、お店ごとに異なるメニュー表を用意するようなものです。

#### Part 2: 開発者向け実装詳細

以下の内容を `implementation-guide.md` に記載する。

**変更ファイル**: `apps/desktop/src/main/index.ts`

**変更内容の概要**:

1. `electron` の import に `Menu` を追加する:

   ```typescript
   import { app, BrowserWindow, shell, session, Menu } from "electron";
   ```

2. `createApplicationMenu()` 関数を追加する（`app.whenReady()` の外、モジュールスコープに配置）:

   ```typescript
   function createApplicationMenu(): Menu {
     const isMac = process.platform === "darwin";
     const template = isMac ? buildMacTemplate() : buildDefaultTemplate();
     return Menu.buildFromTemplate(template);
   }
   ```

3. `buildMacTemplate()` 関数を追加する（macOS 専用、Apple HIG 準拠）:
   - アプリ名メニュー: `about`, `hide`, `hideOthers`, `unhide`, `quit`
   - 編集メニュー: `undo`, `redo`, `cut`, `copy`, `paste`, `selectAll`
   - 表示メニュー: `zoomIn`, `zoomOut`, `resetZoom`, `togglefullscreen`
   - ウィンドウメニュー: `minimize`, `close`, `front`

4. `buildDefaultTemplate()` 関数を追加する（Windows/Linux 用、最小構成）:
   - 表示メニューのみ: `zoomIn`, `zoomOut`, `resetZoom`, `togglefullscreen`

5. `app.whenReady()` 内の `createWindow()` 呼び出しの前に以下を追加する:
   ```typescript
   const menu = createApplicationMenu();
   Menu.setApplicationMenu(menu);
   ```

**設計判断**:

- `menu.ts` に分離せず `index.ts` に直接追加した理由: メニューテンプレートは 50 行以内であり、`app.whenReady()` と密接に連携するため、ファイル分離よりも局所性を優先した（over-engineering の回避）。
- `role` ベースのみを使用した理由: Electron の `role` は OS のネイティブ処理に委譲するため、IPC や Renderer のコードが不要。実装コストが最小になる。
- セキュリティへの影響なし: `Menu` は Main Process の API であり、`BrowserWindow.webPreferences`（`contextIsolation`, `sandbox` 等）とは独立している。

**テスト対応**: `apps/desktop/src/main/__tests__/menu.test.ts` で以下を検証:

- `createApplicationMenu()` が `darwin` / `win32` / `linux` で正しいメニュー構造を返す
- `buildMacTemplate()` に `zoomIn`/`zoomOut`/`resetZoom` role が含まれる
- `buildDefaultTemplate()` に同 role が含まれる
- `Menu.setApplicationMenu()` が `app.whenReady()` 内で呼ばれる（モック検証）

---

### Task 2: システム仕様書更新

> **P43 対策**: 仕様書更新は 3 ファイル以下/エージェントに分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする。
> **P51 対策**: 各 Step の実行完了後に documentation-changelog.md へ記録する。実行前に「完了」と記載しない。

#### Step 1-A: タスク完了記録

以下の 4 ファイルを更新する（**2 ファイルの LOGS.md 両方を更新する — P1/P25 対策**）:

1. **`aiworkflow-requirements/LOGS.md`**（1箇所目）:
   - `TASK-FIX-ELECTRON-APP-MENU-ZOOM-001` の完了記録を追加する
   - 完了日、変更ファイル（`apps/desktop/src/main/index.ts`）を記録する

2. **`task-specification-creator/LOGS.md`**（2箇所目 — **省略不可**）:
   - 同タスクの完了記録を追加する
   - P1/P25 の再発防止のため、必ず両方のファイルを更新する

3. **`aiworkflow-requirements/SKILL.md`** 変更履歴テーブル:
   - TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の変更を記録する

4. **`task-specification-creator/SKILL.md`** 変更履歴テーブル:
   - 同タスクの変更を記録する（P29 対策: SKILL.md 更新漏れ防止）

#### Step 1-B: 実装状況テーブル更新

`grep -rn "apps/desktop/src/main/index.ts" .claude/skills/aiworkflow-requirements/references/` を実行して、`index.ts` の実装状況を管理している仕様書を特定し、TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の実装完了ステータスを更新する。

#### Step 1-C: 関連仕様書の更新

以下のコマンドで関連仕様書を検索する:

```bash
grep -rn "TASK-FIX-ELECTRON-APP-MENU-ZOOM-001" \
  .claude/skills/aiworkflow-requirements/references/ \
  .claude/skills/task-specification-creator/references/
```

検索結果の各仕様書に、タスク完了の記録（実装内容・変更ファイル・完了日）を追加する。

#### Step 1-D: topic-map.md 再生成

> **P2/P27 対策**: 仕様書の追加だけでなく、更新・削除も topic-map 再生成のトリガーになる。Step 1-A〜1-C で 1 つでもファイルを変更した場合は必ず再生成する。

```bash
# プロジェクトルートから実行する
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、`topic-map.md` のタイムスタンプが更新されていることを `git diff --stat -- .claude/skills/` で確認する。

#### Step 2: システム仕様更新

今回の変更（`createApplicationMenu()` の追加）は `apps/desktop/src/main/index.ts` へのコード追加であり、新規 IPC チャンネルの追加・型定義の変更・アーキテクチャ変更は発生しない。

以下の観点でシステム仕様書への追加が必要かを判断する:

| 確認項目                       | 今回の変更       | 仕様書更新要否 |
| ------------------------------ | ---------------- | -------------- |
| 新規 IPC チャンネル追加        | なし             | 不要           |
| 新規型定義追加                 | なし             | 不要           |
| BrowserWindow 設定変更         | なし             | 不要           |
| Electron Main プロセス追加機能 | あり（メニュー） | 要確認         |

`apps/desktop` のアーキテクチャ概要仕様書に「アプリケーションメニューの定義と設定」を追記する場合は、対象ファイルを特定して更新する。

---

### Task 3: documentation-changelog.md 作成

**成果物**: `docs/30-workflows/electron-app-menu-zoom/outputs/phase-12/documentation-changelog.md`

> **P4 対策**: 全 Step 確認前に「完了」と記載しない。各 Step の実行結果を事後に記録する。

以下のフォーマットで記録する:

```markdown
# documentation-changelog

## TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 — Phase 12 記録

### Step 1-A: タスク完了記録

- aiworkflow-requirements/LOGS.md: [更新結果を記録]
- task-specification-creator/LOGS.md: [更新結果を記録]
- aiworkflow-requirements/SKILL.md: [更新結果を記録]
- task-specification-creator/SKILL.md: [更新結果を記録]

### Step 1-B: 実装状況テーブル

- grep 結果: [ヒットしたファイルと更新内容を記録]

### Step 1-C: 関連仕様書

- grep 結果: [ヒットしたファイルと更新内容を記録]

### Step 1-D: topic-map.md 再生成

- 実行結果: [コマンド出力を記録]
- git diff --stat 確認結果: [変更ファイル数を記録]

### Step 2: システム仕様更新

- 更新したファイル: [ファイル名と変更内容を記録]

### Task 1: 実装ガイド

- 成果物: outputs/phase-12/implementation-guide.md — [作成完了/未完了]

### Task 4: 未タスク検出

- 検出件数: [N 件]
- 詳細: outputs/phase-12/unassigned-task-detection.md 参照

### Task 5: スキルフィードバック

- 改善点: [改善点の有無を記録]
- 詳細: outputs/phase-12/skill-feedback-report.md 参照
```

---

### Task 4: 未タスク検出レポート

**成果物**: `docs/30-workflows/electron-app-menu-zoom/outputs/phase-12/unassigned-task-detection.md`

> **0件の場合もサマリーの作成は必須** — 「確認した結果、未タスクはなかった」という記録が重要。

以下の観点で未タスクを検索する:

1. Phase 10（最終レビュー）で MINOR 判定の指摘が残存していないか確認する
2. Phase 3（設計レビュー）で MINOR 判定の指摘が未対応のまま残っていないか確認する
3. スコープ OUT と定義したが将来対応が必要な機能（ズームレベルの永続化など）が未タスク化されていないか確認する

検出した未タスクがある場合は 3 ステップで処理する（P3/P38 対策）:

1. `docs/30-workflows/electron-app-menu-zoom/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（本ファイルを含む）に参照リンクを追加する

再評価クローズした未タスクは GitHub Issue を同時に Close する（P56 対策）:

```bash
gh issue close <issue-number> --comment "再評価クローズ: [クローズ理由を記述]"
```

---

### Task 5: スキルフィードバックレポート

**成果物**: `docs/30-workflows/electron-app-menu-zoom/outputs/phase-12/skill-feedback-report.md`

> **改善点なしの場合も作成は必須**（P28 対策）

以下の観点でスキルフィードバックを作成する:

| 観点                 | 確認内容                                                       |
| -------------------- | -------------------------------------------------------------- |
| ワークフロー効率     | Phase 1-13 の実行フローで無駄・重複があったか                  |
| テンプレートの改善点 | phase-template-phase11/12/13.md の内容が不足していたか         |
| 再利用可能なパターン | 今回の実装（role ベースメニュー追加）が他タスクに転用できるか  |
| 落とし穴の追加       | 新しい pitfall が発見され、06-known-pitfalls.md に追加すべきか |

---

## 成果物

| 成果物                        | パス                                            | 説明                                    |
| ----------------------------- | ----------------------------------------------- | --------------------------------------- |
| 実装ガイド                    | `outputs/phase-12/implementation-guide.md`      | Task 1 成果物（概念説明 + 実装詳細）    |
| documentation-changelog       | `outputs/phase-12/documentation-changelog.md`   | Task 3 成果物（全 Step の完了結果記録） |
| 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md` | Task 4 成果物（未タスク検出結果）       |
| スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`     | Task 5 成果物（スキルフィードバック）   |
| LOGS.md（1箇所目）            | `aiworkflow-requirements/LOGS.md`               | Task 2 / Step 1-A 成果物                |
| LOGS.md（2箇所目）            | `task-specification-creator/LOGS.md`            | Task 2 / Step 1-A 成果物（2箇所目）     |
| SKILL.md（aiworkflow）        | `aiworkflow-requirements/SKILL.md`              | Task 2 / Step 1-A 成果物                |
| SKILL.md（task-spec-creator） | `task-specification-creator/SKILL.md`           | Task 2 / Step 1-A 成果物                |
| topic-map.md                  | `indexes/topic-map.md`                          | Task 2 / Step 1-D 成果物                |

---

## 完了条件

### Task 1（実装ガイド）

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] Part 1 に日常的なたとえ（「レストランのメニュー表」等）が含まれている
- [ ] Part 2 に変更ファイル・変更内容・設計判断理由が記載されている

### Task 2（システム仕様書更新）

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了記録が追加されている（1箇所目）
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録が追加されている（2箇所目 — P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴テーブルが更新されている
- [ ] `task-specification-creator/SKILL.md` 変更履歴テーブルが更新されている（P29 対策）
- [ ] Step 1-C の grep で関連仕様書が特定され、更新が完了している
- [ ] `topic-map.md` が `node generate-index.js` で再生成されている（P2/P27 対策）
- [ ] `git diff --stat -- .claude/skills/` でインデックスファイルの変更が確認できる

### Task 3（documentation-changelog）

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 全 Step（1-A〜1-D、Step 2）の実行結果が事後記録されている（P4 対策）
- [ ] 各 Step の「完了」は当該 Step の実行完了後にのみ記録されている

### Task 4（未タスク検出）

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] 検出した未タスクがある場合、3ステップ（指示書作成・残課題テーブル登録・仕様書リンク追加）が全て完了している（P3/P38 対策）
- [ ] 再評価クローズした未タスクの GitHub Issue が Close されている（P56 対策）

### Task 5（スキルフィードバック）

- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも必須 — P28 対策）
- [ ] 4つの観点（ワークフロー効率・テンプレート改善・再利用パターン・落とし穴追加）が検討されている

---

## タスク100%実行確認【必須】

| No. | タスク名                         | 結果      | 備考                                                                                                                           |
| --- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 実装ガイド作成                   | completed | Part 1: 中学生向け概念説明 + Part 2: 開発者向け実装詳細                                                                        |
| 2   | システム仕様書更新               | completed | LOGS.md x2, SKILL.md x2, architecture-overview-core.md, technology-desktop.md, task-workflow, lessons-learned, topic-map再生成 |
| 3   | documentation-changelog 作成     | completed | 全Step事後記録済み                                                                                                             |
| 4   | 未タスク検出レポート作成         | completed | 検出件数: 0件                                                                                                                  |
| 5   | スキルフィードバックレポート作成 | completed | テスト対象ファイルのimport副作用チェック改善提案あり                                                                           |

---

## 次 Phase

Phase 13（PR 作成）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
