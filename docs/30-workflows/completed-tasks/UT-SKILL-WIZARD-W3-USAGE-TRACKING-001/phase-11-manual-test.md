# Phase 11: 手動テスト（NON_VISUAL）

**Task ID**: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001  
**Task Name**: スキルウィザード使用率計装（trackEvent / Wave 3）  
**Phase**: 11 - 手動テスト  
**作成日**: 2026-04-11

---

> **NON_VISUAL タスクであることを明記する**
>
> 本タスクは Renderer 内部の計装（trackEvent 呼び出し）のみを対象とし、UI の視覚的な変更は一切伴わない。
> そのため、スクリーンショットによる証跡取得は不要であり、`screenshot-plan.json` は作成しない。
> 主証跡は Vitest カバレッジレポートおよびモック呼び出しログとする。

---

## 目的

Vitest coverage レポートと mock 呼び出しログを主証跡として取得し、AC-7〜AC-9 のカバレッジ目標達成を確認する。GUI 操作による目視確認ではなく、自動テスト結果が唯一の証跡となる。

---

## NON_VISUAL の理由

本タスクの実装内容は以下に限定される。

- `trackEvent.ts` への 4 イベント型定義とスタブ実装の追加
- `SkillCreateWizard.tsx` への 5 箇所の `trackEvent` 呼び出し追加
- `CompleteStep.tsx` へのアクション選択時の `trackEvent` 呼び出し追加

これらはいずれも Renderer プロセス内部の副作用（イベント計装）であり、コンポーネントの描画結果・スタイル・レイアウトに変化をもたらさない。したがって、スクリーンショットを撮影しても視覚的な差分は存在せず、証跡としての意味を持たない。

---

## タスク 11-1: Vitest coverage レポートの取得

### 実行コマンド

以下のコマンドを実行して、`trackEvent.ts` のカバレッジレポートを取得する。

```bash
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/trackEvent.ts
```

### 確認手順

1. コマンドを実行する
2. ターミナル出力の coverage サマリーテーブルを確認する
3. `trackEvent.ts` の行が以下の値を満たしていることを確認する:
   - `Stmts`（Statements カバレッジ）: **100%**
   - `Branch`（Branch カバレッジ）: **100%**
   - `Funcs`（Functions カバレッジ）: **100%**
   - `Lines`（Lines カバレッジ）: **100%**
4. HTML 形式のカバレッジレポート（`coverage/index.html`）が生成されていることを確認する。`trackEvent.ts` の網羅性はターミナル出力と JSON サマリーで判定し、ブラウザでの目視確認は行わない
5. JSON 形式のカバレッジレポート（`coverage/coverage-summary.json`）を保存する

### 証跡の保存先

- `outputs/phase-11/manual-test-result.md` に trackEvent.ts のカバレッジ数値を転記する
- HTML レポートのスクリーンショットではなく、JSON レポートのパスを証跡として記録する

### AC-7 達成確認

- `trackEvent.ts` のスタブの全分岐（`skill_wizard_open` / `skill_wizard_step_complete` / `skill_wizard_next_action` / `skill_wizard_abandon`）がカバーされていることを確認する
- 未カバーの分岐が 1 つでも存在する場合は AC-7 未達成として Phase 10 に差し戻す

---

## タスク 11-2: mock 呼び出し確認

### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run --reporter=verbose
```

### 確認手順

1. コマンドを実行する
2. テスト出力から以下の計装ポイントに対応するテストケースを特定する:

   | 計装ポイント      | 対象ファイル            | 対応するイベント             |
   | ----------------- | ----------------------- | ---------------------------- |
   | ウィザード起動時  | `SkillCreateWizard.tsx` | `skill_wizard_open`          |
   | ステップ 0 完了時 | `SkillCreateWizard.tsx` | `skill_wizard_step_complete` |
   | ステップ 1 完了時 | `SkillCreateWizard.tsx` | `skill_wizard_step_complete` |
   | ステップ 2 完了時 | `SkillCreateWizard.tsx` | `skill_wizard_step_complete` |
   | ウィザード中断時  | `SkillCreateWizard.tsx` | `skill_wizard_abandon`       |
   | アクション選択時  | `CompleteStep.tsx`      | `skill_wizard_next_action`   |

3. 各テストケースの `expect(trackEvent).toHaveBeenCalledWith(...)` の検証結果を確認する
4. 全 6 計装ポイント（`SkillCreateWizard.tsx` の 5 箇所 + `CompleteStep.tsx` の 1 箇所）の呼び出しが確認できたことを `outputs/phase-11/manual-test-result.md` に記録する

### テストでの mock 使用パターン（確認対象）

各テストファイルが以下のパターンで `trackEvent` をスタブ化していることを確認する。

```typescript
// 期待されるスタブパターン（実装確認用）
vi.spyOn(trackEventModule, 'trackEvent').mockImplementation(() => {});
// または
vi.fn() による置き換え
```

### 呼び出し引数の検証対象

各計装ポイントで、以下の引数が正しく渡されていることを確認する。

| イベント名                   | 必須プロパティ     | 補足                                   |
| ---------------------------- | ------------------ | -------------------------------------- |
| `skill_wizard_open`          | `source`           | 起動元は `lifecycle_panel` / `direct`  |
| `skill_wizard_step_complete` | `step`, `stepName` | `step` は 0 始まり                     |
| `skill_wizard_next_action`   | `action`           | `execute` / `edit` / `close`           |
| `skill_wizard_abandon`       | `lastStep`         | 完了前に離脱したときの最終到達ステップ |

---

## タスク 11-3: 既知制限の記録

### 実地操作（GUI 操作）が不可である理由

本タスクのテスト環境では、Electron アプリを実際に起動してウィザードを操作することによる目視確認（GUI 操作）は実施しない。理由は以下の通り。

1. **計装コードは副作用のみ**: `trackEvent` の呼び出しは UI 描画に影響を与えないため、GUI 操作で確認できる変化がない
2. **自動テストで完全検証が可能**: Vitest の `vi.spyOn` / `vi.fn()` により、`trackEvent` への引数を自動テストで完全に検証できる
3. **再現性の担保**: 自動テストは毎回同一条件で実行されるため、目視確認より信頼性が高い

### 代替証跡の採用根拠

自動テスト結果を主証跡として採用する根拠を以下に記録する。

- `vi.spyOn` による mock 呼び出し検証は、実際の `trackEvent` 関数への引数を直接検証するため、手動での動作確認と同等以上の信頼性を持つ
- Vitest カバレッジレポートにより、テストが実行されていないコードパスが存在しないことを客観的に証明できる
- CI/CD パイプラインでの自動実行により、環境依存のブレが排除される

---

## NON_VISUAL 証跡ファイル

Phase 11 の完了時に以下のファイルを作成する。

### 1. `outputs/phase-11/manual-test-result.md`

以下の内容を必ず含めること。

- **NON_VISUAL である理由**: Renderer 内部の計装のみで視覚差分なし（上記「NON_VISUAL の理由」セクションを転記）
- **証跡の主ソース**: Vitest カバレッジレポート（JSON）のパス
- **テスト件数**: 実行されたテスト総数・PASS 数・FAIL 数
- **カバレッジ数値**:
  - `trackEvent.ts`: Statements / Branches / Functions / Lines（各パーセンテージ）
  - `SkillCreateWizard.tsx`: Statements / Branches / Functions / Lines（各パーセンテージ）
  - `CompleteStep.tsx`: Statements / Branches / Functions / Lines（各パーセンテージ）
- **計装ポイント確認結果**: 6 箇所の呼び出し確認結果（確認済み / 未確認）

### 2. `outputs/phase-11/discovered-issues.md`

- Phase 11 の実施中に発見した問題点を記録する
- 問題が 0 件であっても、「発見した問題なし」と明記したファイルを作成すること（ファイルを省略しない）
- 発見した問題がある場合は、問題内容・影響範囲・推奨対処を記載する

### screenshot-plan.json について

**NON_VISUAL タスクのため、`screenshot-plan.json` は作成しない。** スクリーンショットによる証跡取得は本タスクの対象外である。

---

## 完了条件

以下の条件が全て満たされた場合に Phase 11 を完了とみなし、Phase 12 へ進む。

1. `pnpm --filter @repo/desktop test:coverage` の実行が完了し、カバレッジレポートが生成されている
2. `trackEvent.ts` のカバレッジが 100% であることが確認されている（AC-7 達成）
3. `SkillCreateWizard.tsx` のカバレッジが 90% 以上であることが確認されている（AC-8 達成）
4. `CompleteStep.tsx` のカバレッジが 90% 以上であることが確認されている（AC-9 達成）
5. 6 箇所の計装ポイントに対する mock 呼び出し確認が完了している
6. `outputs/phase-11/manual-test-result.md` が作成されている
7. `outputs/phase-11/discovered-issues.md` が作成されている（0 件でも作成必須）
