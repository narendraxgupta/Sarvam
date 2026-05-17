import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDiffStore } from "@/store/diffStore";

const initial = useDiffStore.getState();

describe("diffStore change navigation", () => {
  beforeEach(() => {
    useDiffStore.setState(initial, true);
    useDiffStore.getState().loadSample();
  });

  afterEach(() => {
    useDiffStore.setState(initial, true);
  });

  it("nextChange / prevChange never produce a negative index", () => {
    const { setOutputA, setOutputB, nextChange, prevChange } =
      useDiffStore.getState();
    // Force the diff to have zero changes.
    setOutputA("identical");
    setOutputB("identical");
    expect(useDiffStore.getState().result.changeCount).toBe(0);

    nextChange();
    expect(useDiffStore.getState().currentChange).toBe(0);
    prevChange();
    expect(useDiffStore.getState().currentChange).toBe(0);
  });

  it("clamps nextChange to the last change", () => {
    const { setOutputA, setOutputB, nextChange } = useDiffStore.getState();
    setOutputA("alpha beta gamma delta");
    setOutputB("alpha omega gamma epsilon");
    const count = useDiffStore.getState().result.changeCount;
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count + 5; i++) nextChange();
    expect(useDiffStore.getState().currentChange).toBe(count - 1);
  });

  it("clamps prevChange to zero", () => {
    const { prevChange } = useDiffStore.getState();
    for (let i = 0; i < 10; i++) prevChange();
    expect(useDiffStore.getState().currentChange).toBe(0);
  });

  it("setCurrentChange snaps out-of-range values", () => {
    const { setOutputA, setOutputB, setCurrentChange } =
      useDiffStore.getState();
    setOutputA("alpha beta gamma delta");
    setOutputB("alpha omega gamma epsilon");
    const count = useDiffStore.getState().result.changeCount;
    expect(count).toBeGreaterThanOrEqual(1);
    setCurrentChange(999);
    expect(useDiffStore.getState().currentChange).toBe(count - 1);
    setCurrentChange(-999);
    expect(useDiffStore.getState().currentChange).toBe(0);
  });
});
