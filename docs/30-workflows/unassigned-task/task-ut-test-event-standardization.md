# テストイベントAPI標準化（happy-dom環境fireEvent統一） - タスク指示書

## メタ情報

```yaml
issue_number: 803
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-TEST-EVENT-STANDARDIZATION-001                          |
| タスク名     | テストイベントAPI標準化（happy-dom環境fireEvent統一）      |
| 分類         | 改善                                                       |
| 対象機能     | テスト基盤                                                 |
| 優先度       | 中                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 12（P39/P40教訓） |
| 発見日       | 2026-02-13                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-AGENTVIEW-INFINITE-LOOP-001の実装中に、`@testing-library/user-event`の`userEvent.setup()`がhappy-dom環境で`TypeError: Symbol(Node prepared with document state workarounds)`エラーを引き起こすことが判明した（P39）。49/53テストが一斉に失敗する事態が発生し、原因特定に時間を要した。

現在のプロジェクトではhappy-domがデフォルトのテスト環境（`apps/desktop/vitest.config.ts`の`environment: 'happy-dom'`）として設定されているが、一部のテストファイルでuserEventが使用されている可能性がある。

また、モノレポ環境でプロジェクトルートからテスト実行すると`vitest.config.ts`の`environment`設定が読み込まれず、`document is not defined`エラーが発生する問題も発見された（P40）。

### 1.2 問題点・課題

- `@testing-library/user-event`の`userEvent.setup()`はhappy-dom環境のDOM API非互換により`TypeError: Symbol(...)`を発生させる
- 既存テストファイルにuserEventが混在している場合、テスト追加や依存更新のタイミングで突然大量のテストが失敗する
- プロジェクトルートからのテスト実行時にvitest設定が読み込まれず、テスト環境の不整合が発生する
- テストイベント発火の方法がプロジェクト内で統一されていないため、新規開発者がuserEventを使用してしまうリスクがある

### 1.3 放置した場合の影響

- 新規テスト追加時にuserEventを使用してしまい、同じエラーが再発する。開発者が原因を特定できず数時間を浪費するリスクがある
- CIでhappy-dom環境のテストが突然全件失敗する可能性がある
- テストイベントAPIの不統一により、コードベースの保守性が低下する
- モノレポでのテスト実行方法が統一されず、開発者ごとに異なる手順で実行することで再現性のないテスト失敗が発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

プロジェクト全体のテストファイルからuserEvent使用箇所を検出してfireEventに統一し、ESLint設定でuserEventの使用を制限することで、happy-dom環境でのテスト安定性を確保する。

### 2.2 最終ゴール

- `apps/desktop/src/` 配下の全テストファイルでuserEvent使用箇所が0件である
- ESLintの`no-restricted-imports`ルールで`@testing-library/user-event`がwarning設定されている
- テスト実行のベストプラクティスがCONTRIBUTING.mdまたはプロジェクトドキュメントに記載されている
- 全テストがhappy-dom環境でPASSする

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/` 配下の全テストファイル（`.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`）のuserEvent使用箇所調査
- userEvent → fireEvent への変換実装
- 非同期ハンドラへの `await act(async () => { ... })` パターン適用
- ESLint `no-restricted-imports` ルールによる `@testing-library/user-event` のwarning設定
- テスト実行ベストプラクティスのドキュメント更新

#### 含まないもの

- jsdom環境への移行（happy-domをデフォルトとして維持する）
- Playwright E2Eテストの変更（E2Eテストはブラウザ環境で動作するため対象外）
- `@testing-library/user-event` パッケージ自体のアンインストール（段階的にwarning → errorへ格上げ後に検討）

### 2.4 成果物

| 成果物                   | パス・説明                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| 修正済みテストファイル群 | `apps/desktop/src/` 配下のuserEvent使用箇所をfireEventに変換したファイル群 |
| ESLint設定更新           | `apps/desktop/.eslintrc.*` への `no-restricted-imports` ルール追加         |
| テスト実行ドキュメント   | CONTRIBUTING.md または開発者向けドキュメントへのベストプラクティス追記     |
| 調査レポート             | userEvent使用箇所の全数調査結果                                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-AGENTVIEW-INFINITE-LOOP-001が完了していること
- happy-dom環境でのfireEvent動作が確認されていること（P39解決済み）
- `apps/desktop/vitest.config.ts` に `environment: 'happy-dom'` が設定されていること

### 3.2 依存タスク

| タスクID                           | タスク名                | ステータス |
| ---------------------------------- | ----------------------- | ---------- |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | AgentView無限ループ修正 | 完了       |

### 3.3 必要な知識

- `@testing-library/react` の `fireEvent` API
- `@testing-library/user-event` の `userEvent` API
- happy-dom と jsdom の DOM API 互換性の違い
- React Testing Library の `act()` パターン
- ESLint `no-restricted-imports` ルールの設定方法
- モノレポ環境でのVitest設定解決メカニズム

### 3.4 推奨アプローチ

1. **全数調査**: `grep -rn "userEvent" apps/desktop/src/` で全使用箇所をリスト化する
2. **影響分析**: 各テストファイルでのuserEvent使用パターンを分類する
   - `userEvent.setup()` + `user.click()` パターン
   - `userEvent.click()` 直接呼び出しパターン
   - `userEvent.type()` テキスト入力パターン
3. **変換実施**: 各テストファイルで以下の変換を適用する
   - `userEvent.click(element)` → `fireEvent.click(element)`
   - `userEvent.type(element, text)` → `fireEvent.change(element, { target: { value: text } })`
   - 非同期ハンドラは `await act(async () => { fireEvent.click(element) })` で包む
4. **ESLint設定**: `no-restricted-imports` ルールで `@testing-library/user-event` をwarning設定する
5. **全テスト実行**: `cd apps/desktop && pnpm vitest run` で全テストがPASSすることを確認する

---

## 3.5 実装課題と解決策（親タスクからの教訓）

> 親タスク UT-FIX-AGENTVIEW-INFINITE-LOOP-001 実行時に遭遇した課題と解決策。同様の課題を回避するための参照情報。

| #   | 課題                                       | 発見経緯                                                                                                    | 解決策                                                                                                        | 教訓                                                                   |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | happy-domでuserEvent.setup()がSymbolエラー | AgentViewテスト53件中49件が一斉に`TypeError: Symbol(Node prepared with document state workarounds)`で失敗   | `fireEvent`に全面置換する。非同期ハンドラは`await act(async () => { fireEvent.click(el) })`で包む             | happy-dom環境では`userEvent`は使用不可。テスト追加時は必ず実行確認する |
| 2   | テスト実行ディレクトリ依存                 | プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると`document is not defined`で全件失敗 | `cd apps/desktop && pnpm vitest run`で実行する。または`pnpm --filter @repo/desktop exec vitest run`を使用する | モノレポではパッケージディレクトリからテスト実行する                   |
| 3   | jsdom切り替え時のDOM重複                   | `@vitest-environment jsdom`アノテーション追加で`toBeInTheDocument`が認識されず型エラーが発生                | happy-dom + fireEventで統一し、jsdomへの個別切り替えを行わない                                                | テスト環境の切り替えは副作用が大きい。デフォルト環境を尊重する         |

### 参照リンク

- `.claude/rules/06-known-pitfalls.md` P39（happy-dom環境でのuserEvent非互換）
- `.claude/rules/06-known-pitfalls.md` P40（テスト実行ディレクトリ依存）
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`「fireEvent vs userEvent使い分けパターン」セクション

---

## 4. 実行手順

### Phase構成

| Phase | 名称                     | 目的                                         |
| ----- | ------------------------ | -------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー | userEvent使用箇所の全数調査と移行計画策定    |
| 4-5   | テスト修正・実装         | fireEvent統一、ESLintルール追加              |
| 6-9   | テスト拡充・品質検証     | カバレッジ確認、リファクタリング、品質検証   |
| 10-13 | レビュー・完了           | 最終レビュー、手動テスト、ドキュメント、完了 |

### Phase 1-3: 要件定義・設計・レビュー

#### 目的

userEvent使用箇所を全数調査し、移行計画を策定する

#### 手順

1. 以下のコマンドでuserEvent使用箇所を全数調査する:
   ```bash
   grep -rn "userEvent\|user-event" apps/desktop/src/ --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" --include="*.spec.tsx"
   ```
2. 検出結果をファイル別・使用パターン別に分類する
3. 各ファイルのuserEvent使用パターンに応じた変換方針を決定する
4. 移行計画書を作成し、設計レビューを実施する

#### 成果物

- userEvent使用箇所調査レポート（ファイルパス、行番号、使用パターン、変換方針）
- 移行計画書

#### 完了条件

- [ ] 全使用箇所がリスト化されている
- [ ] 各使用パターンの変換方針が決定されている
- [ ] 設計レビューがPASSまたはMINOR判定である

### Phase 4-5: テスト修正・実装

#### 目的

userEvent使用箇所をfireEventに変換し、ESLintルールを追加する

#### 手順

1. 各テストファイルでuserEvent → fireEvent変換を適用する:

   ```typescript
   // Before（非推奨）
   import userEvent from "@testing-library/user-event";
   const user = userEvent.setup();
   await user.click(element);
   await user.type(input, "text");

   // After（推奨）
   import { fireEvent, act } from "@testing-library/react";
   fireEvent.click(element);
   fireEvent.change(input, { target: { value: "text" } });

   // 非同期ハンドラの場合
   await act(async () => {
     fireEvent.click(element);
   });
   ```

2. ESLint設定に`no-restricted-imports`ルールを追加する:
   ```json
   {
     "no-restricted-imports": [
       "warn",
       {
         "paths": [
           {
             "name": "@testing-library/user-event",
             "message": "happy-dom環境ではuserEventは非互換です。@testing-library/reactのfireEventを使用してください。P39参照。"
           }
         ]
       }
     ]
   }
   ```
3. 変換後に各テストファイルを個別に実行して動作確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/path/to/modified.test.tsx
   ```

#### 成果物

- fireEventに変換済みのテストファイル群
- ESLint設定更新ファイル

#### 完了条件

- [ ] 全テストファイルでuserEvent使用が0件である
- [ ] ESLint `no-restricted-imports` ルールが設定されている
- [ ] 変換後の全テストがPASSする

### Phase 6-9: テスト拡充・カバレッジ確認・リファクタリング・品質検証

#### 目的

変換後のテストカバレッジ維持確認と品質検証

#### 手順

1. カバレッジレポートを生成し、変換前後でカバレッジが低下していないことを確認する
2. 重複したact()パターンがある場合はヘルパー関数に抽出する
3. `pnpm typecheck` を実行してTypeScriptエラーがないことを確認する
4. `pnpm lint` を実行してESLintエラーがないことを確認する
5. `cd apps/desktop && pnpm vitest run` で全テストを実行する

#### 成果物

- カバレッジレポート（変換前後の比較）
- 品質検証完了レポート

#### 完了条件

- [ ] カバレッジが変換前と同等以上である
- [ ] TypeScript型チェックがPASS
- [ ] ESLintチェックがPASS
- [ ] 全テストがPASS

### Phase 10-13: レビュー・手動テスト・ドキュメント・完了

#### 目的

最終品質確認、ドキュメント更新、タスク完了

#### 手順

1. 最終レビューを実施する（変換の網羅性、ESLintルールの適切性を確認）
2. 手動でテスト実行し、予期しないエラーがないことを確認する
3. テスト実行ベストプラクティスをドキュメントに追記する:
   - happy-dom環境では`fireEvent`を使用する（`userEvent`は使用不可）
   - テスト実行は `cd apps/desktop && pnpm vitest run` で行う
   - 非同期ハンドラは`act()`で包む
4. Phase 12の成果物（実装ガイド、ドキュメント更新）を作成する
5. PR準備

#### 成果物

- テスト実行ベストプラクティスドキュメント
- Phase 12成果物一式

#### 完了条件

- [ ] 最終レビューがPASS
- [ ] ドキュメントが更新されている
- [ ] PR準備が完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `apps/desktop/src/` 配下の全テストファイルでuserEvent使用箇所が0件である
- [ ] `@testing-library/user-event` のimportが全テストファイルから除去されている
- [ ] 非同期ハンドラが `await act(async () => { ... })` パターンで正しく変換されている
- [ ] ESLint `no-restricted-imports` ルールで `@testing-library/user-event` がwarning設定されている

### 品質要件

- [ ] TypeScript型チェックが通る（`pnpm typecheck`）
- [ ] ESLintエラーがない（`pnpm lint`）
- [ ] 全テストがPASS（`cd apps/desktop && pnpm vitest run`）
- [ ] テストカバレッジが変換前と同等以上である

### ドキュメント要件

- [ ] テスト実行ベストプラクティスがドキュメントに記載されている
- [ ] happy-dom環境でのfireEvent使用ルールが明記されている
- [ ] モノレポでのテスト実行方法（パッケージディレクトリから実行）が記載されている

---

## 6. 検証方法

### テストケース

| No.   | テストケース                                 | 期待結果                                                                  |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------- |
| TC-01 | grep検索でuserEvent使用が0件                 | `grep -rn "userEvent" apps/desktop/src/ --include="*.test.*"` が0件を返す |
| TC-02 | ESLintでuserEventインポート時にwarningが出る | `@testing-library/user-event` をimportするとwarningが表示される           |
| TC-03 | 全テストがhappy-dom環境でPASS                | `cd apps/desktop && pnpm vitest run` が全件PASSする                       |
| TC-04 | fireEvent変換後のテストが正しく動作する      | click, change, submit等の各イベントが正しく発火する                       |
| TC-05 | 非同期ハンドラがact()で正しく包まれている    | act warning が出力されない                                                |
| TC-06 | カバレッジが変換前と同等                     | カバレッジレポートで低下がないことを確認する                              |

### 検証手順

1. userEvent使用箇所を再検索し0件であることを確認する:
   ```bash
   grep -rn "userEvent\|from '@testing-library/user-event'" apps/desktop/src/ --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" --include="*.spec.tsx"
   ```
2. ESLintルールの動作を確認する:
   ```bash
   cd apps/desktop && pnpm lint
   ```
3. 全テストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run
   ```
4. カバレッジレポートを生成して確認する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage
   ```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                                                                       |
| --------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| userEvent→fireEvent変換で挙動差が生じる             | 中     | 中       | テスト実行で動作確認する。fireEventで再現不可な操作（ドラッグ&ドロップ等）は個別対応を検討する                             |
| ESLintルール追加による既存CI失敗                    | 低     | 低       | warningレベルで追加し、全テストPASS確認後に段階的にerrorに格上げする                                                       |
| fireEventでは検出できないアクセシビリティ問題       | 中     | 低       | E2E（Playwright）テストで補完する。本タスクスコープ外として別途対応する                                                    |
| 大量の変換により意図しないテスト破壊が発生          | 高     | 低       | ファイルごとに段階的に変換し、各変換後にテスト実行で確認する。一括変換を避ける                                             |
| `fireEvent.change` で `userEvent.type` と異なる挙動 | 中     | 中       | `userEvent.type` はキーストロークごとにイベント発火するが、`fireEvent.change` は値を一括設定する。テストの期待値を調整する |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                           | パス                                                                                        | 参照セクション                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P39: happy-dom環境でのuserEvent非互換  | `.claude/rules/06-known-pitfalls.md`                                                        | P39セクション                                        |
| P40: テスト実行ディレクトリ依存        | `.claude/rules/06-known-pitfalls.md`                                                        | P40セクション                                        |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001教訓 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | UT-FIX-AGENTVIEW-INFINITE-LOOP-001セクション         |
| fireEvent vs userEvent使い分けパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 「fireEvent vs userEvent使い分けパターン」セクション |
| テスト環境別イベント発火パターン選択   | `.claude/skills/skill-creator/references/patterns.md`                                       | テスト環境別イベント発火パターン選択セクション       |
| ESLint no-restricted-imports設定       | [ESLint公式ドキュメント](https://eslint.org/docs/latest/rules/no-restricted-imports)        | -                                                    |

### 関連ファイル

| ファイル                         | 説明                        |
| -------------------------------- | --------------------------- |
| `apps/desktop/vitest.config.ts`  | テスト環境設定（happy-dom） |
| `apps/desktop/.eslintrc.*`       | ESLint設定ファイル          |
| `apps/desktop/src/**/*.test.tsx` | 変換対象テストファイル群    |

### 関連タスク

| タスクID                           | 関係性             | ステータス |
| ---------------------------------- | ------------------ | ---------- |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | 親タスク（発見元） | 完了       |

---

## 9. 備考

### 発見経緯

```
UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 12（ドキュメント）にて、
P39（happy-dom環境でのuserEvent非互換）とP40（テスト実行ディレクトリ依存）の
教訓を記録する過程で、プロジェクト全体のテストファイルにおけるuserEvent使用の
標準化が必要であると判断した。
```

### 補足事項

- `userEvent`と`fireEvent`の主な挙動差:
  - `userEvent.type()` はキーストロークごとにkeydown/keypress/keyup/input/changeイベントを順次発火するが、`fireEvent.change()` はchangeイベントのみ発火する
  - `userEvent.click()` はfocus/pointerdown/mousedown/pointerup/mouseup/clickイベントを順次発火するが、`fireEvent.click()` はclickイベントのみ発火する
  - 大半のコンポーネントテストではfireEventで十分だが、中間イベント（keydown等）に依存するテストは個別対応が必要
- ESLintルールはwarningレベルで追加し、全テストPASS確認後にerrorへの格上げを検討する
- `@testing-library/user-event` パッケージのアンインストールは本タスクの対象外とし、errorレベル格上げ後の別タスクで対応する
- モノレポでのテスト実行は常に `cd apps/desktop && pnpm vitest run` で行うこと（P40対策）

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-13 | 初版作成 |
