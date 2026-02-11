/**
 * AgentSDKAPI 型定義テスト
 *
 * UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH
 * expectTypeOfを使用した型レベルテスト。
 *
 * @module @repo/desktop/preload/__tests__/agentSDKAPI.types
 */

import { describe, it, expectTypeOf } from "vitest";
import type { AgentSDKAPI } from "../types";

describe("AgentSDKAPI 型定義テスト", () => {
  describe("abort() 戻り値型", () => {
    it("ASDT-TYPE-01: abort() should return Promise<void>", () => {
      // 型レベルテスト: abort()の戻り値がPromise<void>であること
      expectTypeOf<AgentSDKAPI["abort"]>().returns.toEqualTypeOf<
        Promise<void>
      >();
    });

    it("ASDT-TYPE-02: abort() should be a function with no parameters", () => {
      // 型レベルテスト: abort()が引数なしの関数であること
      expectTypeOf<AgentSDKAPI["abort"]>().toBeFunction();
      expectTypeOf<AgentSDKAPI["abort"]>().parameters.toEqualTypeOf<[]>();
    });
  });

  describe("他メソッドとの型一貫性", () => {
    it("ASDT-TYPE-03: abort() should match destroySession return type", () => {
      // 型レベルテスト: destroySessionと同じPromise<void>を返すこと
      expectTypeOf<ReturnType<AgentSDKAPI["abort"]>>().toEqualTypeOf<
        ReturnType<AgentSDKAPI["destroySession"]>
      >();
    });

    it("ASDT-TYPE-04: abort() should match resumeSession return type", () => {
      // 型レベルテスト: resumeSessionと同じPromise<void>を返すこと
      expectTypeOf<ReturnType<AgentSDKAPI["abort"]>>().toEqualTypeOf<
        ReturnType<AgentSDKAPI["resumeSession"]>
      >();
    });

    it("ASDT-TYPE-05: abort() should match query return type", () => {
      // 型レベルテスト: queryと同じPromise<void>を返すこと
      expectTypeOf<ReturnType<AgentSDKAPI["abort"]>>().toEqualTypeOf<
        ReturnType<AgentSDKAPI["query"]>
      >();
    });
  });
});
