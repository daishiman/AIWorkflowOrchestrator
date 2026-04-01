# Manual Test Checklist — UT-IMP-SDK-06 Layer3/4

## テスト対象

このタスクはテスト実装タスクのため、UI/UX の視覚的検証は不要。
手動テストは実装済みコードの動作確認と AC 充足の最終確認を目的とする。

## チェックリスト

### コード変更確認

- [x] `SkillCreatorVerificationEngine.ts` に `validateLayer3` が実装されている
- [x] `SkillCreatorVerificationEngine.ts` に `validateLayer4` が実装されている
- [x] `verify()` メソッドが layer3/layer4 チェック結果を返す
- [x] `createCheck()` の layer 型が `"layer3" | "layer4"` を受け付ける
- [x] `createSkillFixture` に `referenceFiles` が追加されている
- [x] `createSkillFixture` に `skillMdReferenceLinks` が追加されている

### テストケース確認

- [x] T-L3-01〜T-L3-10 が全て実装されている
- [x] T-L3-EC-01〜T-L3-EC-05 が全て実装されている
- [x] T-L4-01〜T-L4-08 が全て実装されている
- [x] T-L4-EC-01〜T-L4-EC-05 が全て実装されている
- [x] T-LOOP-01〜T-LOOP-04 が全て実装されている
- [x] T-LOOP-EC-01〜T-LOOP-EC-03 が全て実装されている

### テスト実行確認

- [x] `pnpm --filter @repo/desktop test run` で全 60 テストが pass する
- [x] 既存 Layer1/2 テストにデグレなし

### スコープ境界確認

- [x] IPC/preload/renderer に変更なし
- [x] governance/session semantics に変更なし
- [x] commit/PR/push は未実施（user 指示なし）
