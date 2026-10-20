import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

const url = import.meta.env.VITE_API_URL;
const apiUrl = url ? `${url.replace(/\/+$/, "")}/` : "";

interface OrderInfo {
  custId: string;
  PONumber: string;
  PODate: string;
  shipDate: string;
}

interface OrderItem {
  partNumber: string;
  partDescription: string;
  partDuplicationStatus: "NEW" | "REPEAT";
  pricePerPiece: string;
  POQTY: string;
  catCode: string;
  finishWeight: string;
  realisationPerKG: string;
}

interface ItemSuggestion {
  partNumber: string;
  partDescription: string;
  catCode: string | null;
  finishWeight: string | number | null;
}

const initialOrderInfo: OrderInfo = {
  custId: "",
  PONumber: "",
  PODate: "",
  shipDate: "",
};

const initialItem: OrderItem = {
  partNumber: "",
  partDescription: "",
  partDuplicationStatus: "NEW",
  pricePerPiece: "",
  POQTY: "",
  catCode: "",
  finishWeight: "",
  realisationPerKG: "",
};

const steps = ["PO INFO", "ITEM DETAILS"];

export const AddExportOrderPage = () => {
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(initialOrderInfo);
  const [item, setItem] = useState<OrderItem>(initialItem);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const searchQuery = item.partNumber.trim();
    if (!searchQuery || item.partDuplicationStatus === "REPEAT") {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${apiUrl}order/fetch-item-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({ searchQuery }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to search item details.");
        }
        setSuggestions(Array.isArray(result.data) ? result.data : []);
      } catch (searchError) {
        if (!(searchError instanceof DOMException && searchError.name === "AbortError")) {
          setError(searchError instanceof Error ? searchError.message : "Unable to search item details.");
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [item.partNumber, item.partDuplicationStatus]);

  const updateOrderInfo = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOrderInfo((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const updateItem = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === "partNumber") {
      setSuggestions([]);
    }
    setItem((previous) => {
      const next = { ...previous, [name]: value };
      if (name === "pricePerPiece" || name === "finishWeight") {
        const price = name === "pricePerPiece" ? value : next.pricePerPiece;
        const weight = name === "finishWeight" ? value : next.finishWeight;
        next.realisationPerKG =
          price && weight ? ((Number(price) * Number(weight)) * 1000).toFixed(3) : "";
      }
      return next;
    });
    setError("");
    setSuccess("");
  };

  const selectSuggestion = (suggestion: ItemSuggestion) => {
    setItem((previous) => ({
      ...previous,
      partNumber: suggestion.partNumber,
      partDescription: suggestion.partDescription,
      catCode: suggestion.catCode ?? "",
      finishWeight: suggestion.finishWeight == null ? "" : String(suggestion.finishWeight),
      realisationPerKG:
        previous.pricePerPiece && suggestion.finishWeight != null
          ? ((Number(previous.pricePerPiece) * Number(suggestion.finishWeight)) / 1000).toFixed(3)
          : "",
      partDuplicationStatus: "REPEAT",
    }));
    setSuggestions([]);
    setError("");
  };

  const addItem = () => {
    const missingFields: string[] = [];
    if (!item.partNumber.trim()) missingFields.push("Part number");
    if (!item.partDescription.trim()) missingFields.push("Part description");
    if (!item.POQTY.trim() || !Number.isInteger(Number(item.POQTY)) || Number(item.POQTY) <= 0) {
      missingFields.push("PO quantity");
    }
    if (!item.pricePerPiece.trim() || !Number.isFinite(Number(item.pricePerPiece))) {
      missingFields.push("Price per piece");
    }
    if (missingFields.length > 0) {
      setError(`Missing or invalid item fields: ${missingFields.join(", ")}.`);
      return;
    }
    setItems((previous) => [...previous, item]);
    setItem(initialItem);
    setSuggestions([]);
    setError("");
  };

  const validateOrder = () => {
    const missingFields: string[] = [];
    if (!orderInfo.custId.trim()) missingFields.push("Customer ID");
    if (!orderInfo.PONumber.trim()) missingFields.push("PO number");
    if (!orderInfo.PODate) missingFields.push("PO date");
    if (!orderInfo.shipDate) missingFields.push("Ship date");
    if (items.length === 0) missingFields.push("At least one item");
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}.`);
      return false;
    }
    return true;
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateOrder()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}order/addOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...orderInfo,
          items: items.map((orderItem) => ({
            ...orderItem,
            pricePerPiece: Number(orderItem.pricePerPiece),
            POQTY: Number(orderItem.POQTY),
            finishWeight: orderItem.finishWeight ? Number(orderItem.finishWeight) : null,
            realisationPerKG: orderItem.realisationPerKG ? Number(orderItem.realisationPerKG) : null,
            catCode: orderItem.catCode || null,
          })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add this order.");
      }
      setSuccess(result.message || "Order added successfully.");
      setOrderInfo(initialOrderInfo);
      setItem(initialItem);
      setItems([]);
      setStep(0);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to add this order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setOrderInfo(initialOrderInfo);
    setItem(initialItem);
    setItems([]);
    setSuggestions([]);
    setStep(0);
    setError("");
    setSuccess("");
  };

  return (
    <section className="page-container order-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Orders / Add exports order</p>
          <h1>Add exports order</h1>
          <p className="page-subtitle">Enter purchase order information and add one or more items.</p>
        </div>
      </div>
      <div className="order-card">
        <div className="stepper" aria-label="Order form sections">
          {steps.map((label, index) => (
            <button
              className={`stepper__item${index === step ? " current" : ""}`}
              key={label}
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? "step" : undefined}
            >
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>
        {error && <div className="form-message form-message--error" role="alert">{error}</div>}
        {success && <div className="form-message form-message--success" role="status">{success}</div>}
        <form onSubmit={submitOrder} noValidate>
          {step === 0 && (
            <FormStep title="PO INFO">
              <Field label="Customer ID" name="custId" value={orderInfo.custId} onChange={updateOrderInfo} />
              <Field label="PO number" name="PONumber" value={orderInfo.PONumber} onChange={updateOrderInfo} />
              <Field label="PO date" name="PODate" type="date" value={orderInfo.PODate} onChange={updateOrderInfo} />
              <Field label="Ship date" name="shipDate" type="date" value={orderInfo.shipDate} onChange={updateOrderInfo} />
            </FormStep>
          )}
          {step === 1 && (
            <FormStep title="ITEM DETAILS">
              <div className="item-search-field">
                <Field label="Part number" name="partNumber" value={item.partNumber} onChange={updateItem} />
                {isSearching && <small className="search-status">Searching...</small>}
                {suggestions.length > 0 && (
                  <div className="item-suggestions" role="listbox">
                    {suggestions.map((suggestion) => (
                      <button type="button" key={suggestion.partNumber} onClick={() => selectSuggestion(suggestion)}>
                        <strong>{suggestion.partNumber}</strong>
                        <span>{suggestion.partDescription}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="order-field order-field--full">
                Part description
                <textarea name="partDescription" value={item.partDescription} onChange={updateItem} rows={4} />
              </label>
              <Field label="PO quantity" name="POQTY" type="number" min="1" step="1" value={item.POQTY} onChange={updateItem} />
              <Field label="Price per piece" name="pricePerPiece" type="number" min="0" step="0.01" value={item.pricePerPiece} onChange={updateItem} />
              <Field label="Category code" name="catCode" value={item.catCode} onChange={updateItem} hint="Optional" />
              <Field label="Finish weight" name="finishWeight" type="number" min="0" step="0.001" value={item.finishWeight} onChange={updateItem} hint="Optional" />
              <Field label="Realisation per kg" name="realisationPerKG" value={item.realisationPerKG} onChange={updateItem} hint="Auto-calculated" readOnly />
              <label className="order-field">
                Duplication status
                <input value={item.partDuplicationStatus} readOnly />
              </label>
              <div className="item-actions">
                <button className="secondary-action button-action" type="button" onClick={() => { setItem(initialItem); setSuggestions([]); }}>Clear item</button>
                <button className="primary-action button-action" type="button" onClick={addItem}>Add item</button>
              </div>
              {items.length > 0 && (
                <div className="added-items order-field--full">
                  <h3>Added items ({items.length})</h3>
                  {items.map((orderItem, index) => (
                    <div className="added-item" key={`${orderItem.partNumber}-${index}`}>
                      <div><strong>{orderItem.partNumber}</strong><span>{orderItem.partDescription}</span></div>
                      <div><span>Qty: {orderItem.POQTY}</span><span>Price: {orderItem.pricePerPiece}</span></div>
                      <button type="button" onClick={() => setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </FormStep>
          )}
          <div className="form-actions">
            <button className="secondary-action button-action" type="button" onClick={clearForm}>Clear</button>
            <button className="primary-action button-action" type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding order..." : "Add order"}</button>
          </div>
        </form>
      </div>
    </section>
  );
};

const FormStep = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="form-step"><h2>{title}</h2><div className="order-fields">{children}</div></div>
);

const Field = ({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => (
  <label className="order-field">{label} {hint && <small>{hint}</small>}<input {...props} /></label>
);

export const ExportOrderListPage = () => <PlaceholderPage eyebrow="Orders / Exports order list" title="Exports order list" copy="Submitted export orders will appear here." />;
export const BacklogsPage = () => <PlaceholderPage eyebrow="Orders / Backlogs" title="Backlogs" copy="Orders that need attention will appear here." />;

const PlaceholderPage = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) => (
  <section className="page-container placeholder-page"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{copy}</p><div className="empty-state">There is nothing to display yet.</div></section>
);
