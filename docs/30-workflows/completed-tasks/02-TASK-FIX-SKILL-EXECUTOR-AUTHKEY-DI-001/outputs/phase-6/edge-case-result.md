# Phase 6 異常系結果

## 異常系観点

- 認証失敗時に `AUTHENTICATION_ERROR` が `errorCode` として返る
- Preload が `errorCode` を `Error.code` へ転写する
- Renderer preflight が `exists=false` で execute 呼び出しを抑止する

## 検証結果

- `skillHandlers.execute.test.ts`: PASS
- `skill-api.contract.test.ts`: PASS
- `useSkillExecution.test.ts`: PASS

## 判定

- 異常系契約は維持されている。
