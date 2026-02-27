# Phase 10: MINOR 指摘事項と未タスク変換記録

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 |
| Phase    | 10                                         |
| 実施日   | 2026-02-26                                 |
| 判定     | MINOR（2件）                               |
| 対応方針 | 全件を未タスク仕様書に変換後、Phase 11 へ  |

---

## MINOR 指摘一覧

| #   | 重要度 | 指摘内容                                                                                  | 影響度 | 未タスクID                                  |
| --- | ------ | ----------------------------------------------------------------------------------------- | ------ | ------------------------------------------- |
| 1   | MINOR  | BOM付きUTF-8で `quick_validate.js` の frontmatter 検出が失敗する                          | 低     | UT-IMP-QUICK-VALIDATE-BOM-UTF8-001          |
| 2   | MINOR  | name/description フィールドが空の場合に `desc.toLowerCase()` でランタイムエラーが発生する | 中     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |

---

## MINOR #1: BOM付きUTF-8 frontmatter 検出失敗

### 指摘内容

`quick_validate.js` が BOM (Byte Order Mark: `\uFEFF`) 付き UTF-8 の SKILL.md を読み込んだ場合、ファイル先頭の `---` が `\uFEFF---` となり、frontmatter の開始マーカーとして認識されない。結果として「frontmatter が見つかりません」という Error が誤検出される。

### 発見元

Phase 6 エッジケーステスト TC-EC-006 で動作記録済み。

### 影響度: 低

- BOM付きUTF-8 で SKILL.md を保存するエディタは限定的（主に Windows のメモ帳等）
- 現状は Error として検出されるため、ユーザーは問題の存在に気付ける
- BOM 除去後に再実行すれば正常動作する

### 未タスク変換

- **未タスクID**: UT-IMP-QUICK-VALIDATE-BOM-UTF8-001
- **未タスク指示書**: `docs/30-workflows/unassigned-task/task-imp-quick-validate-bom-utf8-001.md`
- **task-workflow.md 登録**: 完了
- **関連仕様書リンク**: `spec-update-workflow.md` Step 1-G.3 に参照追記

---

## MINOR #2: name/description 空文字でのランタイムエラー

### 指摘内容

SKILL.md の frontmatter で `name` または `description` フィールドが空文字（`""`）で記載されている場合、`desc.toLowerCase()` でランタイムエラー（TypeError）が発生する。このエラーはキャッチされず、検証プロセスが中断する可能性がある。

### 発見元

Phase 6 エッジケーステスト TC-EC-004 で動作記録済み。

### 影響度: 中

- 空文字の SKILL.md は通常運用では低頻度だが、新規スキル作成途中の状態で発生しうる
- ランタイムエラーは未処理の Warning よりも深刻（検証プロセスが中断）
- 適切なエラーメッセージではなく、スタックトレースが表示される

### 未タスク変換

- **未タスクID**: UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001
- **未タスク指示書**: `docs/30-workflows/completed-tasks/task-imp-quick-validate-empty-field-guard-001.md`（完了移管済み）
- **task-workflow.md 登録**: 完了
- **関連仕様書リンク**: `spec-update-workflow.md` Step 1-G.3 に参照追記

---

## 3ステップ完了チェック（P3 準拠）

| ステップ                           | MINOR #1 | MINOR #2 |
| ---------------------------------- | -------- | -------- |
| 1. `unassigned-task/` に指示書作成 | 完了     | 完了     |
| 2. `task-workflow.md` 残課題登録   | 完了     | 完了     |
| 3. 関連仕様書に参照リンク追加      | 完了     | 完了     |
