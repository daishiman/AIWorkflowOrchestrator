# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 9                                                    |
| Phase名    | 品質保証                                             |
| 前提Phase  | Phase 8                                              |
| 後続Phase  | Phase 10                                             |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

静的解析・セキュリティチェック・パフォーマンス検証により、実装の品質を保証する。

## 背景

Phase 8でリファクタリングが完了し、コード品質が改善された。最終レビューの前に、以下の観点で品質を検証する:

- TypeScript型チェック
- ESLintによる静的解析
- アクセシビリティ自動チェック
- パフォーマンス検証

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript型チェック

**目的**: 型エラーがないことを確認する

**実行手順**:

1. 型チェックを実行:

```bash
pnpm --filter @repo/desktop typecheck
```

2. エラーがある場合は修正

3. 特に以下の点を確認:
   - aria属性の型が正しい
   - イベントハンドラの型が正しい
   - Refの型が正しい

**期待される成果物**:

- 型チェック結果レポート（outputs/phase-9/typecheck-results.md）

---

### タスク2: ESLint静的解析

**目的**: コード品質ルールに準拠していることを確認する

**実行手順**:

1. Lintを実行:

```bash
pnpm --filter @repo/desktop lint
```

2. エラー・警告がある場合は修正

3. 特に以下のルールを確認:
   - react-hooks/rules-of-hooks
   - react-hooks/exhaustive-deps
   - @typescript-eslint/no-unused-vars
   - jsx-a11y/role-has-required-aria-props

**期待される成果物**:

- Lint結果レポート（outputs/phase-9/lint-results.md）

---

### タスク3: アクセシビリティ自動チェック

**目的**: 自動化可能なアクセシビリティチェックを実行する

**実行手順**:

1. jest-axeによる自動チェック:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('FileSelectorModal アクセシビリティ', () => {
  it('axeによる自動チェックに違反がない', async () => {
    const { container } = render(<FileSelectorModal isOpen={true} onClose={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

2. 違反がある場合は修正

3. チェック結果を記録

**期待される成果物**:

- アクセシビリティチェック結果レポート（outputs/phase-9/a11y-check-results.md）

---

### タスク4: パフォーマンス検証

**目的**: アクセシビリティ機能がパフォーマンスに悪影響を与えていないことを確認する

**実行手順**:

1. レンダリングパフォーマンスの確認:
   - useFocusTrapの再レンダリング回数
   - aria-live更新時のパフォーマンス

2. React DevToolsのProfilerで計測:
   - コンポーネントのレンダリング時間
   - 不要な再レンダリングの有無

3. 問題がある場合は最適化

**期待される成果物**:

- パフォーマンス検証レポート（outputs/phase-9/performance-results.md）

---

### タスク5: セキュリティチェック

**目的**: セキュリティ上の問題がないことを確認する

**実行手順**:

1. 依存パッケージの脆弱性チェック:

```bash
pnpm audit
```

2. コードレベルのセキュリティ確認:
   - XSS脆弱性がないこと（aria-label等での動的値）
   - イベントハンドラでの入力検証

3. 問題がある場合は修正

**期待される成果物**:

- セキュリティチェック結果レポート（outputs/phase-9/security-results.md）

---

### タスク6: 品質保証結果サマリー

**目的**: 全ての品質チェック結果をまとめる

**実行手順**:

1. 品質チェック結果サマリーを作成:

| チェック項目                 | 結果 | 詳細 |
| ---------------------------- | ---- | ---- |
| TypeScript型チェック         | TBD  | TBD  |
| ESLint静的解析               | TBD  | TBD  |
| アクセシビリティ自動チェック | TBD  | TBD  |
| パフォーマンス検証           | TBD  | TBD  |
| セキュリティチェック         | TBD  | TBD  |

2. 品質ゲート判定:
   - **PASS**: 全チェック合格
   - **FAIL**: いずれかのチェック不合格

**期待される成果物**:

- 品質保証サマリーレポート（outputs/phase-9/qa-summary.md）

---

## 参照資料

| 参照資料      | パス                                   | 内容             |
| ------------- | -------------------------------------- | ---------------- |
| Phase 8成果物 | リファクタリング後のコード             | 検証対象         |
| ESLint設定    | `.eslintrc.js`                         | Lintルール       |
| jest-axe      | https://github.com/nickcolley/jest-axe | a11y自動チェック |

---

## 成果物

| 成果物                       | パス                                     | 内容               |
| ---------------------------- | ---------------------------------------- | ------------------ |
| 型チェック結果レポート       | `outputs/phase-9/typecheck-results.md`   | TypeScript検証     |
| Lint結果レポート             | `outputs/phase-9/lint-results.md`        | ESLint検証         |
| アクセシビリティチェック結果 | `outputs/phase-9/a11y-check-results.md`  | jest-axe検証       |
| パフォーマンス検証レポート   | `outputs/phase-9/performance-results.md` | パフォーマンス計測 |
| セキュリティチェック結果     | `outputs/phase-9/security-results.md`    | セキュリティ検証   |
| 品質保証サマリー             | `outputs/phase-9/qa-summary.md`          | 全体サマリー       |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 9での統合テスト連携アクション

- [ ] 品質保証で統合テスト結果を確認
- [ ] 全統合テストが成功していることを確認

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

#### アクセシビリティ

- [ ] jest-axe自動チェック合格
- [ ] WCAG 2.1 AA準拠確認

---

## 完了条件

- [ ] TypeScript型チェックがパスしている
- [ ] ESLintエラーがない
- [ ] jest-axeによるアクセシビリティチェックがパスしている
- [ ] パフォーマンス検証で問題がない
- [ ] セキュリティチェックで重大な問題がない
- [ ] 品質保証サマリーレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-10-final-review.md`
