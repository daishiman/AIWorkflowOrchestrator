# Phase 11: 手動テストチェックリスト

## 対象タスク

TASK-RT-03 Skill Creation Result Panel

## 実施前提

- Vite dev server が `http://127.0.0.1:5201/` で起動していること
- `phase11-skill-creation-result-harness` が表示されること
- `outputs/phase-11/screenshot-plan.json` と `outputs/phase-11/phase11-capture-metadata.json` が存在すること

## チェック項目

| TC       | 手順                             | 期待結果                                                                         | 証跡                                                     |
| -------- | -------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-11-01 | initial-state カードを表示する   | `結果がまだありません` と `進行中` バッジが表示される                            | `outputs/phase-11/screenshots/ss-01-initial-state.png`   |
| TC-11-02 | plan-complete カードを表示する   | `PlanResultDetailPanel` が表示され、`Plan完了` が確認できる                      | `outputs/phase-11/screenshots/ss-02-plan-complete.png`   |
| TC-11-03 | execute-success カードを表示する | `persistResult.skillPath` と `persistResult.files` が表示される                  | `outputs/phase-11/screenshots/ss-03-execute-success.png` |
| TC-11-04 | verify-pass カードを表示する     | `VerifyResultDetailPanel` が `完了` 状態で表示される                             | `outputs/phase-11/screenshots/ss-04-verify-pass.png`     |
| TC-11-05 | verify-fail カードを表示する     | severity フィルタ / layer grouping / reverify 導線 / disabledReason が確認できる | `outputs/phase-11/screenshots/ss-05-verify-fail.png`     |
| TC-11-06 | execute-fail カードを表示する    | execute failure と `persistError` が別々に視認できる                             | `outputs/phase-11/screenshots/ss-06-execute-fail.png`    |

## 3層評価チェック

### Semantic

- [ ] Plan / Execute / Verify の順序が理解できる
- [ ] execute 成功と保存結果を切り分けて読める
- [ ] verify fail 時に layer ごとの情報が追える

### Visual

- [ ] 状態バッジの違いが一目で分かる
- [ ] 長いファイルパスが崩れず表示される
- [ ] エラー表示が成功表示と見分けられる

### AI UX

- [ ] 空状態で未完了であることが伝わる
- [ ] verify fail で次の行動が分かる
- [ ] 保存結果の失敗を調査しやすい

## 完了確認

- [ ] screenshot-plan.json がある
- [ ] phase11-capture-metadata.json がある
- [ ] ss-01〜ss-06 の PNG がある
- [ ] manual-test-result.md がある
- [ ] manual-test-report.md がある
- [ ] discovered-issues.md がある
- [ ] ui-sanity-visual-review.md がある
