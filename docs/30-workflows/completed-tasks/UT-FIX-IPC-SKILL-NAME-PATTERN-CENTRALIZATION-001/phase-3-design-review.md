# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 3                                                         |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001          |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化        |
| 前提Phase  | Phase 2                                                   |
| 後続Phase  | Phase 4（PASS / MINOR の場合）/ Phase 2（BLOCKER の場合） |
| 作成日     | 2026-04-06                                                |
| ステータス | completed                                                 |

## 目的

Phase 2 の設計内容が正しく、Phase 4（テスト作成）に進んでよいかを判定する。全レビュー観点が PASS または MINOR であれば Phase 4 に進む。BLOCKER が 1 件以上存在する場合は Phase 2 に戻り再設計を行う。

## 実行タスク

- 5 観点を独立にレビューし、PASS / MINOR / BLOCKER を判定する。
- `gate-decision.md` に進行可否と差し戻し理由を記録する。
- Phase 4 に渡す前提条件を 1 つに固定する。

## SubAgent チーム編成

| SubAgent   | 関心ごと            | 主担当                             |
| ---------- | ------------------- | ---------------------------------- |
| SubAgent-A | shared 定数設計     | skillName.ts の設計妥当性確認      |
| SubAgent-B | TypeScript 参照更新 | SkillScanner.ts 変更設計のレビュー |
| SubAgent-C | ESM 参照更新        | init_skill.js 変更設計のレビュー   |
| SubAgent-D | 統合監査            | 全観点の統合判定・ゲート結論の確定 |

## レビュー観点

| No. | 観点         | 確認内容                                                                                                                | 判定基準                                        |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | 単一責務     | `skillName.ts` がスキル名バリデーションのみを責務とし、他の関心事を含まないか                                           | ファイル内にスキル名以外の定数がなければ PASS   |
| 2   | ESM 互換性   | `init_skill.js` が `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` で `SKILL_NAME_PATTERN` を取得できるか | tsup の ESM ビルド出力が確認できた場合に PASS   |
| 3   | 後方互換性   | 既存の `SkillScanner.ts` と `init_skill.js` のバリデーション動作が変化しないか                                          | 正規表現の文字列が同一であれば PASS             |
| 4   | export 整合  | `packages/shared/src/constants/index.ts` の re-export と package exports が一致するか                                   | エクスポートパスが一意であれば PASS             |
| 5   | スコープ境界 | 本タスクが UI・IPC 契約・データスキーマに変更を加えていないこと（NON_VISUAL 分類の維持）                                | 変更ファイルが定数・型・スクリプトのみなら PASS |

## 判定フロー

```
各観点を SubAgent-A/B/C/D が独立レビュー
          ↓
SubAgent-D が統合し PASS / MINOR / BLOCKER を判定
          ↓
  全観点 PASS または MINOR → Phase 4 へ進む
  BLOCKER 1 件以上         → Phase 2 に戻り再設計
```

## BLOCKER 判定基準

以下のいずれかに該当する場合は BLOCKER とする：

- ESM ビルドが存在せず `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` が機能しない
- `skillName.ts` 追加により循環依存が発生する
- 正規表現の内容が 2 箇所で異なることが発覚し、どちらを正とするか未確定
- `packages/shared/src/constants/index.ts` への追記が既存エクスポートと名前衝突する

## MINOR 判定基準

以下のいずれかに該当するが Phase 4 進行を妨げない場合は MINOR とする：

- JSDoc のコメント粒度が既存ファイルと異なる（スタイル統一は Phase 8 で対応可）

## 参照資料

### 実装・コード

| 資料名                  | パス                                       | 用途                     |
| ----------------------- | ------------------------------------------ | ------------------------ |
| Phase 2 設計書          | `outputs/phase-2/design-document.md`       | レビュー対象の設計内容   |
| 変更ファイル一覧        | `outputs/phase-2/file-change-list.md`      | スコープ確認             |
| ビルド設定分析          | `outputs/phase-2/build-config-analysis.md` | CJS/ESM 互換性の確認     |
| shared 定数インデックス | `packages/shared/src/constants/index.ts`   | 名前衝突チェック         |
| tsup.config.ts          | `packages/shared/tsup.config.ts`           | ESM/CJS ビルド出力の確認 |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                                        | 用途                      |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止              |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準            |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared 定数パターン       |
| タスク運用     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | NON_VISUAL 分類ルール確認 |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見              |

## 実行手順

1. SubAgent-A/B/C が各観点（単一責務 / CJS 互換性 / 後方互換性）を独立してレビューし、PASS / MINOR / BLOCKER を判定する。
2. SubAgent-D が全 SubAgent の判定結果を統合し、「export 整合」「スコープ境界」の観点を追加でチェックする。
3. BLOCKER が存在する場合は Phase 2 への差し戻し理由を gate-decision.md に記録し、Phase 2 担当者に引き渡す。
4. 全観点が PASS / MINOR の場合は「Phase 4 進行許可」をゲート判定書に明記する。
5. レビュー結果と判定書を `outputs/phase-3/` に保存する。

## 統合テスト連携

- Phase 2 の設計成果物を受け取り、Phase 4 のテスト作成へ進行可否を返す。
- BLOCKER の場合は Phase 2 へ差し戻し、再設計後に再レビューする。

## 成果物

| 成果物           | パス                                      | 説明                                         |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 各観点の判定結果と根拠                       |
| ゲート判定書     | `outputs/phase-3/gate-decision.md`        | Phase 4 進行可否・BLOCKER 詳細・差し戻し指示 |

## 完了条件

- [ ] 全 5 観点について PASS / MINOR / BLOCKER のいずれかが判定されていること
- [ ] BLOCKER が 0 件であること（または Phase 2 差し戻しが記録されていること）
- [ ] ゲート判定書に「Phase 4 進行許可」または「Phase 2 差し戻し」が明記されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. SubAgent-A: 単一責務・export 整合のレビュー
2. SubAgent-B: 後方互換性・TypeScript 参照変更のレビュー
3. SubAgent-C: ESM 互換性・import 参照変更のレビュー
4. SubAgent-D: 統合判定・スコープ境界確認・ゲート結論確定
5. 成果物出力・完了条件判定

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] BLOCKER 判定の場合は Phase 2 差し戻し指示を記録済み
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次の Phase

- PASS / MINOR: Phase 4（テスト作成）
- BLOCKER: Phase 2（設計）に差し戻し
