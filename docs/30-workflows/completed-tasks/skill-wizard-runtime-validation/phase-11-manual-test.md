# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase名    | 手動テスト検証                  |
| 前提Phase  | Phase 10                        |
| 後続Phase  | Phase 12                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

バリデーション関数の手動確認とエッジケースの最終確認を行う。
UIコンポーネント変更を伴わないため、本Phaseは **NON_VISUAL** として扱い、
`vitest` 自動テスト結果を primary evidence とする。

---

## タスク分類

**NON_VISUAL（UI差分なし）**

current facts として、対象変更は `packages/shared/src/types/skillInfoFormValidation.ts`、`packages/shared/src/types/index.ts` の公開エクスポート、対応テストに限定される想定である。UIコンポーネント・画面遷移・IPC表示面の変更を含まないため、スクリーンショット撮影は不要とする。
なお、spec_created で開始したタスクに後続で code wave が混入した場合は、Phase 12 で taskType と証跡方針（NON_VISUAL継続可否）を再判定する。

---

## Phase 11 手動テスト方針

| 項目                       | 方針                                               |
| -------------------------- | -------------------------------------------------- |
| `manual-test-result.md`    | 必ず作成する（NON_VISUAL理由・代替evidenceを明記） |
| `manual-test-checklist.md` | 必ず作成する（TC-ID と evidence の対応を固定）     |
| `discovered-issues.md`     | 必ず作成する（0件の場合も出力する）                |
| `screenshot-plan.json`     | 生成しない（NON_VISUALのため不要）                 |
| primary evidence           | `vitest` 自動テスト結果（テスト件数・PASS件数）    |
| 代替evidence の記載内容    | テスト件数・PASS件数・実行コマンド・実行日時       |

### NON_VISUAL 継続の再判定条件

- renderer の visible block 追加・変更が発生した場合は VISUAL に再分類する
- preload / IPC surface 変更により UI 表示仕様が増えた場合は screenshot 証跡要否を再判定する
- 上記が無い場合のみ NON_VISUAL を維持する

### `manual-test-result.md` に明記する内容

- NON_VISUAL である理由（UIコンポーネント変更なし・ピュア関数のみの変更）
- 代替 evidence として vitest テスト結果（件数・PASS/FAIL・実行コマンド）
- エッジケース確認方法（コードレビューで代替した旨）

---

## 実行タスク

### タスク1: テスト最終実行確認

**目的**: 全テスト件数・PASS件数を記録し、primary evidence として `manual-test-result.md` に記載する

**実行手順**:

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
```

**記録すべき情報**:

- 実行日時
- 実行コマンド
- 全テスト件数
- PASSテスト件数
- FAILテスト件数（0件であること）
- テストスイート名

**期待成果物**: `outputs/phase-11/manual-test-result.md`

---

### タスク2: エッジケース目視確認（コードレビューで代替）

**目的**: UIが存在しないため、コードレビューによりエッジケースの実装漏れがないことを確認する

**確認観点**:

| エッジケース                       | 確認方法       | 確認結果 |
| ---------------------------------- | -------------- | -------- |
| `skillName` が `undefined`         | コードレビュー |          |
| `skillName` が空文字列 `""`        | ユニットテスト |          |
| `skillName` が空白のみ `"   "`     | ユニットテスト |          |
| `skillName` がちょうど100文字      | ユニットテスト |          |
| `skillName` が101文字              | ユニットテスト |          |
| `purpose` がちょうど10文字         | ユニットテスト |          |
| `purpose` が9文字                  | ユニットテスト |          |
| `purpose` がちょうど500文字        | ユニットテスト |          |
| `purpose` が501文字                | ユニットテスト |          |
| `purpose` が前後に空白を含む10文字 | コードレビュー |          |

**期待成果物**: 確認結果を `outputs/phase-11/manual-test-result.md` に追記する

---

### タスク3: 発見事項・改善提案の整理

**目的**: Phase 11 の確認作業を通じて発見した問題点・改善提案を整理する

**実行手順**:

1. タスク1・タスク2 の実施結果から発見事項を抽出する
2. 発見事項がない場合でも `outputs/phase-11/discovered-issues.md` を出力する（0件明記）
3. 改善提案がある場合は優先度（HIGH/MEDIUM/LOW）を付けて記録する

**記録フォーマット**:

```markdown
## 発見事項一覧

| No. | 種別 | 優先度 | 内容         | 対応方針 |
| --- | ---- | ------ | ------------ | -------- |
| -   | -    | -      | 発見事項なし | -        |
```

**期待成果物**: `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 資料名                     | パス                                                                  | 説明                       |
| -------------------------- | --------------------------------------------------------------------- | -------------------------- |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`                             | Phase 10 の判定結果        |
| AC検証ドキュメント         | `outputs/phase-10/ac-verification.md`                                 | AC-1〜AC-5 検証済み記録    |
| バリデーション実装ファイル | `packages/shared/src/types/skillInfoFormValidation.ts`                | エッジケース確認対象コード |
| テストファイル             | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | ユニットテスト内容         |

---

## 成果物

| 成果物                   | 配置先                                      | 形式     |
| ------------------------ | ------------------------------------------- | -------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | Markdown |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | Markdown |
| 発見事項・改善提案       | `outputs/phase-11/discovered-issues.md`     | Markdown |

> `screenshot-plan.json` は NON_VISUAL のため生成しない。

---

## 統合テスト連携

- `manual-test-result.md` と `manual-test-checklist.md` は Phase 12 のドキュメント更新の一次入力とする
- `discovered-issues.md` の 0件判定は Phase 12 の未タスク検出結果と一致させる
- NON_VISUAL の証跡は Phase 12 の implementation-guide / system-spec-update-summary に再掲する

## 完了条件

- [ ] テスト最終実行確認が完了し、全件PASSであること
- [ ] `outputs/phase-11/manual-test-result.md` が生成されていること
- [ ] `manual-test-result.md` に NON_VISUAL である理由と代替 evidence（テスト件数・結果）が明記されていること
- [ ] エッジケース確認チェックリストが全項目実施済みであること
- [ ] `outputs/phase-11/discovered-issues.md` が生成されていること（0件の場合も出力）
- [ ] `screenshot-plan.json` を生成していないこと（NON_VISUAL）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクの実行結果を成果物として出力
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS/MINOR（対応済み）で完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-12-documentation.md`
