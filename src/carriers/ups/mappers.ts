import { RateRequest } from '../../models/RateRequest';
import { RateResponse } from '../../models/RateResponse';
import { UPSRateRequest, UPSRateResponse, UPS_SERVICE_CODES } from './types';

export class UPSMapper {
  static toUPSRateRequest(request: RateRequest): UPSRateRequest {
    return {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: 'Rating',
          },
        },
        Shipment: {
          Shipper: {
            Address: {
              City: request.origin.city,
              StateProvinceCode: request.origin.state,
              PostalCode: request.origin.zip,
              CountryCode: request.origin.country,
            },
          },
          ShipTo: {
            Address: {
              City: request.destination.city,
              StateProvinceCode: request.destination.state,
              PostalCode: request.destination.zip,
              CountryCode: request.destination.country,
            },
          },
          ShipFrom: {
            Address: {
              City: request.origin.city,
              StateProvinceCode: request.origin.state,
              PostalCode: request.origin.zip,
              CountryCode: request.origin.country,
            },
          },
          ...(request.serviceLevel && {
            Service: {
              Code: request.serviceLevel,
            },
          }),
          Package: request.packages.map((pkg) => ({
            PackagingType: {
              Code: '02', // Customer Supplied Package
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: pkg.dimensionUnit,
              },
              Length: pkg.length.toString(),
              Width: pkg.width.toString(),
              Height: pkg.height.toString(),
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: pkg.weightUnit,
              },
              Weight: pkg.weight.toString(),
            },
          })),
        },
      },
    };
  }

  static fromUPSRateResponse(response: UPSRateResponse): RateResponse[] {
    return response.RateResponse.RatedShipment.map((shipment) => ({
      carrier: 'UPS',
      service: UPS_SERVICE_CODES[shipment.Service.Code] || `UPS Service ${shipment.Service.Code}`,
      rate: parseFloat(shipment.TotalCharges.MonetaryValue),
      currency: shipment.TotalCharges.CurrencyCode,
      deliveryDate: shipment.TimeInTransit?.ServiceSummary?.EstimatedArrival?.Date,
      transitDays: shipment.GuaranteedDelivery?.BusinessDaysInTransit
        ? parseInt(shipment.GuaranteedDelivery.BusinessDaysInTransit, 10)
        : undefined,
    }));
  }
}
