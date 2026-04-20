# Phase Template Phase11

## 対象

Phase 11 の manual test。

## タスク種別判定（最初に確認）

| タスク種別 | 判定条件 | 適用セクション |
| --- | --- | --- |
| **設計タスク** | タスク種別が「設計・仕様策定」、UI実装なし | 設計タスク専用セクション（SF-01） |
| **docs-only タスク** | UI変更なし、ドキュメント・設定変更のみ | docs-only task テンプレ |
| **UI タスク** | Renderer コンポーネントの追加・変更あり | docs-only + UI task 追加要件 |

## docs-only task テンプレ

### 正本ポリシー（evidence consolidation）

- `manual-test-result.md` を docs-only Phase 11 の正本とし、以下を1ファイルに集約する:
  - テスト件数サマリー（区分別 PASS/FAIL/SKIP 集計 + 実施情報）
  - edge case 一覧表（EC-NNN ID・観点・入力値・期待動作・仕様判断根拠ID・結果）
  - 仕様判断根拠（SD-NNN ID・判断内容・根拠・影響範囲）
  - 実行記録（コマンド、確認対象、判定）
- `manual-test-checklist.md` / `discovered-issues.md` は補助成果物として保持してよいが、判定の一次ソースは `manual-test-result.md` とする。

### docs-only チェック観点

- `SKILL.md` から family file へ辿れるか
- `LOGS.md` から archive へ辿れるか
- `.claude` と `.agents` の file set が一致するか
- validator command を再実行できるか

### ウォークスルーシナリオ発見事項リアルタイム分類欄

各シナリオ実行中に発見した事項を即座に分類するためのテンプレート。
シナリオ完了後にまとめて分類するのではなく、発見時点でリアルタイムに記録する。

| # | シナリオ | 発見事項 | 分類 | 対応方針 |
| - | -------- | -------- | ---- | -------- |
| 1 | A/B/C    | ...      | Blocker / Note / Info | ... |

**分類基準**:
- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

## UI task 追加要件

- `screenshot-plan.json`
- main shell source-to-destination capture（handoff task の場合）
- screenshot evidence
- Apple UI/UX 視覚レビュー
- coverage matrix
- `phase11-capture-metadata.json`

> **[W1-02b-1] UI task の screenshot-plan.json は `mode: "VISUAL"` をデフォルトにする**
>
> UI コンポーネントの追加・変更が明確な task では、`screenshot-plan.json` 生成時に `mode: "VISUAL"` をデフォルトにする。
> `NON_VISUAL` で作成したファイルを Phase 11 で差し替える場合、`taskId` フィールドが旧タスクのままになりやすい。
> Phase 11 着手前に `phase11-capture-metadata.json` の `taskId` が **現行タスク ID** と一致しているかを確認し、不一致なら preflight で fail-fast させる。
> 確認コマンド例: `jq '.taskId' outputs/phase-11/phase11-capture-metadata.json`

## 必須成果物

| 成果物 | タスク種別 | 用途 |
| --- | --- | --- |
| `manual-test-result.md` | docs-only / UI 共通（必須） | walkthrough 結果 + docs-only 集約証跡の正本 |
| `manual-test-checklist.md` | docs-only: 推奨 / UI: 必須 | 実施可否の補助記録 |
| `discovered-issues.md` | docs-only: 条件付 / UI: 必須 | blocker / note 記録 |
| `manual-test-report.md` | 任意 | 実施概要と所見（要約版） |
| `ui-sanity-visual-review.md` | UI task のみ | 視覚レビュー |
| `phase11-capture-metadata.json` | UI task のみ | capture 実行時の evidence inventory |

### canonical ファイル名の優先順位（[UT-LIFECYCLE-FB-2]）

`manual-test-result.md` が Phase 11 の canonical ファイル名であり最優先される。
`{TASK-ID}-manual-test-report.md`（ガイド補助命名）との競合が生じた場合は `manual-test-result.md` を採用すること。

| ファイル名 | 分類 | 適用条件 |
| --- | --- | --- |
| `manual-test-result.md` | canonical（正規名称） | 全タスク共通（必須） |
| `{TASK-ID}-manual-test-report.md` | 補助命名 | `NON_VISUAL + verify_existing` の場合のみ |

`verify_existing` モード以外で `{TASK-ID}-manual-test-report.md` を primary evidence にした場合、
Phase 12 の `phase12-task-spec-compliance-check.md` で参照エラーとなる。

### 環境チェック（Phase 11 着手前）

UI task で screenshot 撮影を行う場合は、着手前に以下を確認する：

1. Electron 起動確認: `pnpm --filter @repo/desktop preview` が正常起動するか
2. 起動不可の場合（worktree 環境等） → **CAPTURE_BLOCKED** として記録する
   - ダミー PNG 作成は禁止（false green 防止）
   - ユニットテストの PASS を代替 evidence として記録する
   - `docs/30-workflows/unassigned-task/` に未タスクとして formalize する
3. 起動可能な場合 → 通常の screenshot 撮影フローへ進む

## 設計タスク専用セクション（SF-01対応）

**判定基準**: タスク種別が「設計・仕様策定」であり、UI実装が存在しない場合に適用。

### 設計文書ウォークスルー（docs-only Phase 11 の代替テスト方式）

設計タスクでは「手動UIテスト」ではなく「設計文書ウォークスルー」を Phase 11 の主テスト方式とする。

| 確認項目 | 方法 | 必須 |
| --- | --- | --- |
| 仕様書の自己完結性 | 前提条件・受入基準・成果物パスが揃っているか目視確認 | ✅ |
| 型定義・インターフェースの整合 | 定義箇所と参照箇所が一致するか grep 確認 | ✅ |
| スコープ外の未タスク洗い出し | 設計中に「将来実装」とした箇所を列挙 | ✅ |
| Phase 3/10レビュー指摘との照合 | MINOR判定事項が全て記録されているか確認 | ✅ |
| 後続実装タスクへの引き継ぎ情報 | 「型定義→実装」「契約→テスト」の引き継ぎ項目を列挙 | ✅ |

### スクリーンショット対応（P53対策）

設計タスクでは通常は CLI 環境での画面キャプチャを必須としない。ただし、ユーザーが明示的にスクリーンショット検証を要求した場合は docs-heavy / backend-heavy task でも related UI を対象に representative capture を残し、`NON_VISUAL` 単独で閉じない。

| 状況 | 対応方法 |
| --- | --- |
| UIコンポーネントが存在しない | 通常は `NON_VISUAL`。ただし user 要求時は representative screenshot を追加 |
| 型定義・仕様書のみの変更 | 通常は `NON_VISUAL`。ただし branch sanity check 要求時は screenshot へ昇格 |
| 関連UIが既存で変更なし | upstream screenshot または review board harness を current workflow へ集約 |

### UI タスクの CLI 環境でのスクリーンショット取得（P53対応）

UI タスクで Electron を直接起動できない CLI 環境では、**Playwright + Vite dev server パターン**を使用する。

| 手順 | コマンド |
| --- | --- |
| 1. Vite dev server 起動 | `cd apps/desktop && npx vite --config vite.e2e.config.ts &` |
| 2. capture-screenshots.js で撮影 | `node .claude/skills/task-specification-creator/scripts/capture-screenshots.js --workflow <path> --plan <plan.json>` |
| 3. preflight 疎通確認 | `curl -I http://127.0.0.1:4173/` |

詳細は [phase-11-12-guide.md](phase-11-12-guide.md) のセクション A/C を参照。

**記録例**（`manual-test-result.md` 冒頭に明記）:

```markdown
## テスト方式

本タスクは設計タスク（spec_created）だが、ユーザー要求により representative screenshot audit を追加。
スクリーンショット: SCREENSHOT + NON_VISUAL
```

## 関連ガイド

- [phase-11-screenshot-guide.md](phase-11-screenshot-guide.md)
- [screenshot-verification-procedure.md](screenshot-verification-procedure.md)
