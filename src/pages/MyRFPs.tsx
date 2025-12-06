import { useState, useEffect } from "react";

interface RFPItem {
  name: string;
  qty: number;
  spec: string;
}

interface RFP {
  id: string;
  title: string;
  budget: number;
  deliveryTimeline: string;
  items: RFPItem[];
  paymentTerms: string;
  warranty: string;
  sentTo: string[];
  createdAt: string;
  status: "pending" | "awarded" | "closed";
  awardedTo?: string;
}

export default function MyRFPs() {
  // Load RFPs from localStorage on mount
  const [rfps, setRfps] = useState<RFP[]>(() => {
    const stored = localStorage.getItem("myRFPs");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardEmail, setAwardEmail] = useState("");

  // Save to localStorage whenever rfps change
  useEffect(() => {
    if (rfps.length > 0) {
      localStorage.setItem("myRFPs", JSON.stringify(rfps));
    }
  }, [rfps]);

  const handleAwardRFP = () => {
    if (!selectedRFP || !awardEmail) return;

    const updated = rfps.map((rfp) =>
      rfp.id === selectedRFP.id
        ? { ...rfp, status: "awarded" as const, awardedTo: awardEmail }
        : rfp
    );

    setRfps(updated);
    localStorage.setItem("myRFPs", JSON.stringify(updated));
    setShowAwardModal(false);
    setAwardEmail("");

    // Show success message
    alert(`✅ RFP "${selectedRFP.title}" has been awarded to ${awardEmail}`);
  };

  const handleCloseRFP = (rfpId: string) => {
    const updated = rfps.map((rfp) =>
      rfp.id === rfpId ? { ...rfp, status: "closed" as const } : rfp
    );
    setRfps(updated);
    localStorage.setItem("myRFPs", JSON.stringify(updated));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "awarded":
        return "bg-green-100 text-green-800 border-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📋 My RFPs</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your Request for Proposals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total RFPs</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {rfps.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {rfps.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Awarded</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {rfps.filter((r) => r.status === "awarded").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* RFP List */}
        {rfps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No RFPs created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first RFP
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Create RFP
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFP Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfps.map((rfp) => (
                    <tr key={rfp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {rfp.title}
                          </p>
                          <p className="text-xs text-gray-500">{rfp.id}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rfp.items.length} item(s)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-green-600">
                          ₹{rfp.budget.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-800">
                          {rfp.deliveryTimeline}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {rfp.sentTo.length} vendor(s)
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(
                            rfp.status
                          )}`}
                        >
                          {rfp.status.toUpperCase()}
                        </span>
                        {rfp.awardedTo && (
                          <p className="text-xs text-gray-500 mt-1">
                            to {rfp.awardedTo}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRFP(rfp)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ View
                          </button>
                          {rfp.status === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedRFP(rfp);
                                setShowAwardModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              ✅ Award
                            </button>
                          )}
                          {rfp.status !== "closed" && (
                            <button
                              onClick={() => handleCloseRFP(rfp.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              🔒 Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View RFP Modal */}
        {selectedRFP && !showAwardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  RFP Details
                </h2>
                <button
                  onClick={() => setSelectedRFP(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">RFP ID</p>
                  <p className="text-lg text-gray-800">{selectedRFP.id}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Title</p>
                  <p className="text-lg text-gray-800">{selectedRFP.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Budget
                    </p>
                    <p className="text-lg text-green-600 font-semibold">
                      ₹{selectedRFP.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Timeline
                    </p>
                    <p className="text-lg text-gray-800">
                      {selectedRFP.deliveryTimeline}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Items Required
                  </p>
                  <div className="space-y-2">
                    {selectedRFP.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">{item.spec}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Payment Terms
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedRFP.paymentTerms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Warranty
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedRFP.warranty}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Sent To</p>
                  <p className="text-sm text-gray-800">
                    {selectedRFP.sentTo.join(", ")}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRFP(null)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Award RFP Modal */}
        {showAwardModal && selectedRFP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Award RFP
              </h2>

              <p className="text-gray-600 mb-4">
                You are about to award "{selectedRFP.title}" to a vendor.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor Email
                </label>
                <input
                  type="email"
                  value={awardEmail}
                  onChange={(e) => setAwardEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAwardModal(false);
                    setAwardEmail("");
                  }}
                  className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAwardRFP}
                  disabled={!awardEmail}
                  className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Award
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
