# Phase 2 成果物: 修正方針設計書

## メタ情報

| 項目      | 値                                   |
| --------- | ------------------------------------ |
| タスクID  | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| Phase     | 2（設計）                            |
| 作成日    | 2026-02-24                           |
| 依存Phase | Phase 1（要件定義）                  |

## 1. task-022-task-9f-skill-share.md の修正設計（Task 2-1）

### 修正箇所1: Step 3「IPC拡張」チャネル名修正

**対象セクション**: Step 3（IPC拡張 -- channels.ts, handlers, preload）、行122-128

**修正方針**:

Step 3 のチャネル一覧で `skill:import` を `skill:importFromSource` に変更する。チャネルの説明文「スキルインポート」は「外部ソースからのスキルインポート」に修正して用途を明確化する。引数型 `ShareTarget` と戻り値型 `ImportResult` は変更不要。

**修正前後の比較**:

| 項目           | 修正前                              | 修正後                                                        |
| -------------- | ----------------------------------- | ------------------------------------------------------------- |
| チャネル一覧   | `- skill:import - スキルインポート` | `- skill:importFromSource - 外部ソースからのスキルインポート` |
| 行番号（概算） | 128                                 | 128                                                           |

**修正の具体的な内容**:

```markdown
<!-- 修正前 -->

- `skill:import` - スキルインポート

<!-- 修正後 -->

- `skill:importFromSource` - 外部ソースからのスキルインポート
```

---

### 修正箇所2: artifacts.modifies セクション追加

**対象セクション**: YAML フロントマター内の `artifacts.modifies`、行29-32

**修正方針**:

`modifies` リストに以下の2ファイルパスを追加する:

1. `apps/desktop/src/main/ipc/channels.ts` -- チャネルホワイトリストに `skill:importFromSource`, `skill:validateSource`, `skill:export` の3チャネル追加が必要
2. `apps/desktop/src/preload/types.ts` -- Preload 型定義に `importFromSource` メソッド追加が必要

**修正前後の比較**:

```yaml
# 修正前
artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillShareManager.ts
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/skillAPI.ts

# 修正後
artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillShareManager.ts
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/skillAPI.ts
    - apps/desktop/src/main/ipc/channels.ts
    - apps/desktop/src/preload/types.ts
```

---

### 修正箇所3: 注記の追加

**対象セクション**: Step 3「IPC拡張」の直後（行129付近）

**修正方針**:

以下の注記を Step 3 のチャネル一覧の直後に追加する。この注記は TASK-9F 実装者が既存チャネルとの差異を認識するためのものであり、リスク R-002（実装者の見落とし）への対策である。

**追加する注記内容**:

```markdown
> ⚠️ **注意**: `skill:import` チャネルは既存のローカルスキルインポート
> （UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済みです。
> 引数は `skillName: string` で、`SkillImportManager.importSkills([skillName])` を呼び出します。
> 外部ソースインポートは `skill:importFromSource` を使用してください。
> この改名は UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 で実施されました。
```

---

## 2. task-030-ui-05-skill-center-view.md の修正設計（Task 2-2）

### 修正箇所4: セクション15B.2 IPC テーブル修正

**対象セクション**: セクション15B.2「ImportSkillDialog / ExportSkillDialog 拡張」の IPC テーブル、行973-978

**修正方針**:

IPC テーブルの4行で `skill:import` を `skill:importFromSource` に変更する。テーブルのヘッダーと他の列は変更不要。

**修正前後の比較**:

```markdown
<!-- 修正前（行973-978） -->

| タブ     | 入力フォーム                       | IPC チャネル   |
| -------- | ---------------------------------- | -------------- |
| GitHub   | リポジトリURL + ブランチ + パス    | `skill:import` |
| Gist     | Gist ID                            | `skill:import` |
| URL      | SKILL.md の URL                    | `skill:import` |
| ローカル | ディレクトリパス（ファイル選択UI） | `skill:import` |

<!-- 修正後 -->

| タブ     | 入力フォーム                       | IPC チャネル             |
| -------- | ---------------------------------- | ------------------------ |
| GitHub   | リポジトリURL + ブランチ + パス    | `skill:importFromSource` |
| Gist     | Gist ID                            | `skill:importFromSource` |
| URL      | SKILL.md の URL                    | `skill:importFromSource` |
| ローカル | ディレクトリパス（ファイル選択UI） | `skill:importFromSource` |
```

---

### 修正箇所5: セクション15B.2 フロー記述修正

**対象セクション**: セクション15B.2 の共通フロー記述、行986

**修正方針**:

フロー記述内の `skill:import` を `skill:importFromSource` に変更する。

**修正前後の比較**:

```markdown
<!-- 修正前（行982-987） -->
```

ソースタイプ選択（タブ切替）
-> 入力フォーム表示
-> [検証] ボタン -> IPC: skill:validateSource -> プレビュー表示
-> [インポート] ボタン -> IPC: skill:import -> 完了Toast

```

<!-- 修正後 -->
```

ソースタイプ選択（タブ切替）
-> 入力フォーム表示
-> [検証] ボタン -> IPC: skill:validateSource -> プレビュー表示
-> [インポート] ボタン -> IPC: skill:importFromSource -> 完了Toast

```

```

---

### 修正箇所6: セクション11 IPC 連携テーブルへの3チャネル追加

**対象セクション**: セクション11「IPC連携」、行685-695

**修正方針**:

1. 既存の `skill:import`（ローカルスキルインポート）行は変更しない（FR-006 準拠）
2. 既存テーブルの末尾（`skill:readMarkdown` 行の後）に以下の3行を追加する
3. セクションの冒頭説明文「新規チャネルの追加は不要。」を削除する（3チャネル追加に伴い不正確となるため）

**追加する3行**:

| 操作                 | IPCチャネル              | 引数                                              | 備考                                      |
| -------------------- | ------------------------ | ------------------------------------------------- | ----------------------------------------- |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | TASK-9F: 外部ソースからのスキルインポート |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | TASK-9F: インポート前のソース検証         |
| スキルエクスポート   | `skill:export`           | `{ skillName: string, destination: ShareTarget }` | TASK-9F: スキルの外部エクスポート         |

**修正後のセクション11 全体像**:

```markdown
## 11. IPC連携

SkillCenterView は既存の IPC チャネルと TASK-9F で追加されるチャネルを利用する。

| 操作                 | IPCチャネル              | 引数                                              | 備考                                      |
| -------------------- | ------------------------ | ------------------------------------------------- | ----------------------------------------- |
| ツール一覧取得       | `skill:list`             | なし                                              | 初期読み込み・リフレッシュ時              |
| ツール追加           | `skill:import`           | `skillName: string`                               | P44解決済み: string を直接渡す            |
| ツール削除           | `skill:remove`           | `skillName: string`                               | P44/P45解決済み: skillName に統一済み     |
| ツール詳細取得       | `skill:detail`           | `skillName: string`                               | DetailPanel 表示用                        |
| SKILL.md取得         | `skill:readMarkdown`     | `skillName: string`                               | SkillMarkdownCollapse 表示用              |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | TASK-9F: 外部ソースからのスキルインポート |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | TASK-9F: インポート前のソース検証         |
| スキルエクスポート   | `skill:export`           | `{ skillName: string, destination: ShareTarget }` | TASK-9F: スキルの外部エクスポート         |
```

---

## 3. 修正順序の設計（Task 2-3）

### 推奨修正順序

| 順序 | 修正箇所 | 対象ファイル | 修正内容                                | 理由                                   |
| ---- | -------- | ------------ | --------------------------------------- | -------------------------------------- |
| 1    | #1       | task-022     | Step 3 チャネル名修正                   | 根本となるチャネル名の変更を最初に行う |
| 2    | #2       | task-022     | artifacts.modifies 追加                 | 同一ファイルの修正を連続で行う         |
| 3    | #3       | task-022     | 注記追加                                | 同一ファイルの修正を連続で行う         |
| 4    | #4       | task-030     | セクション15B.2 IPC テーブル修正（4行） | UI仕様書の修正に移行                   |
| 5    | #5       | task-030     | セクション15B.2 フロー記述修正（1行）   | 同一セクション内を連続で修正する       |
| 6    | #6       | task-030     | セクション11 IPC テーブル追加（3行）    | 新規追加のため最後に行う               |

### 修正順序の根拠

1. **同一ファイル連続修正**: task-022 の3箇所を連続で修正し、次に task-030 の3箇所を連続で修正することで、ファイル切り替えによるコンテキストスイッチを削減する
2. **根本修正優先**: チャネル名の変更（#1）が根本修正であり、他の修正（#3: 注記追加、#4-5: UI仕様書修正）はこの変更に依存する
3. **新規追加は最後**: セクション11 への3行追加（#6）は既存内容に影響を与えないため、最後に行う

---

## 4. 影響範囲分析（Task 2-4）

### 影響範囲確認結果

以下のコマンドで影響範囲を調査済み:

```bash
grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/tasks/ | grep -v "skill:importFromSource" | grep -v completed-task
```

#### 確認結果

| #   | 確認項目                                                                  | 期待結果                    | 実際の結果               | 判定 |
| --- | ------------------------------------------------------------------------- | --------------------------- | ------------------------ | ---- |
| 1   | task-022 以外の TASK-9F 関連ファイルで外部インポート文脈の `skill:import` | 0件（他ファイルに波及なし） | 0件                      | PASS |
| 2   | task-030 以外の UI仕様書で外部インポート文脈の `skill:import`             | 0件（他ファイルに波及なし） | 0件                      | PASS |
| 3   | 既存の `skill:import`（ローカルインポート）の仕様記述                     | 変更なし                    | 修正対象に含まれていない | PASS |

#### task-012 との整合確認

task-012（UT-SKILL-IPC-PRELOAD-EXTENSION-001）の行436:

```
| 7   | `skill:importFromSource`  | `ShareTarget`                   | `ImportResult`           | 9F   | handle   |
```

task-012 では既に `skill:importFromSource` が使用されており、本タスクの修正方針と完全に整合している。task-012 への追加修正は不要。

#### 結論

追加修正が必要な箇所はなく、修正対象は task-022（3箇所）と task-030（3箇所）の合計6箇所のみ。

---

## 5. IPC チャネル命名の妥当性検証（Task 2-5）

### 既存のスキル関連チャネル命名パターン

| チャネル名           | パターン              | 文字数 |
| -------------------- | --------------------- | ------ |
| `skill:list`         | `skill:` + 動詞       | 10     |
| `skill:import`       | `skill:` + 動詞       | 12     |
| `skill:remove`       | `skill:` + 動詞       | 12     |
| `skill:detail`       | `skill:` + 名詞       | 12     |
| `skill:readMarkdown` | `skill:` + 動詞+名詞  | 18     |
| `skill:chain:*`      | `skill:chain:` + 動詞 | 可変   |

### 新規チャネルの命名評価

#### `skill:importFromSource`

| 評価項目       | 結果 | 理由                                                                         |
| -------------- | ---- | ---------------------------------------------------------------------------- |
| 命名規則準拠   | PASS | `skill:` プレフィックス + 動作名のパターンに準拠                             |
| 用途の明確性   | PASS | `FromSource` により外部ソースインポートであることが明確                      |
| 既存との差別化 | PASS | `skill:import`（ローカル）と `skill:importFromSource`（外部）で区別可能      |
| 可読性         | PASS | 23文字。最長の `skill:readMarkdown`（18文字）より5文字長いが、許容範囲内     |
| 一貫性         | PASS | task-012（UT-SKILL-IPC-PRELOAD-EXTENSION-001）で既に採用されている命名と一致 |

#### `skill:validateSource`

| 評価項目     | 結果 | 理由                                              |
| ------------ | ---- | ------------------------------------------------- |
| 命名規則準拠 | PASS | `skill:` プレフィックス + 動詞+名詞パターンに準拠 |
| 用途の明確性 | PASS | インポート元の検証であることが明確                |
| 既存との衝突 | PASS | 既存チャネル名との衝突なし                        |

#### `skill:export`

| 評価項目     | 結果 | 理由                                         |
| ------------ | ---- | -------------------------------------------- |
| 命名規則準拠 | PASS | `skill:` プレフィックス + 動詞パターンに準拠 |
| 用途の明確性 | PASS | スキルのエクスポートであることが明確         |
| 既存との衝突 | PASS | 既存チャネル名との衝突なし                   |

### 総合評価

3つの新規チャネル名は全て命名規則に準拠しており、既存チャネルとの衝突もない。`skill:importFromSource` は task-012 で既に採用されている命名と一致しており、仕様書間の一貫性が保たれている。

**結論**: 全チャネル名は妥当であり、変更の必要はない。

---

## 6. 設計サマリー

### 修正対象マトリクス

| 修正箇所 | ファイル | セクション         | 修正種別     | 対応要件         | 対応AC       |
| -------- | -------- | ------------------ | ------------ | ---------------- | ------------ |
| #1       | task-022 | Step 3             | 文字列置換   | FR-001, FR-002   | AC-01        |
| #2       | task-022 | artifacts.modifies | 行追加       | FR-005           | AC-02, AC-03 |
| #3       | task-022 | Step 3 付近        | ブロック追加 | NFR-001, NFR-003 | -            |
| #4       | task-030 | 15B.2 テーブル     | 文字列置換   | FR-003           | AC-04        |
| #5       | task-030 | 15B.2 フロー       | 文字列置換   | FR-003           | AC-04        |
| #6       | task-030 | セクション11       | 行追加       | FR-004           | AC-05~AC-08  |

### 要件-設計トレーサビリティ

| 要件    | カバーする修正箇所 | カバー状況 |
| ------- | ------------------ | ---------- |
| FR-001  | #1                 | 完全カバー |
| FR-002  | #1                 | 完全カバー |
| FR-003  | #4, #5             | 完全カバー |
| FR-004  | #6                 | 完全カバー |
| FR-005  | #2                 | 完全カバー |
| FR-006  | #6（既存行不変）   | 完全カバー |
| NFR-001 | #3, #6             | 完全カバー |
| NFR-002 | #1, #4, #5         | 完全カバー |
| NFR-003 | #3                 | 完全カバー |
