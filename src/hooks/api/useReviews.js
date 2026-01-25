import { useState, useEffect, useCallback } from 'react';
import * as reviewService from '../../api/reviewService';

/**
 * Hook for fetching and managing reviews
 *
 * Usage:
 * const { reviews, loading, error, createReview, ... } = useReviews({ merchant_id: 1 });
 */
export function useReviews(filters = {}) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await reviewService.getReviews({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setReviews(result.reviews || []);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const createReview = async (reviewData) => {
    try {
      const result = await reviewService.createReview(reviewData);

      if (result.success) {
        // Add to local state
        setReviews((prev) => [result.review, ...prev]);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateReview = async (reviewId, updates) => {
    try {
      const result = await reviewService.updateReview(reviewId, updates);

      if (result.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? result.review : r))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const result = await reviewService.deleteReview(reviewId);

      if (result.success) {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const respondToReview = async (reviewId, responseText) => {
    try {
      const result = await reviewService.respondToReview(reviewId, responseText);

      if (result.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? result.review : r))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    pagination,
    loading,
    error,
    refresh: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
  };
}

/**
 * Hook for fetching single review details
 */
export function useReview(reviewId) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReview = useCallback(async () => {
    if (!reviewId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await reviewService.getReviewById(reviewId);

      if (result.success) {
        setReview(result.review);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  return {
    review,
    loading,
    error,
    refresh: fetchReview,
  };
}

/**
 * Hook for fetching review statistics
 */
export function useReviewStats(type, id) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!type || !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await reviewService.getReviewStats(type, id);

      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load review stats');
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * Hook for creating a review with form state
 */
export function useCreateReview() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const result = await reviewService.createReview(reviewData);

      if (result.success) {
        setSuccess(true);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const message = err.message || 'Failed to submit review';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitting(false);
    setError(null);
    setSuccess(false);
  };

  return {
    submitReview,
    submitting,
    error,
    success,
    reset,
  };
}

export default useReviews;
