# Phase 10: 最終レビューゲート

**Task ID**: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001  
**Task Name**: スキルウィザード使用率計装（trackEvent / Wave 3）  
**Phase**: 10 - 最終レビューゲート  
**作成日**: 2026-04-11

---

## 目的

AC-1〜AC-9 の充足確認と W3-seq-04 の完了判定を行う。本フェーズを通過しない限り、Phase 11 以降には進まない。

---

## タスク 10-1: AC 充足確認チェックリスト

以下の各 AC について、実装コードとテスト結果を照合し、充足状況を確認すること。

| AC番号 | 内容                                                                                | 確認方法                                                                      | 判定                |
| ------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------- |
| AC-1   | `trackEvent` に `skill_wizard_open` イベントが型安全に定義・呼び出しできる          | `trackEvent.ts` の型定義を確認し、TypeScript コンパイルエラーがないことを確認 | [ ] PASS / [ ] FAIL |
| AC-2   | `trackEvent` に `skill_wizard_step_complete` イベントが型安全に定義・呼び出しできる | `trackEvent.ts` の型定義を確認し、TypeScript コンパイルエラーがないことを確認 | [ ] PASS / [ ] FAIL |
| AC-3   | `trackEvent` に `skill_wizard_next_action` イベントが型安全に定義・呼び出しできる   | `trackEvent.ts` の型定義を確認し、TypeScript コンパイルエラーがないことを確認 | [ ] PASS / [ ] FAIL |
| AC-4   | `trackEvent` に `skill_wizard_abandon` イベントが型安全に定義・呼び出しできる       | `trackEvent.ts` の型定義を確認し、TypeScript コンパイルエラーがないことを確認 | [ ] PASS / [ ] FAIL |
| AC-5   | `SkillCreateWizard.tsx` の 5 つの計装ポイントでイベントが正しく発火する             | テストの `vi.spyOn` 呼び出し検証結果を確認                                    | [ ] PASS / [ ] FAIL |
| AC-6   | `CompleteStep.tsx` で `skill_wizard_next_action` が選択時に発火する                 | `CompleteStep.tsx` のテスト結果を確認                                         | [ ] PASS / [ ] FAIL |
| AC-7   | `trackEvent.ts` のスタブの全分岐でテストカバレッジ 100% を達成する                  | `pnpm --filter @repo/desktop test:coverage` の出力を確認                      | [ ] PASS / [ ] FAIL |
| AC-8   | `SkillCreateWizard.tsx` のテストカバレッジが 90% 以上を維持する                     | カバレッジレポートの `SkillCreateWizard.tsx` 行を確認                         | [ ] PASS / [ ] FAIL |
| AC-9   | `CompleteStep.tsx` のテストカバレッジが 90% 以上を維持する                          | カバレッジレポートの `CompleteStep.tsx` 行を確認                              | [ ] PASS / [ ] FAIL |

**全 AC が PASS であること** が、本フェーズを PASS 判定とするための必要条件である。

---

## タスク 10-2: コードレビュー観点

以下の 4 つの観点でコードを精査すること。

### 観点 1: `trackEvent.ts` の型定義が既存パターンと整合しているか

- `skill_wizard_open` / `skill_wizard_step_complete` / `skill_wizard_next_action` / `skill_wizard_abandon` の 4 イベントが、既存の `trackEvent.ts` 内のイベント型定義パターン（Union Type または Discriminated Union）と同一の形式で定義されているか確認する
- 新規イベント型のプロパティ名・型が既存のものと命名規則・型の粒度において統一されているか確認する
- 型定義が `trackEvent.ts` のスタブ実装と対応しており、コンパイルエラーが発生しないか確認する

### 観点 2: `SkillCreateWizard.tsx` の計装コードが責務境界を守っているか

- 計装コード（`trackEvent` 呼び出し）が UI ロジック（state 管理・ステップ遷移）と混在していないか確認する
- 計装は副作用として局所化されており、コンポーネントの返り値やレンダリングに影響していないか確認する
- 5 つの計装ポイントが、ウィザードの状態遷移イベント（open / step_complete / abandon など）に対応する正しい箇所に配置されているか確認する

### 観点 3: `CompleteStep.tsx` の計装が正しいコールバックに紐づいているか

- `skill_wizard_next_action` イベントの発火が、ユーザーのアクション選択（ボタンクリック等）のコールバック内で呼ばれているか確認する
- `trackEvent` の呼び出しが、コールバックの処理が完了する前に発火していないか（副作用の順序）を確認する
- アクション選択肢（例: 「スキルを実行する」「編集に戻る」「閉じる」）ごとに適切なペイロードが渡されているか確認する

### 観点 4: テストが計装ポイントを適切にカバーしているか

- `vi.spyOn` または `vi.fn()` を使用して `trackEvent` をモック化し、各計装ポイントに対して個別のテストケースが存在するか確認する
- 各テストケースで `expect(trackEvent).toHaveBeenCalledWith(...)` による引数検証が実施されているか確認する
- 境界条件（ウィザードを途中で閉じた場合の `abandon` イベント等）がテストでカバーされているか確認する

---

## タスク 10-3: 品質基準の最終確認

以下のコマンドを順に実行し、全て PASS であることを確認する。

### Step 1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- 期待結果: エラーなし（`Found 0 errors.` または同等の出力）
- 確認対象ファイル:
  - `apps/desktop/src/renderer/utils/trackEvent.ts`
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`

### Step 2: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

- 期待結果: エラーなし・警告なし（warning も 0 件が望ましい）
- 既存の lint 設定から外れた記述がないこと

### Step 3: テスト実行

```bash
pnpm --filter @repo/desktop test:run
```

- 期待結果: 全テスト PASS
- 失敗したテストが 1 件でも存在する場合は FAIL 判定

### Step 4: カバレッジ確認

```bash
pnpm --filter @repo/desktop test:coverage
```

- 期待結果:
  - `trackEvent.ts`: Statements / Branches / Functions / Lines すべて **100%**
  - `SkillCreateWizard.tsx`: Statements / Branches / Functions / Lines すべて **90% 以上**
  - `CompleteStep.tsx`: Statements / Branches / Functions / Lines すべて **90% 以上**

---

## レビュー判定基準

| 判定         | 条件                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **PASS**     | AC-1〜AC-9 が全て充足されており、コードレビュー観点で重大な問題がなく、品質基準の全コマンドが PASS である      |
| **MINOR**    | AC は全て充足されているが、コードレビューで軽微な改善点（命名・コメントの追加等）が指摘された。品質基準は PASS |
| **MAJOR**    | AC の充足に漏れがある、またはコードレビューで設計上の問題が見つかった。品質基準のいずれかが FAIL               |
| **CRITICAL** | TypeScript コンパイルエラーが発生している、またはテストが 50% 以上失敗している                                 |

---

## 戻り先決定基準テーブル

| 判定     | 戻り先 Phase                      | 対処内容                                                                          |
| -------- | --------------------------------- | --------------------------------------------------------------------------------- |
| PASS     | なし（Phase 11 へ進む）           | 通過                                                                              |
| MINOR    | Phase 10 内で修正                 | 指摘事項を修正し、再確認後に PASS または MINOR として記録する                     |
| MAJOR    | Phase 8（実装フェーズ）へ差し戻し | 実装の修正が必要。差し戻し理由を `outputs/phase-10/review-result.md` に記録する   |
| CRITICAL | Phase 7（設計フェーズ）へ差し戻し | 設計の見直しが必要。差し戻し理由を `outputs/phase-10/review-result.md` に記録する |

---

## MINOR 指摘事項の未タスク化ルール

MINOR 判定で通過した場合、指摘事項は以下のルールに従って処理する。

1. 本フェーズ内で即時修正可能なものは、修正後に再確認して記録する
2. 本フェーズ内で修正できない、または別タスクとして管理すべきものは、`outputs/phase-10/minor-issues.md` に記録し、Phase 12 の「未タスク検出レポート」（タスク 12-4）に転記する
3. MINOR 指摘事項は次の開発サイクルで対処するタスクとして GitHub Issue を作成する
4. MINOR 指摘事項を未対処のまま放置することは禁止する（放置する場合は MAJOR に格上げして差し戻す）

---

## 完了条件

以下のいずれかを満たした場合に Phase 10 を完了とみなし、Phase 11 へ進む。

- **PASS 判定**: AC-1〜AC-9 が全て充足され、コードレビューで重大な問題がなく、品質基準が全て PASS である
- **MINOR 判定**: PASS 判定と同等だが、軽微な指摘事項が存在する。指摘事項を `outputs/phase-10/minor-issues.md` に記録した上で Phase 11 へ進む

MAJOR または CRITICAL 判定の場合は、対応する Phase に差し戻し、問題を解決してから再度 Phase 10 を実施する。
