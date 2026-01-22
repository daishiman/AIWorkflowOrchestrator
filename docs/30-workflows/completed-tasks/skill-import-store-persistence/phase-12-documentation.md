# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 12                             |
| Phase名    | ドキュメント更新               |
| 前提Phase  | Phase 11                       |
| 後続Phase  | Phase 13                       |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | skill-import-store-persistence |

---

## 目的

修正内容のドキュメント化、仕様更新、未タスク検出を行う。

## 背景

バグ修正が完了したため、修正内容を文書化し、関連する仕様書を更新する必要がある。

---

## 実行タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（2パート構成必須）

**目的**: 修正内容を文書化し、今後の参照資料とする

**実行手順**:

**Part 1: 概念的説明（初学者・非技術者向け）**

1. 問題の概要を分かりやすく説明する
2. 修正内容を概念的に説明する
3. 修正後の動作を説明する

**Part 2: 技術的詳細（開発者向け）**

1. 修正箇所の技術的詳細を記述する
2. electron-storeの設定変更を記述する
3. コード例を含める
4. トラブルシューティング情報を記述する

**成果物ファイル**: `outputs/phase-12/implementation-guide.md`

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新（aiworkflow-requirements）

**目的**: システム仕様書に修正内容を反映する

> 📖 **必須**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録（必須 - 全タスク共通）**

1. 該当する仕様書（`interfaces-agent-sdk.md`）に「## 完了タスク」セクションを追加
2. 「## 関連ドキュメント」に実装ガイドリンクを追加

**Step 2: システム仕様更新（条件付き）**

更新判断基準：

- インターフェース変更がある場合 → 更新必要
- 内部実装の修正のみ → 更新不要

**更新が必要な場合のチェックリスト**:

- [ ] メソッドシグネチャ変更 → `interfaces-agent-sdk.md`
- [ ] 新規エラークラス追加 → `error-handling.md`
- [ ] 更新したファイルの変更履歴にバージョン追記

**更新不要の場合**:

- `documentation-changelog.md`に「更新なし」の判断根拠を明記

**期待される成果物**:

- システム仕様更新または更新不要の判断記録

---

### タスク3: ドキュメント更新履歴作成

**目的**: 今回の変更内容を記録する

**実行手順**:

1. 以下のコマンドで自動生成する（推奨）
   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
     --workflow docs/30-workflows/skill-import-store-persistence
   ```
2. 生成後、手動で以下を補完する
   - システム仕様更新内容または「更新なし」の判断根拠
   - ソースコード変更の概要

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 残存する課題を検出し記録する

**実行手順**:

1. Phase 11の発見課題を確認する
2. 以下の観点で未タスクを検出する
   - FAILしたテスト
   - 重要度「高」の課題
   - WCAG違反
3. 検出結果をレポートに記録する
4. **0件の場合も「検出タスクなし」と明記する**

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

## 参照資料

| 参照資料               | パス                                                                                    | 内容           |
| ---------------------- | --------------------------------------------------------------------------------------- | -------------- |
| Phase 11成果物         | `outputs/phase-11/`                                                                     | テスト結果     |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 更新判断基準   |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 文書作成ガイド |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容             |
| ------------------------- | --------------------------------------------------------------------------- | ---------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様 |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理       |

---

## 成果物

| 成果物               | パス                                            | 内容         |
| -------------------- | ----------------------------------------------- | ------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 修正内容文書 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更記録     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 残存課題     |

---

## 完了条件

- [ ] 実装ガイドが2パート構成で作成されている
- [ ] システム仕様の更新判断が行われている（更新または更新不要の記録）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 未タスク検出レポート形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-store-persistence/phase-13-pr-creation.md`
