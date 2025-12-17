export interface EventbriteAddress {
  address_1?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

export interface EventbriteVenue {
  name: string;
  address?: EventbriteAddress;
}

export interface EventbriteCost {
  currency: string; // ex: "BRL", "USD"
  value: number;    // valor em centavos (ex: 1500 = R$15,00)
}

export interface EventbriteTicketClass {
  free: boolean;
  cost?: EventbriteCost;
}

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description?: {
    text: string;
  };
  url: string;
  logo?: {
    url: string;
  } | null;
  start?: {
    local: string; // ISO 8601: "2025-11-05T19:00:00"
  };
  end?: {
    local: string;
  };
  online_event: boolean;
  venue?: EventbriteVenue;
  ticket_classes?: EventbriteTicketClass[];
}