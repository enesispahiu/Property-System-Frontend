import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  getAdminProperties,
  getBookings,
  getCurrentUser,
  getMyFavorites,
  getProperties,
  getPropertyReviews,
  getTenants,
  getUsers,
  getUserBookings,
  payBooking,
} from "../services/api.js";
import styles from "./Dashboard.module.css";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function StatCard({ label, value, helper }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

function EmptyState({ children }) {
  return <div className={styles.empty}>{children}</div>;
}

const paymentMethods = ["CARD", "CASH", "BANK_TRANSFER"];

function BookingList({
  bookings,
  onCancel,
  onPay,
  selectedMethods = {},
  onMethodChange,
  payingBookingId,
  compact = false,
}) {
  if (!bookings.length) {
    return <EmptyState>No bookings found.</EmptyState>;
  }

  return (
    <div className={styles.bookings}>
      {bookings.map((booking) => {
        const paymentStatus = booking.paymentStatus || "UNPAID";
        const canPay =
          !compact &&
          onPay &&
          booking.status === "PENDING" &&
          paymentStatus !== "PAID";

        return (
          <article key={booking.id} className={styles.booking}>
            <div>
              <h3>{booking.property?.title || `Booking #${booking.id}`}</h3>
              {booking.property?.location ? <p>{booking.property.location}</p> : null}
              <p>
                Booking #{booking.id} - property #{booking.propertyId} -{" "}
                {booking.user?.email ? `${booking.user.email} - ` : ""}
                {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
              </p>
            </div>

            <div className={styles.bookingMeta}>
              <strong>{money(booking.totalPrice)}</strong>
              <span>{booking.status || "PENDING"}</span>
              <span>{paymentStatus}</span>
              {booking.paymentMethod ? <small>{booking.paymentMethod}</small> : null}
            </div>

            {canPay ? (
              <div className={styles.paymentControls}>
                <select
                  value={selectedMethods[booking.id] || "CARD"}
                  onChange={(event) =>
                    onMethodChange?.(booking.id, event.target.value)
                  }
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onPay(booking.id)}
                  disabled={payingBookingId === booking.id}
                >
                  {payingBookingId === booking.id ? "Paying..." : "Pay"}
                </button>
              </div>
            ) : null}

            {!compact && onCancel && booking.status !== "CANCELLED" ? (
              <button type="button" onClick={() => onCancel(booking.id)}>
                Cancel
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ReviewList({ reviews }) {
  if (!reviews.length) {
    return <EmptyState>No reviews found.</EmptyState>;
  }

  return (
    <div className={styles.bookings}>
      {reviews.map((review) => (
        <article key={`${review.propertyId}-${review.id}`} className={styles.booking}>
          <div>
            <h3>{review.property?.title || `Property #${review.propertyId}`}</h3>
            <p>
              Review #{review.id} - {review.rating}/5 -{" "}
              {review.user?.email || `user #${review.userId || "-"}`}
            </p>
            <p>{review.comment}</p>
          </div>
          <div className={styles.bookingMeta}>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function UserDashboard({
  user,
  bookings,
  reviews,
  favorites,
  paymentMessage,
  selectedMethods,
  payingBookingId,
  onRefresh,
  onCancel,
  onPay,
  onMethodChange,
}) {
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  );
  const cancelledBookingsList = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  );
  const paidConfirmedBookings = confirmedBookings.filter(
    (booking) => booking.paymentStatus === "PAID",
  );
  const totalSpent = paidConfirmedBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0,
  );

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Customer dashboard</p>
          <h1>My bookings and saved stays</h1>
          <p>
            Signed in as <strong>{user.email}</strong> ({user.role})
          </p>
        </div>
        <div className={styles.tenantBadge}>Personal account</div>
      </section>

      <section className={styles.stats}>
        <StatCard label="My active bookings" value={confirmedBookings.length} />
        <StatCard label="My pending bookings" value={pendingBookings.length} />
        <StatCard label="My cancelled bookings" value={cancelledBookingsList.length} />
        <StatCard label="Total spent" value={money(totalSpent)} />
        <StatCard label="Saved properties" value={favorites.length} />
        <StatCard label="My reviews" value={reviews.length} />
      </section>

      {paymentMessage ? <div className={styles.status}>{paymentMessage}</div> : null}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Favorites</h2>
            <p>{favorites.length} saved properties</p>
          </div>
          <Link to="/my-favorites">View all favorites</Link>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Confirmed bookings</h2>
            <p>Paid and confirmed stays</p>
          </div>
          <button type="button" onClick={onRefresh}>
            Refresh
          </button>
        </div>

        <BookingList bookings={confirmedBookings} onCancel={onCancel} />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Pending reservations</h2>
            <p>Unpaid reservations are not counted in total spent</p>
          </div>
        </div>

        <BookingList
          bookings={pendingBookings}
          onCancel={onCancel}
          onPay={onPay}
          selectedMethods={selectedMethods}
          onMethodChange={onMethodChange}
          payingBookingId={payingBookingId}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Booking history</h2>
            <p>Cancelled bookings are kept for history</p>
          </div>
        </div>

        <BookingList bookings={cancelledBookingsList} compact />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>My reviews</h2>
            <p>Reviews you left on properties</p>
          </div>
        </div>
        <ReviewList reviews={reviews} />
      </section>
    </main>
  );
}

function TenantAdminDashboard({
  user,
  bookings,
  properties,
  reviews,
  onRefresh,
}) {
  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (booking) => booking.status !== "CANCELLED",
    ).length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "CANCELLED",
    ).length;
    const pendingBookings = bookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;
    const totalIncome = bookings
      .filter(
        (booking) =>
          booking.status === "CONFIRMED" && booking.paymentStatus === "PAID",
      )
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        : 0;

    return {
      activeBookings,
      cancelledBookings,
      pendingBookings,
      totalIncome,
      averageRating,
    };
  }, [bookings, reviews]);

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Business dashboard</p>
          <h1>Business performance overview</h1>
          <p>
            Signed in as <strong>{user.email}</strong> for tenant #{user.tenantId}.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/business/operations">Business Operations</Link>
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard label="Total income" value={money(stats.totalIncome)} />
        <StatCard label="Active bookings" value={stats.activeBookings} />
        <StatCard label="Cancelled bookings" value={stats.cancelledBookings} />
        <StatCard label="Pending bookings" value={stats.pendingBookings} />
        <StatCard label="Total properties" value={properties.length} />
        <StatCard
          label="Total reviews"
          value={reviews.length}
          helper={
            stats.averageRating ? `${stats.averageRating.toFixed(1)}/5 avg` : "No rating"
          }
        />
      </section>

      <section className={styles.quickActions}>
        <Link to="/business/operations">Manage Listings</Link>
        <Link to="/business/operations">Manage Reservations</Link>
        <Link to="/business/reviews">Guest Reviews</Link>
        <Link to="/business">Tenant Settings</Link>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent bookings</h2>
              <p>Latest tenant booking activity</p>
            </div>
            <button type="button" onClick={onRefresh}>
              Refresh
            </button>
          </div>
          <BookingList bookings={bookings.slice(0, 6)} compact />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent reviews</h2>
              <p>Feedback for tenant properties</p>
            </div>
          </div>
          <ReviewList reviews={reviews.slice(0, 6)} />
        </div>
      </section>
    </main>
  );
}

function SuperAdminDashboard({
  user,
  tenants,
  bookings,
  properties,
  users,
  dataUnavailable,
  onRefresh,
}) {
  const totalUsers =
    users.length ||
    tenants.reduce((sum, tenant) => sum + Number(tenant._count?.users || 0), 0);
  const totalProperties =
    properties.length ||
    tenants.reduce(
      (sum, tenant) => sum + Number(tenant._count?.properties || 0),
      0,
    );
  const totalBookings =
    bookings.length ||
    tenants.reduce((sum, tenant) => sum + Number(tenant._count?.bookings || 0), 0);
  const activeTenants = tenants.filter(
    (tenant) => (tenant.status || "ACTIVE") === "ACTIVE",
  ).length;
  const inactiveTenants = tenants.filter(
    (tenant) => tenant.status && tenant.status !== "ACTIVE",
  ).length;

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Platform dashboard</p>
          <h1>SaaS platform overview</h1>
          <p>
            Signed in as <strong>{user.email}</strong>. Platform-level metrics
            across all tenants.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/platform/tenant-management">Tenant Management</Link>
        </div>
      </section>

      {dataUnavailable ? (
        <div className={styles.status}>Some dashboard data unavailable.</div>
      ) : null}

      <section className={styles.stats}>
        <StatCard label="Total tenants" value={tenants.length} />
        <StatCard label="Active tenants" value={activeTenants} />
        <StatCard label="Inactive tenants" value={inactiveTenants} />
        <StatCard label="Total users" value={totalUsers || "Data unavailable"} />
        <StatCard
          label="Total properties"
          value={totalProperties || "Data unavailable"}
        />
        <StatCard
          label="Total bookings"
          value={totalBookings || "Data unavailable"}
        />
      </section>

      <section className={styles.quickActions}>
        <Link to="/platform/tenant-management">Manage Tenants</Link>
        <Link to="/platform/tenant-management">Create Tenant</Link>
        <Link to="/platform/tenant-management">Create Tenant Admin</Link>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Tenant overview</h2>
            <p>Recent tenant registrations and platform footprint</p>
          </div>
          <button type="button" onClick={onRefresh}>
            Refresh
          </button>
        </div>

        {tenants.length === 0 ? (
          <EmptyState>No tenants found.</EmptyState>
        ) : (
          <div className={styles.bookings}>
            {tenants.slice(0, 8).map((tenant) => (
              <article key={tenant.id} className={styles.booking}>
                <div>
                  <h3>{tenant.name}</h3>
                  <p>
                    #{tenant.id} - {tenant.slug || "no slug"} -{" "}
                    {formatDate(tenant.createdAt)}
                  </p>
                </div>
                <div className={styles.bookingMeta}>
                  <strong>{tenant._count?.properties || 0}</strong>
                  <span>properties</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataUnavailable, setDataUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [selectedMethods, setSelectedMethods] = useState({});
  const [payingBookingId, setPayingBookingId] = useState(null);

  async function loadReviewsForProperties(propertyList, currentUser) {
    const reviewGroups = await Promise.all(
      propertyList.map((property) =>
        getPropertyReviews(property.id)
          .then((items) =>
            Array.isArray(items)
              ? items.map((review) => ({
                  ...review,
                  propertyId: property.id,
                  property: review.property || {
                    id: property.id,
                    title: property.title,
                  },
                }))
              : [],
          )
          .catch(() => []),
      ),
    );

    const allReviews = reviewGroups
      .flat()
      .sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime(),
      );

    if (currentUser.role === "USER") {
      return allReviews.filter((review) => review.userId === currentUser.id);
    }

    return allReviews;
  }

  async function loadDashboard() {
    setIsLoading(true);
    setError("");
    setPaymentMessage("");
    setDataUnavailable(false);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser.role === "SUPER_ADMIN") {
        const [tenantData, propertyData, bookingData, userData] = await Promise.all([
          getTenants().catch(() => {
            setDataUnavailable(true);
            return [];
          }),
          getAdminProperties().catch(() => {
            setDataUnavailable(true);
            return [];
          }),
          getBookings().catch(() => {
            setDataUnavailable(true);
            return [];
          }),
          getUsers().catch(() => []),
        ]);

        setTenants(Array.isArray(tenantData) ? tenantData : []);
        setProperties(Array.isArray(propertyData) ? propertyData : []);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setFavorites([]);
        setUsers(Array.isArray(userData) ? userData : []);
        setReviews([]);
        return;
      }

      if (currentUser.role === "TENANT_ADMIN") {
        const [propertyData, bookingData] = await Promise.all([
          getAdminProperties().catch(() => []),
          getBookings().catch(() => []),
        ]);
        const reviewData = await loadReviewsForProperties(propertyData, currentUser);

        setProperties(Array.isArray(propertyData) ? propertyData : []);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setFavorites([]);
        setReviews(reviewData);
        return;
      }

      const [bookingData, favoriteData] = await Promise.all([
        currentUser?.id ? getUserBookings(currentUser.id) : Promise.resolve([]),
        getMyFavorites().catch(() => []),
      ]);
      const propertyData = await getProperties({ page: 1, limit: 500 }).catch(() => []);
      const reviewData = await loadReviewsForProperties(propertyData, currentUser);

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setFavorites(Array.isArray(favoriteData) ? favoriteData : []);
      setProperties(Array.isArray(propertyData) ? propertyData : []);
      setReviews(reviewData);
    } catch (requestError) {
      setError(requestError.message || "Dashboard data unavailable.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCancel(bookingId) {
    try {
      await cancelBooking(bookingId);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || "Unable to cancel booking.");
    }
  }

  function handleMethodChange(bookingId, method) {
    setSelectedMethods((current) => ({ ...current, [bookingId]: method }));
  }

  async function handlePay(bookingId) {
    setPayingBookingId(bookingId);
    setError("");
    setPaymentMessage("");

    try {
      await payBooking(bookingId, selectedMethods[bookingId] || "CARD");
      await loadDashboard();
      setPaymentMessage("Payment completed.");
    } catch (requestError) {
      setError(requestError.message || "Unable to complete payment.");
    } finally {
      setPayingBookingId(null);
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading dashboard...</main>;
  }

  if (error) {
    return <main className={styles.state}>{error}</main>;
  }

  if (!user) {
    return <main className={styles.state}>Dashboard data unavailable.</main>;
  }

  if (user.role === "SUPER_ADMIN") {
    return (
      <SuperAdminDashboard
        user={user}
        tenants={tenants}
        bookings={bookings}
        properties={properties}
        users={users}
        dataUnavailable={dataUnavailable}
        onRefresh={loadDashboard}
      />
    );
  }

  if (user.role === "TENANT_ADMIN") {
    return (
      <TenantAdminDashboard
        user={user}
        bookings={bookings}
        properties={properties}
        reviews={reviews}
        onRefresh={loadDashboard}
      />
    );
  }

  return (
    <UserDashboard
      user={user}
      bookings={bookings}
      reviews={reviews}
      favorites={favorites}
      paymentMessage={paymentMessage}
      selectedMethods={selectedMethods}
      payingBookingId={payingBookingId}
      onRefresh={loadDashboard}
      onCancel={handleCancel}
      onPay={handlePay}
      onMethodChange={handleMethodChange}
    />
  );
}

export default Dashboard;
