# ドキュメント更新履歴テンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 12（ドキュメント更新）実行時
> - 読み込み条件: ドキュメント更新履歴（documentation-changelog.md）を作成するとき
> - 出力先: outputs/phase-12/documentation-changelog.md
> - 関連リソース: references/spec-update-workflow.md

Phase 12 Task 2 で実行したシステム仕様書更新の全記録を残すテンプレート。
**spec-update-workflow.md のStep 1-A〜1-C、Step 2 の実行結果を網羅的に記録する。**

---

## 配置先

```
outputs/phase-12/documentation-changelog.md
```

---

## テンプレート本体

````markdown
# ドキュメント更新履歴: {{FEATURE_NAME}}

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | {{TASK_ID}}            |
| タスク名   | {{FEATURE_NAME}}       |
| 更新日     | {{UPDATED_DATE}}       |
| Phase      | 12                     |
| ステータス | {{STATUS}}             |
| 変更者     | {{AUTHOR}}             |
| 関連 Issue / PR | {{ISSUE_PR_LINK}} |
| validator 実行結果 | {{VALIDATOR_RESULT}} |
| current / baseline | {{CURRENT_BASELINE}} |
| artifacts 同期結果 | {{ARTIFACTS_SYNC_RESULT}} |

## 更新対象ファイル一覧

| ファイル | 変更内容 |
| -------- | -------- |
| `{{SPEC_FILE_1}}` | {{変更内容の要約}} |
| `{{SPEC_FILE_2}}` | {{変更内容の要約}} |

## Phase 12 Task 2 実行ステップ記録

### Step 1-A: タスク完了記録（必須） {{STATUS_EMOJI}}

- `{{PRIMARY_SPEC_FILE}}` に「完了タスク」セクション追加
- `{{PRIMARY_SPEC_FILE}}` の「関連ドキュメント」に実装ガイドリンク追加
- `{{PRIMARY_SPEC_FILE}}` の「変更履歴」にv{{NEW_VERSION}}追記
- aiworkflow-requirements/LOGS.md 更新
- task-specification-creator/LOGS.md 更新

### Step 1-B: 実装状況テーブル更新 {{STATUS_EMOJI}}

- 確認対象: `{{CHECK_FILE}}` → {{確認結果}}
- 判定: **{{判定結果}}**（{{判定理由}}）

### Step 1-C: 関連タスクテーブル更新 {{STATUS_EMOJI}}

- 確認コマンド: `grep -rn "{{TASK_ID}}" references/` で関連テーブルを検出
- 確認対象: `{{RELATED_FILE_1}}` → {{確認結果}}
- 確認対象: `{{RELATED_FILE_2}}` → {{確認結果}}
- 判定: {{判定結果}}

### Step 2: システム仕様更新 {{STATUS_EMOJI}}

- 判定: **{{更新要否}}**（{{判定理由}}）
{{#if STEP2_EXECUTED}}
- 更新内容: {{更新内容の詳細}}
- バージョン: v{{OLD_VERSION}} → v{{NEW_VERSION}}
{{/if}}

### topic-map.md更新 {{STATUS_EMOJI}}

- {{topic-map更新内容}}

### 周辺同期（same-wave） {{STATUS_EMOJI}}

#### Workflow-Local 同期（当該タスク範囲内）

| ファイル | 更新内容 |
| -------- | -------- |
| `outputs/phase-12/*.md` | Phase 12 成果物（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / compliance-check） |
| `index.md` | ステータス・phase 完了状態の更新 |
| `artifacts.json` | deliverables / phase 状態の更新 |

#### Global Skill Sync（スキル正本への反映）

| ファイル | 更新内容 |
| -------- | -------- |
| `aiworkflow-requirements/LOGS.md` | close-out sync 記録 |
| `task-specification-creator/LOGS.md` | close-out sync 記録 |
| `indexes/topic-map.md` + `indexes/keywords.json` | `generate-index.js` 再実行 |
| 関連 references/ | skill-feedback-report に基づく改善反映 |

## 変更内容サマリー

### {{PRIMARY_SPEC_FILE}} (v{{OLD_VERSION}} → v{{NEW_VERSION}})

- {{変更内容の箇条書き}}

{{#each ADDITIONAL_FILES}}
### {{FILE_NAME}}

- {{変更内容の箇条書き}}
{{/each}}
````

---

## 作成時のガイドライン

### 必須記録項目

1. **Step 1-A〜1-C + Step 2 の全ステップ結果を記録する**
   - 「該当なし」「更新不要」も明示的に理由を記述
   - ✅ / ❌ のステータスを付与

2. **更新対象ファイル一覧は網羅的に**
   - LOGS.md（2ファイル）も含める
   - topic-map.md の更新も含める

3. **メタ情報テーブルの必須フィールドを必ず埋める**
   - `変更者` / `関連 Issue / PR` / `validator 実行結果` / `current / baseline` / `artifacts 同期結果`
   - 空欄やプレースホルダの残置を禁止する

4. **Step 1-C の確認コマンドを記録する**
   - `grep -rn "TASK_ID" references/` の実行結果を記載
   - 関連テーブルの有無を明確にする

### よくある漏れパターン

| パターン | 防止策 |
| -------- | ------ |
| Step 1-C を省略 | `grep -rn` コマンドで機械的に検出 |
| LOGS.md が1ファイルのみ | aiworkflow-requirements と task-specification-creator の両方を更新 |
| topic-map.md 未更新 | 新セクション追加時は必ず更新 |
| バージョン未更新 | 変更履歴テーブルとドキュメント冒頭の両方を確認 |
| Step 2「更新不要」の根拠なし | 判定理由を1行以上記述 |

### 品質チェックリスト

- [ ] Step 1-A: 完了タスクセクションが仕様書に追加されているか
- [ ] Step 1-A: LOGS.md（aiworkflow-requirements）が更新されているか
- [ ] Step 1-A: LOGS.md（task-specification-creator）が更新されているか
- [ ] Step 1-B: 実装状況テーブルの確認結果が記録されているか
- [ ] Step 1-C: `grep -rn` で関連テーブルを機械的に検索したか
- [ ] メタ情報テーブルの 5 必須フィールドが全て記録されているか
- [ ] Step 2: 更新判断の根拠が明記されているか
- [ ] topic-map.md: 新セクション追加時に更新されているか
- [ ] 変更内容サマリー: 全更新ファイルが列挙されているか
- [ ] 周辺同期: Workflow-Local 同期ファイル（index.md / artifacts.json / outputs/phase-12/*.md）が列挙されているか
- [ ] 周辺同期: Global Skill Sync（aiworkflow-requirements LOGS.md / task-specification-creator LOGS.md 2ファイル）が明示されているか
- [ ] 周辺同期: skill-feedback-report に記載した改善提案がスキル正本に反映されているか
