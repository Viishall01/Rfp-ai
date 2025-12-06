import { useState, useEffect } from "react";

interface ParsedEmail {
  uid: number;
  messageId: string | undefined;
  from:
    | {
        name: string | undefined;
        address: string | undefined;
      }
    | undefined;
  to:
    | {
        name: string | undefined;
        address: string | undefined;
      }[]
    | undefined;
  subject: string | undefined;
  date: Date | undefined;
  textBody: string | undefined;
  htmlBody: string | undefined;
}

export default function Inbox() {
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  const [error, setError] = useState("");

  const fetchEmails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/check-inbox");
      const data = await response.json();

      if (data.success) {
        // Filter for RFP-related emails and sort by date (newest first)
        const rfpEmails = (data.messages || [])
          .filter((email: ParsedEmail) => {
            // Show emails that are replies (have "Re:" in subject) or contain RFP keywords
            const subject = email.subject?.toLowerCase() || "";
            const isReply = subject.includes("re:");
            const isRFP =
              subject.includes("rfp") || subject.includes("proposal");
            const from = email.from?.address?.toLowerCase() || "";

            // Filter out system emails (Google, MongoDB, ChatGPT, etc.)
            const isSystemEmail =
              from.includes("no-reply") ||
              from.includes("noreply") ||
              from.includes("notifications") ||
              from.includes("mailer-daemon") ||
              from.includes("mongodb") ||
              from.includes("openai");

            return (isReply || isRFP) && !isSystemEmail;
          })
          .sort((a: ParsedEmail, b: ParsedEmail) => {
            // Sort by date, newest first
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });

        setEmails(rfpEmails);
      } else {
        setError(data.error || "Failed to fetch emails");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Inbox error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📬 RFP Inbox</h1>
            <p className="text-gray-600 mt-1">
              View vendor responses to your RFPs
            </p>
          </div>
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && emails.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading emails...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && emails.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No RFP responses yet
            </h3>
            <p className="text-gray-500 mb-4">
              Vendor responses to your RFPs will appear here
            </p>
            <p className="text-sm text-gray-400">
              Note: Only emails with "Re:" or "RFP" in the subject are shown
              here
            </p>
          </div>
        )}

        {/* Email Grid */}
        {!loading && emails.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Emails ({emails.length})
                </h2>
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {emails.map((email) => (
                    <div
                      key={email.uid}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedEmail?.uid === email.uid
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {email.from?.name ||
                              email.from?.address ||
                              "Unknown"}
                          </h3>
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
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {email.textBody?.substring(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="lg:col-span-2">
              {selectedEmail ? (
                <div className="bg-white rounded-xl shadow-md p-6">
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
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                      ✅ Award RFP
                    </button>
                    <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                      🗑️ Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">✉️</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select an email to view
                  </h3>
                  <p className="text-gray-500">
                    Click on an email from the list to read its content
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
