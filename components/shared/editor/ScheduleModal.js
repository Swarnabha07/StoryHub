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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 h-full"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-xl p-4 md:p-6 w-[95%] max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Schedule Post</h2>

            <button
              onClick={() => schedulePost(getFutureDate(1))}
              className="w-full border rounded-lg py-2.5 text-sm md:text-base"
            >
              In 1 Hour
            </button>

            <button
              onClick={() => schedulePost(getFutureDate(12))}
              className="w-full border rounded-lg py-2.5 text-sm md:text-base"
            >
              In 12 Hours
            </button>

            <button
              onClick={() => schedulePost(getFutureDate(24))}
              className="w-full border rounded-lg py-2.5 text-sm md:text-base"
            >
              In 24 Hours
            </button>

            <div className="flex flex-col md:flex-row gap-3 md:gap-6">
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
                className="w-full border rounded-lg p-2.5 text-sm md:text-base"
              />
              <button
                onClick={() => schedulePost(scheduleDate)}
                disabled={!scheduleDate}
                className="w-full bg-[#C5A572] text-white rounded-lg py-2.5 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "scheduled" ? "Reschedule" : "Schedule"}
              </button>
            </div>

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full text-gray-500 text-sm md:text-base hover:text-[#5A2A27]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
