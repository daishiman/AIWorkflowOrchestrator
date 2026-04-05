# Phase 5: 実装（TDD-Green） - タスク仕様書

## メタ情報

| 項目      | 内容              |
| --------- | ----------------- |
| Phase     | 5                 |
| Phase名   | 実装（TDD-Green） |
| カテゴリ  | 実装              |
| 前提Phase | Phase 4           |
| 後続Phase | Phase 6           |

## 目的

Step 3.5-3.6（`parseLlmResponseToContent -> SkillFileWriter.persist`）の統合パスを、設計（Phase 2）どおりに維持しつつ、
テスト（persist-integration 22件）で保証できる状態にする。
また、`SkillCreatorOutputHandler` は別系統パイプラインであることを明文化し、混同を防ぐ。

## 実行タスク

### タスク1: Step 3.5-3.6 実装確認

**目的**: 既存実装が設計どおりかを確認する。

**確認観点**:

- `response.success` の条件で persist に到達する
- `parseLlmResponseToContent(sdkEvents)` の戻り値が `null` の場合は persist をスキップする
- `skillFileWriter` 未注入時は warn を出してスキップする（例外にしない）
- `persistResult` / `persistError` が `executeResult` で返る

### タスク2: skillName 方針（raw pass-through）

**目的**: `planResult.skillName` をそのまま Writer に渡し、バリデーションは Writer に委譲する。

**対応テスト（例）**:

- 正常系: `F-01`, `F-02`
- PATH_TRAVERSAL/NULL等の拒否は Writer 側の結果が `persistError` に伝播する: `E-11`, `E-21〜E-23`

### タスク3: OutputHandler との責務分離の明文化

**目的**: OutputHandler と Facade の統合パスを混同しないために、別系統である旨をコードコメントで固定する。

**Current Facts**:

- `SkillCreatorOutputHandler` は `SkillCreatorIpcBridge` 経由の session-complete パイプライン
- `toSlug()` は path-safe（`/` `\\` `..` `\\0` を無効化、空は `unnamed-skill`）

### タスク4: グリーン確認（テスト）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
pnpm --filter @repo/desktop test -- --testPathPattern=SkillFileWriter
pnpm --filter @repo/desktop test -- --testPathPattern=parseLlmResponseToContent
```

## 完了条件

- [ ] persist-integration（22件）が Green
- [ ] SkillFileWriter（28件）が Green
- [ ] parseLlmResponseToContent（14件）が Green
- [ ] OutputHandler が別系統であることがコード/ドキュメントで明記されている
