import { useState, type ChangeEvent, type FormEvent, type ReactNode, type InputHTMLAttributes } from "react";

const url = import.meta.env.VITE_API_URL;
const apiUrl = url ? `${url.replace(/\/+$/, "")}/` : "";

interface OrderForm {
  custId: string;
  PONumber: string;
  PODate: string;
  shipDate: string;
  partNumber: string;
  partDescription: string;
  pricePerPiece: string;
  POQTY: string;
  catCode: string;
  finishWeight: string;
}

const initialForm: OrderForm = {
  custId: "", PONumber: "", PODate: "", shipDate: "", partNumber: "",
  partDescription: "", pricePerPiece: "", POQTY: "", catCode: "", finishWeight: "",
};

const steps = ["PO INFO", "PART DETAILS", "PRICING & QUANTITY"];

export const AddExportOrderPage = () => {
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const requiredFields: Array<{ key: keyof OrderForm; label: string }> = [
      { key: "custId", label: "Customer ID" },
      { key: "PONumber", label: "PO number" },
      { key: "PODate", label: "PO date" },
      { key: "shipDate", label: "Ship date" },
      { key: "partNumber", label: "Part number" },
      { key: "partDescription", label: "Part description" },
      { key: "pricePerPiece", label: "Price per piece" },
      { key: "POQTY", label: "PO quantity" },
    ];
    const missingFields = requiredFields
      .filter(({ key }) => !form[key].trim())
      .map(({ label }) => label);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}.`);
      return false;
    }
    return true;
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}order/addOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          pricePerPiece: Number(form.pricePerPiece),
          POQTY: Number(form.POQTY),
          finishWeight: form.finishWeight ? Number(form.finishWeight) : undefined,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add this order.");
      }
      setSuccess(result.message || "Order added successfully.");
      setForm(initialForm);
      setStep(0);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to add this order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container order-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Orders / Add exports order</p>
          <h1>Add exports order</h1>
          <p className="page-subtitle">Complete the required details in any order, then add the order.</p>
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
          {step === 0 && <FormStep title="PO INFO">
              <Field label="Customer ID" name="custId" value={form.custId} onChange={updateField} required />
              <Field label="PO number" name="PONumber" value={form.PONumber} onChange={updateField} required />
              <Field label="PO date" name="PODate" type="date" value={form.PODate} onChange={updateField} required />
              <Field label="Ship date" name="shipDate" type="date" value={form.shipDate} onChange={updateField} required />
            </FormStep>}
          {step === 1 && <FormStep title="PART DETAILS">
              <Field label="Part number" name="partNumber" value={form.partNumber} onChange={updateField} required />
              <Field label="Category code" name="catCode" value={form.catCode} onChange={updateField} hint="Optional" />
              <label className="order-field order-field--full">Part description <textarea name="partDescription" value={form.partDescription} onChange={updateField} rows={5} required /></label>
            </FormStep>}
          {step === 2 && <FormStep title="PRICING & QUANTITY">
              <Field label="Price per piece" name="pricePerPiece" type="number" min="0" step="0.01" value={form.pricePerPiece} onChange={updateField} required />
              <Field label="PO quantity" name="POQTY" type="number" min="1" step="1" value={form.POQTY} onChange={updateField} required />
              <Field label="Finish weight (kg)" name="finishWeight" type="number" min="0" step="0.001" value={form.finishWeight} onChange={updateField} hint="Optional" />
            </FormStep>}
          <div className="form-actions">
            <button className="secondary-action button-action" type="button" onClick={() => { setForm(initialForm); setStep(0); setError(""); setSuccess(""); }}>Clear</button>
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
