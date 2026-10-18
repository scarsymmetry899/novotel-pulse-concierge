/**
 * Novotel Pulse Concierge - TypeScript Interfaces
 * Enterprise Hospitality & Google Cloud / Supabase Schema Types
 */

export type RoomCategory = 'Superior' | 'Executive' | 'Suite';
export type RoomStatus = 'vacant' | 'occupied' | 'turnover';

export interface Room {
  id: string;
  roomNumber: string;
  category: RoomCategory;
  floor: number;
  status: RoomStatus;
}

export interface Stay {
  id: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: string; // ISO string / Timestamp
  checkOut: string;
  accessTokenHash: string;
  isActive: boolean;
  whatsappOptIn: boolean;
  createdAt?: string;
}

export interface GuestPreferences {
  stayId: string;
  personaId?: string;
  personaName?: string;
  wellnessInterests: string[];
  tennisSlot?: string;
  pillowType: 'Hungarian Goose Down' | 'Ergonomic Memory Foam' | 'Organic Buckwheat' | 'Cooling Bamboo Silk' | 'Anti-Allergen Cotton' | string;
  towelWarmingTime: string; // e.g. "20:30"
  roomTemp: number; // e.g. 19.5 (in Celsius)
  aromatherapy?: string; // e.g. "French Lavender & Chamomile"
  soundscape?: string; // e.g. "Delta-Wave Sleep (432Hz)"
  lightingMood?: string; // e.g. "Golden Amber 2200K"
  bathRitual?: string; // e.g. "Magnesium Flakes & Epsom Bath Soak"
  breakfastStyle: 'The Square Signature Buffet' | 'In-Room Continental Silver Tray' | 'High-Protein Recovery Scramble' | 'Plant-Based Wellness Bowl' | string;
  minibarItems: string[];
  allergies: string[];
  customNotes?: string;
  updatedAt?: string;
}

export interface DepartmentDirective {
  department: Department;
  title: string;
  actionItems: string[];
  timing?: string;
  badge: string;
}

export interface LuxuryPersona {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  avatarIcon: string;
  badgeColor: string;
  category: RoomCategory;
  guestName: string;
  sensoryProfile: {
    roomTemp: number;
    aromatherapy: string;
    soundscape: string;
    lighting: string;
    pillow: string;
    bathRitual: string;
  };
  refreshments: {
    breakfast: string;
    coffeeRoast: string;
    beverages: string[];
    dietaryFlags: string[];
  };
  amenities: string[];
  departmentDirectives: DepartmentDirective[];
  preferences: Partial<GuestPreferences>;
}

export type Department = 'housekeeping' | 'wellness' | 'fnb' | 'front_desk';
export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed';

export interface ServiceRequest {
  id: string;
  stayId: string;
  roomId: string;
  department: Department;
  serviceType: string;
  details?: string;
  scheduledTime?: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  hours: string;
  currentOccupancy: string;
  rules?: string;
  slots: string[];
  temperature?: string;
  status?: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  stayId: string;
  roomId: string;
  timeSlot: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  createdAt: string;
}

/**
 * Auth & Custom Token Claims (Firebase Auth / Supabase JWT)
 */
export interface GuestTokenClaims {
  stayId: string;
  roomId: string;
  role: 'guest';
}

export interface StaffTokenClaims {
  role: 'front_desk' | 'wellness' | 'housekeeping' | 'fnb' | 'admin';
  department: Department;
  email: string;
}

/**
 * WhatsApp Business & Google Chat Dispatch Payloads
 */
export interface WhatsAppMessagePayload {
  to: string;
  templateName?: string;
  text?: string;
  headerImageUrl?: string;
  buttons?: Array<{
    type: 'url' | 'quick_reply';
    title: string;
    payloadOrUrl: string;
  }>;
}

export interface GoogleChatCardPayload {
  spaceId: string;
  header: {
    title: string;
    subtitle: string;
    imageUrl?: string;
  };
  sections: Array<{
    widgets: Array<{
      keyValue?: {
        topLabel: string;
        content: string;
        bottomLabel?: string;
      };
      buttons?: Array<{
        textButton: {
          text: string;
          onClick: { openLink: { url: string } };
        };
      }>;
    }>;
  }>;
}
