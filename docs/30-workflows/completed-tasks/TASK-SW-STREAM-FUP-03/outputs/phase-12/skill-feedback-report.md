# Phase 12: スキルフィードバックレポート

## タスクID

TASK-SW-STREAM-FUP-03

## 実行日時

2026-04-18

---

## workflow への改善提案

### 提案 1: canonical output 名の単一ソース化

Phase 12 は `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の 6 ファイルを扱う。ここで名前揺れが起きると、root manifest と outputs manifest の整合が崩れやすい。

**提案**: Phase 12 の canonical output 名を 1 箇所のテンプレートに集約し、`phase-12-documentation.md`・`artifacts.json`・`outputs/artifacts.json` が同じ値を参照するようにする。

### 提案 2: Phase 11 の evidence 名をテンプレートに埋め込む

このタスクでは Phase 11 の実ファイル名が `TASK-SW-STREAM-FUP-03-manual-test-report.md` である一方、旧来の checklist / result 名が残りやすい。

**提案**: NON_VISUAL タスク用の Phase 12 テンプレートに、Phase 11 の actual evidence file を明示する欄を追加する。

### 提案 3: renderer 側の progress phase mapping を別責務として扱う

`SkillCreatorService.ts` の progress phase が mode-specific に拡張されたため、renderer 側の `useStreamingProgress.ts` が未知 phase を `planning` に吸収すると表示が退行する。

**提案**: `useStreamingProgress.ts` / `generationProgressSlice.ts` / `GenerateStep.tsx` の consumer 変換を別 follow-up として formalize し、`planning` fallback のまま残さない。

## skill への改善提案

### 提案 1: Phase 12 の検証順をテンプレート化する

`Part 1/Part 2`、`Step 1-A/B/C`、`Step 2 N/A`、`artifacts parity`、`Phase 11 参照` を固定順で記載すると、レビュー時の見落としが減る。

### 提案 2: NON_VISUAL 判定の文言を標準化する

「UI/UX変更なしのため Phase 11 スクリーンショット不要」を固定フレーズ化すると、スクリーンショット要否の解釈ぶれが減る。

## 改善なしの項目

| 項目                                              | 判断             |
| ------------------------------------------------- | ---------------- |
| progress flow の内部実装方針                      | 適切             |
| `onProgress` の optional handling                 | 適切             |
| `createSkill()` を orchestration point に置く方針 | 適切             |
| `Step 2` を N/A とする判断                        | 適切             |
| renderer 側の fallback 対応                       | follow-up が必要 |

## 総括

今回の scope では、内部実装に対する追加の構造変更は不要だった。改善余地は主に template / manifest の名前揺れ防止にある。
