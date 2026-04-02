# Phase 12: スキルフィードバックレポート

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-02                    |

---

## タスク実行で学んだこと

### 1. vi.doMock + vi.resetModules パターン

Electron の `Notification` はモジュールレベルでの static クラスであるため、
通常の `vi.mock()` ホイスティングが使えない。
`beforeEach(() => vi.resetModules())` + `vi.doMock("electron", ...)` + 動的 `import()` の組み合わせが
このようなシングルトン的なモジュールに対する唯一の確実なテスト手法。

### 2. TDD の効果

Phase 4（Red）でテストを書いてから Phase 5（Green）で実装を書くフローにより、
`hasRunningExecution()` の設計（`activeExecutionCount` カウンター方式）が
テストケース側から先に定義された。これにより実装の意図が明確になった。

### 3. Optional DI の効果

`notificationService?: INotificationService`（optional）にしたことで、
既存の `RuntimeSkillCreatorFacade` テスト群（Phase 5 以前に作成）がそのまま通過した。
段階的な DI 導入は既存テストの壊れを防ぐ重要な設計判断。

---

## Phase フローの改善提案

| 改善項目                       | 内容                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Phase 5 と Phase 6 の統合      | 基本テスト（Phase 4）とエッジケース（Phase 6）を同時に書けば工程が短縮できる   |
| vitest run コマンドの最適化    | `--testPathPattern` は全ファイルにマッチするため、ファイルパス直指定が望ましい |
| esbuild バージョン不整合の検出 | `pnpm install` 後に esbuild バイナリ確認を CI に組み込むと効率的               |

---

## task-specification-creator スキルへのフィードバック

### 有効だった点

- Phase 1（要件抽出）→ Phase 2（設計）→ Phase 3（レビューゲート）の順序が明確で、
  Phase 4 以降の実装方針が一貫して定まった
- AC-1〜AC-9 の定義が具体的で、各テストケースとの対応が容易だった
- `NON_VISUAL` タグが Phase 11 の手動テスト方針を明確にした

### 改善提案

- Phase 7（カバレッジ）の計測コマンド（`vitest --coverage`）は
  Vitest のバージョン・設定によって動作が異なるため、環境固有のコマンドを spec に記載してほしい
- Phase 6 のエッジケーステストが Phase 4 のファイルと同一ファイルに追記する設計であることを
  Phase 4 spec 時点で明記するとより明確
