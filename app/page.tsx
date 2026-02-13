"use client";

import { useState, useEffect } from "react";
import { linkCategories as defaultLinks } from "@/data/links";
import { fetchLinksFromGoogle } from "@/lib/fetchLinks";
import LinkFormModal from "@/components/LinkFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import type { LinkCategory, Link } from "@/data/links";

export default function Home() {
  const [linkCategories, setLinkCategories] = useState<LinkCategory[]>(defaultLinks);
  const [selectedCategory, setSelectedCategory] = useState<LinkCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link & { category: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; linkTitle: string; rowIndex?: number }>({
    isOpen: false,
    linkTitle: "",
    rowIndex: undefined,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Try to fetch from Google Sheets, fallback to default links
    fetchLinksFromGoogle().then((categories) => {
      if (categories.length > 0) {
        setLinkCategories(categories);
        setSelectedCategory(categories[0]);
      } else {
        // Use default links if Google Sheets fetch fails
        setSelectedCategory(defaultLinks[0] || null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory && linkCategories.length > 0) {
      setSelectedCategory(linkCategories[0]);
    }
  }, [linkCategories, selectedCategory]);

  const refreshData = async () => {
    try {
      const result = await fetch("/api/links");
      const newData = await result.json();

      if (newData.linkCategories) {
        setLinkCategories(newData.linkCategories);
        // Keep the selected category if it still exists
        const stillExistsCategory = newData.linkCategories.find(
          (cat: LinkCategory) => cat.name === selectedCategory?.name
        );
        setSelectedCategory(stillExistsCategory || newData.linkCategories[0]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleSaveLink = async (
    data: {
      category: string;
      title: string;
      url: string;
      description: string;
      rowIndex?: number;
    },
    isEdit: boolean
  ) => {
    try {
      if (isEdit && data.rowIndex !== undefined) {
        // Update existing link
        const response = await fetch("/api/links", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowIndex: data.rowIndex,
            category: data.category,
            title: data.title,
            url: data.url,
            description: data.description,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error);
        }
      } else {
        // Add new link
        const response = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: data.category,
            title: data.title,
            url: data.url,
            description: data.description,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error);
        }
      }

      // Refresh data from Google Sheets
      await refreshData();
      setModalOpen(false);
      setEditingLink(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteLink = async (rowIndex: number | undefined, linkTitle: string) => {
    if (rowIndex === undefined) {
      alert("Cannot delete local links. Please add links from Google Sheet.");
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      linkTitle: linkTitle,
      rowIndex: rowIndex,
    });
  };

  const handleConfirmDelete = async () => {
    const { rowIndex } = deleteConfirm;
    if (rowIndex === undefined) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      await refreshData();
      setDeleteConfirm({ isOpen: false, linkTitle: "", rowIndex: undefined });
    } catch (error) {
      alert("Failed to delete link: " + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditLink = (link: Link, categoryName: string) => {
    setEditingLink({
      ...link,
      category: categoryName,
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Favorite Links</h1>
          <p className="text-blue-100 text-sm">Select a category and click a link to open</p>
        </div>
        <button
          onClick={() => {
            setEditingLink(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>
      </div>

      {/* Main Content - Split Panel */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left Sidebar - Categories */}
        <div className="w-full sm:w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 px-2">Categories</h2>
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-2">
                {linkCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all ${
                      selectedCategory?.name === category.name
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs opacity-75">{category.links.length} links</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Links List */}
        <div className="hidden sm:flex flex-1 flex-col bg-gray-950 overflow-hidden">
          {selectedCategory ? (
            <>
              {/* Category Header */}
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{selectedCategory.name}</h2>
                <p className="text-gray-400 text-sm">{selectedCategory.description}</p>
              </div>

              {/* Links Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.links.map((link) => (
                    <div
                      key={`${link.title}-${link.url}`}
                      className="group bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 rounded-lg p-4 transition-all duration-300"
                    >
                      {/* Link Content */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-3 group/link"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white group-hover/link:text-indigo-400 transition-colors truncate">
                              {link.title}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-2">{link.url}</p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover/link:text-indigo-400 transition-colors ml-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l6-6m0 0V5m0 1H9"
                            />
                          </svg>
                        </div>
                      </a>

                      {/* Edit and Delete Buttons */}
                      <div className="flex gap-1 pt-3 border-t border-gray-700 justify-end">
                        <button
                          onClick={() => handleEditLink(link, selectedCategory.name)}
                          title="Edit link"
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.rowIndex, link.title)}
                          title="Delete link"
                          className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <p className="text-lg">No category selected</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <LinkFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        categories={linkCategories.map((c) => c.name)}
        editingData={
          editingLink
            ? {
                category: editingLink.category,
                title: editingLink.title,
                url: editingLink.url,
                description: editingLink.description || "",
                rowIndex: editingLink.rowIndex || 0,
              }
            : null
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        linkTitle={deleteConfirm.linkTitle}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, linkTitle: "", rowIndex: undefined })}
        isLoading={isDeleting}
      />
    </div>
  );
}
