"use client";

export default function ScheduleModal({
  showScheduleModal,
  setShowScheduleModal,
  getFutureDate,
  scheduleDate,
  setScheduleDate,
  status,
  schedulePost,
}) {
  function formatForDateTimeInput(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return (
    <>
      {/* schedule modal */}
      {showScheduleModal && (
        <div
          className="fixed h-full inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Schedule Post</h2>

            <button
              onClick={() => schedulePost(getFutureDate(1))}
              className="w-full border rounded-lg py-2"
            >
              In 1 Hour
            </button>

            <button
              onClick={() => schedulePost(getFutureDate(12))}
              className="w-full border rounded-lg py-2"
            >
              In 12 Hours
            </button>

            <button
              onClick={() => schedulePost(getFutureDate(24))}
              className="w-full border rounded-lg py-2"
            >
              In 24 Hours
            </button>

            <div className="flex gap-4">
              <input
                type="datetime-local"
                value={scheduleDate ? formatForDateTimeInput(scheduleDate) : ""}
                onChange={(e) => {
                  if (!e.target.value) {
                    setScheduleDate(null);
                    return;
                  }

                  setScheduleDate(new Date(e.target.value).toISOString());
                }}
                className="w-full border rounded-lg p-2"
              />
              <button
                onClick={() => schedulePost(scheduleDate)}
                disabled={!scheduleDate}
                className="w-full bg-[#C5A572] text-white rounded-lg py-2"
              >
                {status === "scheduled" ? "Reschedule" : "Schedule"}
              </button>
            </div>

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
