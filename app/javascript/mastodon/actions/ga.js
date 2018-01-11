import GoogleAnalytics from 'react-ga';

GoogleAnalytics.initialize('UA-1830249-136');

export const startHeartbeat = () => {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return setInterval(() => {
    GoogleAnalytics.event({
      category: 'Heartbeat',
      action: 'Heartbeat',
    });
  }, 10 * 60 * 1000);
};

export const trackPage = (page) => {
  if (process.env.NODE_ENV !== 'production' || page.indexOf('/admin/') === 0) {
    return;
  }

  const options = {};

  const userIdElement = document.querySelector('meta[name=ga-uid]');
  if (userIdElement) {
    const userId = userIdElement.getAttribute('content');
    if (userId) {
      options.userId = userId;
    }
  }

  GoogleAnalytics.set({
    page,
    ...options,
  });
  GoogleAnalytics.pageview(page);
};