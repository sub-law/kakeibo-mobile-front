//src/app/components/ModalConfirmDelete.tsx
"use client";

import Button from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ModalConfirmDelete({
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-sm p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">削除しますか？</h2>
        <p className="text-sm text-gray-600 mb-6">この操作は取り消せません。</p>

        <div className="flex gap-3">
          <Button
            variant="muted"
            full={false}
            className="flex-1"
            onClick={onClose}
          >
            キャンセル
          </Button>

          <Button
            variant="danger"
            full={false}
            className="flex-1 transition"
            onClick={onConfirm}
          >
            削除する
          </Button>
        </div>
      </div>
    </div>
  );
}
