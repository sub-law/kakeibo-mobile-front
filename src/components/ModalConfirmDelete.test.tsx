import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModalConfirmDelete from "@/components/ModalConfirmDelete";

describe("ModalConfirmDelete", () => {
  it("openがfalseの場合は確認内容を表示しない", () => {
    render(
      <ModalConfirmDelete
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "削除しますか？" }),
    ).not.toBeInTheDocument();
  });

  it("確認内容を表示してキャンセルと削除の操作を通知する", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ModalConfirmDelete
        open
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "削除しますか？" }),
    ).toBeInTheDocument();
    expect(screen.getByText("この操作は取り消せません。"))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
