import React from 'react';

export enum Status {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export enum ComplaintType {
    Pothole = 'Pothole',
    Garbage = 'Garbage Overflow',
    Streetlight = 'Broken Streetlight',
    WaterLogging = 'Water Logging',
    BrokenSidewalk = 'Broken Sidewalk',
    DamagedPublicProperty = 'Damaged Public Property',
    IllegalParking = 'Illegal Parking',
    StrayAnimal = 'Stray Animal Nuisance',
    TrafficSignal = 'Traffic Signal Malfunction',
    Graffiti = 'Graffiti',
    Other = 'Other',
}

export enum Impact {
    AccidentRisk = 'Accident Risk',
    HealthHazard = 'Health Hazard',
    SafetyConcern = 'Safety Concern (e.g., Women Safety)',
    AnimalWelfare = 'Animal Lives At Risk',
    PropertyDamage = 'Property Damage Risk',
    EnvironmentalHazard = 'Environmental Hazard',
    AccessibilityIssue = 'Accessibility Issue',
    PublicNuisance = 'Public Nuisance',
}

export interface Location {
  lat: number;
  lng: number;
  houseNo?: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  fullAddress: string;
}


export interface Complaint {
  id: string;
  title: string;
  description: string;
  photo: string; // base64 string
  location: Location;
  status: Status;
  submittedAt: Date;
  resolutionNotes?: string;
  type: ComplaintType;
  impact: Impact;
  affectedCount: number;
}

export enum Page {
  Public = 'Public',
  User = 'User',
  Report = 'Report',
}