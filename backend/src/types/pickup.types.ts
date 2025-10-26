import { RequestType, RequestStatus } from '../models/PickupRequest';

export interface CreatePickupRequestDTO {
  studentId: string;
  requestType: RequestType;
  scheduledPickupTime?: Date;
  notes?: string;
  specialInstructions?: string;
  requestLocationLat?: number;
  requestLocationLng?: number;
  // Guest pickup fields
  guestName?: string;
  guestPhone?: string;
  guestIdNumber?: string;
  guestPhotoUrl?: string;
}

export interface UpdatePickupStatusDTO {
  status: RequestStatus;
  rejectionReason?: string;
  pickupPersonId?: string;
  actualPickupTime?: Date;
  pickupLocationLat?: number;
  pickupLocationLng?: number;
}

export interface PickupRequestFilters {
  status?: RequestStatus;
  studentId?: string;
  requesterId?: string;
  requestType?: RequestType;
  startDate?: Date;
  endDate?: Date;
}
