import { toast } from "react-toastify";

class NotificationAggregator {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(toastOptions) {
    this.queue.push(toastOptions);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    const nextToast = this.queue.shift();

    toast(nextToast.content, nextToast.options);

    setTimeout(() => {
      this.processQueue();
    }, 5000); // show at most one toast every 5 seconds
  }
}

const notificationAggregator = new NotificationAggregator();

export default notificationAggregator;
