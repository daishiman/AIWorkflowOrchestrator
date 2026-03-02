# Phase 9: 品質保証 — SkillAnalysisView

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| タスクID   | TASK-10A-B                         |
| Phase      | 9（品質保証）                      |
| 前Phase    | Phase 8（リファクタリング）        |
| 次Phase    | Phase 10（最終レビュー）           |
| 依存成果物 | Phase 8 リファクタリング済みコード |

## 目的

リファクタリング後の SkillAnalysisView および関連コンポーネントに対して、ESLint・TypeScript 型チェック・Prettier・テスト全実行・セキュリティチェック・アクセシビリティチェックを実行し、品質基準への適合を検証する。

## 実行タスク

- Lint実行: ESLintを実行して警告/エラーを解消する
- 型検証: TypeScript strictモードで型エラーを解消する
- 形式検証: Prettier差分を解消して整形を統一する
- テスト実行: 全テストとカバレッジ結果を確認する
- セキュリティ検証: IPC入力検証とエラーサニタイズを確認する
- アクセシビリティ検証: ARIA/キーボード/コントラストを確認する

## 参照資料

### プロジェクトルール

- `.claude/rules/02-code-quality.md` — 型安全、エラーハンドリング、カバレッジ基準
- `.claude/rules/04-electron-security.md` — IPC セキュリティ原則
- `.claude/rules/06-known-pitfalls.md` — P42（3段バリデーション）、P39（happy-dom 環境）

### システム仕様（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — エラーハンドリング基準
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — IPC セキュリティ
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — 品質基準

### 前 Phase 成果物

- `phase-5-implementation.md` — 実装仕様とテスト対象範囲
- `outputs/phase-8/refactoring-log.md` — リファクタリング記録

## 実行手順

### Task 1: ESLint 実行

```bash
cd apps/desktop && pnpm lint
```

**チェック対象ルール:**

| ルール                               | 確認内容                                  |
| ------------------------------------ | ----------------------------------------- |
| `no-unused-vars`                     | 未使用の import・変数が存在しない         |
| `@typescript-eslint/no-explicit-any` | `any` 型が使用されていない                |
| `react-hooks/rules-of-hooks`         | Hook がトップレベルでのみ呼び出されている |
| `react-hooks/exhaustive-deps`        | useEffect 依存配列が正確に指定されている  |

**合格基準:** エラー 0 件、警告 0 件（対象ファイルに限定）

**不合格時の対応:**

- エラーは修正必須
- 警告は修正して再実行
- `@ts-ignore` / `@ts-expect-error` を追加する場合は理由コメント必須

### Task 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

**チェック項目:**

| 項目               | 基準                                       |
| ------------------ | ------------------------------------------ |
| `strict: true`     | 厳密モードで型チェックが通過               |
| 型アサーション     | `as` キャストが存在しない                  |
| `@ts-ignore`       | 使用していない（使用時は理由コメント必須） |
| `@ts-expect-error` | 使用していない（使用時は理由コメント必須） |
| Props 型           | P46 準拠（Omit で衝突回避）                |

**合格基準:** エラー 0 件

### Task 3: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm format:check
```

**合格基準:** フォーマット差分 0 件

**不合格時の対応:**

```bash
cd apps/desktop && pnpm format
```

### Task 4: テスト全実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

**テスト品質基準:**

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**テスト環境に関する注意:**

- happy-dom 環境では `userEvent` は使用禁止（P39 準拠）。`fireEvent` を使用する
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- テスト実行は `apps/desktop` ディレクトリから行う（P40 準拠）

**合格基準:**

- 全テスト PASS
- カバレッジが最低基準を満たす

### Task 5: セキュリティチェック

#### 5-1: IPC 入力バリデーション確認

SkillAnalysisView が呼び出す IPC チャンネルのハンドラ側で P42 準拠の 3 段バリデーションが実装されていることを確認する。

| IPC チャンネル   | バリデーション確認項目                          |
| ---------------- | ----------------------------------------------- |
| `skill:analyze`  | skillName: 型チェック → 空文字列 → トリム空文列 |
| `skill:improve`  | skillName: 型チェック → 空文字列 → トリム空文列 |
| `skill:optimize` | skillName: 型チェック → 空文字列 → トリム空文列 |

```typescript
// 3段バリデーションの確認パターン
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

#### 5-2: エラーサニタイズ確認

- IPC エラーレスポンスに内部スタックトレースが含まれていないこと
- API キー・パスワード・PII がログに出力されないこと

#### 5-3: XSS 防止確認

- ユーザー入力がダイレクトに `dangerouslySetInnerHTML` に渡されていないこと
- スキル名・分析結果テキストが React の自動エスケープで保護されていること

### Task 6: アクセシビリティチェック

| チェック項目             | 基準                                                      |
| ------------------------ | --------------------------------------------------------- |
| ARIA 属性                | ボタン・リスト・パネルに適切な ARIA ラベル付与            |
| キーボードナビゲーション | Tab キーで全インタラクティブ要素にアクセス可能            |
| コントラスト比           | 通常テキスト 4.5:1 以上、大テキスト/UI部品 3:1 以上       |
| スクリーンリーダー対応   | 分析状態（分析中/完了/エラー）が `aria-live` で通知される |
| フォーカス管理           | モーダル表示時に初回フォーカスが閉じるボタンへ移動する    |

**確認方法:**

- コントラスト比: Apple HIG システムカラー使用で基準達成を確認
- ARIA: `role`, `aria-label`, `aria-live`, `aria-busy` の付与状況を確認
- キーボード: Tab / Enter / Escape キーで操作可能か確認

## 統合テスト連携

品質保証フェーズでの修正は、コードの動作を変えない範囲（フォーマット・lint 修正・ARIA 属性追加）に限定する。動作変更を伴う修正が必要な場合は Phase 5 に戻る。

## 多角的チェック観点

| 観点             | 確認内容                                                    |
| ---------------- | ----------------------------------------------------------- |
| Lint             | ESLint エラー 0 / 警告 0                                    |
| 型安全           | TypeScript strict mode 通過、as/any/@ts-ignore 不使用       |
| フォーマット     | Prettier 差分 0                                             |
| テスト           | 全 PASS、カバレッジ基準達成                                 |
| セキュリティ     | P42 準拠 3 段バリデーション、エラーサニタイズ、XSS 防止     |
| アクセシビリティ | WCAG 2.1 AA 準拠、ARIA 属性、キーボードナビ、コントラスト比 |

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] `cd apps/desktop && pnpm lint` がエラー 0 / 警告 0 で通過
- [ ] `cd apps/desktop && pnpm typecheck` がエラー 0 で通過
- [ ] `cd apps/desktop && pnpm format:check` がフォーマット差分 0 で通過
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/skill/` が全 PASS
- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] IPC ハンドラで P42 準拠 3 段バリデーションが実装されている
- [ ] エラーレスポンスに内部情報が漏洩していない
- [ ] XSS 脆弱性が存在しない
- [ ] ARIA 属性が対象要素へ漏れなく付与されている
- [ ] キーボードナビゲーションで全操作が可能
- [ ] コントラスト比が WCAG 2.1 AA 基準を満たしている
- [ ] `quality-report.md` に全チェック結果が記録されている

## 次の Phase

Phase 10（最終レビュー）へ進む。
