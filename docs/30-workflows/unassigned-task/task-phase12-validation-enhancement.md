# Phase 12検証自動化拡張 - タスク指示書

## メタ情報

```yaml
issue_number: 459
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | PHASE12-VAL-ENHANCE-001                    |
| タスク名     | Phase 12検証スクリプトの機能拡張           |
| 分類         | 改善                                       |
| 対象機能     | task-specification-creator スキル          |
| 優先度       | 中                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12 - SHARED-TYPE-EXPORT-03スキル改善 |
| 発見日       | 2026-01-23                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SHARED-TYPE-EXPORT-03ワークフローのPhase 12実行時に、Step 1（必須タスク完了記録）が適切に実行されなかった問題が発生した。この問題を解決するため、`validate-phase12-step1.js`スクリプトを作成したが、現在の機能は基本的な検証のみである。

### 1.2 問題点・課題

現在のスクリプトの制限:

1. **単一ファイル検証のみ**: 複数の関連仕様書を一括検証できない
2. **Step 2の検証なし**: Step 1のみ検証し、Step 2（インターフェース仕様更新）の検証機能がない
3. **レポート出力限定**: コンソール出力のみで、Markdown/JSON形式のレポート出力がない
4. **CI/CD統合なし**: GitHub Actions等での自動実行に最適化されていない

### 1.3 放置した場合の影響

- Phase 12の必須要件が継続的に見落とされる可能性
- 複数仕様書更新時の検証漏れ
- 自動化されたワークフローでの品質チェック不足

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12の全タスク（12-1〜12-4）を自動検証できる包括的なスクリプトに拡張する。

### 2.2 最終ゴール

- 複数仕様書の一括検証機能
- Step 1/Step 2両方の検証対応
- Markdown/JSON形式のレポート出力
- CI/CD対応（終了コード、出力形式）

### 2.3 スコープ

#### 含むもの

- `validate-phase12-step1.js`の機能拡張
- `validate-phase12-all.js`新規スクリプト作成
- 検証レポートテンプレート
- SKILL.mdへのドキュメント追加

#### 含まないもの

- 他のPhaseの検証スクリプト
- GitHub Actions ワークフロー定義
- E2Eテスト自動化

### 2.4 成果物

| 成果物                                      | 説明                               |
| ------------------------------------------- | ---------------------------------- |
| `validate-phase12-all.js`                   | Phase 12全タスク検証スクリプト     |
| `validate-phase12-step1.js` 改善版          | 複数ファイル対応、レポート出力対応 |
| `phase12-validation-report.md` テンプレート | 検証レポートテンプレート           |
| SKILL.md更新                                | 検証コマンドドキュメント追加       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `validate-phase12-step1.js`が存在する
- task-specification-creator SKILL.mdが存在する
- Node.js ES Module環境

### 3.2 依存タスク

- SHARED-TYPE-EXPORT-03（完了済み）: 初版スクリプト作成

### 3.3 必要な知識

- Node.js ES Module
- Markdown解析
- JSON Schema検証
- CLIツール設計

### 3.4 推奨アプローチ

1. 既存スクリプトのリファクタリング（共通関数の抽出）
2. 複数ファイル対応の追加
3. レポート出力機能の追加
4. 新規スクリプト（validate-phase12-all.js）の作成

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                     |
| ----- | ------------ | ------------------------ |
| 1     | 設計         | 拡張機能の詳細設計       |
| 2     | 実装         | スクリプト拡張・新規作成 |
| 3     | テスト       | 動作検証                 |
| 4     | ドキュメント | SKILL.md更新             |

### Phase 1: 設計

#### 目的

拡張機能の詳細設計を行う。

#### 手順

1. 現在のスクリプト構造を分析
2. 共通関数を特定・設計
3. CLI引数を設計
4. 出力フォーマットを設計

#### 成果物

- `outputs/phase-1/validation-script-design.md`

#### 完了条件

- [ ] 共通関数が特定されている
- [ ] CLI引数が設計されている
- [ ] 出力フォーマットが定義されている

### Phase 2: 実装

#### 目的

設計に基づきスクリプトを拡張・作成する。

#### 手順

1. 共通ユーティリティモジュール作成
2. `validate-phase12-step1.js`の改善
3. `validate-phase12-all.js`の新規作成
4. レポートテンプレート作成

#### 成果物

- 改善版スクリプト
- 新規スクリプト
- レポートテンプレート

#### 完了条件

- [ ] 複数ファイル検証が動作する
- [ ] レポート出力が動作する
- [ ] Step 2検証が動作する

### Phase 3: テスト

#### 目的

実装の品質を検証する。

#### 手順

1. 単体テストケースを実行
2. 実際のワークフローディレクトリで検証
3. エラーケースの確認

#### 成果物

- `outputs/phase-3/test-results.md`

#### 完了条件

- [ ] 正常系テストPASS
- [ ] 異常系テストPASS
- [ ] 実ワークフローでの検証PASS

### Phase 4: ドキュメント

#### 目的

SKILL.mdと関連ドキュメントを更新する。

#### 手順

1. SKILL.mdのスクリプトテーブルを更新
2. 検証コマンドセクションを追加
3. 使用例を追加

#### 成果物

- SKILL.md更新
- 検証コマンドガイド

#### 完了条件

- [ ] SKILL.mdが更新されている
- [ ] 使用例が記載されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 複数仕様書を`--specs`引数で指定可能
- [ ] `--output`引数でレポート出力形式を選択可能（console/markdown/json）
- [ ] Step 1検証が動作する
- [ ] Step 2検証（任意）が動作する
- [ ] `validate-phase12-all.js`が4タスクを検証可能

### 品質要件

- [ ] ES Module形式で実装されている
- [ ] エラーハンドリングが適切
- [ ] CI/CD互換（終了コード0/1）

### ドキュメント要件

- [ ] SKILL.mdにスクリプト追加されている
- [ ] 使用例がドキュメント化されている
- [ ] CLI引数が文書化されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容               | 期待結果             |
| ------ | ------------------------ | -------------------- |
| TC-001 | 単一ファイル検証（PASS） | 終了コード0、✅表示  |
| TC-002 | 単一ファイル検証（FAIL） | 終了コード1、❌表示  |
| TC-003 | 複数ファイル検証         | 全ファイルの結果表示 |
| TC-004 | Markdown出力             | レポートファイル生成 |
| TC-005 | JSON出力                 | JSON形式出力         |

### 検証手順

```bash
# 単一ファイル（既存機能）
node scripts/validate-phase12-step1.js \
  --workflow docs/30-workflows/shared-type-export-03-verification \
  --spec .claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md

# 複数ファイル（新機能）
node scripts/validate-phase12-step1.js \
  --workflow docs/30-workflows/shared-type-export-03-verification \
  --specs "interfaces-rag-community-detection.md,architecture-monorepo.md" \
  --output markdown

# 全タスク検証（新規スクリプト）
node scripts/validate-phase12-all.js \
  --workflow docs/30-workflows/shared-type-export-03-verification
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                |
| ---------------------- | ------ | -------- | ----------------------------------- |
| 既存機能の破壊         | 中     | 低       | 後方互換性を維持、既存CLI引数を保持 |
| 仕様書フォーマット変化 | 低     | 中       | 柔軟なパターンマッチング            |
| ES Module互換性問題    | 低     | 低       | プロジェクト設定に合わせた実装      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                        | パス                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| task-specification-creator SKILL.md | `.claude/skills/task-specification-creator/SKILL.md`                          |
| Phase 12テンプレート                | `.claude/skills/task-specification-creator/references/phase-templates.md`     |
| 既存検証スクリプト                  | `.claude/skills/task-specification-creator/scripts/validate-phase12-step1.js` |

### 参考資料

- [Commander.js CLI Framework](https://github.com/tj/commander.js)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

---

## 9. 備考

### 発見経緯

SHARED-TYPE-EXPORT-03ワークフローにおいて、Phase 12 Step 1が「検証タスクなので更新不要」と誤って判断され、必須要件が満たされなかった。この問題を解決するため、検証スクリプトを作成したが、より包括的な検証機能が求められている。

### 補足事項

- このタスクは優先度「中」であり、次回のPhase 12実行前に完了が望ましい
- skill-creatorのフィードバック機構と連携し、改善パターンを記録することを推奨
- 将来的にはGitHub Actionsでの自動実行を検討（別タスク）
