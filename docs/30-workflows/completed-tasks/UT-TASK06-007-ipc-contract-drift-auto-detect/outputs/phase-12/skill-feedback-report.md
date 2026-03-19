# スキルフィードバックレポート - UT-TASK06-007 Phase 12

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-TASK06-007                                       |
| 作成日     | 2026-03-18                                          |
| Phase      | 12 - ドキュメント                                   |
| 対象スキル | task-specification-creator, aiworkflow-requirements |

---

## フィードバックサマリー

| ID   | 対象スキル                 | 改善区分                     | 優先度 |
| ---- | -------------------------- | ---------------------------- | ------ |
| T-01 | task-specification-creator | Phase仕様書テンプレート改善  | Medium |
| T-02 | task-specification-creator | テスト実行環境の代替手法追記 | Medium |

---

## T-01: NFR行数目安と実際スクリプト規模の乖離に対するエスカレーション手順

### 観測された問題

Phase 2（設計）仕様書において、スクリプトのNFR（非機能要件）として「200行以内を目安とする」という記載があった。しかし、実際の実装（Phase 5）では静的解析ロジック、正規表現パターン、CLIオプション解析、レポート生成の全機能を1ファイルに収めるため、最終的に478行となった。

NFRの「200行以内」目安と実装の乖離が発生したが、Phase 2→3（設計レビュー）の段階でこの乖離への対処方針が明確でなく、以下の疑問が解消されないまま Phase 5 に進んだ:

- 200行超えた場合にファイル分割すべきか、単一ファイルを維持すべきか
- Phase 10 レビューでこの超過が MINOR/MAJOR 判定に影響するか
- 超過が確定した時点でPhase 2に戻るべきか、Phase 5内で対応するか

実際には Phase 8（リファクタリング）で「分割するとテスト実行のモジュール解決が複雑化する」という技術的理由から単一ファイル維持を選択し、Phase 10 では PASS 判定となった。

### 推奨する改善内容

`task-specification-creator/references/phase-templates.md` の Phase 2 設計テンプレートに以下を追加する:

```markdown
#### NFR行数目安の乖離エスカレーション手順

スクリプト・ユーティリティ系タスクでNFR（行数目安）の超過が予測される場合:

1. **Phase 3（設計レビュー）で判定**: 超過が設計上の根拠を持つ場合はMINOR判定とし、
   「超過容認の根拠」を gate-decision.md に明記する
2. **許容条件**: 以下の全てを満たす場合は単一ファイル維持を容認する
   - テストの独立実行が可能である
   - ファイル分割によりモジュール解決の複雑度が増す
   - 関心の分離が論理的に成立している（関数レベルで責務が分離されている）
3. **超過容認時の記録**: Phase 5 実装後に実際行数を `artifacts.json` に記録する
```

### 参照

- 既知の落とし穴: P4（documentation-changelog への早期「完了」記載）
- 関連タスク: UT-TASK06-007（Phase 8 リファクタリングレポート）

---

## T-02: worktree環境でのesbuildプラットフォーム不一致に対する代替テスト手法

### 観測された問題

Phase 4（テスト作成）〜Phase 5（実装）の段階で、worktree環境での `vitest run` 実行時に以下のエラーが発生した:

```
Error: Failed to resolve module 'esbuild-darwin-arm64'
```

これは P7（ネイティブモジュールのバイナリ不一致）の亜種であり、worktree環境では `node_modules` がシンボリックリンクで共有されるため、異なるプラットフォーム用にビルドされた esbuild バイナリが参照される場合がある。

対応として `pnpm tsx` 経由での直接実行（型チェックなし）と、テストファイルの `--pool=forks` オプション付き実行を試みたが、完全な解決には至らず一部のテストスイートを `--reporter=verbose` + 個別実行で対応した。

### 推奨する改善内容

`task-specification-creator/references/phase-templates.md` の Phase 4 テスト作成テンプレートに以下を追加する:

````markdown
#### worktree環境でのテスト実行代替手法（P7相当）

worktree環境でネイティブモジュール（esbuild等）のバイナリ不一致が発生した場合:

1. **第一手段**: `pnpm tsx` による直接実行で動作確認する
   ```bash
   pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
   ```
````

2. **第二手段**: `--pool=forks` でテストプロセスを分離する

   ```bash
   pnpm --filter @repo/desktop exec vitest run --pool=forks src/path/to/test.ts
   ```

3. **第三手段**: ルートの `pnpm install --force` でバイナリを再構築する（P7対策）

   ```bash
   pnpm store prune && pnpm install --force
   ```

4. **回避不能な場合**: テストに `.skip` を付与し、Issue/TODO コメントと
   未タスクIDを記録する（`--no-verify` は禁止）

```

### 参照

- 既知の落とし穴: P7（ネイティブモジュールのバイナリ不一致）、P40（テスト実行ディレクトリ依存）
- CLAUDE.md: 「Git操作の禁止事項」（`--no-verify` 禁止）

---

## スキル改善提案ファイルの作成状況

| 提案ID | 対象スキルファイル | 状態 |
|--------|--------------|------|
| T-01 | `task-specification-creator/references/phase-templates.md` | PR時に追記 |
| T-02 | `task-specification-creator/references/phase-templates.md` | PR時に追記 |

**worktree環境制約により、実際のスキルファイル更新はPR時に実施する。**

---

## 改善点なし項目

以下については改善点なしと判断した:

- **既知の落とし穴（P44/P45）対応**: IPC契約ドリフト検出ルール R-02/R-03 が既存のピットフォールパターンを正しく対象としており、`06-known-pitfalls.md` との整合性は良好
- **Phase 1-3 フロー**: 設計レビューゲート（PASS）が正常に機能し、Phase 4 への移行判断が適切だった
- **テスト駆動開発（TDD）**: Red→Green→Refactor のサイクルが Phase 4-5-6-7-8 の順序に沿って実施された
```
