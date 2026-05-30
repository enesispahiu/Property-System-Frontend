import { useEffect, useMemo, useState } from "react";
import { getSearchHistory } from "../services/api.js";
import styles from "./SearchAnalytics.module.css";

const PAGE_SIZE = 8;

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatSearchQuery(value) {
  if (!value) {
    return { query: "-", filters: "-" };
  }

  try {
    const parsed = JSON.parse(value);
    const query =
      parsed.location || parsed.category || parsed.propertyType || "All properties";
    const filters = Object.entries(parsed)
      .filter(([, filterValue]) => filterValue)
      .map(([key, filterValue]) => `${key}: ${filterValue}`)
      .join(", ");

    return { query, filters: filters || "-" };
  } catch {
    return { query: value, filters: "-" };
  }
}

function SearchAnalytics() {
  const [searchHistory, setSearchHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSearchHistory() {
    setError("");
    setIsLoading(true);

    try {
      const data = await getSearchHistory();
      setSearchHistory(Array.isArray(data) ? data : []);
      setVisibleCount(PAGE_SIZE);
    } catch (requestError) {
      setSearchHistory([]);
      setError(requestError.message || "Unable to load search analytics.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const visibleHistory = useMemo(
    () => searchHistory.slice(0, visibleCount),
    [searchHistory, visibleCount],
  );
  const canShowMore = visibleCount < searchHistory.length;

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>Platform</p>
        <h1>Search Analytics</h1>
        <p>
          Review global public search history across the platform. This data is
          available only to SuperAdmin users.
        </p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.panelEyebrow}>Global platform activity</p>
            <h2>Search History</h2>
          </div>
          <button type="button" onClick={loadSearchHistory}>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className={styles.empty}>Loading search history...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : searchHistory.length === 0 ? (
          <div className={styles.empty}>No search history yet.</div>
        ) : (
          <>
            <div className={styles.table}>
              {visibleHistory.map((entry) => {
                const formatted = formatSearchQuery(entry.query);

                return (
                  <article key={entry.id} className={styles.row}>
                    <div>
                      <strong>{formatted.query}</strong>
                      <span>{formatted.filters}</span>
                    </div>
                    <time dateTime={entry.createdAt || ""}>
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </article>
                );
              })}
            </div>

            {canShowMore ? (
              <div className={styles.moreActions}>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) => current + PAGE_SIZE)
                  }
                >
                  Show more
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

export default SearchAnalytics;
