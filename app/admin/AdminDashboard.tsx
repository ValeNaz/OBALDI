"use client";

import { Fragment, useEffect, useState } from "react";

type PendingProduct = {
  id: string;
  title: string;
  priceCents: number;
  sellerId: string;
};

type ProductChangeRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  proposedDataJson: Record<string, unknown>;
  product: {
    id: string;
    title: string;
  };
  seller: {
    id: string;
    email: string;
  };
};

type PurchaseAssistRequest = {
  id: string;
  urlToCheck: string;
  notes: string | null;
  status: "OPEN" | "IN_REVIEW" | "DONE";
  outcome: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
};

type AdminOrderItem = {
  id: string;
  qty: number;
  unitPriceCents: number;
  unitPoints: number | null;
  product: {
    id: string;
    title: string;
  };
};

type AdminOrder = {
  id: string;
  status: "CREATED" | "PAID" | "CANCELED" | "REFUNDED";
  totalCents: number;
  currency: string;
  paidWith: "MONEY" | "POINTS" | "MIXED";
  pointsSpent: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
  items: AdminOrderItem[];
};

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  actorUser: {
    id: string;
    email: string;
  } | null;
  metadataJson: Record<string, unknown>;
};

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  updatedAt: string;
};

type AdminUser = {
  id: string;
  email: string;
  role: "MEMBER" | "SELLER" | "ADMIN";
  isDisabled: boolean;
  createdAt: string;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "products" | "changes" | "assist" | "orders" | "audit" | "news" | "users"
  >("products");
  const [pending, setPending] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assistRequests, setAssistRequests] = useState<PurchaseAssistRequest[]>([]);
  const [assistStatus, setAssistStatus] = useState<"OPEN" | "IN_REVIEW" | "DONE">("OPEN");
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [changeRequests, setChangeRequests] = useState<ProductChangeRequest[]>([]);
  const [changeStatus, setChangeStatus] = useState<
    ProductChangeRequest["status"] | "ALL"
  >("PENDING");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersStatus, setOrdersStatus] = useState<"ALL" | AdminOrder["status"]>("ALL");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [newsStatus, setNewsStatus] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSlug, setNewsSlug] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsTags, setNewsTags] = useState("");
  const [newsStatusForm, setNewsStatusForm] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [newsSaving, setNewsSaving] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/products?status=PENDING", {
          signal: controller.signal
        });
        if (!response.ok) {
          setError("Impossibile caricare i prodotti in coda.");
          return;
        }
        const data = await response.json();
        setPending(data.products ?? []);
      } catch {
        setError("Impossibile caricare i prodotti in coda.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeTab !== "assist") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setAssistLoading(true);
        setAssistError(null);
        const response = await fetch(`/api/admin/purchase-assist?status=${assistStatus}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          setAssistError("Impossibile caricare le richieste di assistenza.");
          return;
        }
        const data = await response.json();
        setAssistRequests(data.requests ?? []);
      } catch {
        setAssistError("Impossibile caricare le richieste di assistenza.");
      } finally {
        setAssistLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab, assistStatus]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const query = ordersStatus === "ALL" ? "" : `?status=${ordersStatus}`;
        const response = await fetch(`/api/admin/orders${query}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          setOrdersError("Impossibile caricare gli ordini.");
          return;
        }
        const data = await response.json();
        setOrders(data.orders ?? []);
      } catch {
        setOrdersError("Impossibile caricare gli ordini.");
      } finally {
        setOrdersLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab, ordersStatus]);

  useEffect(() => {
    if (activeTab !== "changes") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setChangeLoading(true);
        setChangeError(null);
        const query = changeStatus === "ALL" ? "" : `?status=${changeStatus}`;
        const response = await fetch(`/api/admin/products/change-requests${query}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          setChangeError("Impossibile caricare le modifiche prodotto.");
          return;
        }
        const data = await response.json();
        setChangeRequests(data.requests ?? []);
      } catch {
        setChangeError("Impossibile caricare le modifiche prodotto.");
      } finally {
        setChangeLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab, changeStatus]);

  useEffect(() => {
    if (activeTab !== "audit") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setAuditLoading(true);
        setAuditError(null);
        const query = auditQuery.trim();
        const url = query.length > 0 ? `/api/admin/audit?q=${encodeURIComponent(query)}` : "/api/admin/audit";
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          setAuditError("Impossibile caricare il log attività.");
          return;
        }
        const data = await response.json();
        setAuditLogs(data.logs ?? []);
      } catch {
        setAuditError("Impossibile caricare il log attività.");
      } finally {
        setAuditLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab, auditQuery]);

  useEffect(() => {
    if (activeTab !== "news") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        const query = newsStatus === "ALL" ? "" : `?status=${newsStatus}`;
        const response = await fetch(`/api/admin/news${query}`, { signal: controller.signal });
        if (!response.ok) {
          setNewsError("Impossibile caricare le news.");
          return;
        }
        const data = await response.json();
        setNewsPosts(data.posts ?? []);
      } catch {
        setNewsError("Impossibile caricare le news.");
      } finally {
        setNewsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab, newsStatus]);

  useEffect(() => {
    if (activeTab !== "users") return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const response = await fetch("/api/admin/users", { signal: controller.signal });
        if (!response.ok) {
          setUsersError("Impossibile caricare gli utenti.");
          return;
        }
        const data = await response.json();
        setUsers(data.users ?? []);
      } catch {
        setUsersError("Impossibile caricare gli utenti.");
      } finally {
        setUsersLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [activeTab]);
  const handleApprove = async (id: string) => {
    const response = await fetch(`/api/admin/products/${id}/approve`, {
      method: "POST"
    });
    if (!response.ok) {
      setError("Errore durante l'approvazione.");
      return;
    }
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = async (id: string) => {
    const note = window.prompt("Nota di rigetto (opzionale):") ?? undefined;
    const response = await fetch(`/api/admin/products/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note })
    });
    if (!response.ok) {
      setError("Errore durante il rigetto.");
      return;
    }
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeApprove = async (request: ProductChangeRequest) => {
    const adminNote = window.prompt("Nota di approvazione (opzionale):") ?? undefined;
    const response = await fetch(
      `/api/admin/products/change-requests/${request.id}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote })
      }
    );

    if (!response.ok) {
      setChangeError("Errore durante l'approvazione.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.changeRequest) {
      setChangeRequests((prev) => prev.filter((item) => item.id !== request.id));
      return;
    }

    setChangeRequests((prev) =>
      changeStatus === "PENDING"
        ? prev.filter((item) => item.id !== request.id)
        : prev.map((item) => (item.id === request.id ? payload.changeRequest : item))
    );
  };

  const handleChangeReject = async (request: ProductChangeRequest) => {
    const adminNote = window.prompt("Nota di rigetto (opzionale):") ?? undefined;
    const response = await fetch(
      `/api/admin/products/change-requests/${request.id}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote })
      }
    );

    if (!response.ok) {
      setChangeError("Errore durante il rigetto.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.changeRequest) {
      setChangeRequests((prev) => prev.filter((item) => item.id !== request.id));
      return;
    }

    setChangeRequests((prev) =>
      changeStatus === "PENDING"
        ? prev.filter((item) => item.id !== request.id)
        : prev.map((item) => (item.id === request.id ? payload.changeRequest : item))
    );
  };

  const handleAssistUpdate = async (id: string, status: "IN_REVIEW" | "DONE") => {
    const outcome =
      status === "DONE"
        ? window.prompt("Esito (opzionale):") ?? undefined
        : undefined;
    const response = await fetch(`/api/admin/purchase-assist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, outcome })
    });

    if (!response.ok) {
      setAssistError("Errore durante l'aggiornamento.");
      return;
    }

    setAssistRequests((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOrderStatus = async (order: AdminOrder, status: AdminOrder["status"]) => {
    const note =
      status === "CANCELED" || status === "REFUNDED"
        ? window.prompt("Nota (opzionale):") ?? undefined
        : undefined;
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note })
    });

    if (!response.ok) {
      setOrdersError("Errore durante l'aggiornamento ordine.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.order) {
      return;
    }
    setOrders((prev) =>
      prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
    );
  };

  const handleOrderRefund = async (order: AdminOrder) => {
    const reason = window.prompt("Motivo del rimborso (opzionale):") ?? undefined;
    const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      setOrdersError("Errore durante il rimborso.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.order) return;
    setOrders((prev) =>
      prev.map((item) => (item.id === order.id ? { ...item, status: payload.order.status } : item))
    );
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleNewsCreate = async () => {
    setNewsError(null);
    if (!newsTitle.trim() || !newsBody.trim()) {
      setNewsError("Titolo e contenuto sono obbligatori.");
      return;
    }
    setNewsSaving(true);
    try {
      const tags = newsTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle.trim(),
          slug: newsSlug.trim() || slugify(newsTitle),
          excerpt: newsExcerpt.trim() || undefined,
          body: newsBody.trim(),
          tags,
          status: newsStatusForm
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setNewsError(payload?.error?.message ?? "Impossibile creare la news.");
        return;
      }

      setNewsPosts((prev) => [payload.post, ...prev]);
      setNewsTitle("");
      setNewsSlug("");
      setNewsExcerpt("");
      setNewsBody("");
      setNewsTags("");
      setNewsStatusForm("DRAFT");
    } catch {
      setNewsError("Impossibile creare la news.");
    } finally {
      setNewsSaving(false);
    }
  };

  const handleNewsStatusToggle = async (post: NewsPost) => {
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const response = await fetch(`/api/admin/news/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      setNewsError("Impossibile aggiornare lo stato della news.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.post) return;
    setNewsPosts((prev) =>
      prev.map((item) => (item.id === post.id ? payload.post : item))
    );
  };

  const handleNewsDelete = async (post: NewsPost) => {
    const confirmed = window.confirm("Vuoi eliminare questa news?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/news/${post.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      setNewsError("Impossibile eliminare la news.");
      return;
    }
    setNewsPosts((prev) => prev.filter((item) => item.id !== post.id));
  };

  const handleUserUpdate = async (user: AdminUser, data: Partial<AdminUser>) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      setUsersError("Impossibile aggiornare l'utente.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!payload?.user) return;
    setUsers((prev) => prev.map((item) => (item.id === user.id ? payload.user : item)));
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e]">Console Amministrazione</h1>
        <div className="bg-white/70 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
          Accesso Protetto
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <nav className="space-y-2 glass-panel p-4">
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "products"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("products")}
            >
              Prodotti in coda ({pending.length})
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "changes"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("changes")}
            >
              Modifiche prodotti ({changeRequests.length})
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "assist"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("assist")}
            >
              Assist richieste
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "orders"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              Ordini
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "audit"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("audit")}
            >
              Audit log
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "news"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("news")}
            >
              News
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "users"
                  ? "bg-white/80 text-slate-900"
                  : "hover:bg-white/60 text-slate-500"
              }`}
              onClick={() => setActiveTab("users")}
            >
              Utenti
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "products" ? (
            <div className="glass-panel overflow-hidden">
              {error && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {error}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Prodotto</th>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Prezzo</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {pending.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 font-bold">{product.title}</td>
                      <td className="px-6 py-4">{product.sellerId}</td>
                      <td className="px-6 py-4">€{(product.priceCents / 100).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                          onClick={() => handleApprove(product.id)}
                        >
                          Approva
                        </button>
                        <button
                          className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold"
                          onClick={() => handleReject(product.id)}
                        >
                          Rigetta
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && pending.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Nessun prodotto in attesa di approvazione.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Caricamento prodotti...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "changes" ? (
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/70">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      changeStatus === status
                        ? "bg-[#0b224e] text-white"
                        : "bg-white/70 text-slate-500"
                    }`}
                    onClick={() => setChangeStatus(status)}
                  >
                    {status === "ALL"
                      ? "Tutte"
                      : status === "PENDING"
                      ? "In attesa"
                      : status === "APPROVED"
                      ? "Approvate"
                      : "Respinte"}
                  </button>
                ))}
              </div>
              {changeError && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {changeError}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Prodotto</th>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Proposta</th>
                    <th className="px-6 py-4">Stato</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {changeRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 font-bold">{request.product.title}</td>
                      <td className="px-6 py-4">{request.seller.email}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <code className="block whitespace-pre-wrap break-words">
                          {JSON.stringify(request.proposedDataJson)}
                        </code>
                      </td>
                      <td className="px-6 py-4">{request.status}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {request.status === "PENDING" && (
                          <>
                            <button
                              className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                              onClick={() => handleChangeApprove(request)}
                            >
                              Approva
                            </button>
                            <button
                              className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold"
                              onClick={() => handleChangeReject(request)}
                            >
                              Rigetta
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!changeLoading && changeRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nessuna modifica per lo stato selezionato.
                      </td>
                    </tr>
                  )}
                  {changeLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Caricamento modifiche...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "assist" ? (
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/70">
                {(["OPEN", "IN_REVIEW", "DONE"] as const).map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      assistStatus === status
                        ? "bg-[#0b224e] text-white"
                        : "bg-white/70 text-slate-500"
                    }`}
                    onClick={() => setAssistStatus(status)}
                  >
                    {status === "OPEN"
                      ? "Aperte"
                      : status === "IN_REVIEW"
                      ? "In revisione"
                      : "Completate"}
                  </button>
                ))}
              </div>
              {assistError && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {assistError}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">URL</th>
                    <th className="px-6 py-4">Utente</th>
                    <th className="px-6 py-4">Stato</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {assistRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4">
                        <a
                          href={request.urlToCheck}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0b224e] font-semibold underline"
                        >
                          {request.urlToCheck}
                        </a>
                      </td>
                      <td className="px-6 py-4">{request.user.email}</td>
                      <td className="px-6 py-4">
                        {request.status === "OPEN"
                          ? "Aperta"
                          : request.status === "IN_REVIEW"
                          ? "In revisione"
                          : "Completata"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {request.status === "OPEN" && (
                          <button
                            className="bg-[#0b224e] text-white px-3 py-1.5 rounded text-xs font-bold"
                            onClick={() => handleAssistUpdate(request.id, "IN_REVIEW")}
                          >
                            Prendi in carico
                          </button>
                        )}
                        {request.status !== "DONE" && (
                          <button
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                            onClick={() => handleAssistUpdate(request.id, "DONE")}
                          >
                            Completa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!assistLoading && assistRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Nessuna richiesta per lo stato selezionato.
                      </td>
                    </tr>
                  )}
                  {assistLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Caricamento richieste...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "orders" ? (
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/70 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(["ALL", "CREATED", "PAID", "CANCELED", "REFUNDED"] as const).map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-full text-xs font-bold ${
                        ordersStatus === status
                          ? "bg-[#0b224e] text-white"
                          : "bg-white/70 text-slate-500"
                      }`}
                      onClick={() => setOrdersStatus(status)}
                    >
                      {status === "ALL"
                        ? "Tutti"
                        : status === "CREATED"
                        ? "Creati"
                        : status === "PAID"
                        ? "Pagati"
                        : status === "CANCELED"
                        ? "Annullati"
                        : "Rimborsati"}
                    </button>
                  ))}
                </div>
                <a
                  href={`/api/admin/orders/export${ordersStatus === "ALL" ? "" : `?status=${ordersStatus}`}`}
                  className="text-xs font-bold text-[#0b224e] underline"
                >
                  Esporta CSV
                </a>
              </div>
              {ordersError && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {ordersError}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Ordine</th>
                    <th className="px-6 py-4">Utente</th>
                    <th className="px-6 py-4">Totale</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4">Stato</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                      <tr>
                        <td className="px-6 py-4 font-bold">{order.id}</td>
                        <td className="px-6 py-4">{order.user.email}</td>
                        <td className="px-6 py-4">
                          €{(order.totalCents / 100).toFixed(2)} {order.currency}
                          {order.pointsSpent > 0 ? ` + ${order.pointsSpent} punti` : ""}
                        </td>
                        <td className="px-6 py-4">{order.paidWith}</td>
                        <td className="px-6 py-4">{order.status}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            className="text-xs font-bold text-[#0b224e] underline"
                            onClick={() =>
                              setExpandedOrderId((prev) => (prev === order.id ? null : order.id))
                            }
                          >
                            Dettagli
                          </button>
                          {order.status === "CREATED" && (
                            <>
                              <button
                                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                                onClick={() => handleOrderStatus(order, "PAID")}
                              >
                                Segna pagato
                              </button>
                              <button
                                className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold"
                                onClick={() => handleOrderStatus(order, "CANCELED")}
                              >
                                Annulla
                              </button>
                            </>
                          )}
                          {order.status === "PAID" && (
                            <button
                              className="bg-[#a41f2e] text-white px-3 py-1.5 rounded text-xs font-bold"
                              onClick={() => handleOrderRefund(order)}
                            >
                              Rimborsa
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-white/40">
                            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                              Dettagli ordine
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                  <span className="font-semibold text-[#0b224e]">
                                    {item.product.title}
                                  </span>
                                  <span>
                                    x{item.qty} • €{(item.unitPriceCents / 100).toFixed(2)}
                                    {item.unitPoints ? ` • ${item.unitPoints} punti` : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {!ordersLoading && orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nessun ordine trovato.
                      </td>
                    </tr>
                  )}
                  {ordersLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Caricamento ordini...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "audit" ? (
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-white/70 items-center justify-between">
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(event) => setAuditQuery(event.target.value)}
                  placeholder="Filtra per azione o entità..."
                  className="glass-input w-full md:w-80"
                />
                <span className="text-xs text-slate-400 font-semibold">
                  Ultime {auditLogs.length} attività
                </span>
              </div>
              {auditError && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {auditError}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Quando</th>
                    <th className="px-6 py-4">Azione</th>
                    <th className="px-6 py-4">Entità</th>
                    <th className="px-6 py-4">Attore</th>
                    <th className="px-6 py-4">Dettagli</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString("it-IT")}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#0b224e]">{log.action}</td>
                      <td className="px-6 py-4">
                        {log.entity}
                        {log.entityId ? ` (${log.entityId})` : ""}
                      </td>
                      <td className="px-6 py-4">
                        {log.actorUser?.email ?? "system"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {JSON.stringify(log.metadataJson).slice(0, 120)}
                      </td>
                    </tr>
                  ))}
                  {!auditLoading && auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nessun log disponibile.
                      </td>
                    </tr>
                  )}
                  {auditLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Caricamento log...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "news" ? (
            <div className="space-y-6">
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-[#0b224e] mb-4">Nuova news</h3>
                {newsError && (
                  <div className="mb-4 text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {newsError}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Titolo</label>
                    <input
                      type="text"
                      className="glass-input w-full"
                      value={newsTitle}
                      onChange={(event) => setNewsTitle(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                    <input
                      type="text"
                      className="glass-input w-full"
                      value={newsSlug}
                      placeholder={newsTitle ? slugify(newsTitle) : "titolo-news"}
                      onChange={(event) => setNewsSlug(event.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt</label>
                  <textarea
                    rows={2}
                    className="glass-input w-full"
                    value={newsExcerpt}
                    onChange={(event) => setNewsExcerpt(event.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contenuto</label>
                  <textarea
                    rows={6}
                    className="glass-input w-full"
                    value={newsBody}
                    onChange={(event) => setNewsBody(event.target.value)}
                  />
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tag (comma)</label>
                    <input
                      type="text"
                      className="glass-input w-full"
                      value={newsTags}
                      onChange={(event) => setNewsTags(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Stato</label>
                    <select
                      className="glass-input w-full"
                      value={newsStatusForm}
                      onChange={(event) =>
                        setNewsStatusForm(event.target.value as "DRAFT" | "PUBLISHED")
                      }
                    >
                      <option value="DRAFT">Bozza</option>
                      <option value="PUBLISHED">Pubblicata</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleNewsCreate}
                  disabled={newsSaving}
                  className="mt-6 bg-[#0b224e] text-white px-6 py-2 rounded-full text-sm font-bold shadow-glow-soft"
                >
                  {newsSaving ? "Salvataggio..." : "Crea news"}
                </button>
              </div>

              <div className="glass-panel overflow-hidden">
                <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/70">
                  {(["ALL", "DRAFT", "PUBLISHED"] as const).map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-full text-xs font-bold ${
                        newsStatus === status
                          ? "bg-[#0b224e] text-white"
                          : "bg-white/70 text-slate-500"
                      }`}
                      onClick={() => setNewsStatus(status)}
                    >
                      {status === "ALL" ? "Tutte" : status === "DRAFT" ? "Bozze" : "Pubblicate"}
                    </button>
                  ))}
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">Titolo</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4">Stato</th>
                      <th className="px-6 py-4">Aggiornato</th>
                      <th className="px-6 py-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {newsPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 font-bold text-[#0b224e]">{post.title}</td>
                        <td className="px-6 py-4 text-slate-500">/{post.slug}</td>
                        <td className="px-6 py-4">{post.status === "PUBLISHED" ? "Pubblicata" : "Bozza"}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(post.updatedAt).toLocaleDateString("it-IT")}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            className="text-xs font-bold text-[#0b224e] underline"
                            onClick={() => handleNewsStatusToggle(post)}
                          >
                            {post.status === "PUBLISHED" ? "Ritira" : "Pubblica"}
                          </button>
                          <button
                            className="text-xs font-bold text-red-600 underline"
                            onClick={() => handleNewsDelete(post)}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!newsLoading && newsPosts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Nessuna news trovata.
                        </td>
                      </tr>
                    )}
                    {newsLoading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Caricamento news...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden">
              {usersError && (
                <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-semibold">
                  {usersError}
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/70 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Ruolo</th>
                    <th className="px-6 py-4">Stato</th>
                    <th className="px-6 py-4">Creato</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-semibold text-[#0b224e]">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          className="glass-input"
                          value={user.role}
                          onChange={(event) =>
                            handleUserUpdate(user, { role: event.target.value as AdminUser["role"] })
                          }
                        >
                          <option value="MEMBER">Member</option>
                          <option value="SELLER">Seller</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {user.isDisabled ? "Disabilitato" : "Attivo"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("it-IT")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className={`text-xs font-bold underline ${
                            user.isDisabled ? "text-green-700" : "text-red-600"
                          }`}
                          onClick={() =>
                            handleUserUpdate(user, { isDisabled: !user.isDisabled })
                          }
                        >
                          {user.isDisabled ? "Riattiva" : "Disabilita"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!usersLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nessun utente trovato.
                      </td>
                    </tr>
                  )}
                  {usersLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Caricamento utenti...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
