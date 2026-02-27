# Phase 12 システム仕様更新・苦戦箇所テンプレート

> **用途**: Phase 12 Step 2 で「今回の実装内容」と「苦戦箇所」を aiworkflow-requirements へ再利用可能な形で反映する。
> **推奨出力先**: `docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md`
> **関連仕様書（推奨5点セット）**:
> - `references/<interface-spec>.md`（型/API契約）
> - `references/<api-ipc-spec>.md`（IPC契約）
> - `references/<security-spec>.md`（セキュリティ仕様）
> - `references/task-workflow.md`（完了台帳）
> - `references/lessons-learned.md`（再発防止知見）

---

## 1. メタ情報

| 項目 | 値 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| 実施日 | `YYYY-MM-DD` |
| ステータス | `completed` / `spec_created` |
| SubAgent分担 | `A:interfaces / B:api-ipc / C:security / D:task-workflow / E:lessons`（必要に応じて置換） |

---

## 2. 実装内容サマリー

| 観点 | 内容 |
| --- | --- |
| 何を実装したか | `<実装の要点を1-2行>` |
| 変更範囲 | `<Main / Preload / Renderer / Store など>` |
| なぜ必要か | `<背景と狙い>` |
| 完了判定 | `<Phase 12要件と一致する根拠>` |

---

## 3. 仕様書別SubAgent分担（必須）

| SubAgent | 担当仕様書 | 主担当作業 | 依存関係 |
| --- | --- | --- | --- |
| A | `references/<interface-spec>.md` | 型/API契約の同期 | 実装差分確定後 |
| B | `references/<api-ipc-spec>.md` | IPCチャネル契約（request/response/validation）同期 | A完了後 |
| C | `references/<security-spec>.md` | sender/P42/入力検証/エラーサニタイズ同期 | B完了後 |
| D | `references/task-workflow.md` | 完了台帳・検証証跡・残課題同期 | A/B/C完了後 |
| E | `references/lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 | D完了後 |

---

## 4. 仕様反映先（テンプレート準拠）

| 仕様書 | 反映内容 | 証跡 |
| --- | --- | --- |
| `task-workflow.md` | 完了タスク・成果物・苦戦箇所・簡潔手順を記録 | `<該当セクション>` |
| `<domain-spec>.md` | 実装仕様・契約差分・苦戦箇所・関連タスクを記録 | `<該当セクション>` |
| `lessons-learned.md` | 再発条件付きの苦戦箇所と再利用手順を記録 | `<該当セクション>` |

---

## 5. 苦戦箇所（再利用可能形式）

| 苦戦箇所 | 再発条件 | 解決策 | 今後の標準ルール |
| --- | --- | --- | --- |
| `<課題1>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題2>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題3>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |

---

## 6. 同種課題の簡潔解決手順（5ステップ）

1. `<変更範囲を interfaces/api-ipc/security/task/lessons の5責務へ分離する>`
2. `<実装 + 契約 + セキュリティを同一ターンで同期する>`
3. `<未タスクがある場合は docs/30-workflows/unassigned-task/ に9セクション形式で作成する>`
4. `<verify-all-specs / validate-phase-output / verify-unassigned-links / audit --diff-from HEAD を連続実行する>`
5. `<検証値と苦戦箇所を task-workflow と lessons に同時転記する>`

---

## 7. 検証コマンド

| コマンド | 目的 | 期待結果 |
| --- | --- | --- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` | ワークフロー仕様準拠確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` | Phase出力構造確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク整合確認 | `missing: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations: 0` |
| `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` | スキル構造検証 | `error: 0` |

---

## 8. Phase 12 成果物チェック

- [ ] `implementation-guide.md`
- [ ] `spec-update-summary.md`
- [ ] `documentation-changelog.md`
- [ ] `unassigned-task-report.md`（または `unassigned-task-detection.md`）
- [ ] `phase12-task-spec-compliance-check.md`（任意だが推奨）
