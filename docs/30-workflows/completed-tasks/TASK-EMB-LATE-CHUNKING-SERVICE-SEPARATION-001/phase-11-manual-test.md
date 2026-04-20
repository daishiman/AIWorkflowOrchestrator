# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| Phase      | 11                                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001              |
| タスク種別 | NON_VISUAL code task                                       |
| 目的       | 自動テスト結果を primary evidence として代替証跡を固定する |
| 前提Phase  | Phase 10（最終レビュー）                                   |
| 後続Phase  | Phase 12（ドキュメント更新）                               |
| 作成日     | 2026-04-20                                                 |
| 機能名     | emb-late-chunking-service-separation                       |

---

## 目的

本タスクは Renderer 変更を伴わない純粋なサービス層リファクタリングであり、`NON_VISUAL code task` として扱う。screenshot による視覚検証は行わず、vitest / typecheck / lint / テンプレート仮生成確認を primary evidence として手動テストの代替証跡を固定する。

---

## Phase 11 手動テスト方針（NON_VISUAL code task）

- `screenshot-plan.json` は **生成しない**
- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- primary evidence:
  - `pnpm --filter @repo/shared test -- LateChunkingService`（9 メソッド動作）
  - `pnpm --filter @repo/shared test -- chunking-service.integration`（委譲動作）
  - `pnpm --filter @repo/shared typecheck`（型整合）
  - `pnpm --filter @repo/shared lint`（コード品質）
- placeholder-only の証跡は PASS 扱いにしない

### NON_VISUAL 判定理由

| 観点                         | 判定     | 理由                                                              |
| ---------------------------- | -------- | ----------------------------------------------------------------- |
| UI task                      | いいえ   | Renderer 変更が一切ない（`packages/shared` のサービス層のみ変更） |
| ユーザー視認可能な挙動変更   | なし     | `ChunkingService.chunk()` の入出力シグネチャが維持される          |
| 画面遷移・navigation state   | 変更なし | 対象は Main/Worker プロセスのサービス層                           |
| Apple UI/UX 視覚検証の必要性 | なし     | 視覚証跡が存在しない                                              |

---

## 実行タスク

### タスク1: manual-test-checklist.md の作成

**目的**: NON_VISUAL code task としてのテストチェックリストを固定する。

**実行手順**:

1. `outputs/phase-11/manual-test-checklist.md` を作成する。
2. 以下のテストケース（TC）を記述する。
   - TC-01: `ChunkingLateChunkingAdapter.applyLateChunking()` が単一チャンク・mean で正常動作する
   - TC-02: `ChunkingLateChunkingAdapter.applyLateChunking()` が複数チャンク・cls で正常動作する
   - TC-03: `ChunkingLateChunkingAdapter.determineChunkBoundaries()` が先頭・末尾境界を正しく返す
   - TC-04: `ChunkingLateChunkingAdapter.poolTokenEmbeddings()` が mean / attention / フォールバックで正常動作する
   - TC-05: `ChunkingService.chunk()` の入出力シグネチャが変化しない
   - TC-06: `ChunkingService` の既存コンストラクタ（3 引数呼び出し）が型エラーなしで動作する
   - TC-07: `LateChunkingService` が `ChunkingService` のモックなしでテスト可能
3. 各 TC に期待 evidence（対応する SEP-ID または pnpm コマンド）を記載する。

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`

---

### タスク2: 代替 evidence の収集と記録

**目的**: vitest / typecheck / lint の実行結果を primary evidence として固定する。

**実行手順**:

1. 以下のコマンドを順次実行し、出力を記録する。
   - `pnpm exec vitest run src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts`
   - `pnpm exec vitest run src/services/chunking/__tests__/chunking-service.integration.test.ts`
   - `pnpm exec tsc --noEmit`
   - `pnpm exec eslint src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts src/services/embedding/late-chunking/index.ts src/services/chunking/chunking-service.ts src/services/chunking/__tests__/chunking-service.integration.test.ts`
2. 各コマンドの終了コード（0）と最終行を `outputs/phase-11/evidence-collection.md` に記録する。
3. テスト件数と PASS 数を記録する（例: `9 passed, 0 failed`）。
4. 各 TC-ID に対して対応する evidence（SEP-ID または pnpm 出力ファイル）をマッピングする。

**期待される成果物**:

- `outputs/phase-11/evidence-collection.md`（コマンド × 終了コード × 最終行）

---

### タスク3: discovered-issues.md の作成

**目的**: Phase 11 実行中に発見された新規課題を記録する。

**実行手順**:

1. `outputs/phase-11/discovered-issues.md` を作成する。
2. Phase 11 実行中に発見された以下の項目を記録する。
   - 回帰テストで検出された新規課題（なければ「N/A」と記録）
   - JSDoc の不足箇所（後続 Phase 12 での対応予定を記載）
   - 型定義の改善余地（MINOR 追跡テーブルへの追加）
3. 新規課題が発見された場合は MINOR / MAJOR の判定を行い、対応 Phase を決定する。
4. MAJOR 以上が発見された場合は Phase 12 へ進行せず、該当 Phase に戻る旨を記載する。

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

### タスク4: manual-test-result.md の作成

**目的**: TC-ID ↔ evidence 対応を固定し、Phase 12 への引き継ぎを行う。

**実行手順**:

1. `outputs/phase-11/manual-test-result.md` を作成する。
2. TC-01〜TC-07 × evidence（SEP-ID または pnpm 出力）の対応表を記述する。
3. NON_VISUAL 判定理由を明記する（Renderer 変更なし、サービス層リファクタのため）。
4. 代替 evidence 方針を明記する（screenshot の代わりに vitest / typecheck / lint を使用）。
5. 全 TC の PASS を確認する。
6. placeholder-only（内容空の evidence）が含まれていないことを確認する。

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## 参照資料

| 参照資料                               | パス                                                                                                    | 内容                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 4 テスト作成仕様                 | `phase-4-test-creation.md`                                                                              | SEP-01〜SEP-09 と TC のマッピング     |
| Phase 10 最終レビュー結果              | `outputs/phase-10/final-review-result.md`                                                               | Phase 11 進行可否                     |
| phase-template-phase11                 | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                        | Phase 11 手動テストテンプレート       |
| phase-11-12-guide                      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                             | NON_VISUAL code task の手動テスト方針 |
| chunking-late-chunking-adapter.test.ts | `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` | SEP-01〜SEP-07 実装                   |
| chunking-service.integration.test.ts   | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`                  | SEP-08〜SEP-09 実装                   |

---

## Canonical Artifacts

| 成果物                   | パス                                        | 内容                               |
| ------------------------ | ------------------------------------------- | ---------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-01〜TC-07 の一覧と期待 evidence |
| 代替 evidence 収集記録   | `outputs/phase-11/evidence-collection.md`   | 各コマンドの終了コードと最終行     |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 新規課題・MINOR 追跡               |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応表            |

---

## 統合テスト連携

- `chunking-service.integration.test.ts` の結果を manual-test-result の primary evidence に含める。
- SEP-08 / SEP-09 は NON_VISUAL task における実質的な統合検証として扱う。
- Phase 12 では統合テスト結果を screenshot 不要の根拠として再掲する。

## 成果物

| 成果物                   | パス                                        | 内容                    |
| ------------------------ | ------------------------------------------- | ----------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC 一覧                 |
| 代替 evidence 収集記録   | `outputs/phase-11/evidence-collection.md`   | コマンド実行結果        |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`     | MINOR / MAJOR 追跡      |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応表 |

---

## 完了条件

- [ ] `manual-test-checklist.md` に TC-01〜TC-07 が記載されている
- [ ] `evidence-collection.md` に 4 コマンド（test × 2、typecheck、lint）の終了コード 0 が記録されている
- [ ] `discovered-issues.md` が作成されている（課題なしでも N/A として記載）
- [ ] `manual-test-result.md` に TC-ID ↔ evidence 対応表が記載されている
- [ ] NON_VISUAL 判定理由が明記されている
- [ ] `screenshot-plan.json` が **作成されていない** ことを確認した
- [ ] placeholder-only の evidence が含まれていないことを確認した
- [ ] 発見された MAJOR 以上の課題がないことを確認した

---

## タスク100%実行確認【必須】

- [ ] Task 1: manual-test-checklist 作成 完了
- [ ] Task 2: evidence 収集と記録 完了
- [ ] Task 3: discovered-issues 作成 完了
- [ ] Task 4: manual-test-result 作成 完了

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS または MINOR 判定であること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-12-documentation.md`
