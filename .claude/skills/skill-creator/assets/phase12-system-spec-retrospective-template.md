# Phase 12 システム仕様更新・苦戦箇所テンプレート

> **用途**: Phase 12 Step 2 で「今回実装内容」と「苦戦箇所」を、同種課題に再利用できる形式で反映する。  
> **推奨出力先**: `docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md`  
> **前提**: 関心ごとの分離（仕様書別SubAgent分担）で同一ターン同期する。

---

## 1. メタ情報

| 項目 | 値 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| 実施日 | `YYYY-MM-DD` |
| ステータス | `completed` / `spec_created` |
| 対象仕様書 | `task-workflow.md` / `lessons-learned.md` / `<domain-spec>.md` |

---

## 2. SubAgent分担（関心分離）

| SubAgent | 主担当仕様書 | 責務 | 完了条件 |
| --- | --- | --- | --- |
| A | `references/task-workflow.md` | 完了台帳・残課題・成果物参照の同期 | ステータス/参照パスが実体と一致 |
| B | `references/lessons-learned.md` | 苦戦箇所（原因/再発条件/対処）と再利用手順の記録 | 3件以上の苦戦箇所と手順が記載 |
| C | `SKILL.md` / `LOGS.md` | 変更履歴と作業ログの同期 | 同一タスクIDが両方に記録 |
| D | 検証コマンド実行 | `quick_validate` / `verify-unassigned-links` / `audit` の最終判定 | Error 0 かつ current違反 0 |

---

## 3. 実装内容サマリー

| 観点 | 内容 |
| --- | --- |
| 何を実装したか | `<要点を1-2行>` |
| 変更範囲 | `<Main / Preload / Renderer / Docs運用 など>` |
| なぜ必要か | `<背景と狙い>` |
| 完了判定 | `<Phase 12 要件への適合根拠>` |

---

## 4. 仕様反映マップ（テンプレート準拠）

| 仕様書 | 反映内容 | 証跡 |
| --- | --- | --- |
| `task-workflow.md` | 完了タスク、残課題ステータス、成果物参照、変更履歴 | `<該当行/セクション>` |
| `lessons-learned.md` | 苦戦箇所（原因/再発条件/対処）と簡潔解決手順 | `<該当行/セクション>` |
| `<domain-spec>.md` | 実装仕様・運用ルール・関連タスク | `<該当行/セクション>` |

---

## 5. 苦戦箇所（再利用可能形式）

| 苦戦箇所 | 原因 | 再発条件 | 解決策 | 今後の標準ルール |
| --- | --- | --- | --- | --- |
| `<課題1>` | `<根本原因>` | `<再発しやすい状況>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題2>` | `<根本原因>` | `<再発しやすい状況>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題3>` | `<根本原因>` | `<再発しやすい状況>` | `<今回の対処>` | `<次回の標準運用>` |

---

## 6. 同種課題の簡潔解決手順（5ステップ）

1. 正規コマンド経路を固定する（fallbackは条件付き）  
2. 仕様書更新を SubAgent 単位で同時実行する  
3. 未タスクは「作成→台帳登録→参照検証」を1セットで完了する  
4. 監査結果を `current`（合否）と `baseline`（監視）で分離記録する  
5. `SKILL.md` / `LOGS.md` / 対象仕様書の3点同期で終了する  

---

## 7. 検証コマンド（正規経路）

| コマンド | 目的 | 期待結果 |
| --- | --- | --- |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator` | skill-creator構造検証 | `error: 0` |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator` | task-spec構造検証 | `error: 0` |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements` | aiworkflow構造検証 | `error: 0` |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --json` | ワークフロー仕様準拠確認 | `"passed": true` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` | Phase出力構造確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク整合確認 | `missing: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 差分監査（今回起因） | `currentViolations: 0` |

---

## 8. Phase 12 成果物チェック

- [ ] `implementation-guide.md`
- [ ] `spec-update-summary.md`
- [ ] `documentation-changelog.md`
- [ ] `unassigned-task-detection.md`
- [ ] `skill-feedback-report.md`
- [ ] `artifacts.json` の Phase 12 が `completed`
