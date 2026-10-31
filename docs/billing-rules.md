# Billing Rules

This document defines the billing behavior for the Brightloop
subscription demo. It is the shared reference for the billing module,
invoice generator, discount engine, and tests.

## 1. Core terms

-   **Plan:** A monthly subscription plan with a configured minimum
    quantity and an end behavior.
-   **Subscription:** A customer's purchase of a plan, with a quantity
    and a lifecycle state.
-   **Billing period:** One monthly period covered by an invoice.
-   **Invoice:** The charge generated for one subscription and one
    billing period.
-   **Tax:** A percentage applied to the discounted taxable amount.
-   **Discount rule:** A percentage discount with eligibility conditions
    such as minimum quantity, date window, and usage limit.

All monetary calculations use decimal arithmetic, not binary
floating-point arithmetic.

## 2. Subscription quantity and eligibility

1.  A subscription is created from a plan.
2.  The subscription quantity must be at least the plan's configured
    minimum quantity.
3.  Quantity must be a positive whole number.
4.  The per-seat price comes from the product/plan configuration; it is
    not entered independently on each invoice.
5.  A subscription that does not meet the plan minimum quantity must be
    rejected by server-side validation.

**Example:** If a plan has a minimum quantity of 2, a subscription for 1
seat is invalid; subscriptions for 2 or more seats may proceed.

## 3. Subscription lifecycle

The supported lifecycle is:

`Draft → Confirmed → Active → Closed`

-   **Draft:** Created but not yet confirmed; it is not billable.
-   **Confirmed:** The subscription has passed confirmation checks and
    is ready to become active.
-   **Active:** Eligible for batch billing.
-   **Closed:** No future invoices are generated.

Only valid forward transitions are accepted. The server must enforce
transition rules; clients must not be able to set arbitrary states. A
closed subscription is not reactivated as part of this demo flow.

## 4. Monthly billing periods

-   Billing frequency is monthly.
-   Each generated invoice represents one subscription and one billing
    period.
-   Period boundaries are calculated using calendar months, not a fixed
    number of days.
-   When the target month has fewer days than the original day-of-month,
    clamp to the final day of that month.

**Date example:** A monthly period anchored on January 31 advances to
February 28 (or February 29 in a leap year), then to March 31. Do not
allow date-library overflow to move the February date into March.

The exact inclusive/exclusive timestamp convention should be consistent
throughout the API and database. A recommended convention is a half-open
interval: `[period_start, next_period_start)`.

## 5. Invoice amount calculation

For each eligible subscription and billing period:

1.  Calculate the gross line amount: `quantity × price_per_seat`.
2.  Apply any eligible percentage discount to the gross line amount.
3.  Calculate tax on the discounted taxable amount.
4.  Add the tax to obtain the invoice total.

Formulas:

``` text
gross_amount     = quantity × price_per_seat
discount_amount  = gross_amount × discount_rate
taxable_amount   = gross_amount - discount_amount
tax_amount       = taxable_amount × tax_rate
invoice_total    = taxable_amount + tax_amount
```

If no discount applies, `discount_amount = 0`.

### Worked example: 3 seats, 100 per seat, 10% tax

Assume one monthly billing period, no discount, and a 10% tax rate.

  Item                     Calculation       Amount
  ------------------- ---------------- ------------
  Quantity                     3 seats            3
  Price per seat                   ---       100.00
  Subtotal                  3 × 100.00       300.00
  Discount                        None         0.00
  Taxable amount         300.00 − 0.00       300.00
  Tax (10%)              300.00 × 0.10        30.00
  **Invoice total**     300.00 + 30.00   **330.00**

The invoice should retain the quantity, unit price, subtotal, discount,
tax rate, tax amount, and final total so the calculation can be audited.

### Worked example: same subscription with a 10% discount

Assume the same 3 seats at 100.00 each, a 10% eligible discount, and 10%
tax.

  Item                     Calculation       Amount
  ------------------- ---------------- ------------
  Subtotal                  3 × 100.00       300.00
  Discount (10%)         300.00 × 0.10        30.00
  Taxable amount        300.00 − 30.00       270.00
  Tax (10%)              270.00 × 0.10        27.00
  **Invoice total**     270.00 + 27.00   **297.00**

This example assumes tax is calculated after the discount. Confirm this
treatment against the applicable tax configuration before using the
system for real transactions.

## 6. Discount rules

A discount rule supports:

-   Percentage discount.
-   Minimum subscription quantity.
-   Start and end dates (eligibility window).
-   Usage limit.

A rule is eligible for an invoice only when all configured conditions
are satisfied:

1.  The subscription quantity meets or exceeds the rule's minimum
    quantity.
2.  The invoice's billing date falls within the rule's active date
    window.
3.  The rule has remaining usage.
4.  The rule is enabled/active.

An eligible discount is applied automatically during invoice generation.
It applies to the next invoice generated while the rule is eligible; it
is not retroactively applied to existing invoices.

**Example:** A 10% rule with minimum quantity 3 applies to a 3-seat
subscription, but not to a 2-seat subscription. If its usage limit has
already been reached, it does not apply even when the quantity and date
conditions match.

The discount usage count must be updated safely with invoice generation
so concurrent batch runs cannot exceed the limit. Record which rule was
applied and the discount amount on the invoice.

## 7. Batch invoice generation and idempotency

-   Batch billing considers only subscriptions in the `Active` state.
-   Generate at most one invoice for a given
    `(subscription_id, billing_period)` pair.
-   Enforce this with a database unique constraint on
    `(subscription_id, billing_period)`; an application-level pre-check
    alone is insufficient.
-   Generate invoices and update discount usage in a database
    transaction.
-   If the batch is run again for the same period, existing invoices are
    left unchanged and no duplicates are created.
-   A failed transaction must not leave a partial invoice or consume
    discount usage.

**Worked example:** The first batch run creates an invoice for
subscription 42 for the October billing period. Running the same batch
again for October creates no second invoice for subscription 42. A later
billing period may create a new invoice.

The unique constraint is the final safeguard against duplicate invoices,
including concurrent batch requests.

## 8. Payments, invoice status, and overdue

-   Payments are recorded against an invoice.
-   The outstanding balance is
    `invoice_total - sum(successfully_recorded_payments)`.
-   An invoice becomes **Paid** when its outstanding balance reaches
    zero.
-   An invoice with a positive outstanding balance is **Overdue** when
    the current date is later than its due date.
-   An invoice that is not fully paid and has not passed its due date
    remains unpaid/open, not overdue.
-   Do not mark an invoice overdue solely because it is unpaid; the due
    date must have passed.

**Example:** An invoice total is 330.00. A recorded payment of 100.00
leaves 230.00 outstanding. If the due date has passed, the invoice is
overdue; if the due date has not passed, it remains unpaid but not
overdue. Once another payment of 230.00 is recorded, the balance is zero
and the invoice is Paid.

Payment amounts must be positive. The API should validate that a payment
does not exceed the remaining balance unless an explicit
overpayment/refund policy is added. That policy is not defined in the
demo scope.

## 9. Rounding and currency

-   Store and calculate monetary values using a fixed-precision decimal
    type.
-   Round displayed and posted monetary amounts to the currency's minor
    unit (two decimal places for the examples in this document).
-   Use one consistent rounding rule in the billing service and tests.
-   Calculate using unrounded intermediate decimal values where
    practical, then round the posted discount, tax, and total according
    to the chosen currency rule.

The mission plan does not specify a currency, rounding mode,
tax-inclusive pricing, proration, partial-period billing, refunds, or
overpayment handling. These are outside the demo rules unless the team
explicitly decides otherwise.

## 10. Minimum acceptance tests

1.  A 3-seat subscription at 100.00 per seat with 10% tax and no
    discount produces a 330.00 invoice.
2.  The same subscription with an eligible 10% discount and 10% tax
    produces a 297.00 invoice.
3.  A subscription below the plan's minimum quantity is rejected.
4.  A non-Active subscription is not billed.
5.  January 31 advances to the last day of February, and then to March
    31.
6.  A second batch run for the same subscription and billing period
    creates no duplicate invoice.
7.  An expired discount rule is not applied.
8.  A discount rule at its usage limit is not applied.
9.  A discount rule whose minimum quantity is not met is not applied.
10. A partially paid invoice remains unpaid; it becomes overdue only
    after its due date.
11. An invoice becomes Paid when its outstanding balance reaches zero.
12. A failed invoice-generation transaction does not consume discount
    usage.

------------------------------------------------------------------------

**Scope note:** These rules reflect the Brightloop mission plan's demo
scope: one monthly plan, subscription lifecycle, tax-aware batch
invoicing, idempotency, one percentage discount rule, payment recording,
and overdue calculation. Any policy not specified above should be agreed
by the team before implementation rather than inferred independently by
different modules.
