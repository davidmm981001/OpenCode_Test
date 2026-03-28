"use client";

import type { Dispatch, SetStateAction } from "react";

type Props = {
  setRequestData: Dispatch<SetStateAction<any>>;
};

export function LlamaCloudSelector({ setRequestData }: Props) {
  return (
    <button
      type="button"
      className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
      onClick={() => setRequestData((current: any) => current)}
    >
      LlamaCloud
    </button>
  );
}
