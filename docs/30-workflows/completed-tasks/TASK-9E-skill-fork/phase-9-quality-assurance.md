# Phase 9: 品質保証

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 9                                |
| タスクID  | TASK-9E-SKILL-FORK               |
| 機能名    | skill-fork（スキルフォーク機能） |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 8（リファクタリング）      |
| 次Phase   | Phase 10（最終レビューゲート）   |

## 目的

静的解析・型チェック・セキュリティ・テストの4観点から、定義された品質基準を全て満たすことを検証する。

## 背景

Phase 8 のリファクタリング完了後、品質ゲートとして Lint・型チェック・セキュリティ・テストカバレッジの全基準を検証する。特に IPC 機能であるため、セキュリティ検証は重点的に実施する。

## 実行タスク

### タスク1: Lint 検証

**目的**: ESLint ルール違反が 0 件であることを確認する。

**対象ファイル**:

- `apps/desktop/src/main/services/skill/SkillForker.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`（skill:fork 関連部分）
- `apps/desktop/src/preload/skill-api.ts`（fork 関連部分）
- `apps/desktop/src/preload/channels.ts`（SKILL_FORK チャネル）
- `packages/shared/src/types/skill-fork.ts`
- `packages/shared/src/types/index.ts`（re-export 部分）
- `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`

**確認コマンド**:

```bash
pnpm lint
```

**期待される成果物**: `outputs/phase-9/quality-verification.md`

### タスク2: 型チェック検証

**目的**: TypeScript の厳密型チェック（`strict: true`）でコンパイルエラーが 0 件であることを確認する。

**確認項目**:

- `any` 型の使用がないこと
- `@ts-ignore` / `@ts-expect-error` がないこと（使用時は理由コメント必須）
- SkillForkOptions/SkillForkResult/SkillForkMetadata の型定義が `packages/shared/src/types/skill-fork.ts` と `apps/desktop/src/preload/skill-api.ts` で一致していること（**P32 チェック**）
- 型アサーション（`as`）によるバリデーション回避がないこと

**確認コマンド**:

```bash
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit
```

**期待される成果物**: `outputs/phase-9/quality-verification.md`

### タスク3: セキュリティ検証

**目的**: IPC ハンドラーのセキュリティ要件が全て満たされていることを確認する。

**セキュリティチェックマトリクス**:

| チャンネル   | validateIpcSender | パス検証 | sanitizeError | IPC_CHANNELS定数 | 3段バリデーション(P42) | 引数名整合(P45) |
| ------------ | ----------------- | -------- | ------------- | ---------------- | ---------------------- | --------------- |
| `skill:fork` | ✅ 必須           | ✅ 必須  | ✅ 必須       | ✅ 必須          | ✅ 必須                | ✅ 必須         |

**パストラバーサル攻撃パターン検証**:

| #   | 攻撃パターン                             | テスト有無 |
| --- | ---------------------------------------- | ---------- |
| 1   | `../` を含むスキル名                     | 確認必須   |
| 2   | 絶対パス（`/etc/passwd`）                | 確認必須   |
| 3   | null バイト（`\0`）を含むスキル名        | 確認必須   |
| 4   | シンボリックリンクによるディレクトリ脱出 | 確認必須   |

**確認コマンド**:

```bash
# セキュリティ関連テストの実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts
```

**期待される成果物**: `outputs/phase-9/quality-verification.md`

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を達成していることを確認する。

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**確認コマンド**:

```bash
# SkillForker テスト実行（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillForker.test.ts --coverage

# IPC ハンドラーテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts --coverage

# 全テスト実行
cd apps/desktop && pnpm vitest run
```

**期待される成果物**: `outputs/phase-9/quality-verification.md`

### タスク5: 品質ゲート総合判定

**目的**: 全品質項目の結果を集約し、品質ゲートの通過可否を判定する。

**品質ゲートテーブル**:

| #   | 品質項目      | 基準                                  | 結果 | 判定 |
| --- | ------------- | ------------------------------------- | ---- | ---- |
| 1   | 機能検証      | SkillForker 全テスト成功              | -    | -    |
| 2   | コード品質    | ESLint エラー 0, TypeScript エラー 0  | -    | -    |
| 3   | テスト網羅性  | Line 80%+, Branch 60%+, Function 80%+ | -    | -    |
| 4   | セキュリティ  | 全セキュリティチェック項目 PASS       | -    | -    |
| 5   | IPC契約整合性 | ハンドラー・Preload・型定義が完全一致 | -    | -    |

**判定基準**:

- 全項目 PASS → 品質ゲート通過
- 1項目でも FAIL → 該当タスクへ戻り修正

**期待される成果物**: `outputs/phase-9/quality-verification.md`

## 参照資料

| 資料名             | パス                                                                                             | 説明                    |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----------------------- |
| Phase 5 成果物     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-5/implementation-summary.md` | 実装結果の基準点        |
| Phase 8 成果物     | `outputs/phase-8/`                                                                               | リファクタリング結果    |
| SkillForker        | `apps/desktop/src/main/services/skill/SkillForker.ts`                                            | 実装コード              |
| テスト             | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                             | テストコード            |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                     | skill:fork ハンドラー   |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                                          | IPC セキュリティ原則    |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                               | 型安全・テスト基準      |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                             | P32, P42, P44, P45 対策 |

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容                                   | 結果 |
| ------------ | ------------------------------------------ | ---- |
| 機能検証     | SkillForker + IPC ハンドラー全テスト成功   | -    |
| 型整合性     | shared/preload/main 間の型定義一致         | -    |
| セキュリティ | パストラバーサル防止・sender検証テスト成功 | -    |
| カバレッジ   | 全基準達成                                 | -    |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                    |
| ------------------ | -------- | ----------------------------------------------------------- |
| セキュリティ       | ✅       | validateIpcSender、パストラバーサル防止、入力バリデーション |
| アーキテクチャ     | ✅       | レイヤー依存方向の維持、SRP 準拠                            |
| API設計            | ✅       | IPC チャンネル契約整合性（P44/P45 対策）                    |
| エラーハンドリング | ✅       | sanitizeError 適用、内部情報非漏洩                          |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                          |
| -------------------- | ------------------------------------------------- |
| バックエンド（Main） | SkillForker サービスの品質基準達成                |
| IPC通信              | skill:fork ハンドラーのセキュリティ・型整合性     |
| Preload/セキュリティ | contextBridge 経由の API 公開、ホワイトリスト管理 |

## 成果物

| 成果物               | パス                                      | 説明                   |
| -------------------- | ----------------------------------------- | ---------------------- |
| Lint レポート        | `outputs/phase-9/quality-verification.md` | ESLint 検証結果        |
| 型チェックレポート   | `outputs/phase-9/quality-verification.md` | TypeScript 型検証結果  |
| セキュリティレポート | `outputs/phase-9/quality-verification.md` | セキュリティ検証結果   |
| カバレッジレポート   | `outputs/phase-9/quality-verification.md` | テスト・カバレッジ結果 |
| 品質ゲート結果       | `outputs/phase-9/quality-verification.md` | 総合判定結果           |

## 完了条件

- [ ] ESLint エラーが 0 件
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] `any` 型の使用がないこと
- [ ] P32 準拠: 型定義が shared/preload 間で一致
- [ ] 全セキュリティチェック項目が PASS
- [ ] パストラバーサル攻撃パターン 4 種のテストが存在
- [ ] P42 準拠: 3段バリデーション適用確認
- [ ] P44/P45 準拠: IPC 引数形式・命名の整合性確認
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 品質ゲート総合判定が PASS
- [ ] 5つのレポートが `outputs/phase-9/` に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: Lint 検証
3. タスク2: 型チェック検証
4. タスク3: セキュリティ検証
5. タスク4: テスト実行・カバレッジ確認
6. タスク5: 品質ゲート総合判定
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビューゲート
