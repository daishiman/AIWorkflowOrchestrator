# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 9                                |
| Phase名    | 品質保証                         |
| カテゴリ   | 品質                             |
| 前提Phase  | Phase 8                          |
| 後続Phase  | Phase 10                         |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

テスト環境改善の全変更に対して、静的解析・型チェック・リント・セキュリティの観点で品質保証を実施する。

## 背景

Phase 5-8で実施したテスト環境変更（vitest.config.ts、テストセットアップ、テストファイル修正、Clipboard APIモック）が品質基準を満たしていることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript型チェック

**目的**: 全変更ファイルの型エラーがゼロであることを確認する。

**実行手順**:

1. desktopパッケージの型チェックを実行する
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. 型エラーがある場合、エラー内容と修正方針を記録する
3. 型エラーを修正する
4. 修正後、型チェックがエラーゼロで通ることを確認する

**期待される成果物**:

- 型チェック結果の記録（品質レポートに含める）

---

### タスク2: ESLint静的解析

**目的**: 変更ファイルにリントエラーがないことを確認する。

**実行手順**:

1. desktopパッケージのリントを実行する
   ```bash
   pnpm --filter @repo/desktop lint
   ```
2. 変更したファイルに関連するリントエラーを確認する
   - `apps/desktop/vitest.config.ts`
   - `apps/desktop/src/test/setup.ts`
   - `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*.tsx`
   - テストユーティリティファイル（変更がある場合）
3. リントエラーがある場合は修正する
4. 修正後、リントがエラーゼロで通ることを確認する

**期待される成果物**:

- リント結果の記録（品質レポートに含める）

---

### タスク3: コードフォーマット確認

**目的**: 変更ファイルがPrettierフォーマットに準拠していることを確認する。

**実行手順**:

1. フォーマットチェックを実行する
   ```bash
   pnpm --filter @repo/desktop prettier --check "src/**/*.{ts,tsx}"
   ```
2. フォーマット違反がある場合は修正する
   ```bash
   pnpm --filter @repo/desktop prettier --write "src/**/*.{ts,tsx}"
   ```

**期待される成果物**:

- フォーマット結果の記録（品質レポートに含める）

---

### タスク4: 全テスト最終実行

**目的**: 品質保証の修正を含めた最終的なテスト実行を行う。

**実行手順**:

1. desktopパッケージの全テストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
2. 全テストがPASSすることを確認する
3. `describe.skip`が残っていないことを確認する
   ```bash
   grep -r "describe.skip" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*
   ```
4. `act()`警告がないことを確認する
5. 実行結果を品質レポートに記録する

**期待される成果物**:

- `outputs/phase-9/quality-assurance-report.md`（品質保証レポート）

---

## 参照資料

| 参照資料      | パス                                    | 内容                 |
| ------------- | --------------------------------------- | -------------------- |
| Phase 8成果物 | `outputs/phase-8/refactoring-result.md` | リファクタリング結果 |
| Phase 7成果物 | `outputs/phase-7/coverage-report.md`    | カバレッジレポート   |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- 品質保証の修正（型修正、リント修正）が統合テストの動作に影響していないことを確認する

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 統合テスト成功（i18n Integration含む）

#### コード品質

- [ ] TypeScript型エラー: 0件
- [ ] ESLintエラー: 0件
- [ ] Prettierフォーマット準拠

#### テスト網羅性

- [ ] `describe.skip`: 0件
- [ ] `act()`警告: 0件
- [ ] カバレッジ目標達成（Phase 7確認済み）

---

## 成果物

| 成果物           | パス                                          | 内容               |
| ---------------- | --------------------------------------------- | ------------------ |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | 全品質チェック結果 |

---

## 完了条件

- [ ] TypeScript型チェックがエラーゼロで通過する
- [ ] ESLintがエラーゼロで通過する
- [ ] Prettierフォーマットに準拠している
- [ ] 全テストがPASSする（`pnpm --filter @repo/desktop vitest run`）
- [ ] `describe.skip`がSkillStreamDisplayテストファイルに存在しない
- [ ] `act()`警告がゼロ
- [ ] 品質保証レポートが生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-10-final-review.md`
