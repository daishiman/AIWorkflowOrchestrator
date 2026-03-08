# 2Workflow Baseline 正規化自動化 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION           |
| タスク名     | 2Workflow Baseline 正規化自動化                     |
| 分類         | 改善                                                |
| 対象機能     | 2Workflow 運用（current / completed baseline 管理） |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | TASK-10A-F Phase 12 実行時の苦戦箇所 #6, #7         |
| 発見日       | 2026-03-08                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F の Phase 12 実行時は、移管前 current workflow と completed workflow baseline の 2workflow 運用だった。最終的に成果物は `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` へ統合したが、その過程で以下の課題が顕在化した。

### 1.2 問題点・課題

1. **current workflow の stale 化**（苦戦箇所 #6）: completed workflow が先に Phase 12 まで完了した後、current workflow の仕様書がそのまま放置され、`spec_created` ステータスのまま陳腐化する。Phase 11/12 の証跡参照が current 側で壊れ、手動で同期し直す作業が発生した
2. **legacy drift による baseline 汚染**（苦戦箇所 #7）: completed workflow 内に Phase 形式のドリフト（ファイル命名揺れ、成果物パス不統一）が残存し、current workflow 側で正規化ルールを固定しても baseline に汚染が残る。`verify-all-specs.js` が completed workflow 側で警告を出し続ける
3. **手動同期のコスト**: 2workflow 間の整合性確認が完全に手作業に依存しており、Phase 12 の作業時間の 30% 以上を占めた

### 1.3 放置した場合の影響

- 今後の 2workflow 運用タスク（TASK-10A-G 等）で同じ同期作業が繰り返される
- completed workflow の legacy drift が蓄積し、baseline としての信頼性が低下
- Phase 12 の作業時間が毎回肥大化

---

## 2. 何を達成するか（What）

### 2.1 目的

2workflow 間の整合性検証と baseline 正規化を自動化するスクリプトを作成し、Phase 12 の手動同期コストを削減する。

### 2.2 最終ゴール

- `validate-2workflow-sync.js` で current/completed 間の Phase ステータス・成果物パス・証跡参照の整合性を自動検証
- `normalize-baseline.js` で completed workflow の legacy drift（ファイル命名揺れ、パス不統一）を自動正規化
- Phase 12 で 2workflow 同期に要する手動作業を 80% 削減

### 2.3 スコープ

#### 含むもの

- `validate-2workflow-sync.js` の新規作成（整合性検証スクリプト）
- `normalize-baseline.js` の新規作成（baseline 正規化スクリプト）
- 既存 `verify-all-specs.js` との連携（2workflow モード追加）
- テスト用フィクスチャ（正常/異常ケース）

#### 含まないもの

- `verify-all-specs.js` 自体の大規模リファクタリング
- CI/CD パイプラインへの組み込み（別タスクで実施）
- 3workflow 以上の運用対応

### 2.4 成果物

- `validate-2workflow-sync.js`（検証スクリプト）
- `normalize-baseline.js`（正規化スクリプト）
- テストフィクスチャ + テストコード
- 運用ガイドライン（Phase 12 手順への追記）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）
- `task-specification-creator/scripts/` 配下の既存スクリプト構成を理解していること

### 3.2 依存タスク

| タスクID   | 内容                          | ステータス |
| ---------- | ----------------------------- | ---------- |
| TASK-10A-F | Store駆動ライフサイクルUI統合 | 完了       |

### 3.3 必要な知識

- `verify-all-specs.js` / `validate-phase-output.js` の内部構造
- `artifacts.json` のスキーマと Phase ステータス管理
- current/completed workflow のディレクトリ構成差分

### 3.4 推奨アプローチ

1. 既存の `verify-all-specs.js` のコードを分析し、2workflow 検証の拡張ポイントを特定
2. `validate-2workflow-sync.js` を TDD で作成（Red→Green→Refactor）
3. `normalize-baseline.js` を TDD で作成
4. 実際の TASK-10A-F 2workflow をテストケースとして検証
5. Phase 12 手順書に運用ガイドラインを追記

---

## 4. 実行手順

### Phase構成

中規模タスクのため Phase 1-2-3-4-5-9-12 の7フェーズ構成。

### Phase 1: 要件定義

#### 目的

2workflow 同期検証・正規化の要件を明確化

#### 手順

1. `verify-all-specs.js` / `validate-phase-output.js` のソースコードを分析
2. TASK-10A-F で発生した 2workflow 不整合パターンを整理
3. 検証項目リストと正規化ルールリストを作成

### Phase 4-5: テスト作成→実装

#### 目的

2workflow 検証・正規化スクリプトの実装

#### 手順

1. `validate-2workflow-sync.js` のテストケース設計
   - Phase ステータス整合（current ↔ completed）
   - 成果物パス存在確認
   - 証跡参照の有効性検証
   - ファイル命名規則の一致
2. `normalize-baseline.js` のテストケース設計
   - ファイル命名揺れの自動修正
   - パス不統一の正規化
   - dry-run モードの検証
3. スクリプト実装（Node.js、既存スクリプトと同一パターン）

#### 成果物

検証スクリプト + 正規化スクリプト + テストコード

#### 完了条件

- 全テスト PASS
- TASK-10A-F の 2workflow を対象に実行して整合性が確認できる
- `normalize-baseline.js --dry-run` で変更予定が出力される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validate-2workflow-sync.js` が current/completed 間の Phase ステータス整合を検証
- [ ] `validate-2workflow-sync.js` が成果物パスの存在確認を実施
- [ ] `normalize-baseline.js` がファイル命名揺れを自動修正（dry-run + 実行モード）
- [ ] `normalize-baseline.js` が成果物パス不統一を正規化

### 品質要件

- [ ] 全テスト PASS
- [ ] ESLint 0エラー
- [ ] `--dry-run` モードで破壊的変更なしを確認

### ドキュメント要件

- [ ] Phase 12 手順書に 2workflow 検証ガイドラインを追記
- [ ] lessons-learned.md に教訓追記

---

## 6. 検証方法

### テストケース

- 正常: current/completed が完全に同期している 2workflow
- 異常: Phase ステータスが不整合な 2workflow
- 異常: 成果物パスが存在しない 2workflow
- 異常: ファイル命名が揺れている completed workflow

### 検証手順

```bash
# 検証スクリプト実行
node .claude/skills/task-specification-creator/scripts/validate-2workflow-sync.js \
  --current docs/30-workflows/<feature-workflow> \
  --completed docs/30-workflows/completed-tasks/<feature-workflow>

# 正規化スクリプト（dry-run）
node .claude/skills/task-specification-creator/scripts/normalize-baseline.js \
  --target docs/30-workflows/completed-tasks/store-driven-lifecycle-ui \
  --dry-run

# 正規化スクリプト（実行）
node .claude/skills/task-specification-creator/scripts/normalize-baseline.js \
  --target docs/30-workflows/completed-tasks/store-driven-lifecycle-ui
```

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                    |
| --------------------------------------------- | ------ | -------- | ------------------------------------------------------- |
| normalize-baseline が意図しないファイルを変更 | 高     | 中       | dry-run モードを必須にし、差分を事前確認                |
| 既存スクリプトとの競合                        | 中     | 低       | verify-all-specs.js は変更せず、別スクリプトとして追加  |
| completed workflow の構造が多様すぎる         | 中     | 中       | TASK-10A-F の実例をベースにルールを固定し、段階的に拡張 |

---

## 8. 参照情報

### 関連ドキュメント

- `lessons-learned.md` - TASK-10A-F 苦戦箇所（ワークフロー系）#6（current workflow stale化）、#7（legacy drift baseline汚染）
- `arch-state-management.md` - TASK-10A-F セクション（2workflow 運用の設計判断記録）
- `task-workflow.md` - TASK-10A-F 完了タスクセクション（2workflow 監査結果）

### 参考資料

- `task-specification-creator/scripts/verify-all-specs.js` - 既存検証スクリプト
- `task-specification-creator/scripts/validate-phase-output.js` - Phase 出力検証スクリプト
- TASK-10A-F 2workflow 構成: 移管前 current workflow + `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/`

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

1. **current workflow stale 化**（#6）: completed workflow が先に完了した後、current workflow の Phase 11/12 証跡参照が壊れた。自動検証で早期発見が必要
2. **legacy drift baseline 汚染**（#7）: completed workflow のファイル命名揺れ（`phase-11-manual-testing.md` vs `phase-11-manual-test.md`）が validator 警告の原因。正規化スクリプトで一括修正が必要
3. **手動同期コスト**: 2workflow 間の整合性確認が Phase 12 作業時間の 30% 以上を占めた。自動化による大幅な効率化が見込める

### 補足事項

- 本タスクは「ワークフロー基盤改善」であり、アプリケーション機能変更は含まない
- normalize-baseline は破壊的操作のため、必ず dry-run で事前確認する運用を徹底する
- 将来的に CI/CD に組み込む場合は、別タスクで対応する
