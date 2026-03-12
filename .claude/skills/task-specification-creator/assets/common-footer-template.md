# 共通フッターテンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase仕様書生成時（generate-task-specs Task実行時）
> - 読み込み条件: Phase仕様書のフッター部分を生成するとき
> - 使用スキーマ: schemas/phase-spec.json
> - 組み合わせ: common-header-template.md, phase-spec-template.md

Phase仕様書の共通フッター部分を定義する。

---

## 変数一覧

| 変数名 | 説明 | 例 |
| ------ | ---- | -- |
| `{{PHASE_NUMBER}}` | Phase番号（1-13） | `4` |
| `{{FEATURE_NAME}}` | 機能名（ケバブケース） | `search-replace-ui` |
| `{{NEXT_PHASE}}` | 次のPhase番号 | `5` |
| `{{NEXT_PHASE_NAME}}` | 次のPhase名称 | `実装` |

---

## テンプレート

```markdown
---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/{{FEATURE_NAME}} --phase {{PHASE_NUMBER}}
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase {{PHASE_NUMBER}} 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |
| {{TASK_NAME}} | {{完了/未完了}} | {{備考}} |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## 次のPhase

Phase {{NEXT_PHASE}}: {{NEXT_PHASE_NAME}}

`docs/30-workflows/{{FEATURE_NAME}}/phase-{{NEXT_PHASE}}-*.md`
```

---

## 使用方法

1. Phase仕様書の末尾にこのテンプレートを展開
2. 変数を実際の値で置換
3. 完了条件をチェックリストとして活用

---

## 注意事項

- Phase 13は最終Phaseのため、「次のPhase」セクションは「なし（ワークフロー完了）」とする
