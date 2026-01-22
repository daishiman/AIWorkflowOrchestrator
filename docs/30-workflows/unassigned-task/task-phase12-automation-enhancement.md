# Phase 12自動化スクリプト拡充 - タスク指示書

## メタ情報

```yaml
issue_number: 409
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TSC-AUTOMATION-001                              |
| タスク名     | Phase 12自動化スクリプト拡充                    |
| 分類         | 改善                                            |
| 対象機能     | task-specification-creatorスキル Phase 12自動化 |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | skill-import-persistence-bugfix Phase 12実施時  |
| 発見日       | 2026-01-22                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12（ドキュメント更新フェーズ）では複数のドキュメント作成タスクがあり、一部は自動化スクリプト（`generate-documentation-changelog.js`）で効率化されている。しかし、他のタスクはまだ手動作業が多い。

### 1.2 問題点・課題

- `implementation-guide.md`の生成は完全手動
- システム仕様書への完了タスク記録は手動コピー＆ペースト
- `artifacts.json`の更新は手動
- 既存スクリプト（`generate-documentation-changelog.js`）の活用範囲が限定的

### 1.3 放置した場合の影響

- Phase 12の作業時間が削減されない
- 人的ミス（記載漏れ、フォーマット不整合）が発生し続ける
- 複数タスクで同じ手動作業を繰り返す

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12の主要タスクを自動化スクリプトで支援し、作業効率と品質を向上させる。

### 2.2 最終ゴール

- 3つ以上の自動化スクリプトがPhase 12タスクを支援
- 手動作業がテンプレート埋め込み程度に削減
- スクリプト使用方法がドキュメント化されている

### 2.3 スコープ

#### 含むもの

- `generate-implementation-guide.js`の作成
- `generate-completion-record.js`の作成
- `update-artifacts-json.js`の作成
- 既存スクリプトの改善

#### 含まないもの

- Phase 12以外のフェーズの自動化
- CI/CDパイプラインへの統合
- GUI/インタラクティブツールの作成

### 2.4 成果物

| 成果物                             | パス                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| implementation-guide生成スクリプト | `.claude/skills/task-specification-creator/scripts/generate-implementation-guide.js` |
| completion-record生成スクリプト    | `.claude/skills/task-specification-creator/scripts/generate-completion-record.js`    |
| artifacts.json更新スクリプト       | `.claude/skills/task-specification-creator/scripts/update-artifacts-json.js`         |
| スクリプト使用ガイド               | `.claude/skills/task-specification-creator/references/automation-scripts-guide.md`   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 18以上がインストールされていること
- task-specification-creatorスキルの構造を理解していること
- Phase 12のタスク内容を把握していること

### 3.2 依存タスク

| タスク                          | ステータス |
| ------------------------------- | ---------- |
| skill-import-persistence-bugfix | 完了       |

### 3.3 必要な知識

- Node.js/JavaScriptスクリプト作成
- Markdownテンプレート生成
- JSONファイル操作
- Git操作（差分取得）

### 3.4 推奨アプローチ

1. 既存スクリプト（`generate-documentation-changelog.js`）のパターンを踏襲
2. コマンドライン引数で`--workflow`パスを受け取る統一インターフェース
3. テンプレートリテラルでMarkdown生成
4. 手動記入が必要な箇所は明確にマーク

---

## 4. 実行手順

### Phase構成

| Phase | 名称           | 目的                                 |
| ----- | -------------- | ------------------------------------ |
| 1     | 要件定義       | 各スクリプトの仕様定義               |
| 2     | 設計           | スクリプト構造・インターフェース設計 |
| 4     | 実装           | スクリプトコード作成                 |
| 7     | カバレッジ確認 | 動作検証                             |
| 12    | ドキュメント   | 使用ガイド作成                       |

### Phase 4: 実装

#### 目的

3つの自動化スクリプトを作成する。

#### 手順

1. `generate-implementation-guide.js`を作成
   - ワークフローパスからテスト結果、変更ファイル一覧を抽出
   - implementation-guide.mdのテンプレートを生成
2. `generate-completion-record.js`を作成
   - artifacts.jsonとテスト結果から完了記録Markdownを生成
   - システム仕様書に追記可能な形式で出力
3. `update-artifacts-json.js`を作成
   - 指定フェーズの成果物をartifacts.jsonに追加

#### 成果物

- 3つのNode.jsスクリプト

#### 完了条件

- 各スクリプトが正常に動作する
- 出力形式が既存フォーマットと整合する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `generate-implementation-guide.js`が動作する
- [ ] `generate-completion-record.js`が動作する
- [ ] `update-artifacts-json.js`が動作する
- [ ] 既存スクリプト（`generate-documentation-changelog.js`）との整合性がある

### 品質要件

- [ ] ESLint/Prettierでフォーマット済み
- [ ] エラーハンドリングが実装されている
- [ ] 使用方法がコンソールに表示される（--help対応）

### ドキュメント要件

- [ ] 各スクリプトの使用方法がドキュメント化されている
- [ ] SKILL.mdにスクリプト一覧が追記されている

---

## 6. 検証方法

### テストケース

| TC-ID       | テスト内容               | 期待結果                                   |
| ----------- | ------------------------ | ------------------------------------------ |
| TC-AUTO-001 | implementation-guide生成 | 正しいフォーマットのmdファイルが生成される |
| TC-AUTO-002 | completion-record生成    | システム仕様書に追記可能な形式で出力される |
| TC-AUTO-003 | artifacts.json更新       | 既存データを保持しつつ新規追加される       |

### 検証手順

```bash
# implementation-guide生成
node .claude/skills/task-specification-creator/scripts/generate-implementation-guide.js \
  --workflow docs/30-workflows/test-workflow

# completion-record生成
node .claude/skills/task-specification-creator/scripts/generate-completion-record.js \
  --workflow docs/30-workflows/test-workflow \
  --spec-file interfaces-agent-sdk.md

# artifacts.json更新
node .claude/skills/task-specification-creator/scripts/update-artifacts-json.js \
  --workflow docs/30-workflows/test-workflow \
  --phase 12 \
  --artifact "outputs/phase-12/implementation-guide.md"
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                     |
| ------------------------ | ------ | -------- | ------------------------ |
| 既存スクリプトとの不整合 | 中     | 低       | 共通モジュールの切り出し |
| ワークフロー構造の変更   | 中     | 低       | 柔軟なパス解決ロジック   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| 既存自動化スクリプト         | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` |
| タスク仕様書作成スキル       | `.claude/skills/task-specification-creator/SKILL.md`                                    |
| システム仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                 | 内容               |
| ------------------ | -------------------------------------------------------------------- | ------------------ |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | Phase 12フロー仕様 |

---

## 9. 備考

### 発見経緯

skill-import-persistence-bugfixタスクのPhase 12実施時に、手動作業の多さが認識された。`generate-documentation-changelog.js`の有効性が確認されたため、同様のアプローチで他タスクも自動化可能と判断。

### 補足事項

- 優先度「低」のため、他の優先度が高いタスクの後に実施
- 自動化による品質向上が主目的であり、必須機能ではない
