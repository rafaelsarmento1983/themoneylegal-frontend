import type { GroupedCategory } from "@/components/ui/SelectPopoverGrouped";

export const atividadeCategorias: GroupedCategory[] = [
  {
    id: "tech",
    label: "Tecnologia e Internet",
    icon: "💻",
    items: [
      { value: "tech_dev", label: "Desenvolvimento de software / Programação", icon: "⌨️" },
      { value: "tech_consult", label: "Consultoria em tecnologia da informação (TI)", icon: "🧠" },
      { value: "tech_helpdesk", label: "Suporte técnico / Help desk", icon: "🛠️" },
      { value: "tech_cloud", label: "Hospedagem de sites e serviços em nuvem", icon: "☁️" },
      { value: "tech_webdesign", label: "Criação de sites e design digital", icon: "🎨" },
      { value: "tech_mkt", label: "Marketing digital", icon: "📣" },
      { value: "tech_content", label: "Produção de conteúdo / Influencer / YouTube", icon: "🎥" },
      { value: "tech_portals", label: "Portais, provedores de conteúdo e aplicativos", icon: "📱" },
      { value: "tech_infosec", label: "Segurança da informação", icon: "🔐" },
    ],
  },

  {
    id: "commerce",
    label: "Comércio (lojas e vendas)",
    icon: "🛍️",
    items: [
      { value: "com_fashion", label: "Comércio varejista de roupas e acessórios", icon: "👕" },
      { value: "com_online", label: "Comércio varejista de produtos diversos (loja online)", icon: "🛒" },
      { value: "com_electronics", label: "Comércio de eletrônicos e informática", icon: "🖥️" },
      { value: "com_cosmetics", label: "Comércio de cosméticos e perfumaria", icon: "🧴" },
      { value: "com_fooddrink", label: "Comércio de alimentos e bebidas", icon: "🥤" },
      { value: "com_furniture", label: "Comércio de móveis e decoração", icon: "🛋️" },
      { value: "com_ecommerce", label: "E-commerce / Loja virtual", icon: "🌐" },
      { value: "com_wholesale", label: "Distribuidora / Atacado", icon: "📦" },
    ],
  },

  {
    id: "food",
    label: "Alimentação",
    icon: "🍔",
    items: [
      { value: "food_rest", label: "Restaurante", icon: "🍽️" },
      { value: "food_snack", label: "Lanchonete / Hamburgueria", icon: "🍔" },
      { value: "food_bar", label: "Bar / Pub", icon: "🍺" },
      { value: "food_cafe", label: "Cafeteria", icon: "☕" },
      { value: "food_bakery", label: "Padaria / Confeitaria", icon: "🥐" },
      { value: "food_delivery", label: "Delivery de alimentos", icon: "🛵" },
      { value: "food_truck", label: "Food truck", icon: "🚚" },
      { value: "food_artisan", label: "Produção de alimentos artesanais", icon: "🧑‍🍳" },
    ],
  },

  {
    id: "admin",
    label: "Serviços administrativos e profissionais",
    icon: "🧑‍💼",
    items: [
      { value: "adm_consult", label: "Consultoria empresarial", icon: "📊" },
      { value: "adm_office", label: "Serviços administrativos / Escritório", icon: "🗂️" },
      { value: "adm_accounting", label: "Contabilidade", icon: "🧾" },
      { value: "adm_legal", label: "Advocacia / Serviços jurídicos", icon: "⚖️" },
      { value: "adm_hr", label: "Recursos humanos / Recrutamento", icon: "🧑‍🤝‍🧑" },
      { value: "adm_training", label: "Treinamentos e cursos", icon: "🎓" },
      { value: "adm_translation", label: "Tradução e revisão de textos", icon: "📝" },
    ],
  },

  {
    id: "construction",
    label: "Construção e engenharia",
    icon: "🏗️",
    items: [
      { value: "con_civil", label: "Construção civil", icon: "🏗️" },
      { value: "con_renov", label: "Reformas e obras", icon: "🧱" },
      { value: "con_engineering", label: "Engenharia", icon: "📐" },
      { value: "con_arch", label: "Arquitetura", icon: "🏛️" },
      { value: "con_electric", label: "Instalações elétricas", icon: "⚡" },
      { value: "con_hydraulic", label: "Instalações hidráulicas", icon: "🚰" },
      { value: "con_paint", label: "Serviços de pintura", icon: "🖌️" },
      { value: "con_maintenance", label: "Serviços de manutenção predial", icon: "🔧" },
    ],
  },

  {
    id: "logistics",
    label: "Transporte e logística",
    icon: "🚚",
    items: [
      { value: "log_cargo", label: "Transporte rodoviário de cargas", icon: "🚛" },
      { value: "log_passengers", label: "Transporte de passageiros", icon: "🚌" },
      { value: "log_motoboy", label: "Motoboy / Entregas rápidas", icon: "🛵" },
      { value: "log_storage", label: "Logística e armazenagem", icon: "🏬" },
      { value: "log_moving", label: "Mudanças", icon: "📦" },
      { value: "log_apps", label: "Aplicativos de transporte", icon: "📱" },
    ],
  },

  {
    id: "health",
    label: "Saúde e bem-estar",
    icon: "🏥",
    items: [
      { value: "hl_clinic", label: "Clínica médica", icon: "🩺" },
      { value: "hl_dentistry", label: "Odontologia", icon: "🦷" },
      { value: "hl_psy", label: "Psicologia / Terapias", icon: "🧠" },
      { value: "hl_physio", label: "Fisioterapia", icon: "🦴" },
      { value: "hl_gym", label: "Academia / Personal trainer", icon: "💪" },
      { value: "hl_beauty", label: "Estética e beleza", icon: "💆" },
      { value: "hl_nutrition", label: "Nutrição", icon: "🥗" },
      { value: "hl_lab", label: "Laboratório / exames", icon: "🧪" },
    ],
  },

  {
    id: "beauty",
    label: "Beleza e estética",
    icon: "💇",
    items: [
      { value: "bt_salon", label: "Salão de beleza", icon: "💇‍♀️" },
      { value: "bt_barber", label: "Barbearia", icon: "💈" },
      { value: "bt_manicure", label: "Manicure / Pedicure", icon: "💅" },
      { value: "bt_facial", label: "Estética facial e corporal", icon: "✨" },
      { value: "bt_makeup", label: "Maquiagem profissional", icon: "💄" },
      { value: "bt_wax", label: "Depilação", icon: "🧴" },
      { value: "bt_spa", label: "Spa / massagens", icon: "🧖" },
    ],
  },

  {
    id: "education",
    label: "Educação",
    icon: "🎓",
    items: [
      { value: "ed_school", label: "Escola / Ensino básico", icon: "🏫" },
      { value: "ed_vocational", label: "Curso profissionalizante", icon: "🧰" },
      { value: "ed_ead", label: "Curso online / EAD", icon: "💻" },
      { value: "ed_private", label: "Aulas particulares", icon: "📚" },
      { value: "ed_languages", label: "Escola de idiomas", icon: "🗣️" },
      { value: "ed_corporate", label: "Treinamentos corporativos", icon: "🏢" },
    ],
  },

  {
    id: "media",
    label: "Mídia, eventos e criatividade",
    icon: "🎨",
    items: [
      { value: "md_ads", label: "Agência de publicidade", icon: "📣" },
      { value: "md_audiovisual", label: "Produção audiovisual", icon: "🎬" },
      { value: "md_photo", label: "Fotografia", icon: "📷" },
      { value: "md_events_film", label: "Filmagem de eventos", icon: "📹" },
      { value: "md_events_org", label: "Organização de eventos", icon: "🎟️" },
      { value: "md_design", label: "Design gráfico", icon: "🧩" },
      { value: "md_music", label: "Produção musical", icon: "🎵" },
    ],
  },

  {
    id: "realestate",
    label: "Imobiliário",
    icon: "🏠",
    items: [
      { value: "re_broker", label: "Corretagem de imóveis", icon: "🏡" },
      { value: "re_admin", label: "Administração de imóveis", icon: "🧾" },
      { value: "re_season", label: "Aluguel por temporada", icon: "🗓️" },
    ],
  },

  {
    id: "general",
    label: "Serviços gerais",
    icon: "🧺",
    items: [
      { value: "sv_cleaning", label: "Limpeza residencial/comercial", icon: "🧹" },
      { value: "sv_security", label: "Segurança privada", icon: "🛡️" },
      { value: "sv_garden", label: "Jardinagem e paisagismo", icon: "🌿" },
      { value: "sv_laundry", label: "Lavanderia", icon: "🧼" },
      { value: "sv_pet", label: "Pet shop / serviços para pets", icon: "🐶" },
    ],
  },

  {
    id: "finance",
    label: "Financeiro",
    icon: "💰",
    items: [
      { value: "fin_services", label: "Serviços financeiros", icon: "💳" },
      { value: "fin_correspondent", label: "Correspondente bancário", icon: "🏦" },
      { value: "fin_consult", label: "Consultoria financeira", icon: "📈" },
      { value: "fin_insurance", label: "Seguros", icon: "🛡️" },
    ],
  },

  {
    id: "other",
    label: "Outros",
    icon: "🧾",
    items: [
      { value: "other_services", label: "Outros serviços", icon: "🧩" },
    ],
  },
];