import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useForm } from "./use-form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  age: z.coerce.number().min(18, "Must be 18 or older"),
});

type OnValid = (values: z.infer<typeof schema>) => Promise<string | void>;

function TestForm({ onValid }: { onValid: OnValid }) {
  const { onSubmit, pending, errors, formError } = useForm(schema, onValid);
  return (
    <form onSubmit={onSubmit} noValidate>
      <input aria-label="Name" name="name" />
      <input aria-label="Age" name="age" />
      {errors.name && <p>{errors.name[0]}</p>}
      {errors.age && <p>{errors.age[0]}</p>}
      {formError && <p role="alert">{formError}</p>}
      <button type="submit" disabled={pending}>
        Save
      </button>
    </form>
  );
}

const fill = (name: string, age: string) => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Age"), { target: { value: age } });
};
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

describe("useForm", () => {
  it("shows field errors and skips onValid when invalid", () => {
    const onValid = vi.fn<OnValid>();
    render(<TestForm onValid={onValid} />);

    fill(" ", "12");
    submit();

    expect(screen.getByText("Enter your name")).toBeInTheDocument();
    expect(screen.getByText("Must be 18 or older")).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("passes parsed values to onValid and clears old errors", async () => {
    const onValid = vi.fn<OnValid>().mockResolvedValue(undefined);
    render(<TestForm onValid={onValid} />);

    submit();
    expect(screen.getByText("Enter your name")).toBeInTheDocument();

    fill("  Maria ", "30");
    await act(async () => submit());

    expect(onValid).toHaveBeenCalledWith({ name: "Maria", age: 30 });
    expect(screen.queryByText("Enter your name")).not.toBeInTheDocument();
  });

  it("shows a string returned from onValid as the form error", async () => {
    render(<TestForm onValid={async () => "Email already in use"} />);

    fill("Maria", "30");
    await act(async () => submit());

    expect(screen.getByRole("alert")).toHaveTextContent("Email already in use");
  });

  it("is pending while onValid runs", async () => {
    let resolve!: () => void;
    const onValid: OnValid = () => new Promise<void>((r) => (resolve = r));
    render(<TestForm onValid={onValid} />);

    fill("Maria", "30");
    await act(async () => submit());
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await act(async () => resolve());
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
