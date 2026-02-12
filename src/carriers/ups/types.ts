export interface UPSRateRequest {
  RateRequest: {
    Request: {
      TransactionReference?: {
        CustomerContext?: string;
      };
    };
    Shipment: {
      Shipper: {
        Address: {
          City: string;
          StateProvinceCode: string;
          PostalCode: string;
          CountryCode: string;
        };
      };
      ShipTo: {
        Address: {
          City: string;
          StateProvinceCode: string;
          PostalCode: string;
          CountryCode: string;
        };
      };
      ShipFrom: {
        Address: {
          City: string;
          StateProvinceCode: string;
          PostalCode: string;
          CountryCode: string;
        };
      };
      Service?: {
        Code: string;
      };
      Package: Array<{
        PackagingType: {
          Code: string;
        };
        Dimensions: {
          UnitOfMeasurement: {
            Code: string;
          };
          Length: string;
          Width: string;
          Height: string;
        };
        PackageWeight: {
          UnitOfMeasurement: {
            Code: string;
          };
          Weight: string;
        };
      }>;
    };
  };
}

export interface UPSRateResponse {
  RateResponse: {
    Response: {
      ResponseStatus: {
        Code: string;
        Description: string;
      };
      Alert?: Array<{
        Code: string;
        Description: string;
      }>;
    };
    RatedShipment: Array<{
      Service: {
        Code: string;
      };
      TotalCharges: {
        CurrencyCode: string;
        MonetaryValue: string;
      };
      GuaranteedDelivery?: {
        BusinessDaysInTransit: string;
      };
      TimeInTransit?: {
        ServiceSummary: {
          EstimatedArrival: {
            Date: string;
          };
        };
      };
    }>;
  };
}

export const UPS_SERVICE_CODES: Record<string, string> = {
  '01': 'UPS Next Day Air',
  '02': 'UPS 2nd Day Air',
  '03': 'UPS Ground',
  '12': 'UPS 3 Day Select',
  '13': 'UPS Next Day Air Saver',
  '14': 'UPS Next Day Air Early',
  '59': 'UPS 2nd Day Air A.M.',
};
