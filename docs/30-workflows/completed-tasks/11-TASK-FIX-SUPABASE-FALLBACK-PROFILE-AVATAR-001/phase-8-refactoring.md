# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 8                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 7 カバレッジ確認（PASS）                |

## 目的

Phase 5の実装コードを品質改善の観点からリファクタリングする。機能変更は行わず、コードの可読性・保守性・一貫性を向上させる。

## 実行タスク

- Task 1: リファクタリング候補の特定: 重複する fallback 配列や応答定義を整理できるか確認する
- Task 2: 実施するリファクタリング: 既存パターンを壊さない範囲で最小改善を行う
- Task 3: リファクタリング後のテスト実行: 契約が不変であることを再確認する

### Task 1: リファクタリング候補の特定

#### 1.1 DRY原則の検討

3つのフォールバック関数（Auth/Profile/Avatar）に共通パターンがある:

```typescript
// 共通パターン:
// 1. notConfiguredResponse オブジェクトの定義
// 2. チャンネル-ハンドラ配列の定義
// 3. for...of ループでの ipcMain.handle 登録
```

**判定**: 3関数とも15行以下の単純な関数であり、共通化のメリットが限定的。DRY化による抽象化コストが可読性を上回るため、**現状維持**が適切。

#### 1.2 型安全性の検討

- `ReadonlyArray<readonly [string, () => Promise<unknown>]>` の型は既存パターンと一致しており変更不要
- エラーレスポンスの型を共有型として抽出する必要性を検討 → 3関数のみの使用であり、型抽出は不要

#### 1.3 命名規約の確認

| 関数名                            | 命名規約                           | 判定               |
| --------------------------------- | ---------------------------------- | ------------------ |
| `registerProfileFallbackHandlers` | `register{Domain}FallbackHandlers` | 既存パターンと一致 |
| `registerAvatarFallbackHandlers`  | `register{Domain}FallbackHandlers` | 既存パターンと一致 |

### Task 2: 実施するリファクタリング

本タスクでは以下のリファクタリングのみ実施:

1. **コメントの統一**: 3関数のJSDocコメント形式を統一（既に統一済みであれば変更なし）
2. **変数名の一貫性確認**: `notConfiguredResponse` の変数名が3関数で統一されていることを確認
3. **コード配置の確認**: 3つのフォールバック関数が連続して配置されていることを確認

### Task 3: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/fallback-handlers.test.ts
```

リファクタリング前と同一のテスト結果（全件GREEN）であることを確認する。

## 参照資料

| 資料名           | パス                                 | 説明                       |
| ---------------- | ------------------------------------ | -------------------------- |
| Phase 5 実装     | `apps/desktop/src/main/ipc/index.ts` | リファクタリング対象       |
| コード品質ルール | `.claude/rules/02-code-quality.md`   | 命名規約・コーディング規約 |

### システム仕様（aiworkflow-requirements）

- `references/development-guidelines.md` - コーディング規約

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. 実装コードを通読し、リファクタリング候補を特定
2. DRY原則の検討（共通化の是非を判断）
3. 型安全性の検討（型抽出の是非を判断）
4. 命名規約の確認
5. 必要なリファクタリングを実施（変更なしの場合もその判断を記録）
6. テスト実行で全件 GREEN を確認

## 統合テスト連携

- リファクタリング後に Phase 4 / 6 の契約テストを再実行し、fallback の戻り値と件数が変化していないことを確認する
- `registerAuthFallbackHandlers()` との構造一貫性が保たれているかをテスト観点と合わせて確認する
- Phase 11 の手動シナリオに影響する UI 観点は、コード整理のみで挙動変化がない前提を維持する

## 成果物

| 成果物                     | パス                                 | 説明                                       |
| -------------------------- | ------------------------------------ | ------------------------------------------ |
| リファクタリング済みコード | `apps/desktop/src/main/ipc/index.ts` | 品質改善後のコード（変更なしの場合もあり） |

## 完了条件

- [ ] リファクタリング候補の検討結果が記録済み
- [ ] DRY化の判断理由が記録済み
- [ ] 命名規約の一貫性が確認済み
- [ ] テスト全件 GREEN（リファクタリング前と同一結果）
- [ ] 機能変更がないことを確認

## 次のPhase

Phase 9: 品質検証
