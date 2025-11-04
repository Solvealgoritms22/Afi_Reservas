export type FundPreset = {
  key: string;
  name: string;
  adminFeePct: number;
  // relative public path to icon image (e.g., /iconos/xxx.svg)
  icon: string;
  cover?: string; // portada grande opcional
  description?: string;
  uses?: string[];
  docs?: { label: string; url: string }[];
};

export const FUND_PRESETS: FundPreset[] = [
  {
    key: 'quisqueya',
    name: 'Fondo Quisqueya',
    adminFeePct: 2,
    icon: '/iconos/fondo_quisqueya.svg',
    cover: '/iconos/fondo_quisqueya.svg',
    description:
      'Fondo abierto en pesos para inversiones de corto plazo sin permanencia mínima, con liquidez y rendimiento competitivo.',
    uses: [
      'Ahorros e inversiones a corto plazo.',
      'Para eficientizar manejo del capital de tu empresa o negocio.',
      'Instrumento de inversión de fácil uso y comprensión.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Quisqueya',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/yoab1ytt/ficha-diaria-afi-quisqueya.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ys1kmovy/reporte-hist%C3%B3rico-fondo-quisqueya-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Quisqueya',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/zxsev215/reporte-mensual-quisqueya-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ymohso4y/folleto-informativo-fondo-quisqueya.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/0difuwty/reglamento-interno-fondo-quisqueya.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/icad4s5e/eeff-fquisqueya-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/c1ffmfg2/1ef-quisqueya-final-2024.pdf',
      },
      {
        label: 'Memoria Anual Fondo Quisqueya 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/hppceya2/memoria-anual-2024-fondo-mutuo-corto-plazo-reservas-quisqueya.pdf',
      },
      {
        label: 'Calificación de Riesgo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/uxpo0swy/informe-reservas-quisqueya-2025-07.pdf',
      },
    ],
  },
  {
    key: 'bohio',
    name: 'Fondo el Bohío',
    adminFeePct: 2,
    icon: '/iconos/fondo_bohio.svg',
    cover: '/iconos/fondo_bohio.svg',
    description:
      'Fondo abierto en pesos y de mediano plazo, diseñado para proyectos familiares o individuales como la planificación de boda, compra de vehículo o vivienda, vacaciones, etc.',
    uses: [
      'Planificación de boda.',
      'Inicial o compra de inmueble o vehículo.',
      'Rentabilizar capital de reserva del negocio.',
      'Planificación de vacaciones.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI El Bohío',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/h4olkfx3/ficha-diaria-afi-bohio.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/1htghzem/reporte-hist%C3%B3rico-fondo-bohio-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual El Bohío',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/wnhfqarh/reporte-mensual-bohio-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/i4ul5aub/folleto-informativo-resumido-fondo-mutuo-reservas-el-boh%C3%ADo.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/agoi2gkz/reglamento-interno-fondo-bohio.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/jg3dtuuv/eeff-fel-bohio-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/b3hdup0a/1ef-el-bohio-final-2024.pdf',
      },
      {
        label: 'Memoria Anual Fondo El Bohío 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/drrdfdih/memoria-anual-2024-fondo-mutuo-matrimonial-med-plazo-reservas-boh%C3%ADo.pdf',
      },
    ],
  },
  {
    key: 'inmobiliario',
    name: 'Fondo Inmobiliario',
    adminFeePct: 2,
    icon: '/iconos/fondo_inmobiliario.svg',
    cover: '/iconos/fondo_inmobiliario.svg',
    description:
      'Fondo cerrado en pesos orientado a la inversión a largo plazo en bienes inmuebles ubicados en República Dominicana, con potencial de flujos por arrendamiento y apreciación de activos.',
    uses: [
      'Ahorros e inversiones a largo plazo.',
      'Para ahorros de tu retiro.',
      'Diversificación del portafolio de inversión.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Inmobiliario Reservas I',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/x1smmfp3/ficha-diaria-afi-inmobiliario-reservas.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/g0xdx0wl/reporte-hist%C3%B3rico-fondo-inmobiliario-i-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Inmobiliario Reservas I',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/1ggleyeq/reporte-mensual-inmobiliaria-i-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/wfmn0cod/folleto-informativo-resumido-fondo-cerrado-inmobiliario-actualizado.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/z30pfigc/reglamento_interno_fici_i.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/cz3ha0g4/eeff-ficinmobiliario-reservas-i-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/1f0cyjpg/1-ficri-2024-pdf-final.pdf',
      },
      {
        label: 'Memoria Anual Fondo Inmobiliario 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/43bipyn1/memoria-anual-2024-fondo-de-inversi%C3%B3n-cerrado-inmobiliario-reservas-i.pdf',
      },
    ],
  },
  {
    key: 'larimar',
    name: 'Fondo Larimar',
    adminFeePct: 2,
    icon: '/iconos/fondo_larimar.svg',
    cover: '/iconos/fondo_larimar.svg',
    description:
      'Fondo abierto en pesos y de largo plazo (al menos un año de permanencia), pensado para incursionar de forma sencilla en el mercado de valores.',
    uses: [
      'Ahorro para tu retiro.',
      'Ahorro para herencia.',
      'Inicial o compra de inmueble.',
      'Planificación de viaje familiar.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Larimar',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/avdpnxe5/ficha-diaria-afi-larimar.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/vxujsmrq/reporte-hist%C3%B3rico-fondo-larimar-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Larimar',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/2cdnmo3c/reporte-mensual-larimar-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/b20jg1q0/folleto-informativo-resumido-fondo-mutuo-reservas-larimar.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/bhvfvo2j/reglamento-interno-fondo-mutuo-reservas-larimar.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/n2cbtj4d/eeff-flarimar-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/20pf1pv0/1ef-larimar-final-2024.pdf',
      },
      {
        label: 'Memoria Anual Fondo Larimar 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/hblfnsdh/memoria-anual-2024-fondo-mutuo-largo-plazo-reservas-larimar.pdf',
      },
    ],
  },
  {
    key: 'caoba',
    name: 'Fondo Caoba',
    adminFeePct: 2,
    icon: '/iconos/fondo_caoba.svg',
    cover: '/iconos/fondo_caoba.svg',
    description:
      'Fondo abierto en dólares estadounidenses y de mediano plazo. Permite diversificar las inversiones y proteger el capital en moneda extranjera.',
    uses: ['Diversificación por moneda.', 'Protección de capital en USD.'],
    docs: [
      {
        label: 'Ficha Diaria AFI Caoba',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/tezbp5xp/ficha-diaria-afi-caoba.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/4asjwsbv/reporte-hist%C3%B3rico-fondo-caoba-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Caoba',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/e04lkwpy/reporte-mensual-caoba-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/yfkdwyar/folleto-informativo-resumido-fondo-caoba.pdf',
      },
      {
        label: 'Memoria Anual Fondo Caoba 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ef4joq1s/memoria-anual-2024-fondo-mutuo-d%C3%B3lares-reservas-caoba.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/kzshfpnc/reglamento-interno-fondo-caoba.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/4ohfjdwt/eeff-fcreservas-caoba-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/j4dh04hh/1ef-caoba-final-2024.pdf',
      },
      {
        label: 'Calificación de Riesgo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/h2zfsutr/informe-reservas-caoba-2025-07.pdf',
      },
    ],
  },
  {
    key: 'desarrollo',
    name: 'Fondo Desarrollo',
    adminFeePct: 2,
    icon: '/iconos/fondo_desarrollo.svg',
    cover: '/iconos/fondo_desarrollo.svg',
    description:
      'Fondo cerrado en pesos orientado a invertir en valores de deuda y/o capital de proyectos, infraestructuras, fideicomisos y sociedades en República Dominicana (excepto sector financiero), para generar ingresos y apreciación de capital a mediano y largo plazo.',
    uses: [
      'Ahorros e inversiones a largo plazo.',
      'Ahorro para retiro.',
      'Diversificación del portafolio de inversión.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Desarrollo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/pelhqaxu/ficha-diaria-afi-desarrollo.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/smzfsq2q/reporte-hist%C3%B3rico-fondo-desarrollo-i-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Desarrollo Reservas I',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/u5zg5ylu/reporte-mensual-desarrollo-i-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/5ubforyu/folleto-informativo-ficd-i.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/2o3lp5kv/reglamento-interno-ficd-i.pdf',
      },
      {
        label: 'Memoria Anual 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/gmbjvse4/memoria-anual-2024-fondo-de-inversi%C3%B3n-cerrado-de-desarrollo-reservas-i.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/pw5geohx/eeff-ficdesarrollo-reservas-i-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/3xtbzbyc/fondo-de-inversi%C3%B3n-cerrado-de-desarrollo-reservas-i.pdf',
      },
      {
        label: 'Calificación de Riesgo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/s53peigu/informe-fondo-desarrollo-reservas-i-2025-07.pdf',
      },
    ],
  },
  {
    key: 'desarrollo2',
    name: 'Fondo Desarrollo II',
    adminFeePct: 2,
    icon: '/iconos/fondo_desarrollo_II.svg',
    cover: '/iconos/fondo_desarrollo_II.svg',
    description:
      'Fondo cerrado en dólares orientado a invertir en valores de deuda y/o capital de proyectos, infraestructuras, fideicomisos y sociedades en República Dominicana (excepto sector financiero), con horizonte de mediano y largo plazo.',
    uses: [
      'Ahorros e inversiones a largo plazo.',
      'Para ahorros de tu retiro.',
      'Diversificación del portafolio de inversión.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Desarrollo II',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/5wfd5alj/ficha-diaria-afi-desarrollo-ii.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/xerp0afz/reporte-hist%C3%B3rico-fondo-desarrollo-ii-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Desarrollo Reservas II',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/z0hdgqiz/reporte-mensual-desarrollo-ii-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/fyzlwult/folleto-informativo-resumido-ficd-ii.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/nxfg4ole/reglamento-interno-ficd-ii.pdf',
      },
      {
        label: 'Memoria Anual 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/b1zd4lsu/memoria-anual-2024-fondo-de-inversi%C3%B3n-cerrado-de-desarrollo-en-d%C3%B3lares-reservas-ii.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/rksjzzzu/eeff-ficdesarrollo-en-dolares-reservas-ii-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/iwdfsziy/1ficddr-ii-2024-pdf-final.pdf',
      },
      {
        label: 'Calificación de Riesgo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/0sfp30mh/informe-fondo-desarrollo-en-d%C3%B3lares-reservas-ii-2025-07.pdf',
      },
    ],
  },
  {
    key: 'inmobiliario2',
    name: 'Fondo Inmobiliario II',
    adminFeePct: 2,
    icon: '/iconos/fondo_inmobiliario_II.svg',
    cover: '/iconos/fondo_inmobiliario_II.svg',
    description:
      'Fondo cerrado orientado a la inversión a largo plazo en bienes inmuebles ubicados en República Dominicana, con potencial de flujos por arrendamiento y apreciación de activos.',
    uses: [
      'Ahorros e inversiones a largo plazo.',
      'Para ahorros de tu retiro.',
      'Diversificación del portafolio de inversión.',
    ],
    docs: [
      {
        label: 'Ficha Diaria AFI Inmobiliario Reservas II',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/qrsarczi/ficha-diaria-afi-inmobiliario-reservas-ii.pdf',
      },
      {
        label: 'Reporte histórico valor cuota',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/1g0moock/reporte-hist%C3%B3rico-fondo-inmobiliario-ii-afi-reservas.pdf',
      },
      {
        label: 'Reporte Mensual Inmobiliario Reservas II',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/omffl3ta/reporte-mensual-inmobiliaria-ii-septiembre.pdf',
      },
      {
        label: 'Folleto Informativo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/5hqpbcha/folleto-fondo-inmobiliario-ii.pdf',
      },
      {
        label: 'Reglamento Interno',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/onmjtp3q/reglamento-interno-fondo-inmobiliario-ii.pdf',
      },
      {
        label: 'Estado Financiero Trimestral',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ebybxhyu/eeff-ficinmobiliario-reservas-ii-3er-trimestre-2025.pdf',
      },
      {
        label: 'Estado Financiero Anual Auditado',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/zqzlu4dp/1ef-reservas-ii-2024.pdf',
      },
      {
        label: 'Memoria Anual 2024',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ipmhcf0d/memoria-anual-2024-fondo-de-inversi%C3%B3n-cerrado-inmobiliario-reservas-ii.pdf',
      },
      {
        label: 'Calificación de Riesgo',
        url: 'https://cdneafireservaspeastus.azureedge.net/afireservas/media/ctrke2yk/informe-fondo-inmobiliario-reservas-ii-2025-07.pdf',
      },
    ],
  },
];

export function presetByKey(key: string) {
  return FUND_PRESETS.find((p) => p.key === key);
}

// Utils para mapear fondos ↔ presets
export function normalizeName(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getFundPresetKeyFromFund(f: { name: string; logoDataUrl?: string }): string | undefined {
  const raw = f.logoDataUrl || '';
  const presetPart = raw.split('|').find((p) => p.startsWith('preset:'));
  if (presetPart) return presetPart.replace('preset:', '');
  const byName = FUND_PRESETS.find((p) => normalizeName(p.name) === normalizeName(f.name));
  return byName?.key;
}

export function iconFromLogoData(logoDataUrl?: string): string | undefined {
  if (!logoDataUrl) return undefined;
  const parts = logoDataUrl.split('|');
  const iconPart = parts.find((p) => p.startsWith('icon:'));
  if (!iconPart) return undefined;
  const value = iconPart.replace('icon:', '');
  return value || undefined;
}

export function resolveFundIconSrc(f: { name: string; logoDataUrl?: string }): string | undefined {
  // Priority: explicit icon in logoDataUrl, else preset mapping
  const explicit = iconFromLogoData(f.logoDataUrl);
  const isPath = explicit && (explicit.startsWith('/') || explicit.startsWith('http') || explicit.endsWith('.svg') || explicit.endsWith('.png'));
  if (explicit && isPath) return explicit;
  return presetByKey(getFundPresetKeyFromFund(f) || '')?.icon;
}

