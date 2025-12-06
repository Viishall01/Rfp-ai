import { useState, useEffect } from "react";
import type { RFP, Stats, ParsedEmail, Recipient } from "../types/rfp.types";
import { rfpService } from "../services/rfp.service";
import StatsCards from "../components/RFP/StatsCards";
import RFPTable from "../components/RFP/RFPTable";
import ViewRFPModal from "../components/RFP/ViewRFPModal";
import AwardRFPModal from "../components/RFP/AwardRFPModal";
import RepliesModal from "../components/RFP/RepliesModal";

export default function MyRFPs() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    awarded: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [rfpReplies, setRfpReplies] = useState<ParsedEmail[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Fetch RFPs from MongoDB
  const fetchRFPs = async () => {
    setLoading(true);
    const result = await rfpService.fetchRFPs();
    if (result.success && result.data) {
      setRfps(result.data);
    } else {
      console.error("Failed to fetch RFPs:", result.error);
    }
    setLoading(false);
  };

  // Fetch stats from MongoDB
  const fetchStats = async () => {
    const result = await rfpService.fetchStats();
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      console.error("Failed to fetch stats:", result.error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchRFPs();
      await fetchStats();
    };
    loadData();
  }, []);

  const handleAwardRFP = async (awardedTo: Recipient) => {
    if (!selectedRFP) return;

    const result = await rfpService.awardRFP(selectedRFP._id, awardedTo);

    if (result.success) {
      await fetchRFPs();
      await fetchStats();
      setShowAwardModal(false);
      alert(
        `✅ RFP "${selectedRFP.title}" has been awarded to ${awardedTo.name}`
      );
    } else {
      alert("❌ Failed to award RFP: " + result.error);
    }
  };

  const handleCloseRFP = async (rfpId: string) => {
    const result = await rfpService.closeRFP(rfpId);

    if (result.success) {
      await fetchRFPs();
      await fetchStats();
    } else {
      alert("❌ Failed to close RFP: " + result.error);
    }
  };

  const handleViewReplies = async (rfp: RFP) => {
    setSelectedRFP(rfp);
    setShowRepliesModal(true);
    setLoadingReplies(true);
    setRfpReplies([]);

    const result = await rfpService.fetchRFPReplies(rfp.rfpId);

    if (result.success && result.messages) {
      setRfpReplies(result.messages);
    } else {
      console.error("Failed to fetch RFP replies:", result.error);
    }

    setLoadingReplies(false);
  };

  const handleViewRFP = (rfp: RFP) => {
    setSelectedRFP(rfp);
    setShowViewModal(true);
  };

  const handleAwardFromReplies = () => {
    setShowRepliesModal(false);
    setShowAwardModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📋 My RFPs</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your Request for Proposals
            </p>
          </div>
          <button
            onClick={() => {
              fetchRFPs();
              fetchStats();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading RFPs...</p>
          </div>
        ) : rfps.length === 0 ? (
          /* Empty State */
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
          /* RFP List */
          <RFPTable
            rfps={rfps}
            onViewRFP={handleViewRFP}
            onViewReplies={handleViewReplies}
            onAwardRFP={(rfp) => {
              setSelectedRFP(rfp);
              setShowAwardModal(true);
            }}
            onCloseRFP={handleCloseRFP}
          />
        )}

        {/* View RFP Modal */}
        {selectedRFP && showViewModal && !showAwardModal && (
          <ViewRFPModal
            rfp={selectedRFP}
            onClose={() => setShowViewModal(false)}
          />
        )}

        {/* Award RFP Modal */}
        {showAwardModal && selectedRFP && (
          <AwardRFPModal
            rfp={selectedRFP}
            onClose={() => setShowAwardModal(false)}
            onAward={handleAwardRFP}
          />
        )}

        {/* View Replies Modal */}
        {showRepliesModal && selectedRFP && (
          <RepliesModal
            rfp={selectedRFP}
            replies={rfpReplies}
            loading={loadingReplies}
            onClose={() => {
              setShowRepliesModal(false);
              setSelectedRFP(null);
              setRfpReplies([]);
            }}
            onAwardToVendor={handleAwardFromReplies}
          />
        )}
      </div>
    </div>
  );
}
