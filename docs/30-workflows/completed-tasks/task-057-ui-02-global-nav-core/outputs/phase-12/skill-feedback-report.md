# スキル改善レポート

## 今回実施した更新

### task-specification-creator

| ファイル                             | 実施内容                                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/phase-11-12-guide.md`    | `artifacts.json` / `outputs/artifacts.json` 同期に加え、`generate-index.js --workflow ... --regenerate` による `index.md` 再生成確認を追加                                                        |
| `references/spec-update-workflow.md` | 「`phase-12-documentation.md` だけ更新して `index.md` を見ない」「`artifacts.json` だけ見て `outputs/artifacts.json` を見ない」「phase 本文 1〜11 は pending のままでよい」を誤判断パターンへ追加 |
| `SKILL.md` / `LOGS.md`               | TASK-UI-02 再監査で見つかった workflow index / phase 本文 stale 是正手順を変更履歴とログへ反映                                                                                                    |

### skill-creator

| ファイル                                               | 実施内容                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `references/patterns.md`                               | Phase 12 成功パターンとして「workflow index / artifacts 二重同期」に加え「phase 本文 1〜11 completed 同期」を追加  |
| `assets/phase12-system-spec-retrospective-template.md` | `outputs/artifacts.json` と `index.md` 再生成に加え、`phase-1..11` 本文 pending 残置の検出コマンドと完了条件を追加 |
| `assets/phase12-spec-sync-subagent-template.md`        | SubAgent-D 相当の責務に workflow index / artifacts 同期確認と `phase-1..11` 本文 completed 確認を追加              |
| `SKILL.md` / `LOGS.md`                                 | 上記テンプレート改善を変更履歴とログへ反映                                                                         |

## 今回の学び

- `phase-12-documentation.md` の completed 化だけでは不十分で、`phase-1..11` 本文 / `artifacts.json` / `outputs/artifacts.json` / `index.md` まで含めて 1セットで同期しないと再監査で漏れる。
- UI タスクでは視覚調整が軽微でも、スクリーンショット再確認を挟まないと `mobileLabel` のような可読性問題を見落とす。

## 残る改善候補

| 優先度 | 項目                                         | 内容                                                                                                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 高     | `complete-phase.js` 自動化拡張               | `outputs/artifacts.json` 同期生成と workflow `index.md` 再生成をスクリプト側で自動化すると手戻りが減る                                           |
| 高     | Phase 本文 completed 同期の自動化            | `artifacts.json` が completed の Phase について、`phase-*.md` の `ステータス` / 完了条件 / 実行タスク結果を自動補正できると本文 stale を減らせる |
| 中     | `quick_validate` の direct-link warning 削減 | `aiworkflow-requirements` 側の 141 warning は今回差分起因ではないが、再監査ノイズ源なので別タスク化余地がある                                    |
| 中     | Phase 12 再監査テンプレートの機械検証化      | `phase-12-documentation.md` と `index.md` の状態突合を専用 validator 化すると更に安全                                                            |

## 良かった点

- `verify-unassigned-links` と `audit --diff-from HEAD` を併用したことで、未タスク current / baseline を混同せずに判定できた。
- `skill-creator` テンプレートに戻したことで、今回の再監査知見を次タスクへそのまま流用できる状態になった。
