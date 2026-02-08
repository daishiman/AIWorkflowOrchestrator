# 要件定義書

## タスク情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-FIX-1-2                                            |
| タスク名     | SkillExecutor 型定義クリーンアップ                      |
| 作成日       | 2026-02-07                                              |
| Phase        | 1 - 要件定義                                            |
| 対象ファイル | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| 正本         | `packages/shared/src/types/skill.ts`                    |

---

## 1. 背景と目的

### 1.1 背景

`SkillExecutor.ts` 内に、`@repo/shared/types/skill.ts`（正本）と重複する型定義が8個存在する。これらの重複は以下の問題を引き起こす：

1. **保守性の低下**: 型変更時に複数箇所の修正が必要
2. **不整合リスク**: 正本と異なる型定義が発生（実際に3つの差異を確認）
3. **コードの可読性低下**: 同一概念に対する複数の型定義が混在

### 1.2 目的

SkillExecutor.ts のローカル型定義を正本（`@repo/shared`）に統合し、型の一元管理を実現する。

---

## 2. 機能要件（FR: Functional Requirements）

### FR-01: 完全一致型の削除と import 置換

**説明**: 正本と完全に一致する5つの型定義を削除し、`@repo/shared` からの import に置換する。

**対象型**:
| 型名 | SkillExecutor.ts 行番号 | 正本との一致状態 |
|------|------------------------|-----------------|
| ExecutionState | L31-36 | 完全一致 |
| ExecutionInfo | L84-90 | 完全一致 |
| SkillExecutionErrorCode | L110-120 | 完全一致 |
| SkillExecutionError | L122-127 | 完全一致 |
| ExecutionContext | L129-137 | 完全一致 |

**受け入れ基準**: AC-1 参照

---

### FR-02: SkillExecutionRequest の差異解消

**説明**: SkillExecutor.ts の `SkillExecutionRequest`（L67-74）と正本の差異を解消する。

**差異の詳細**:

| プロパティ        | SkillExecutor.ts                     | 正本                        | 解決方針                                |
| ----------------- | ------------------------------------ | --------------------------- | --------------------------------------- |
| skillId/skillName | `skillId: string`                    | `skillName: string`         | 正本に `skillId` を追加（オプショナル） |
| timeout           | `timeout?: number`                   | なし                        | 正本に追加                              |
| sessionId         | `sessionId?: string`                 | なし                        | 正本に追加                              |
| retryConfig       | `retryConfig?: Partial<RetryConfig>` | なし                        | 正本に追加                              |
| workingDirectory  | なし                                 | `workingDirectory?: string` | SkillExecutor で使用開始検討            |

**受け入れ基準**: AC-2 参照

---

### FR-03: SkillExecutionResponse の差異解消

**説明**: SkillExecutor.ts の `SkillExecutionResponse`（L77-81）と正本の差異を解消する。

**差異の詳細**:

| プロパティ | SkillExecutor.ts              | 正本             | 解決方針                                               |
| ---------- | ----------------------------- | ---------------- | ------------------------------------------------------ |
| error      | `error?: SkillExecutionError` | `error?: string` | 正本を拡張（union型: `string \| SkillExecutionError`） |

**受け入れ基準**: AC-2 参照

---

### FR-04: SkillStreamMessage の差異解消

**説明**: SkillExecutor.ts の `SkillStreamMessage`（L100-108）と正本の差異を解消する。

**差異の詳細**:

| 観点         | SkillExecutor.ts                                                  | 正本                                                            |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| 設計パターン | 単純オブジェクト型                                                | Discriminated Union                                             |
| type         | `SkillStreamMessageType` (text, tool_use, error, complete, retry) | 5種類の専用型 (assistant, tool_use, tool_result, status, error) |
| content      | `content: string`                                                 | 型別に異なる content 型                                         |
| id           | `id: string`                                                      | なし                                                            |
| isComplete   | `isComplete: boolean`                                             | なし                                                            |

**解決方針**:

- SkillExecutor 専用の型として維持（`SkillExecutorStreamMessage` にリネーム）
- 必要に応じて正本の `SkillStreamMessage` に変換するアダプター関数を実装

**受け入れ基準**: AC-2 参照

---

### FR-05: import 文の整理

**説明**: 不要になったローカル型定義の削除に伴い、import 文を整理する。

**要件**:

1. `@repo/shared` からの型 import を追加
2. 未使用の import を削除
3. import 順序を規約に従って整理（外部 → 内部 → 型）

**受け入れ基準**: AC-3 参照

---

## 3. 非機能要件（NFR: Non-Functional Requirements）

### NFR-01: 後方互換性の維持

**説明**: 既存の SkillExecutor の公開 API（`execute`, `abort`, `getActiveExecutions`, `getExecutionStatus`）の動作を変更しない。

**検証方法**: 既存テストが全て PASS することを確認

---

### NFR-02: 型安全性の維持

**説明**: TypeScript の strict モード下でコンパイルエラーが発生しないこと。

**検証方法**: `pnpm typecheck` が成功すること

---

### NFR-03: コード品質の維持

**説明**: ESLint ルールに違反しないこと。

**検証方法**: `pnpm lint` が成功すること

---

### NFR-04: テストカバレッジの維持

**説明**: 型変更によりテストカバレッジが低下しないこと。

**検証基準**:

- Line Coverage: 80% 以上
- Branch Coverage: 60% 以上
- Function Coverage: 80% 以上

---

### NFR-05: 影響範囲の最小化

**説明**: 変更は SkillExecutor.ts と関連する型定義ファイルのみに限定する。

**制約**:

- IPC チャンネル定義の変更は行わない
- Renderer 側のコード変更は最小限に抑える
- テストコードは型変更に追従する形で更新

---

## 4. スコープ

### 4.1 スコープ内

1. SkillExecutor.ts 内の重複型定義の削除/統合
2. `@repo/shared/types/skill.ts` の必要に応じた拡張
3. 型変更に伴うテストコードの更新
4. import 文の整理

### 4.2 スコープ外

1. SkillExecutor のビジネスロジックの変更
2. 新機能の追加
3. パフォーマンス最適化
4. IPC 通信仕様の変更
5. UI/UX の変更

---

## 5. 重複型定義サマリー

| #   | 型名                    | 行番号   | 差異状態   | 対応方針      |
| --- | ----------------------- | -------- | ---------- | ------------- |
| 1   | ExecutionState          | L31-36   | 完全一致   | 削除 + import |
| 2   | SkillExecutionRequest   | L67-74   | 差異あり   | 正本拡張      |
| 3   | SkillExecutionResponse  | L77-81   | 差異あり   | 正本拡張      |
| 4   | ExecutionInfo           | L84-90   | 完全一致   | 削除 + import |
| 5   | SkillStreamMessage      | L100-108 | 大きな差異 | リネーム維持  |
| 6   | SkillExecutionErrorCode | L110-120 | 完全一致   | 削除 + import |
| 7   | SkillExecutionError     | L122-127 | 完全一致   | 削除 + import |
| 8   | ExecutionContext        | L129-137 | 完全一致   | 削除 + import |

---

## 6. 依存関係

### 6.1 前提条件

- `@repo/shared` パッケージがビルド可能な状態であること
- 既存テストが全て PASS すること

### 6.2 影響を受けるファイル

| ファイル                                                               | 影響内容                   |
| ---------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | 型定義削除、import 追加    |
| `packages/shared/src/types/skill.ts`                                   | 型定義拡張（FR-02, FR-03） |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` | 型変更に追従               |

---

## 7. リスク評価

| リスク                           | 発生確率 | 影響度 | 対策                               |
| -------------------------------- | -------- | ------ | ---------------------------------- |
| 型変更による既存コードの破壊     | 低       | 高     | 後方互換性を維持する拡張のみ実施   |
| import パス解決の失敗            | 低       | 中     | 事前に `@repo/shared` のビルド確認 |
| Discriminated Union への移行困難 | 中       | 中     | SkillExecutor 専用型として維持     |

---

## 8. 成功指標

1. 重複型定義が5つ削除されること
2. `pnpm typecheck` が成功すること
3. `pnpm lint` が成功すること
4. 既存テストが全て PASS すること
5. 新規の型不整合が発生しないこと
