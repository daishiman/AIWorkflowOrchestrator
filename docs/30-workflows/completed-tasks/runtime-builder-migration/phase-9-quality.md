# Phase 9: 品質検証

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase    | 9（品質検証）                    |
| 前提     | Phase 8 リファクタリング 完了    |
| 作成日   | 2026-03-23                       |

---

## 参照資料

| 参照資料                 | パス                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/runtime-builder-migration/phase-8-refactoring.md` |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                   |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                 |

---

## 1. 目的

Lint・型チェック・テスト・セキュリティの全観点で品質基準を充足していることを確認する。Phase 9 を通過した成果物のみ Phase 10 最終レビューへ進む。

---

## 2. 品質チェックリスト

### 2.1 Lint チェック

```bash
pnpm lint
```

| 確認項目                      | 期待結果 |
| ----------------------------- | -------- |
| ESLint エラー 0件             | PASS     |
| Prettier フォーマット違反 0件 | PASS     |
| 未使用 import 0件             | PASS     |

失敗した場合は `pnpm lint --fix` で自動修正を試みる。自動修正できない場合は手動で対応する。

---

### 2.2 型チェック

```bash
pnpm typecheck
```

| 確認項目                                     | 期待結果 |
| -------------------------------------------- | -------- |
| TypeScript コンパイルエラー 0件              | PASS     |
| `any` 型の使用 0件（新規追加分）             | PASS     |
| `@ts-ignore` / `@ts-expect-error` の使用なし | PASS     |

---

### 2.3 テスト実行

#### 対象テスト（単体）

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

| 確認項目                                                        | 期待結果       |
| --------------------------------------------------------------- | -------------- |
| テストケース数                                                  | 12件以上       |
| 全テスト PASS                                                   | PASS           |
| surfaceType 3値（chat-edit / runtime / skill-docs）のカバレッジ | 全値テスト済み |
| 未知の surfaceType によるエラー throw テスト                    | PASS           |

#### 全テスト（回帰確認）

```bash
cd apps/desktop && pnpm vitest run
```

| 確認項目                         | 期待結果 |
| -------------------------------- | -------- |
| 既存テストの回帰なし             | PASS     |
| 新規テストの追加による FAIL なし | PASS     |

---

### 2.4 セキュリティチェック

#### API key 非含有確認（P55 準拠）

```bash
grep -rn "apiKey\|api_key\|Bearer\|sk-" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

**期待結果**: 0件（ヒットなし）

ヒットした場合はコンテキストを確認し、コメントや文字列リテラルへの埋め込みでないか精査する。テスト用フィクスチャ内の `sk-dummy` 等は除外する。

#### TerminalHandoffBundle IPC 非通過確認（NFR-3 準拠）

```bash
grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/
```

**期待結果**: 0件（ヒットなし）

`TerminalHandoffBundle` は Main Process 内部型であり、IPC を経由して Renderer に渡してはならない。

---

### 2.5 P62 準拠チェック（DEFAULT_CONFIG fallback 禁止）

```bash
grep -rn "DEFAULT_CONFIG\|defaultConfig" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

**期待結果**: 0件（ヒットなし）

未知の `surfaceType` が渡された場合はデフォルト値へのフォールバックではなく、エラーを throw する実装になっていることを確認する。

---

### 2.6 旧メソッド @deprecated チェック

#### runtime/TerminalHandoffBuilder.ts

```bash
grep -n "@deprecated" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

**期待結果**: 3件（`build`, `buildForAgentExecution`, `buildForSkillExecution`）

```
<行番号>:   * @deprecated buildForSurface() を使用してください
<行番号>:   * @deprecated buildForSurface() を使用してください
<行番号>:   * @deprecated buildForSurface() を使用してください
```

#### chat-edit/TerminalHandoffBuilder.ts

```bash
grep -n "@deprecated" \
  apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts
```

**期待結果**: 1件（`build`）

```
<行番号>:   * @deprecated buildForSurface() を使用してください
```

---

## 3. チェックリスト集計

| #   | チェック項目                             | コマンド                   | 期待結果         | 結果 |
| --- | ---------------------------------------- | -------------------------- | ---------------- | ---- |
| 1   | Lint チェック                            | `pnpm lint`                | エラー 0件       | [ ]  |
| 2   | 型チェック                               | `pnpm typecheck`           | エラー 0件       | [ ]  |
| 3   | TerminalHandoffBuilder 単体テスト        | vitest run (対象ファイル)  | 12件以上 全 PASS | [ ]  |
| 4   | 全テスト回帰確認                         | vitest run (全件)          | 回帰なし 全 PASS | [ ]  |
| 5   | API key 非含有確認                       | grep apiKey 等             | 0件              | [ ]  |
| 6   | TerminalHandoffBundle IPC 非通過確認     | grep renderer              | 0件              | [ ]  |
| 7   | P62 準拠（DEFAULT_CONFIG fallback なし） | grep DEFAULT_CONFIG        | 0件              | [ ]  |
| 8   | runtime @deprecated 3件確認              | grep @deprecated (runtime) | 3件              | [ ]  |
| 9   | chat-edit @deprecated 1件確認            | grep @deprecated (chat)    | 1件              | [ ]  |

---

## 4. 完了条件

上記チェックリスト全9項目が期待結果を満たした場合に Phase 9 完了とする。

1件でも期待結果を満たさない場合は、該当するチェック項目の修正を行ってから再確認する。

---

---

## 統合テスト連携

Phase 6 の統合テスト（C-1〜C-3, D-1）および Phase 4 の単体テスト（16ケース）が全て PASS することを確認する。

---

## 多角的チェック観点

| 観点                 | 確認内容                                                      | 対応        |
| -------------------- | ------------------------------------------------------------- | ----------- |
| セキュリティ         | API key が terminalCommand に漏洩していないか                 | Section 2.4 |
| アーキテクチャ整合性 | TerminalHandoffBundle が IPC 経由で Renderer に渡っていないか | Section 2.4 |
| 後方互換性           | @deprecated メソッドが正しい件数で存在するか                  | Section 2.6 |

---

## サブタスク管理

- [ ] Lint チェックを実行する（`pnpm lint`）
- [ ] 型チェックを実行する（`pnpm typecheck`）
- [ ] TerminalHandoffBuilder 単体テストを実行する（12件以上 PASS）
- [ ] 全テスト回帰確認を実行する
- [ ] API key 非含有確認を実行する
- [ ] TerminalHandoffBundle IPC 非通過確認を実行する
- [ ] P62 準拠チェックを実行する
- [ ] runtime @deprecated 3件確認を実行する
- [ ] chat-edit @deprecated 1件確認を実行する

## 次 Phase

Phase 10（最終レビュー）へ進む。
