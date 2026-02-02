# Phase 2: テスト設計書

## 設計日: 2026-02-02

## 概要

Phase 1ギャップ分析で特定された4件の部分カバーテストケース（SE-02, SE-07, SE-08, PR-03）の詳細設計。既存テストは44件中40件をカバー済みのため、補強テストの追加設計を行う。

## ギャップ補強テスト設計

### SE-02: execute - スキル未発見エラー

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
**配置先**: `describe("execute")` 内に追加

```
it("should throw error when skill metadata is invalid")
```

**Given-When-Then**:

- **Given**: SkillExecutorインスタンスが初期化済み、SkillMetadataのnameが空文字
- **When**: `execute(request, invalidSkill)` を呼び出す
- **Then**: エラーメッセージを含むrejectionが返る

**アサーション**: `expect(...).rejects.toThrow()` または `expect(response.success).toBe(false)`

### SE-07: createHooks - Hooks作成

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
**配置先**: 新規 `describe("createHooks")` を追加

```
it("should return object with PreToolUse and PostToolUse hooks")
```

**Given-When-Then**:

- **Given**: SkillExecutorインスタンスが初期化済み
- **When**: `createHooks(executionId)` を呼び出す
- **Then**: 戻り値が `PreToolUse` と `PostToolUse` 関数プロパティを持つオブジェクト

**アサーション**: `expect(hooks).toHaveProperty("PreToolUse")`, `expect(typeof hooks.PreToolUse).toBe("function")`

### SE-08: handlePermissionResponse - 権限応答

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
**配置先**: 新規 `describe("handlePermissionResponse")` を追加

```
it("should call permissionResolver.resolveRequest with correct response")
```

**Given-When-Then**:

- **Given**: SkillExecutorインスタンスが初期化済み、PermissionResolverのresolveRequestがスパイ化
- **When**: `handlePermissionResponse(requestId, true, true)` を呼び出す
- **Then**: `permissionResolver.resolveRequest` が正しい `SkillPermissionResponse` 引数で呼ばれる

**アサーション**: `expect(resolveRequestSpy).toHaveBeenCalledWith(expect.objectContaining({ requestId, approved: true, rememberChoice: true }))`

### PR-03: waitForResponse - 記憶選択

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`
**配置先**: `describe("waitForResponse")` 内に追加

```
it("should include rememberChoice in resolved response")
```

**Given-When-Then**:

- **Given**: PermissionResolverインスタンス初期化済み
- **When**: `waitForResponse(requestId)` 呼び出し後、`resolveRequest({ requestId, approved: true, rememberChoice: true })` を呼ぶ
- **Then**: 解決されたPromiseの結果に `rememberChoice: true` が含まれる

**アサーション**: `expect(result.rememberChoice).toBe(true)`

## 既存テスト44件の設計確認

既存テストは以下のパターンで実装済み:

### SkillScanner (10/10)

- SS-01〜SS-10: 全てカバー済み。実ファイルシステムベースのテストとモックベースの両方が存在

### SkillImportManager (8/8)

- SIM-01〜SIM-08: 全てカバー済み。モックStoreパターンで実装

### SkillExecutor (5/8 → 8/8に補強)

- SE-01, SE-03〜SE-06: カバー済み
- SE-02, SE-07, SE-08: 上記の補強テストで対応

### PermissionResolver (5/6 → 6/6に補強)

- PR-01, PR-02, PR-04〜PR-06: カバー済み
- PR-03: 上記の補強テストで対応

### skillSlice (12/12)

- SKS-01〜SKS-12: 全てカバー済み。Zustand storeパターンで実装
