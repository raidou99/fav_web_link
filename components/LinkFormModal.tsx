import { useState, useEffect } from "react";

interface LinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { category: string; title: string; url: string; description: string; rowIndex?: number }, isEdit: boolean) => Promise<void>;
  categories: string[];
  editingData?: { category: string; title: string; url: string; description: string; rowIndex: number } | null;
}

export default function LinkFormModal({
  isOpen,
  onClose,
  onSave,
  categories,
  editingData,
}: LinkFormModalProps) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingData;

  useEffect(() => {
    if (isEditing && editingData) {
      setCategory(editingData.category);
      setTitle(editingData.title);
      setUrl(editingData.url);
      setDescription(editingData.description);
      setCustomCategory("");
    } else {
      setCategory("");
      setTitle("");
      setUrl("");
      setDescription("");
      setCustomCategory("");
    }
    setError("");
  }, [isEditing, editingData, isOpen]);

  const selectedCategory = customCategory || category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCategory || !title || !url) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await onSave(
        {
          category: selectedCategory,
          title,
          url,
          description,
          rowIndex: editingData?.rowIndex,
        },
        isEditing
      );

      // Modal closes automatically from parent
    } catch (err) {
      setError((err as Error).message || "Failed to save link");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Edit Link" : "Add New Link"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCustomCategory("");
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select category or create new</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {category === "" && (
              <input
                type="text"
                placeholder="Or enter new category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://github.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Version control platform"
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
