// Client mock data for development/demo purposes

import type { Client as ApiClient } from '@/api/types/client.types';

export interface Project {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  startDate: string;
  endDate?: string;
  value: number;
}

export interface ClientDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  totalRevenue: number;
  projects: Project[];
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export type MockClient = ApiClient & {
  company: string;
  status: 'active' | 'inactive' | 'pending';
  projects: number;
  revenue: number;
};

export const mockClients: MockClient[] = [
  {
    id: 1,
    full_name: 'John Smith',
    email: 'john.smith@abc.com',
    company: 'ABC Corp',
    status: 'active',
    projects: 3,
    revenue: 15000,
    profile: { risk_preference: 'Balanced' },
    primary_advisor_id: 1,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    full_name: 'Sarah Johnson',
    email: 'sarah.j@xyz.com',
    company: 'XYZ Ltd',
    status: 'active',
    projects: 2,
    revenue: 8500,
    profile: { risk_preference: 'Moderate' },
    primary_advisor_id: 1,
    created_at: '2024-03-21T10:00:00Z',
  },
  {
    id: 3,
    full_name: 'Mike Wilson',
    email: 'mike.w@def.com',
    company: 'DEF Inc',
    status: 'pending',
    projects: 1,
    revenue: 5000,
    profile: { risk_preference: 'Conservative' },
    primary_advisor_id: 1,
    created_at: '2024-05-11T10:00:00Z',
  },
  {
    id: 4,
    full_name: 'Emma Davis',
    email: 'emma.d@ghi.com',
    company: 'GHI Solutions',
    status: 'inactive',
    projects: 0,
    revenue: 0,
    profile: { risk_preference: 'Moderate' },
    primary_advisor_id: 2,
    created_at: '2023-12-02T10:00:00Z',
  },
  {
    id: 5,
    full_name: 'Alex Brown',
    email: 'alex.b@jkl.com',
    company: 'JKL Enterprises',
    status: 'active',
    projects: 4,
    revenue: 22000,
    profile: { risk_preference: 'Aggressive' },
    primary_advisor_id: 1,
    created_at: '2024-07-19T10:00:00Z',
  },
];

export const mockClientData: Record<string, ClientDetail> = {
  '1': {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@abc.com',
    phone: '+1 (555) 123-4567',
    company: 'ABC Corp',
    position: 'CEO',
    status: 'active',
    joinDate: '2023-01-15',
    totalRevenue: 15000,
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
    },
    projects: [
      {
        id: 1,
        name: 'Website Redesign',
        status: 'completed',
        startDate: '2023-02-01',
        endDate: '2023-04-15',
        value: 8000,
      },
      {
        id: 2,
        name: 'Mobile App Development',
        status: 'in-progress',
        startDate: '2023-05-01',
        value: 12000,
      },
      {
        id: 3,
        name: 'SEO Optimization',
        status: 'pending',
        startDate: '2023-08-01',
        value: 3000,
      },
    ],
  },
};

