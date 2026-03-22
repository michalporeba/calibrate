import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import { createEntry, type CreateCpdEntryInput, type EntryOccurredAt, type EntrySeason } from "../lib/entries";

type Precision = EntryOccurredAt["precision"];

type FormState = {
  precision: Precision;
  exactDate: string;
  monthYear: string;
  season: EntrySeason;
  seasonYear: string;
  yearOnly: string;
  title: string;
  body: string;
};

type FormErrors = {
  occurredAt?: string;
  title?: string;
  body?: string;
};

function todayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function currentYearValue(): string {
  return String(new Date().getFullYear());
}

function currentSeason(): EntrySeason {
  const month = new Date().getMonth() + 1;

  if (month <= 2 || month === 12) {
    return "winter";
  }
  if (month <= 5) {
    return "spring";
  }
  if (month <= 8) {
    return "summer";
  }
  return "autumn";
}

function initialFormState(): FormState {
  return {
    precision: "exact-date",
    exactDate: todayDateValue(),
    monthYear: currentMonthValue(),
    season: currentSeason(),
    seasonYear: currentYearValue(),
    yearOnly: currentYearValue(),
    title: "",
    body: "",
  };
}

function buildOccurredAt(state: FormState): EntryOccurredAt | null {
  switch (state.precision) {
    case "exact-date":
      return state.exactDate
        ? { precision: "exact-date", date: state.exactDate }
        : null;
    case "month": {
      if (!state.monthYear) {
        return null;
      }
      const [year, month] = state.monthYear.split("-").map((value) => Number(value));
      return {
        precision: "month",
        year,
        month,
      };
    }
    case "season": {
      const year = Number(state.seasonYear);
      if (!Number.isInteger(year)) {
        return null;
      }
      return {
        precision: "season",
        year,
        season: state.season,
      };
    }
    case "year": {
      const year = Number(state.yearOnly);
      if (!Number.isInteger(year)) {
        return null;
      }
      return {
        precision: "year",
        year,
      };
    }
  }
}

function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!buildOccurredAt(state)) {
    errors.occurredAt = "Choose when the event happened.";
  }

  if (!state.title.trim()) {
    errors.title = "Give the event a title.";
  }

  if (!state.body.trim()) {
    errors.body = "Add a short description of what happened.";
  }

  return errors;
}

export function RecordPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveError(null);
    setErrors((current) => {
      if (!(key in current) && key !== "precision") {
        return current;
      }

      const nextErrors = { ...current };
      if (key === "title") {
        delete nextErrors.title;
      }
      if (key === "body") {
        delete nextErrors.body;
      }
      if (key === "precision" || key === "exactDate" || key === "monthYear" || key === "season" || key === "seasonYear" || key === "yearOnly") {
        delete nextErrors.occurredAt;
      }
      return nextErrors;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const occurredAt = buildOccurredAt(formState);

    if (!occurredAt) {
      setErrors({ occurredAt: "Choose when the event happened." });
      return;
    }

    const input: CreateCpdEntryInput = {
      title: formState.title,
      body: formState.body,
      occurredAt,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      await createEntry(input);
      navigate("/events");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save the event.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageFrame
      title="Record an event"
      intro="Capture something that happened so you can return to it later, reflect on it, or use it as evidence in a structured template."
      homeLabel="Back to Calibrate"
      actions={
        <Link className="text-link" to="/events">
          Browse events
        </Link>
      }
    >
      <section className="content-block">
        <h2>New entry</h2>
        <p>
          Record something that happened in a form you can return to later.
          Start with when it happened, give it a clear title, and describe what
          matters about it.
        </p>
      </section>

      <section className="content-block">
        <form className="event-form" onSubmit={handleSubmit} noValidate>
          <div className="event-form__field">
            <label className="event-form__label" htmlFor="precision">
              When did it happen?
            </label>
            <select
              className="event-form__control"
              id="precision"
              value={formState.precision}
              onChange={(event) =>
                updateForm("precision", event.target.value as Precision)
              }
            >
              <option value="exact-date">Exact date</option>
              <option value="month">Month</option>
              <option value="season">Season</option>
              <option value="year">Year</option>
            </select>
            <p className="event-form__hint">
              If you do not know the exact date, choose a broader period.
            </p>
            {formState.precision === "exact-date" ? (
              <input
                className="event-form__control"
                id="exact-date"
                name="exact-date"
                type="date"
                value={formState.exactDate}
                onChange={(event) => updateForm("exactDate", event.target.value)}
              />
            ) : null}
            {formState.precision === "month" ? (
              <input
                className="event-form__control"
                id="month-year"
                name="month-year"
                type="month"
                value={formState.monthYear}
                onChange={(event) => updateForm("monthYear", event.target.value)}
              />
            ) : null}
            {formState.precision === "season" ? (
              <div className="event-form__split">
                <select
                  className="event-form__control"
                  id="season"
                  value={formState.season}
                  onChange={(event) =>
                    updateForm("season", event.target.value as EntrySeason)
                  }
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
                <input
                  className="event-form__control"
                  id="season-year"
                  inputMode="numeric"
                  name="season-year"
                  pattern="[0-9]*"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formState.seasonYear}
                  onChange={(event) => updateForm("seasonYear", event.target.value)}
                />
              </div>
            ) : null}
            {formState.precision === "year" ? (
              <input
                className="event-form__control"
                id="year-only"
                inputMode="numeric"
                name="year-only"
                pattern="[0-9]*"
                type="number"
                min="1900"
                max="2100"
                value={formState.yearOnly}
                onChange={(event) => updateForm("yearOnly", event.target.value)}
              />
            ) : null}
            {errors.occurredAt ? (
              <p className="form-error" role="alert">
                {errors.occurredAt}
              </p>
            ) : null}
          </div>

          <div className="event-form__field">
            <label className="event-form__label" htmlFor="entry-title">
              Title
            </label>
            <input
              className="event-form__control"
              id="entry-title"
              name="title"
              type="text"
              value={formState.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
            {errors.title ? (
              <p className="form-error" role="alert">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="event-form__field">
            <label className="event-form__label" htmlFor="entry-body">
              Description
            </label>
            <textarea
              className="event-form__control event-form__control--textarea"
              id="entry-body"
              name="body"
              value={formState.body}
              onChange={(event) => updateForm("body", event.target.value)}
            />
            <p className="event-form__hint">
              Write enough to help your future self remember what happened and
              why it mattered.
            </p>
            {errors.body ? (
              <p className="form-error" role="alert">
                {errors.body}
              </p>
            ) : null}
          </div>

          {saveError ? (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="flow-actions">
            <button className="button-primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving…" : "Save event"}
            </button>
            <Link className="text-link" to="/events">
              Browse events
            </Link>
            <Link className="text-link" to="/learn#recording-events">
              Learn how event recording fits into Calibrate
            </Link>
          </div>
          {hasErrors ? (
            <p className="event-form__hint">
              Check the highlighted fields and try again.
            </p>
          ) : null}
        </form>
      </section>
    </PageFrame>
  );
}
