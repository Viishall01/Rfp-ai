import type { RFP } from "../../types/rfp.types";
import { getStatusBadge } from "../../utils/rfp.utils";
import { Eye, Mail, Award, Lock } from "lucide-react";

interface RFPTableProps {
  rfps: RFP[];
  onViewRFP: (rfp: RFP) => void;
  onViewReplies: (rfp: RFP) => void;
  onAwardRFP: (rfp: RFP) => void;
  onCloseRFP: (rfpId: string) => void;
}

export default function RFPTable({
  rfps,
  onViewRFP,
  onViewReplies,
  onAwardRFP,
  onCloseRFP,
}: RFPTableProps) {
  return (
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
              <tr key={rfp._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {rfp.title}
                    </p>
                    <p className="text-xs text-gray-500">{rfp.rfpId}</p>
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
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(
                      rfp.status
                    )}`}
                  >
                    {rfp.status.toUpperCase()}
                  </span>
                  {rfp.awardedTo && (
                    <p className="text-xs text-gray-500 mt-1">
                      to {rfp.awardedTo.name}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewRFP(rfp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onViewReplies(rfp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                      title="View Replies"
                    >
                      <Mail size={16} />
                    </button>
                    {rfp.status === "pending" && (
                      <button
                        onClick={() => onAwardRFP(rfp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                        title="Award RFP"
                      >
                        <Award size={16} />
                        <span>Award</span>
                      </button>
                    )}
                    {rfp.status !== "closed" && (
                      <button
                        onClick={() => onCloseRFP(rfp._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                        title="Close RFP"
                      >
                        <Lock size={16} />
                        <span>Close</span>
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
  );
}
