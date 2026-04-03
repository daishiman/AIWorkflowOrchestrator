# Lessons Learned: UI/UX visual baseline drift / dark-mode screenshot

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: UI visual baseline drift / dark-mode screenshot / Phase 11 evidence / Phase 12 sync の教訓
> 対象読者: AIWorkflowOrchestrator 開発者

---

## メタ情報

| 項目 | 値 |
| --- | --- |
| 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| タスクID | `UT-UIUX-VISUAL-BASELINE-DRIFT-001` |
| 目的 | dark-mode screenshot drift と evidence sync の再利用手順を残す |
| スコープ | Playwright visual baseline、TC-ID / screenshot、artifact inventory、same-wave sync |

---

## 教訓

### L-UIUX-VISUAL-001: browser default theme と spec-level colorScheme を同時に固定する

| 項目 | 内容 |
| --- | --- |
| 課題 | Playwright project だけ、または spec だけ theme を固定すると、baseline PNG が UI 差分ではなく browser defaults に引っ張られて drift する |
| 再発条件 | dark/light で見た目が変わる visual regression task で、config と spec のどちらか一方しか theme を pin しない場合 |
| 解決策 | `playwright.config.ts` と visual spec の両方で同じ `colorScheme` を明示した |
| 標準ルール | dark-mode / light-mode screenshot は config と spec の両方で theme を pin する |

### L-UIUX-VISUAL-002: screenshot evidence は baseline snapshot 名ではなく TC-ID で管理する

| 項目 | 内容 |
| --- | --- |
| 課題 | baseline snapshot の raw filename をそのまま証跡にすると、TC と png の 1:1 対応が崩れる |
| 再発条件 | representative screenshot を再利用するときに、baseline 名と evidence 名を混同する場合 |
| 解決策 | `TC-11-05..07` のように TC-ID を基準に screenshot 名を固定し、manual-test-result と対応させた |
| 標準ルール | screenshot は `TC-ID ↔ png ↔ manual-test-result` で管理する |

### L-UIUX-VISUAL-003: config 修正だけで閉じず workflow / ledger / lessons を同 wave で更新する

| 項目 | 内容 |
| --- | --- |
| 課題 | config 変更や spec 変更だけで完了扱いにすると、completed ledger と lessons が古い前提のまま残る |
| 再発条件 | `task-workflow` や `lessons-learned` を後追い更新に回す場合 |
| 解決策 | workflow、completed ledger、lessons、resource lookup を同一 wave で同期した |
| 標準ルール | visual regression fix は code / spec / evidence / lesson を同時に閉じる |

---

## 同種課題の簡潔解決手順

1. current screenshot と baseline PNG を比較し、差分の起点が UI 実装か browser default かを切り分ける。
2. `playwright.config.ts` と spec-level `test.use` の両方で同じ `colorScheme` を設定する。
3. `TC-ID` ごとに screenshot 名を固定し、manual-test-result と一致させる。
4. `artifacts.json` / `outputs/artifacts.json` / Phase 12 出力を同 wave で同期する。
5. `task-workflow` / `resource-map` / `quick-reference` を更新し、次回の初動を短縮する。

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [workflow-ui-ux-visual-baseline-drift.md](./workflow-ui-ux-visual-baseline-drift.md) | 統合 workflow 正本 |
| [task-workflow-completed-ui-ux-visual-baseline-drift.md](./task-workflow-completed-ui-ux-visual-baseline-drift.md) | 完了記録 |
| [ui-ux-design-system.md](./ui-ux-design-system.md) | theme / contrast / token 観点 |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | screenshot evidence / TC 対応 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-04-03 | 1.0.0 | UT-UIUX-VISUAL-BASELINE-DRIFT-001 の教訓を新規作成。dark-mode baseline drift と evidence sync の再利用カードを集約した |
