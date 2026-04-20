# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 8                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 7: カバレッジ確認                                       |
| 次Phase    | 9: 品質保証                                             |

---

## 目的

`SkillLifecyclePanel.auth-regression.test.tsx` に追加した新テストケース群の構造を見直し、
`describe` / `it` ブロックの命名・階層を整理する。
共通化できるヘルパー（render セットアップ・mock 初期化）が存在する場合のみ抽出し、
テスト可読性と保守性を向上させる。
共通化が利益を上回らない場合は、非導入判断と理由を `refactoring-summary.md` に残す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複パターンの特定

**目的**: テストファイル内の重複している render セットアップ・mock パターンを洗い出す

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` を開いて全体構造を確認する
2. 以下の観点で重複パターンを特定する
   - `render()` 呼び出し前の mock セットアップコード（`vi.fn()` による `auth:login` モック等）
   - `beforeEach` / `afterEach` のリセット処理
   - `fireEvent` や `userEvent` による操作手順の繰り返し
   - `expect` アサーションの共通パターン
3. 重複箇所を Before / After / 理由の形式で記録する

**重複パターン例（Before）**:

```typescript
// 各 it ブロックで繰り返されるセットアップ
const mockAuthLogin = vi.fn();
vi.mock("electron", () => ({
  ipcRenderer: { invoke: mockAuthLogin },
}));

beforeEach(() => {
  mockAuthLogin.mockClear();
});
```

**期待される成果物**:

- `outputs/phase-8/refactoring-summary.md` の重複パターン特定セクション

---

### タスク2: 共通ヘルパーの要否判断と設計

**目的**: 重複パターンをヘルパー関数に抽出すべきか判断し、必要な場合のみ実装する

**実行手順**:

1. 重複量・変更箇所数・可読性改善量を比較し、導入判断を記録する
2. 導入する場合のみ、ヘルパー関数の設計を決定する
   - 配置先: `apps/desktop/src/renderer/components/skill/__tests__/helpers/` または同ファイル内の `describe` 外ヘルパー
   - 公開する関数の一覧を決定する
3. 導入判断が Yes の場合のみヘルパー関数を実装する

**実装例（After）**:

```typescript
// テストファイル内または helpers/ ディレクトリに配置
function setupAuthMock() {
  const mockAuthLogin = vi.fn();
  vi.mock('electron', () => ({
    ipcRenderer: { invoke: mockAuthLogin },
  }));
  return { mockAuthLogin };
}

function renderPanel(props?: Partial<SkillLifecyclePanelProps>) {
  return render(<SkillLifecyclePanel {...defaultProps} {...props} />);
}
```

4. 実装した場合は TypeScript 型エラーがないことを確認する

**期待される成果物**:

- `outputs/phase-8/refactoring-summary.md` の導入判断セクション

---

### タスク3: `describe` / `it` 構造の整理

**目的**: テストケースの意図が一目で分かるよう、`describe` と `it` の命名・階層を整理する

**実行手順**:

1. 現状の `describe` / `it` 階層を確認する
2. 以下の命名規則に従って整理する
   - `describe`: テスト対象の状態・条件（例: `rapid click 条件下`、`rerender 後`）
   - `it`: 期待する振る舞い（例: `auth:login を発火しない`）
3. 整理後の構造を `refactoring-summary.md` に記録する

**整理後の構造例**:

```typescript
describe('SkillLifecyclePanel auth-regression', () => {
  describe('rapid click 条件下', () => {
    it('短時間に複数回クリックしても auth:login を発火しない', () => { ... });
  });

  describe('rerender 条件下', () => {
    it('props 変更による rerender 後も auth:login を発火しない', () => { ... });
  });
});
```

**期待される成果物**:

- `outputs/phase-8/refactoring-summary.md` の構造整理セクション

---

### タスク4: リファクタリング後のテスト継続確認

**目的**: 共通ヘルパー適用・構造整理後も全テストが正常に PASS することを確認する

**実行手順**:

1. 以下のコマンドで対象テストファイルを実行する

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

2. 全テストが PASS することを確認する
3. テスト名・PASS 件数・FAIL 件数・実行時間を記録する
4. 結果を `refactoring-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-summary.md` のテスト継続確認セクション

---

## 参照資料

| 参照資料           | パス                                                                                                | 内容                       |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------- |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | リファクタリング対象テスト |
| コンポーネント本体 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | テスト対象コンポーネント   |
| Phase 7 成果物     | `outputs/phase-7/`                                                                                  | カバレッジ確認結果         |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に必ず以下のシステム仕様を確認し、仕様に準拠した状態を維持してください。

| 参照資料   | パス                                                                   | 内容                 |
| ---------- | ---------------------------------------------------------------------- | -------------------- |
| 記述ガイド | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 仕様記述・命名の基準 |

---

## 成果物

| 成果物                   | パス                                     | 内容                                                 |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------- |
| リファクタリングサマリー | `outputs/phase-8/refactoring-summary.md` | 重複パターン特定・導入判断・構造整理・テスト継続確認 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8 の統合テスト連携アクション**:

- 共通ヘルパー導入後も auth-regression テスト全件が PASS し、統合テストの安定性が維持されることを確認する
- `describe` / `it` 構造整理によりテスト意図の明確化が図られ、将来の回帰テスト追加が容易になることを確認する
- 共通ヘルパーの TypeScript 型定義が正しく、型エラーが発生しないことを確認する

---

## 多角的チェック観点（AIが判断）

| 観点                     | チェック内容                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------- |
| DRY 原則の適用           | render セットアップ・mock 初期化の重複が排除されているか                           |
| 型安全性                 | 共通ヘルパーの型定義が厳密で、`any` を使っていないか                               |
| テスト独立性の維持       | 共通ヘルパー使用後もテスト間の状態漏れ（mock の使い回し）がないか                  |
| describe / it 命名品質   | 状態・条件・期待振る舞いが命名から読み取れるか                                     |
| テスト対象の保持         | リファクタリングにより rapid click / rerender 条件の検証ロジックが失われていないか |
| 保守コスト削減の定量評価 | 変更前後のコード行数差分（削減行数）を記録しているか                               |

---

## サブタスク管理

| サブタスクID | 内容                             | ステータス |
| ------------ | -------------------------------- | ---------- |
| ST-8-01      | 重複パターン特定                 | 未実施     |
| ST-8-02      | 共通ヘルパー設計と実装           | 未実施     |
| ST-8-03      | describe / it 構造整理           | 未実施     |
| ST-8-04      | リファクタリング後テスト継続確認 | 未実施     |

---

## 完了条件

- [ ] 重複している render セットアップ・mock パターンが特定されている
- [ ] 共通ヘルパーを導入する場合は実装済みであり、導入しない場合は理由が `refactoring-summary.md` に記録されている
- [ ] `describe` / `it` の命名・階層が整理されている
- [ ] `outputs/phase-8/refactoring-summary.md` に Before / After / 理由テーブルが記録されている
- [ ] リファクタリング後に vitest run で全テストが PASS している

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-9-quality.md`
