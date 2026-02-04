# 受け入れ基準: TASK-FIX-1-1-TYPE-ALIGNMENT

## 機能要件の受け入れ基準

### FR-01: SkillStreamMessageが単一定義

| 基準ID | 検証方法                                                  | 期待結果                    |
| ------ | --------------------------------------------------------- | --------------------------- |
| AC-01a | `grep -r "SkillStreamMessage" packages/shared/src/types/` | skill.tsのみにヒット        |
| AC-01b | skill-execution.ts内のSkillStreamMessage定義を確認        | 定義が存在しない            |
| AC-01c | skill.tsのSkillStreamMessage構造を確認                    | Discriminated Union形式維持 |

### FR-02: SkillExecutionRequestが単一定義

| 基準ID | 検証方法                                                     | 期待結果               |
| ------ | ------------------------------------------------------------ | ---------------------- |
| AC-02a | `grep -r "SkillExecutionRequest" packages/shared/src/types/` | skill.tsのみにヒット   |
| AC-02b | skill.tsのSkillExecutionRequest構造を確認                    | 必要フィールド全て含む |

### FR-03: 呼び出し元が正しいimportを使用

| 基準ID | 検証方法                                           | 期待結果             |
| ------ | -------------------------------------------------- | -------------------- |
| AC-03a | `grep -rn "from.*skill-execution" apps/ packages/` | 0件                  |
| AC-03b | すべてのimportパスを確認                           | @repo/shared経由のみ |

### FR-04: 仕様書準拠の型構造

| 基準ID | 検証方法                         | 期待結果                                                 |
| ------ | -------------------------------- | -------------------------------------------------------- |
| AC-04a | specification.md §5.1との比較    | 型定義が一致                                             |
| AC-04b | SkillStreamMessageTypeの値を確認 | 5種類（assistant, tool_use, tool_result, status, error） |

---

## 非機能要件の受け入れ基準

### NFR-01: TypeScript型安全性

| 基準ID | 検証方法         | 期待結果 |
| ------ | ---------------- | -------- |
| AC-N01 | `pnpm typecheck` | エラー0  |

### NFR-02: 既存テストの維持

| 基準ID | 検証方法    | 期待結果     |
| ------ | ----------- | ------------ |
| AC-N02 | `pnpm test` | 全テストPASS |

### NFR-03: 後方互換性

| 基準ID | 検証方法                   | 期待結果             |
| ------ | -------------------------- | -------------------- |
| AC-N03 | デスクトップアプリ起動確認 | ランタイムエラーなし |

### NFR-04: コード品質

| 基準ID  | 検証方法            | 期待結果 |
| ------- | ------------------- | -------- |
| AC-N04a | `pnpm lint`         | エラー0  |
| AC-N04b | `pnpm format:check` | 差分0    |

---

## 統合テスト受け入れ基準

| 基準ID | 検証内容                                 | 期待結果         |
| ------ | ---------------------------------------- | ---------------- |
| AC-I01 | Main-Renderer間のSkillStreamMessage伝播  | 型エラーなし     |
| AC-I02 | skillSliceでのSkillExecutionStatus型使用 | 型エラーなし     |
| AC-I03 | IPCチャンネルでの型整合性                | シリアライズ正常 |
