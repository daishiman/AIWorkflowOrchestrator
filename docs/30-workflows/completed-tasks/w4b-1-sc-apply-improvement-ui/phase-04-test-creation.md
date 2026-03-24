# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 4                                          |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI              |
| 作成日   | 2026-03-23                                 |
| 前提     | Phase 3 完了（PASS または MINOR 対応済み） |

## 目的

Phase 2 の設計に基づき、TDD の Red フェーズとしてテストケースを先行作成する。IPC ハンドラテスト・Renderer コンポーネントテストの両方を作成する。

## 実行タスク

### Task 1: IPC ハンドラテスト作成

**ファイル**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts`

既存テストファイル `skillCreatorHandlers.runtime.test.ts` のパターンを参照して作成する。

#### テストケース一覧

| ID    | テスト名                                      | 内容                                                                              |
| ----- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| H-1   | 正常系: 改善提案の適用成功                    | 有効な skillName + suggestions で applyImprovement が呼ばれ、成功レスポンスが返る |
| H-2   | バリデーション: skillName 未指定              | `args.skillName` が undefined の場合、バリデーションエラーが返る                  |
| H-3   | バリデーション: skillName 空文字列            | `args.skillName` が `""` の場合、バリデーションエラーが返る                       |
| H-4   | バリデーション: skillName スペースのみ        | `args.skillName` が `"   "` の場合、バリデーションエラーが返る（P42）             |
| H-5   | バリデーション: suggestions 非配列            | `args.suggestions` が文字列の場合、バリデーションエラーが返る                     |
| H-6   | バリデーション: suggestions 空配列            | `args.suggestions` が `[]` の場合、バリデーションエラーが返る                     |
| H-7   | バリデーション: suggestion 要素の構造不正     | `section` が欠落した suggestion でバリデーションエラーが返る                      |
| H-8   | runtimeService 未注入                         | runtimeSkillCreatorService が undefined の場合、利用不可エラーが返る              |
| H-9   | applyImprovement 例外                         | facade.applyImprovement が例外を投げた場合、sanitize されたエラーが返る           |
| H-10  | 送信元検証失敗                                | validateIpcSender が失敗した場合、例外が送出される                                |
| H-11  | unregister 確認                               | unregisterRuntimeSkillCreatorHandlers でハンドラが解除される                      |
| H-11a | バリデーション: suggestions 配列が 101 件以上 | `args.suggestions` が 101 件以上の場合、バリデーションエラーが返る（DoS 防御）    |

### Task 2: Renderer コンポーネントテスト作成

#### 2-1. ImprovementProposalItem テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalItem.test.tsx`

| ID  | テスト名                   | 内容                                                                                   |
| --- | -------------------------- | -------------------------------------------------------------------------------------- |
| C-1 | 正常レンダリング           | section/before/after/reason が全て表示される                                           |
| C-2 | チェックボックス選択状態   | isSelected=true でチェック済みになる                                                   |
| C-3 | チェックボックス未選択状態 | isSelected=false で未チェックになる                                                    |
| C-4 | トグルコールバック         | チェックボックス操作で onToggle(index) が呼ばれる                                      |
| C-5 | diff スタイル適用          | before に赤系、after に緑系のスタイルクラスが適用される（P47 準拠: diffStyles import） |
| C-6 | 長文テキストの表示         | before/after が長文でもレイアウトが崩れない                                            |
| C-7 | アクセシビリティ           | チェックボックスに aria-label が付与されている                                         |

#### 2-2. ImprovementProposalList テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalList.test.tsx`

| ID  | テスト名         | 内容                                                   |
| --- | ---------------- | ------------------------------------------------------ |
| L-1 | 空リスト表示     | suggestions=[] で「提案なし」メッセージが表示される    |
| L-2 | 複数提案の表示   | 3件の suggestions が全てレンダリングされる             |
| L-3 | 全選択ボタン     | 「全て選択」ボタン押下で onSelectAll が呼ばれる        |
| L-4 | 全解除ボタン     | 「全て解除」ボタン押下で onDeselectAll が呼ばれる      |
| L-5 | 適用ボタン: 有効 | selectedCount > 0 で「適用」ボタンが有効               |
| L-6 | 適用ボタン: 無効 | selectedCount === 0 で「適用」ボタンが disabled        |
| L-7 | 適用中の状態     | isApplying=true でボタンが disabled + ローディング表示 |
| L-8 | 適用ボタン押下   | 「適用」ボタン押下で onApply が呼ばれる                |

#### 2-3. ImprovementApplyResult テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/ImprovementApplyResult.test.tsx`

| ID  | テスト名         | 内容                                                          |
| --- | ---------------- | ------------------------------------------------------------- |
| R-1 | 全件適用成功     | applied=3, skipped=0 で成功メッセージが表示される             |
| R-2 | 一部スキップ     | applied=2, skipped=1 でスキップ理由が表示される               |
| R-3 | エラー表示       | errors 配列が空でない場合、エラーメッセージが赤色で表示される |
| R-4 | 閉じるボタン     | 「閉じる」ボタン押下で onClose が呼ばれる                     |
| R-5 | スキップ詳細表示 | skippedDetails の section + reason がリスト表示される         |

#### 2-4. ImprovementProposalPanel テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx`

| ID  | テスト名                       | 内容                                                                         |
| --- | ------------------------------ | ---------------------------------------------------------------------------- |
| P-1 | 初期レンダリング               | suggestions が ImprovementProposalList に渡され、全提案が表示される          |
| P-2 | 選択トグル                     | チェックボックス操作で selectedIndices が更新される                          |
| P-3 | 全選択・全解除                 | 「全て選択」「全て解除」ボタンで selectedIndices が全件/0件に切り替わる      |
| P-4 | 適用成功時の結果表示           | 選択→適用で IPC 呼び出し後、ImprovementApplyResult が表示される              |
| P-5 | 適用エラー時のエラーメッセージ | IPC 呼び出しが失敗した場合、エラーメッセージが表示され再試行可能な状態に戻る |

### Task 3: テスト実行用モックデータ

```typescript
// テスト共通のモックデータファクトリ
export function createMockSuggestion(
  overrides?: Partial<RuntimeSkillCreatorImproveSuggestion>,
): RuntimeSkillCreatorImproveSuggestion {
  return {
    section: "## 目的",
    before: "このスキルは処理を行います。",
    after: "このスキルは入力テキストを解析し、構造化データに変換します。",
    reason: "目的を具体的に記述することで、利用者の理解度が向上する",
    ...overrides,
  };
}

export function createMockApplyResult(
  overrides?: Partial<ApplyImprovementResult>,
): ApplyImprovementResult {
  return {
    applied: 2,
    skipped: 1,
    skippedDetails: [
      { section: "## 制約事項", reason: "before text not found in SKILL.md" },
    ],
    errors: [],
    ...overrides,
  };
}
```

## 参照資料

- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`（既存テストパターン）
- `apps/desktop/src/renderer/components/skill/__tests__/SuggestionList.test.tsx`（既存 UI テストパターン）
- `.claude/rules/02-code-quality.md`（TDD / カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md` P39（happy-dom 環境: fireEvent 使用）
- `.claude/rules/06-known-pitfalls.md` P40（テスト実行ディレクトリ依存）
- `.claude/rules/06-known-pitfalls.md` P47（CSS 変数テスト戦略）

## 成果物

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalItem.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalList.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementApplyResult.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx`

## 統合テスト連携

本 Phase（テスト作成）では Phase 6 統合テスト（I-1 ~ I-5）の基盤として以下を設計:

- IPC ハンドラのモックパターン確立（creatorHandlers テスト）
- Renderer コンポーネントのモックデータファクトリ確立（createMockSuggestion / createMockApplyResult）
- happy-dom 環境 + fireEvent パターンの確認（P39 準拠）

## 多角的チェック観点

| 観点         | 適用判断                 | 仕様参照先                                          |
| ------------ | ------------------------ | --------------------------------------------------- |
| セキュリティ | バリデーションテスト網羅 | `aiworkflow-requirements: security-electron-ipc.md` |
| UI/UX        | aria-label テスト        | `aiworkflow-requirements: ui-ux-*.md`               |
| IPC通信      | ハンドラ登録/解除テスト  | `aiworkflow-requirements: api-*.md`                 |

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. IPC ハンドラテスト作成（Task 1: H-1 ~ H-11a）
2. ImprovementProposalItem テスト作成（Task 2-1: C-1 ~ C-7）
3. ImprovementProposalList テスト作成（Task 2-2: L-1 ~ L-8）
4. ImprovementApplyResult テスト作成（Task 2-3: R-1 ~ R-5）
5. ImprovementProposalPanel テスト作成（Task 2-4: P-1 ~ P-5）
6. モックデータファクトリ作成（Task 3）

## タスク100%実行確認

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 完了条件

- [ ] IPC ハンドラテスト（H-1 ~ H-11）が作成されている
- [ ] suggestions 最大長バリデーションテスト（H-11a）が作成されている
- [ ] ImprovementProposalItem テスト（C-1 ~ C-7）が作成されている
- [ ] ImprovementProposalList テスト（L-1 ~ L-8）が作成されている
- [ ] ImprovementApplyResult テスト（R-1 ~ R-5）が作成されている
- [ ] ImprovementProposalPanel テスト（P-1 ~ P-5）が作成されている
- [ ] テスト実行時に全件 FAIL する（Red フェーズ: 実装が未完了のため）
- [ ] テストが happy-dom 環境で `fireEvent` を使用している（P39 準拠）
- [ ] `cd apps/desktop && pnpm vitest run` で実行可能（P40 準拠）

## 次の Phase

Phase 5: 実装
