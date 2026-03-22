# Phase 1: 要件定義

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 1                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

スキル生成中の進捗をリアルタイムでUIに表示するための要件を定義する。現行の GenerateStep コンポーネント（スピナーのみ）の課題を明確にし、進捗表示・エラーハンドリング・キャンセル機能の受入基準を確立する。

## 実行タスク

1. `SKILL_CREATOR_PROGRESS` チャンネルの現行定義を調査する
   - `apps/desktop/src/preload/skill-creator-api.ts` のチャンネル定義確認
   - Main プロセス側の進捗イベント送信箇所を特定する
2. `GenerateStep.tsx` の現行UI実装を確認する
   - スピナーのみの現行実装を把握する
   - 進捗データを受け取る口がないことを確認する
3. 進捗表示要件を定義する
   - 表示すべき段階の洗い出し（構造計画中 → SKILL.md 生成中 → agents 生成中 → バリデーション中）
   - 各段階のユーザー向けメッセージを定義する
4. エラー表示要件を定義する
   - API Key 未設定エラー → 設定画面への誘導
   - LLMエラー（レートリミット等）→ リトライ案内
   - ネットワークエラー → オフライン表示
5. キャンセル機能要件を定義する
   - キャンセルトリガー（ボタン押下）
   - AbortController による中断処理
   - キャンセル後のUI状態
6. 受入基準（AC）を確定する

## 参照資料

- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md`
- 親タスク仕様書: `docs/30-workflows/skill-creator-llm-integration/index.md`

## 成果物

- 本ドキュメント（Phase 1 要件定義書）
- 受入基準チェックリスト（FR-2 / AC-3 / AC-6 に対応）

## 完了条件

- [ ] `SKILL_CREATOR_PROGRESS` チャンネルの現行ペイロード型が確認されている
- [ ] `GenerateStep.tsx` の現行実装（スピナーのみ）が把握されている
- [ ] 進捗4段階（構造計画中→SKILL.md生成中→agents生成中→バリデーション中）が定義されている
- [ ] 3種類のエラーパターン（API Key未設定・LLMエラー・ネットワークエラー）とその対応UIが定義されている
- [ ] キャンセル機能の要件（AbortController使用）が定義されている
- [ ] FR-2（リアルタイム進捗表示）・AC-3（進捗ストリーミング）・AC-6（エラーメッセージ）の充足基準が明確化されている

## 次のPhase

Phase 2: 設計
