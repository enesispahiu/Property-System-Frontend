import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  createProperty,
  deleteBooking,
  deleteProperty,
  deleteReview,
  deleteUser,
  getBookings,
  getCurrentUser,
  getProperties,
  getPropertyReviews,
  getUsers,
  generatePropertyDescription,
  createTenant,
  createTenantAdmin,
  deleteTenant,
  getTenants,
  updateTenant,
  updateProperty,
  updateBookingStatus,
  updateUserRole,
} from "../services/api.js";
import styles from "./AdminPanel.module.css";

const initialPropertyForm = {
  title: "",
  description: "",
  location: "",
  price: "",
};

const initialTenantForm = {
  name: "",
  slug: "",
  domain: "",
  logoUrl: "",
  primaryColor: "#ff385c",
};

const initialTenantAdminForm = {
  tenantId: "",
  email: "",
  password: "12345678",
};

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

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedReviewPropertyId, setSelectedReviewPropertyId] = useState("");
  const [propertyForm, setPropertyForm] = useState(initialPropertyForm);
  const [tenantForm, setTenantForm] = useState(initialTenantForm);
  const [tenantAdminForm, setTenantAdminForm] = useState(initialTenantAdminForm);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const roleOptions = useMemo(() => {
    return users
      .map((entry) => ({ id: entry.roleId, name: entry.role?.name || `Role ${entry.roleId}` }))
      .filter(
      (role, index, all) =>
        role.id && all.findIndex((candidate) => candidate.id === role.id) === index,
      );
  }, [users]);

  async function loadAdminData(nextUser = user) {
    setError("");
    setStatus("");

    try {
      const currentUser = nextUser || (await getCurrentUser());
      setUser(currentUser);

      if (currentUser.role === "SUPER_ADMIN") {
        const tenantsData = await getTenants().catch(() => []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setIsLoading(false);
        return;
      }

      if (currentUser.role !== "TENANT_ADMIN") {
        setIsLoading(false);
        return;
      }

      const [usersData, propertiesData, bookingsData] = await Promise.all([
        getUsers().catch(() => []),
        getProperties({ page: 1, limit: 100 }).catch(() => []),
        getBookings().catch(() => []),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const firstPropertyId = selectedReviewPropertyId || propertiesData?.[0]?.id || "";
      setSelectedReviewPropertyId(firstPropertyId ? String(firstPropertyId) : "");

      if (firstPropertyId) {
        const reviewData = await getPropertyReviews(firstPropertyId).catch(() => []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } else {
        setReviews([]);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to load admin panel.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadReviews(propertyId) {
    setSelectedReviewPropertyId(propertyId);
    setStatus("");

    if (!propertyId) {
      setReviews([]);
      return;
    }

    try {
      const reviewData = await getPropertyReviews(propertyId);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to load reviews.");
      setReviews([]);
    }
  }

  function updatePropertyField(event) {
    const { name, value } = event.target;
    setPropertyForm((current) => ({ ...current, [name]: value }));
  }

  function updateTenantField(event) {
    const { name, value } = event.target;
    setTenantForm((current) => ({ ...current, [name]: value }));
  }

  function updateTenantAdminField(event) {
    const { name, value } = event.target;
    setTenantAdminForm((current) => ({ ...current, [name]: value }));
  }

  function beginEditTenant(tenant) {
    setEditingTenantId(tenant.id);
    setTenantForm({
      name: tenant.name || "",
      slug: tenant.slug || "",
      domain: tenant.domain || "",
      logoUrl: tenant.logoUrl || "",
      primaryColor: tenant.primaryColor || "",
    });
    setStatus("");
  }

  function resetTenantForm() {
    setEditingTenantId(null);
    setTenantForm(initialTenantForm);
  }

  function beginEditProperty(property) {
    setEditingPropertyId(property.id);
    setPropertyForm({
      title: property.title || "",
      description: property.description || "",
      location: property.location || "",
      price: String(property.price || ""),
    });
  }

  async function handleSaveProperty(event) {
    event.preventDefault();
    setStatus("");

    try {
      const payload = {
        ...propertyForm,
        price: Number(propertyForm.price),
      };

      if (editingPropertyId) {
        await updateProperty(editingPropertyId, payload);
        setStatus("Property updated.");
      } else {
        await createProperty(payload);
        setStatus("Property created.");
      }

      setPropertyForm(initialPropertyForm);
      setEditingPropertyId(null);
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to save property.");
    }
  }

  async function handleGenerateDescription() {
    setStatus("");

    if (!propertyForm.title || !propertyForm.location) {
      setStatus("Please enter title and location before generating description.");
      return;
    }

    if (!propertyForm.price) {
      setStatus("Please enter price before generating description.");
      return;
    }

    setIsGeneratingDescription(true);

    try {
      const response = await generatePropertyDescription(propertyForm);
      setPropertyForm((current) => ({
        ...current,
        description: response.result || current.description,
      }));
      setStatus("AI description generated.");
    } catch {
      setStatus("AI could not generate description. Please try again.");
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  async function handleDeleteProperty(id) {
    setStatus("");

    try {
      await deleteProperty(id);
      setStatus("Property deleted.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to delete property.");
    }
  }

  async function handleUpdateRole(userId, roleId) {
    setStatus("");

    try {
      await updateUserRole(userId, roleId);
      setStatus("User role updated.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to update user role.");
    }
  }

  async function handleDeleteUser(userId) {
    setStatus("");

    try {
      await deleteUser(userId);
      setStatus("User deleted.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to delete user.");
    }
  }

  async function handleCancelBooking(id) {
    setStatus("");

    try {
      await cancelBooking(id);
      setStatus("Booking cancelled.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to cancel booking.");
    }
  }

  async function handleDeleteBooking(id) {
    setStatus("");

    try {
      await deleteBooking(id);
      setStatus("Booking deleted.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to delete booking.");
    }
  }

  async function handleUpdateBookingStatus(id, status) {
    setStatus("");

    try {
      await updateBookingStatus(id, status);
      setStatus("Booking status updated.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to update booking status.");
    }
  }

  async function handleDeleteReview(id) {
    setStatus("");

    try {
      await deleteReview(id);
      setStatus("Review deleted.");
      await loadReviews(selectedReviewPropertyId);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to delete review.");
    }
  }

  async function handleSaveTenant(event) {
    event.preventDefault();
    setStatus("");

    try {
      const payload = {
        ...tenantForm,
        slug: tenantForm.slug || undefined,
        domain: tenantForm.domain || undefined,
        logoUrl: tenantForm.logoUrl || undefined,
        primaryColor: tenantForm.primaryColor || undefined,
      };

      if (editingTenantId) {
        await updateTenant(editingTenantId, payload);
        setStatus("Tenant updated.");
      } else {
        await createTenant(payload);
        setStatus("Tenant created.");
      }

      resetTenantForm();
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to save tenant.");
    }
  }

  async function handleCreateTenantAdmin(event) {
    event.preventDefault();
    setStatus("");

    try {
      await createTenantAdmin(tenantAdminForm.tenantId, {
        email: tenantAdminForm.email,
        password: tenantAdminForm.password,
      });
      setTenantAdminForm(initialTenantAdminForm);
      setStatus("Tenant admin created.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to create tenant admin.");
    }
  }

  async function handleDeleteTenant(id) {
    setStatus("");

    try {
      await deleteTenant(id);
      setStatus("Tenant deleted.");
      await loadAdminData(user);
    } catch (requestError) {
      setStatus(requestError.message || "Unable to delete tenant.");
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading admin panel...</main>;
  }

  if (error) {
    return <main className={styles.state}>{error}</main>;
  }

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "TENANT_ADMIN") {
    return <main className={styles.state}>Access denied.</main>;
  }

  if (user?.role === "SUPER_ADMIN") {
    return (
      <main className={styles.page}>
        <section className={styles.heading}>
          <p className={styles.eyebrow}>Platform</p>
          <h1>Platform Admin Panel</h1>
          <p>
            Signed in as <strong>{user.email}</strong>. Manage tenants and tenant
            admins across the SaaS platform.
          </p>
        </section>

        {status ? <div className={styles.status}>{status}</div> : null}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{editingTenantId ? "Edit Tenant" : "Create Tenant"}</h2>
          </div>
          <form className={styles.form} onSubmit={handleSaveTenant}>
            <input
              name="name"
              placeholder="Tenant name"
              value={tenantForm.name}
              onChange={updateTenantField}
              required
            />
            <input
              name="slug"
              placeholder="tenant-slug"
              value={tenantForm.slug}
              onChange={updateTenantField}
            />
            <input
              name="domain"
              placeholder="Domain"
              value={tenantForm.domain}
              onChange={updateTenantField}
            />
            <input
              name="logoUrl"
              placeholder="Logo URL"
              value={tenantForm.logoUrl}
              onChange={updateTenantField}
            />
            <input
              name="primaryColor"
              placeholder="#ff385c"
              value={tenantForm.primaryColor}
              onChange={updateTenantField}
            />
            <div className={styles.formActions}>
              <button type="submit">
                {editingTenantId ? "Update tenant" : "Create tenant"}
              </button>
              {editingTenantId ? (
                <button type="button" onClick={resetTenantForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Tenant Admins</h2>
          </div>
          <form className={styles.form} onSubmit={handleCreateTenantAdmin}>
            <select
              name="tenantId"
              value={tenantAdminForm.tenantId}
              onChange={updateTenantAdminField}
              required
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <input
              name="email"
              type="email"
              placeholder="Tenant admin email"
              value={tenantAdminForm.email}
              onChange={updateTenantAdminField}
              required
            />
            <input
              name="password"
              type="password"
              minLength="8"
              placeholder="Password"
              value={tenantAdminForm.password}
              onChange={updateTenantAdminField}
              required
            />
            <button type="submit">Create tenant admin</button>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Tenants</h2>
            <button type="button" onClick={() => loadAdminData(user)}>
              Refresh
            </button>
          </div>
          {tenants.length === 0 ? (
            <div className={styles.empty}>No tenants found.</div>
          ) : (
            <div className={styles.table}>
              {tenants.map((tenant) => (
                <article key={tenant.id} className={styles.row}>
                  <div>
                    <strong>#{tenant.id} {tenant.name}</strong>
                    <span>
                      {tenant.slug} - users {tenant._count?.users || 0} -
                      properties {tenant._count?.properties || 0}
                    </span>
                  </div>
                  <button type="button" onClick={() => beginEditTenant(tenant)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteTenant(tenant.id)}>
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>Business Admin</p>
        <h1>Business Admin Panel</h1>
        <p>
          Signed in as <strong>{user.email}</strong> for tenant #{user.tenantId}.
        </p>
      </section>

      {status ? <div className={styles.status}>{status}</div> : null}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Manage Users</h2>
          <button type="button" onClick={() => loadAdminData(user)}>
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className={styles.empty}>No users found.</div>
        ) : (
          <div className={styles.table}>
            {users.map((entry) => (
              <article key={entry.id} className={styles.row}>
                <div>
                  <strong>#{entry.id} {entry.email}</strong>
                  <span>
                    {entry.role?.name || "No role"} - tenant #{entry.tenantId}
                  </span>
                </div>
                <select
                  value={entry.roleId}
                  onChange={(event) => handleUpdateRole(entry.id, event.target.value)}
                  disabled={entry.id === user.id}
                >
                  {roleOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(entry.id)}
                  disabled={entry.id === user.id}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Manage Properties</h2>
        </div>

        <form className={styles.form} onSubmit={handleSaveProperty}>
          <input
            name="title"
            placeholder="Title"
            value={propertyForm.title}
            onChange={updatePropertyField}
            required
          />
          <input
            name="location"
            placeholder="Location"
            value={propertyForm.location}
            onChange={updatePropertyField}
            required
          />
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            placeholder="Price"
            value={propertyForm.price}
            onChange={updatePropertyField}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={propertyForm.description}
            onChange={updatePropertyField}
            required
          />
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription}
            >
              {isGeneratingDescription ? "Generating..." : "Generate AI Description"}
            </button>
            <button type="submit">
              {editingPropertyId ? "Update property" : "Create property"}
            </button>
            {editingPropertyId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingPropertyId(null);
                  setPropertyForm(initialPropertyForm);
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        {properties.length === 0 ? (
          <div className={styles.empty}>No properties found.</div>
        ) : (
          <div className={styles.table}>
            {properties.map((property) => (
              <article key={property.id} className={styles.row}>
                <div>
                  <strong>#{property.id} {property.title}</strong>
                  <span>
                    {property.location} - ${property.price} - tenant #{property.tenantId} - owner #{property.ownerId}
                  </span>
                </div>
                <button type="button" onClick={() => beginEditProperty(property)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDeleteProperty(property.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Manage Bookings</h2>
        </div>

        {bookings.length === 0 ? (
          <div className={styles.empty}>No bookings found.</div>
        ) : (
          <div className={styles.table}>
            {bookings.map((booking) => (
              <article key={booking.id} className={styles.row}>
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <span>
                    {booking.property?.title || `property #${booking.propertyId}`} -{" "}
                    {booking.user?.email || `user #${booking.userId}`} -{" "}
                    {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                    {" "}- created {formatDate(booking.createdAt)}
                  </span>
                </div>
                <select
                  value={booking.status}
                  onChange={(event) =>
                    handleUpdateBookingStatus(booking.id, event.target.value)
                  }
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                {booking.status !== "CANCELLED" ? (
                  <button type="button" onClick={() => handleCancelBooking(booking.id)}>
                    Cancel
                  </button>
                ) : null}
                <button type="button" onClick={() => handleDeleteBooking(booking.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Manage Reviews</h2>
          <select
            value={selectedReviewPropertyId}
            onChange={(event) => loadReviews(event.target.value)}
          >
            <option value="">Select property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>

        {!selectedReviewPropertyId ? (
          <div className={styles.empty}>Select a property to view reviews.</div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>No reviews found.</div>
        ) : (
          <div className={styles.table}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.row}>
                <div>
                  <strong>
                    Review #{review.id} - {review.rating}/5 -{" "}
                    {review.user?.email || `user #${review.userId}`}
                  </strong>
                  <span>
                    {review.property?.title || `property #${review.propertyId}`} -{" "}
                    {formatDate(review.createdAt)} - {review.comment}
                  </span>
                </div>
                <button type="button" onClick={() => handleDeleteReview(review.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPanel;
