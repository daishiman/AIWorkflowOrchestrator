# スキルウィザード使用率計装（trackEvent / Wave 3）- タスク指示書

## メタ情報

```yaml
issue_number: 2018
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                |
| タスク名     | スキルウィザード使用率計装（trackEvent / Wave 3）                    |
| 分類         | 新機能実装                                                           |
| 対象機能     | スキル作成ウィザード - 使用率トラッキング計装                        |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | skill-wizard-redesign-lane Wave 2 完了後                             |
| 発見日       | 2026-04-08                                                           |
| タスク分類   | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし）                 |
| 参照レーン   | `docs/30-workflows/skill-wizard-redesign-lane/index.md`（W3-seq-04） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-redesign-lane` では Wave 0〜2 にわたってスキル作成ウィザードを全面改善した。
Wave 3 の本タスクは、改善後のウィザードがどのように使用されているかを定量計測するための
計装（instrumentation）を追加する最終ステップである。

現状、ウィザードが開かれた回数・各ステップの完了率・中断率・ネクストアクションの選択傾向など
使用率データが一切収集されていない。このデータがなければ、改善後のウィザード設計の効果を
客観的に評価できず、次のイテレーションへの根拠が得られない。

### 1.2 問題点・課題

- ウィザードの開封率・離脱率・完了率が把握できない
- どのステップで離脱が多いかが不明のため、改善の優先箇所を特定できない
- `CompleteStep` のネクストアクション（3カード）の選択傾向が可視化されていない
- `trackEvent` に `skill_wizard_*` 系イベントが定義されておらず、型安全に計装できない
- Wave 2 の `SkillCreateWizard.tsx` 実装時、計装ポイントの型定義が未整備のままマージされた

### 1.3 放置した場合の影響

- ウィザード改善（Wave 0〜2）の効果測定ができず、投資対効果が不明になる
- データなしの主観的判断で次の UI 改善が行われ、品質が退行するリスクがある
- `trackEvent` を ad-hoc に直接呼び出す実装が混入し、型安全性が失われる可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/utils/trackEvent.ts` に `skill_wizard_*` 系イベントを追加し、
ウィザードの使用率を型安全に計装する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| AC-1 | `trackEvent` に `skill_wizard_open` イベントが型安全に定義・呼び出しできる          |
| AC-2 | `trackEvent` に `skill_wizard_step_complete` イベントが型安全に定義・呼び出しできる |
| AC-3 | `trackEvent` に `skill_wizard_next_action` イベントが型安全に定義・呼び出しできる   |
| AC-4 | `trackEvent` に `skill_wizard_abandon` イベントが型安全に定義・呼び出しできる       |
| AC-5 | `SkillCreateWizard.tsx` の 5 つの計装ポイントでイベントが正しく発火する             |
| AC-6 | `CompleteStep.tsx` で `skill_wizard_next_action` が選択時に発火する                 |
| AC-7 | `trackEvent.ts` のスタブの全分岐でテストカバレッジ 100% を達成する                  |
| AC-8 | `SkillCreateWizard.tsx` のテストカバレッジが 90% 以上を維持する                     |
| AC-9 | `CompleteStep.tsx` のテストカバレッジが 90% 以上を維持する                          |

### 2.3 スコープ

含むもの:

- `apps/desktop/src/renderer/utils/trackEvent.ts` への `skill_wizard_*` イベント型定義追加
- `SkillCreateWizard.tsx` の 5 計装ポイントへの `trackEvent` 呼び出し追加
- `CompleteStep.tsx` へのネクストアクション選択時 `trackEvent` 追加
- `trackEvent.ts` のテスト（スタブ全分岐 100%）
- `SkillCreateWizard.tsx` の計装ポイントに関するテスト追加

含まないもの:

- 外部アナリティクスサービスへのイベント送信
- ダッシュボード UI や集計機能
- Electron Main プロセス側のイベント処理
- IPC 通信を伴うイベント転送

### 2.4 計装ポイント詳細

| イベント名                   | 発火タイミング                             | ペイロード例                                 |
| ---------------------------- | ------------------------------------------ | -------------------------------------------- |
| `skill_wizard_open`          | ウィザードコンポーネントのマウント時       | `{ source: 'lifecycle_panel' \| 'direct' }`  |
| `skill_wizard_step_complete` | 各ステップの「次へ」完了時                 | `{ step: number, stepName: string }`         |
| `skill_wizard_next_action`   | `CompleteStep` のネクストアクション選択時  | `{ action: 'edit' \| 'execute' \| 'close' }` |
| `skill_wizard_abandon`       | ウィザードのアンマウント時（未完了の場合） | `{ lastStep: number }`                       |

### 2.5 成果物

| 種別      | ファイルパス                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------- |
| 修正      | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                         |
| 修正      | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                      |
| 修正      | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`（または相当コンポーネント）        |
| 新規/修正 | `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                                          |
| 修正      | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（計装確認ケース追加） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: W2-seq-03a（`SkillCreateWizard.tsx` オーケストレーション実装）が完了していること
- **ブロッカー**: W2-seq-03b（`wizard/index.ts` エクスポート更新）が完了していること
- `trackEvent.ts` が Renderer ユーティリティとして既に存在し、スタブ化パターンが確立されていること

### 3.2 依存タスク

| タスク ID / Wave | 状態 | 内容                                                        |
| ---------------- | ---- | ----------------------------------------------------------- |
| W2-seq-03a       | 前提 | `SkillCreateWizard.tsx` オーケストレーション（計装挿入先）  |
| W2-seq-03b       | 前提 | `wizard/index.ts` エクスポート（CompleteStep 等の公開確認） |

依存グラフ:

```
W2-seq-03a → W3-seq-04（本タスク）
```

### 3.3 推奨アプローチ

1. `trackEvent.ts` の現状のスタブ化パターン（Electron Notification API と同様の手法）を確認する
2. `skill_wizard_*` イベント型を追加し、既存の `trackEvent` 関数に統合する
3. `SkillCreateWizard.tsx` の `useEffect` マウント/アンマウントフックと各ステップ完了ハンドラーに計装を挿入する
4. `CompleteStep.tsx` のネクストアクション選択コールバックに `trackEvent` を追加する
5. `trackEvent.ts` のスタブ全分岐を網羅したテストを TDD で作成する（Red → Green → Refactor）
6. NON_VISUAL タスクとして Phase 11 証跡は console ログ / mock 呼び出し確認 / Vitest coverage で取得する

---

## 4. 実行手順（Phase 1-13 の概要）

詳細は `docs/30-workflows/skill-wizard-redesign-lane/index.md` の W3-seq-04 と
`task-specification-creator` スキルの Phase テンプレートを正とし、ここでは要点のみ記述する。

| Phase | 名称             | 主な作業（要点）                                                                                                                                                                                   |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | `trackEvent.ts` 現状調査、計装ポイント確定、スタブ化パターン確認、AC-1〜AC-9 固定                                                                                                                  |
| 2     | 設計             | `skill_wizard_*` 型定義の追加設計、各計装ポイントの責務境界確認、テスト戦略確定                                                                                                                    |
| 3     | 設計レビュー     | 既存 `trackEvent` との型整合性、スタブパターンの一貫性、Phase 4 進行可否判定                                                                                                                       |
| 4     | テスト作成       | TDD Red: `trackEvent.ts` スタブ全分岐テスト・`SkillCreateWizard.tsx` 計装テスト・`CompleteStep.tsx` テスト                                                                                         |
| 5     | 実装             | `trackEvent.ts` 型追加、`SkillCreateWizard.tsx` 計装挿入、`CompleteStep.tsx` 計装挿入                                                                                                              |
| 6     | テスト拡充       | fail path（ウィザード途中アンマウント）・ペイロード検証・回帰ガード追加                                                                                                                            |
| 7     | カバレッジ確認   | `trackEvent.ts` 100%、`SkillCreateWizard.tsx` 90% 以上、`CompleteStep.tsx` 90% 以上の達成確認                                                                                                      |
| 8     | リファクタリング | 計装コードの重複除去・命名揺れ修正（`対象/Before/After/理由` テーブル形式で記録）                                                                                                                  |
| 9     | 品質保証         | `pnpm typecheck` / `pnpm lint` / `pnpm test` の全通過確認                                                                                                                                          |
| 10    | 最終レビュー     | AC-1〜AC-9 の充足確認、W3-seq-04 としての完了判定                                                                                                                                                  |
| 11    | 手動テスト       | NON_VISUAL: Vitest カバレッジレポート・console mock 呼び出しログを主証跡として取得                                                                                                                 |
| 12    | ドキュメント更新 | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` |
| 13    | PR 作成          | ユーザー明示承認後のみ実施（blocked 維持）                                                                                                                                                         |

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: `skill_wizard_open` イベントが型安全に定義・呼び出し可能
- [ ] AC-2: `skill_wizard_step_complete` イベントが型安全に定義・呼び出し可能
- [ ] AC-3: `skill_wizard_next_action` イベントが型安全に定義・呼び出し可能
- [ ] AC-4: `skill_wizard_abandon` イベントが型安全に定義・呼び出し可能
- [ ] AC-5: `SkillCreateWizard.tsx` の 5 計装ポイントでイベントが正しく発火する
- [ ] AC-6: `CompleteStep.tsx` でネクストアクション選択時に `skill_wizard_next_action` が発火する

### テストカバレッジ要件

- [ ] AC-7: `trackEvent.ts` スタブ全分岐のカバレッジ 100% 達成
- [ ] AC-8: `SkillCreateWizard.tsx` のテストカバレッジ 90% 以上維持
- [ ] AC-9: `CompleteStep.tsx` のテストカバレッジ 90% 以上維持

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] `trackEvent.ts` の既存イベントへの影響がない（回帰なし）

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 6. 検証方法

### ユニットテスト実行

```bash
# trackEvent.ts のテスト
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# SkillCreateWizard.tsx の計装テスト
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# CompleteStep.tsx の計装テスト（パスは実際の wizard ディレクトリに合わせる）
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/
```

### カバレッジ確認

```bash
# trackEvent.ts の 100% カバレッジ確認
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/trackEvent.ts
```

### NON_VISUAL Phase 11 証跡取得

```bash
# mock の呼び出し回数・引数をコンソールで確認
# Vitest の vi.spyOn / vi.fn() で trackEvent をスタブ化し、
# 各テストケースで呼び出し引数を検証する
pnpm --filter @repo/desktop test:run --reporter=verbose
```

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                                                                   |
| ----------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `trackEvent.ts` が存在しない（新規作成が必要）        | 高     | 中       | Phase 1 で既存ファイルの有無を確認し、存在しない場合はスタブ実装から作成する                           |
| スタブ化パターンが Electron Notification API と異なる | 中     | 低       | Phase 1 で既存のスタブ化パターンを調査し、同一のパターンを踏襲する                                     |
| W2-seq-03a の計装挿入先コードが未確定                 | 高     | 低       | W2-seq-03a の完了を待ってから Phase 4（実装）を開始する                                                |
| `abandon` イベントのタイミング判定が複雑              | 中     | 中       | `useEffect` のクリーンアップ関数内でステップ完了フラグを参照し、最終ステップ未到達ならイベント発火する |
| 既存 `trackEvent` 呼び出し箇所への影響                | 中     | 低       | 型定義の追加は既存型を拡張する形で行い、Breaking Change を避ける                                       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                         | パス                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| skill-wizard-redesign-lane インデックス              | `docs/30-workflows/skill-wizard-redesign-lane/index.md`        |
| W0-seq-01 型定義（完了済み）                         | `docs/30-workflows/W0-seq-01-types-skill-info-form/`           |
| W0-seq-02 スマートデフォルト推論サービス（完了済み） | `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/` |
| task-specification-creator スキル                    | `.claude/skills/task-specification-creator/SKILL.md`           |
| aiworkflow-requirements スキル                       | `.claude/skills/aiworkflow-requirements/SKILL.md`              |

### 関連ソースコード

| 対象                          | パス                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| 既存スキル作成ウィザード      | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                |
| wizard サブディレクトリ       | `apps/desktop/src/renderer/components/skill/wizard/`（Wave 1 成果物）             |
| Renderer utils ディレクトリ   | `apps/desktop/src/renderer/utils/`                                                |
| 既存 SkillCreateWizard テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                           | 原因・背景                                                                                                                   | 推奨アプローチ                                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `trackEvent.ts` のスタブ化パターン確立             | Electron 環境ではレンダラー側から直接 OS API を呼ぶことができないため、スタブが必要                                          | Electron Notification API のスタブ化と同様に、`vi.mock()` または `vi.spyOn()` でテスト環境では no-op にする |
| NON_VISUAL タスクの Phase 11 証跡取得方法          | 視覚的なスクリーンショットが取得できないため、証跡取得パターンが通常と異なる                                                 | Vitest のカバレッジレポート（HTML/JSON）・`--reporter=verbose` の出力・mock 呼び出し引数ログを証跡とする    |
| 既存 `trackEvent` と新規イベント定義の型安全性確保 | 既存イベントの型定義構造に依存し、単純な追加が Breaking Change になる可能性がある                                            | ユニオン型拡張またはオブジェクト型マージを用い、既存呼び出し箇所の型チェックを確認してから追加する          |
| `skill_wizard_abandon` の発火タイミング制御        | React の `useEffect` クリーンアップはコンポーネントの再レンダリングでも発火するため、意図しない abandon イベントが発生しうる | `useRef` でステップ完了フラグを保持し、最終ステップ到達前にアンマウントされた場合のみ発火する               |

### W0 実装からの得た知見（参考）

Wave 0（W0-seq-01）の実装では、共有型を `@repo/shared/types/skillCreator` に閉じることで
root `@repo/shared` への影響を最小化するアプローチが有効だった。本タスクでは
`trackEvent.ts` は Renderer 内部に閉じているため、`@repo/shared` への変更は不要。

### 実行時の注意事項

- Phase 13（PR 作成）はユーザーの明示的な承認があるまで blocked 状態を維持する
- コミット・push は禁止（承認後のみ）
- `trackEvent` の新規イベントは `skill_wizard_` プレフィックスで統一する
