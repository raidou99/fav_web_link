interface DeleteConfirmModalProps {
  isOpen: boolean;
  linkTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  linkTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Delete Link</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0-6a9 9 0 110 18 9 9 0 010-18zm0-2a11 11 0 110 22 11 11 0 010-22z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white break-words">"{linkTitle}"</span>?
              </p>
              <p className="text-gray-400 text-sm mt-2">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-700 bg-gray-750">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium text-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
