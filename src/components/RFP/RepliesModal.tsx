import { useState } from "react";
import type { RFP, ParsedEmail, Recipient } from "../../types/rfp.types";
import { formatDate } from "../../utils/rfp.utils";

interface RepliesModalProps {
  rfp: RFP;
  replies: ParsedEmail[];
  loading: boolean;
  onClose: () => void;
  onAwardToVendor: (vendor: Recipient) => void;
}

export default function RepliesModal({
  rfp,
  replies,
  loading,
  onClose,
  onAwardToVendor,
}: RepliesModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">📧 Email Replies</h2>
            <p className="text-sm mt-1 opacity-90">
              RFP: {rfp.title} ({rfp.rfpId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-black hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <span className="text-3xl">×</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading replies...</p>
            </div>
          </div>
        ) : replies.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Replies Yet
              </h3>
              <p className="text-gray-500">
                Vendor responses will appear here once they reply to this RFP
              </p>
            </div>
          </div>
        ) : (
          /* Emails List */
          <div className="flex-1 flex overflow-hidden">
            {/* Email List - Left Side */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">
                    Replies ({replies.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {replies.map((email) => (
                    <div
                      key={email.uid}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedEmail?.uid === email.uid
                          ? "bg-purple-100 border-2 border-purple-500 shadow-md"
                          : "bg-white hover:bg-gray-100 border-2 border-transparent shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {email.from?.name ||
                              email.from?.address ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {email.from?.address}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate font-medium">
                        {email.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {email.textBody?.substring(0, 80)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Content - Right Side */}
            <div className="flex-1 overflow-y-auto bg-white">
              {selectedEmail ? (
                <div className="p-6">
                  {/* Email Header */}
                  <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {selectedEmail.subject || "No Subject"}
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-600 w-16">
                          From:
                        </span>
                        <span className="text-sm text-gray-800">
                          {selectedEmail.from?.name || "Unknown"}{" "}
                          <span className="text-gray-500">
                            &lt;{selectedEmail.from?.address}&gt;
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-600 w-16">
                          Date:
                        </span>
                        <span className="text-sm text-gray-800">
                          {selectedEmail.date
                            ? new Date(selectedEmail.date).toLocaleString(
                                "en-US",
                                {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                }
                              )
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="prose max-w-none">
                    {selectedEmail.htmlBody ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedEmail.htmlBody,
                        }}
                        className="text-gray-700"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-700">
                        {selectedEmail.textBody || "No content"}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t flex gap-3">
                    <button
                      onClick={() => {
                        if (selectedEmail.from?.address) {
                          onAwardToVendor({
                            email: selectedEmail.from.address || "",
                            name: selectedEmail.from.name || "",
                          });
                        }
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      ✅ Award to This Vendor
                    </button>
                  </div>
                </div>
              ) : (
                /* No Email Selected */
                <div className="flex items-center justify-center h-full p-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✉️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Select an email to view
                    </h3>
                    <p className="text-gray-500">
                      Click on an email from the list to read its content
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
