import React from 'react';
import {
  AdventureWorksIcon,
  NorthWindIcon,
  ZavaTechIcon,
  ContosoComputeIcon,
  NanofabEquipIcon,
  EducareIcon,
} from '@/icons';
import theme from '@/styles/theme';

export interface CompanyConfig {
  bgColor: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>> | null;
}

const COMPANY_MAP: Record<string, CompanyConfig> = {
  'adventure works': { bgColor: theme.colors.companies.adventureWorks, Icon: AdventureWorksIcon },
  adventureworks: { bgColor: theme.colors.companies.adventureWorks, Icon: AdventureWorksIcon },
  northwind: { bgColor: theme.colors.companies.northWind, Icon: NorthWindIcon },
  'northwind memory technologies': { bgColor: theme.colors.companies.northWind, Icon: NorthWindIcon },
  'zava technologies': { bgColor: theme.colors.companies.zavaTechnologies, Icon: ZavaTechIcon },
  'contoso compute': { bgColor: theme.colors.companies.contosoCompute, Icon: ContosoComputeIcon },
  // API returns "nanofab equipment" (no trailing s); keep both for compatibility
  'nanofab equipment': { bgColor: theme.colors.companies.nanofabEquipments, Icon: NanofabEquipIcon },
  'nanofab equipments': { bgColor: theme.colors.companies.nanofabEquipments, Icon: NanofabEquipIcon },
  educare: { bgColor: theme.colors.companies.eduCare, Icon: EducareIcon },
};

export function getCompanyConfig(companyName: string): CompanyConfig | undefined {
  return COMPANY_MAP[companyName.toLowerCase().trim()];
}
