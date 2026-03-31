# 成功パターン集 - テスト（テスト環境・TDDパターン B）

## テスト環境・TDDパターン

### [Testing] process.cwd() ベースの定数はモジュールロード時に固定 — 環境変数DIパターン（TASK-P0-04）

- **状況**: `resolveDefaultManifestPath()` が `process.cwd()` ベースで `.claude/` を参照するコードが、Vitest テスト環境で期待通りに動作しなかった。Vitest の cwd が `apps/desktop/` になるため、プロジェクトルートを指さない
- **アプローチ**:
  - `process.cwd()` ベースの定数はモジュールロード時に評価・固定される（runtimeでの再評価は不可）
  - 本番コードに環境変数 (`AIWORKFLOW_SKILL_CREATOR_PATH`) によるパスオーバーライド口を追加する
  - テスト側の `beforeAll`/`afterAll` でこの環境変数をセットし、正しいパスへ誘導する
  - 本番コードの主要ロジックは変更不要
- **成功パターン**:
  - `getSkillCreatorRootCandidates()` の先頭に `process.env.AIWORKFLOW_SKILL_CREATOR_PATH` チェックを追加（DI 差し込み口）
  - テスト側:
    ```typescript
    beforeAll(() => {
      process.env.AIWORKFLOW_SKILL_CREATOR_PATH = path.resolve(__dirname, "../../../../../../");
    });
    afterAll(() => {
      delete process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
    });
    ```
  - 優先順: explicit arg → env var → home dir → repo root の4段階探索として設計する
- **失敗パターン**:
  - `process.cwd()` 解決を `vi.mock('process', ...)` でモックする（副作用が大きく他テストが壊れる）
  - 定数をモジュールレベルで `const PATH = path.resolve(process.cwd(), ...)` で固定し、テスト時の上書き手段を用意しない
  - テスト環境向けに本番コードに `if (process.env.NODE_ENV === "test")` 分岐を入れる（テスト専用コードが本番に混入）
- **適用条件**: `process.cwd()` ベースのパス解決を含む定数・ファクトリ関数をユニットテストする際
- **発見日**: 2026-03-30
- **関連タスク**: TASK-P0-04
- **クロスリファレンス**: [lessons-learned-current.md - L-P0-04-001](../../aiworkflow-requirements/references/lessons-learned-current.md)

---

### [TDD] スケルトン定義→テスト記述→Red確認→実装→Green確認の順序（TASK-P0-04）

- **状況**: 既存関数が含まれるファイルへ未実装の関数を `import` してテストを書くと、TypeScript コンパイルエラーで同ファイル内の既存テストも全失敗した
- **アプローチ**:
  - スケルトン関数（`throw new Error("not implemented")`）を先に定義して import をコンパイル可能な状態にする
  - 実行時にのみ新テストが Red になるよう設計し、既存テストへの影響をゼロにする
  - `vitest run <target-file>` で「新テストのみ Red / 既存テストは Green」を確認してから実装を進める
- **成功パターン**:
  1. スケルトン関数を追加:
     ```typescript
     export function resolveDefaultManifestPath(explicitRoot?: string): string {
       throw new Error("not implemented");
     }
     ```
  2. テスト記述 → `vitest run <target>` で Red 確認（既存テストが Green であることを同時確認）
  3. 実装 → Green 確認（全テスト PASS）
- **失敗パターン**:
  - 関数定義なしで `import { resolveDefaultManifestPath } from "./constants"` を追加 → TypeScript コンパイルエラーで既存テストも巻き込み全失敗
  - `describe.skip` / `it.skip` でテストを書いてから import 追加 → skip のためエラーが隠蔽され Red が確認できない
  - 既存テストファイルに対してスケルトンなしで新テストを書く → Red の確認が「import エラー」になり意図した失敗かどうか判断できない
- **適用条件**: 既存関数が含まれるファイルへ新規関数を TDD で追加する際。特に同ファイルに既存テストがある場合
- **発見日**: 2026-03-30
- **関連タスク**: TASK-P0-04
- **クロスリファレンス**: [lessons-learned-current.md - L-P0-04-002](../../aiworkflow-requirements/references/lessons-learned-current.md)

---

## 変更履歴

| 日付 | 変更内容 |
| --- | --- |
| 2026-03-30 | TASK-P0-04 テスト環境・TDD パターン2件を新規追加（このファイルを新規作成）|
