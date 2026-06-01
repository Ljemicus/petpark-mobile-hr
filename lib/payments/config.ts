// Payments are intentionally out of scope for this mobile completion pass.
// Keep payment screens compiling, but never start Stripe checkout while disabled.
export const PAYMENTS_ENABLED = false;

export const PAYMENT_DISABLED_TITLE = 'Plaćanje uskoro';
export const PAYMENT_DISABLED_MESSAGE =
  'Online plaćanje će biti dostupno uskoro. Upit i dogovor s pružateljem usluge rade normalno.';
