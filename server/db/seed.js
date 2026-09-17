const { getDb, saveDb } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...');
  const db = await getDb();

  // --- Admin User ---
  const existingAdmin = db.exec("SELECT id FROM admin_users WHERE username = 'admin'");
  if (existingAdmin.length === 0 || existingAdmin[0].values.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", ['admin', hash]);
    console.log('  ✅ Admin user created (admin / admin123)');
  } else {
    console.log('  ⏭️  Admin user already exists');
  }

  // --- Categories ---
  const cats = [
    { name_pt: 'Sondas e Monitoramento', name_en: 'Probes & Monitoring', name_es: 'Sondas y Monitoreo', slug: 'sondas', icon: '📡', sort: 1 },
    { name_pt: 'Painéis e Automação', name_en: 'Panels & Automation', name_es: 'Paneles y Automatización', slug: 'automacao', icon: '⚡', sort: 2 },
    { name_pt: 'Motores e Bombas', name_en: 'Motors & Pumps', name_es: 'Motores y Bombas', slug: 'motores', icon: '🔄', sort: 3 },
    { name_pt: 'Material Elétrico', name_en: 'Electrical Supplies', name_es: 'Material Eléctrico', slug: 'material-eletrico', icon: '🔌', sort: 4 },
    { name_pt: 'Linha Residencial', name_en: 'Residential Line', name_es: 'Línea Residencial', slug: 'residencial', icon: '🏠', sort: 5 },
    { name_pt: 'Alarmes e Segurança', name_en: 'Alarms & Security', name_es: 'Alarmas y Seguridad', slug: 'alarmes', icon: '🔔', sort: 6 },
  ];

  const existingCats = db.exec("SELECT COUNT(*) as c FROM categories");
  if (existingCats[0].values[0][0] === 0) {
    const stmt = db.prepare("INSERT INTO categories (name_pt, name_en, name_es, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    cats.forEach(c => {
      stmt.run([c.name_pt, c.name_en, c.name_es, c.slug, c.icon, c.sort]);
    });
    stmt.free();
    console.log('  ✅ Categories seeded');
  } else {
    console.log('  ⏭️  Categories already exist');
  }

  // --- Products ---
  const existingProducts = db.exec("SELECT COUNT(*) as c FROM products");
  if (existingProducts[0].values[0][0] === 0) {
    const products = [
      {
        category_id: 1, is_featured: 1, discount_percent: 0, sort_order: 1,
        name_pt: 'OXILIFE FISH — Sonda de Oxigênio Dissolvido',
        name_en: 'OXILIFE FISH — Dissolved Oxygen Probe',
        name_es: 'OXILIFE FISH — Sonda de Oxígeno Disuelto',
        description_pt: 'Sistema de monitoramento e controle do oxigênio no tanque de peixe. Separado em quatro grupos de aeradores que ligam e desligam separadamente de acordo com a necessidade e programação do produtor. Também conta com leitura de temperatura para um melhor manejo da produção. Acesso remoto pelo celular através de aplicativo.',
        description_en: 'Oxygen monitoring and control system for fish tanks. Separated into four aerator groups that turn on and off independently according to the producer\'s needs and programming. Also features temperature reading for better production management. Remote access via smartphone app.',
        description_es: 'Sistema de monitoreo y control de oxígeno en tanques de peces. Separado en cuatro grupos de aireadores que se encienden y apagan independientemente según la necesidad y programación del productor. También cuenta con lectura de temperatura.',
        features_pt: 'Até 3 sondas no mesmo painel;4 grupos de aeradores independentes;Alarme para nível de O₂ máximo e mínimo;Alarme para problemas de leitura em segundos;Acesso remoto pelo celular via aplicativo;Liga/desliga manual pelo painel ou app;Histórico de leituras gravado em pendrive;Leitura de temperatura integrada;Equipamentos de nível industrial;Economia de até 40% em energia',
        features_en: 'Up to 3 probes on the same panel;4 independent aerator groups;Max/min O₂ level alarms;Reading problem alarm within seconds;Remote access via smartphone app;Manual on/off via panel or app;Reading history saved to USB drive;Integrated temperature reading;Industrial-grade equipment;Up to 40% energy savings',
        features_es: 'Hasta 3 sondas en el mismo panel;4 grupos de aireadores independientes;Alarma para nivel de O₂ máximo y mínimo;Alarma para problemas de lectura en segundos;Acceso remoto por celular vía app;Encendido/apagado manual por panel o app;Historial de lecturas grabado en pendrive;Lectura de temperatura integrada;Equipos de nivel industrial;Ahorro de hasta 40% en energía',
        image: '/assets/images/painel-sonda.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre a sonda OXILIFE FISH.',
        whatsapp_message_en: 'Hello! I would like to know more about the OXILIFE FISH probe.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre la sonda OXILIFE FISH.',
      },
      {
        category_id: 1, is_featured: 0, discount_percent: 0, sort_order: 2,
        name_pt: 'Oxímetro Manual',
        name_en: 'Handheld Oximeter',
        name_es: 'Oxímetro Manual',
        description_pt: 'Aparelho portátil para medição de oxigênio dissolvido, temperatura e saturação para uso em tanques de peixes. Ferramenta essencial para o manejo diário da piscicultura, permitindo leituras rápidas e precisas em campo.',
        description_en: 'Portable device for measuring dissolved oxygen, temperature, and saturation for use in fish tanks. Essential tool for daily fish farming management, allowing quick and accurate field readings.',
        description_es: 'Aparato portátil para medición de oxígeno disuelto, temperatura y saturación para uso en tanques de peces. Herramienta esencial para el manejo diario de la piscicultura.',
        features_pt: 'Medição de oxigênio dissolvido;Leitura de temperatura;Medição de saturação;Portátil e leve;Ideal para campo;Leitura rápida e precisa;Display digital',
        features_en: 'Dissolved oxygen measurement;Temperature reading;Saturation measurement;Portable and lightweight;Ideal for fieldwork;Quick and accurate reading;Digital display',
        features_es: 'Medición de oxígeno disuelto;Lectura de temperatura;Medición de saturación;Portátil y liviano;Ideal para campo;Lectura rápida y precisa;Display digital',
        image: '/assets/images/oximetro.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre o Oxímetro Manual.',
        whatsapp_message_en: 'Hello! I would like to know more about the Handheld Oximeter.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre el Oxímetro Manual.',
      },
      {
        category_id: 2, is_featured: 0, discount_percent: 0, sort_order: 3,
        name_pt: 'Painel da Sonda OXILIFE FISH',
        name_en: 'OXILIFE FISH Probe Panel',
        name_es: 'Panel de la Sonda OXILIFE FISH',
        description_pt: 'Painel de comando completo para a sonda OXILIFE FISH. Equipado com componentes de altíssima qualidade de nível industrial, incluindo contatoras, relés térmicos, disjuntores e controle para até 4 grupos de aeradores. Projeto personalizado conforme a necessidade do produtor.',
        description_en: 'Complete control panel for the OXILIFE FISH probe. Equipped with top-quality industrial-grade components, including contactors, thermal relays, breakers, and control for up to 4 aerator groups. Custom design according to producer needs.',
        description_es: 'Panel de comando completo para la sonda OXILIFE FISH. Equipado con componentes de altísima calidad de nivel industrial, incluyendo contactores, relés térmicos, disyuntores y control para hasta 4 grupos de aireadores.',
        features_pt: 'Componentes de nível industrial;Controle de até 4 grupos de aeradores;Proteção trifásica completa;Contatoras de alta durabilidade;Relés térmicos de segurança;Disjuntores certificados;Projeto sob medida;Integração com app celular',
        features_en: 'Industrial-grade components;Control for up to 4 aerator groups;Complete three-phase protection;High-durability contactors;Safety thermal relays;Certified breakers;Custom design;Smartphone app integration',
        features_es: 'Componentes de nivel industrial;Control de hasta 4 grupos de aireadores;Protección trifásica completa;Contactores de alta durabilidad;Relés térmicos de seguridad;Disyuntores certificados;Diseño a medida;Integración con app celular',
        image: '/assets/images/painel-sonda-1.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre o Painel da Sonda OXILIFE FISH.',
        whatsapp_message_en: 'Hello! I would like to know more about the OXILIFE FISH Probe Panel.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre el Panel de la Sonda OXILIFE FISH.',
      },
      {
        category_id: 2, is_featured: 0, discount_percent: 0, sort_order: 4,
        name_pt: 'Painel Elétrico Industrial',
        name_en: 'Industrial Electrical Panel',
        name_es: 'Panel Eléctrico Industrial',
        description_pt: 'Montagem de painéis elétricos industriais e de automação sob medida. Projetado para indústrias, propriedades rurais e estabelecimentos comerciais. Utiliza equipamentos de altíssima qualidade com proteção completa.',
        description_en: 'Custom industrial and automation electrical panel assembly. Designed for industries, rural properties, and commercial establishments. Uses top-quality equipment with complete protection.',
        description_es: 'Montaje de paneles eléctricos industriales y de automatización a medida. Diseñado para industrias, propiedades rurales y establecimientos comerciales.',
        features_pt: 'Projeto sob medida;Proteção completa;Contatoras e relés de qualidade;Disjuntores certificados;Chaves de posição;Timers programáveis;Normas NR-10 e NR-12;Assistência técnica',
        features_en: 'Custom design;Complete protection;Quality contactors and relays;Certified breakers;Position switches;Programmable timers;NR-10 and NR-12 standards;Technical support',
        features_es: 'Diseño a medida;Protección completa;Contactores y relés de calidad;Disyuntores certificados;Llaves de posición;Temporizadores programables;Normas NR-10 y NR-12;Asistencia técnica',
        image: '/assets/images/painel-eletrico.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre o Painel Elétrico Industrial.',
        whatsapp_message_en: 'Hello! I would like to know more about the Industrial Electrical Panel.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre el Panel Eléctrico Industrial.',
      },
      {
        category_id: 3, is_featured: 0, discount_percent: 0, sort_order: 5,
        name_pt: 'Motores Elétricos Hércules',
        name_en: 'Hércules Electric Motors',
        name_es: 'Motores Eléctricos Hércules',
        description_pt: 'Motores elétricos Hércules novos de diferentes modelos, potências e RPM. Linha completa para aplicações industriais, agrícolas e residenciais. Qualidade comprovada com garantia de fábrica.',
        description_en: 'New Hércules electric motors in different models, power ratings, and RPMs. Complete line for industrial, agricultural, and residential applications. Proven quality with factory warranty.',
        description_es: 'Motores eléctricos Hércules nuevos de diferentes modelos, potencias y RPM. Línea completa para aplicaciones industriales, agrícolas y residenciales.',
        features_pt: 'Diferentes modelos e potências;Variações de RPM;Monofásico e trifásico;Para uso industrial e rural;Garantia de fábrica;Alto rendimento;Disponíveis pronta entrega',
        features_en: 'Different models and power ratings;RPM variations;Single and three-phase;For industrial and rural use;Factory warranty;High efficiency;Available for immediate delivery',
        features_es: 'Diferentes modelos y potencias;Variaciones de RPM;Monofásico y trifásico;Para uso industrial y rural;Garantía de fábrica;Alto rendimiento;Disponibles entrega inmediata',
        image: '/assets/images/motores-hercules.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre os Motores Elétricos Hércules.',
        whatsapp_message_en: 'Hello! I would like to know more about the Hércules Electric Motors.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre los Motores Eléctricos Hércules.',
      },
      {
        category_id: 4, is_featured: 0, discount_percent: 0, sort_order: 6,
        name_pt: 'Materiais para Painéis e Instalações',
        name_en: 'Panel & Installation Supplies',
        name_es: 'Materiales para Paneles e Instalaciones',
        description_pt: 'Materiais diversos para painéis e instalações elétricas: contatoras, relés térmicos, disjuntores, chaves de duas e três posições, timers, painéis de PVC e metal e muito mais. Produtos de qualidade com garantia.',
        description_en: 'Various materials for panels and electrical installations: contactors, thermal relays, breakers, two and three-position switches, timers, PVC and metal panels, and much more. Quality products with warranty.',
        description_es: 'Materiales diversos para paneles e instalaciones eléctricas: contactores, relés térmicos, disyuntores, llaves de posición, temporizadores, paneles de PVC y metal y mucho más.',
        features_pt: 'Contatoras;Relés térmicos;Disjuntores;Chaves de posição;Timers;Painéis PVC e metal;Borneiras e trilhos;Cabos e fios',
        features_en: 'Contactors;Thermal relays;Breakers;Position switches;Timers;PVC and metal panels;Terminal blocks and rails;Cables and wires',
        features_es: 'Contactores;Relés térmicos;Disyuntores;Llaves de posición;Temporizadores;Paneles PVC y metal;Borneras y rieles;Cables y alambres',
        image: '/assets/images/materiais-paineis.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre os materiais para painéis.',
        whatsapp_message_en: 'Hello! I would like to know more about panel materials.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre los materiales para paneles.',
      },
      {
        category_id: 5, is_featured: 0, discount_percent: 0, sort_order: 7,
        name_pt: 'Produtos Zagonel — Chuveiros e Torneiras',
        name_en: 'Zagonel Products — Showers & Faucets',
        name_es: 'Productos Zagonel — Duchas y Grifos',
        description_pt: 'Linha completa de produtos Zagonel: chuveiros e torneiras elétricas de diferentes modelos. Qualidade e durabilidade para sua residência com economia de energia.',
        description_en: 'Complete line of Zagonel products: electric showers and faucets in different models. Quality and durability for your home with energy savings.',
        description_es: 'Línea completa de productos Zagonel: duchas y grifos eléctricos de diferentes modelos. Calidad y durabilidad para su hogar con ahorro de energía.',
        features_pt: 'Diversos modelos;Chuveiros elétricos;Torneiras elétricas;Economia de energia;Garantia Zagonel;Design moderno;Fácil instalação',
        features_en: 'Various models;Electric showers;Electric faucets;Energy savings;Zagonel warranty;Modern design;Easy installation',
        features_es: 'Diversos modelos;Duchas eléctricas;Grifos eléctricos;Ahorro de energía;Garantía Zagonel;Diseño moderno;Fácil instalación',
        image: '/assets/images/produtos-zagonel.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre os produtos Zagonel.',
        whatsapp_message_en: 'Hello! I would like to know more about Zagonel products.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre los productos Zagonel.',
      },
      {
        category_id: 6, is_featured: 0, discount_percent: 0, sort_order: 8,
        name_pt: 'Sistema de Alarme para Piscicultura',
        name_en: 'Fish Farming Alarm System',
        name_es: 'Sistema de Alarma para Piscicultura',
        description_pt: 'Sistema de alarme para piscicultura com funcionamento sem fio e WiFi. Acompanha aplicativo para celular que permite monitorar e receber alertas em tempo real sobre sua produção, de qualquer lugar.',
        description_en: 'Fish farming alarm system with wireless and WiFi operation. Includes smartphone app for real-time monitoring and alerts about your production from anywhere.',
        description_es: 'Sistema de alarma para piscicultura con funcionamiento inalámbrico y WiFi. Incluye aplicación para celular para monitoreo y alertas en tiempo real.',
        features_pt: 'Funcionamento sem fio;Conexão WiFi;Aplicativo para celular;Alertas em tempo real;Monitoramento remoto;Fácil instalação;Bateria de longa duração',
        features_en: 'Wireless operation;WiFi connection;Smartphone app;Real-time alerts;Remote monitoring;Easy installation;Long battery life',
        features_es: 'Funcionamiento inalámbrico;Conexión WiFi;Aplicación para celular;Alertas en tiempo real;Monitoreo remoto;Fácil instalación;Batería de larga duración',
        image: null,
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre o Sistema de Alarme para Piscicultura.',
        whatsapp_message_en: 'Hello! I would like to know more about the Fish Farming Alarm System.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre el Sistema de Alarma para Piscicultura.',
      },
      {
        category_id: 4, is_featured: 0, discount_percent: 0, sort_order: 9,
        name_pt: 'Produtos Diversos — Material Elétrico',
        name_en: 'Various Products — Electrical Supplies',
        name_es: 'Productos Diversos — Material Eléctrico',
        description_pt: 'Linha completa de materiais elétricos para instalações residenciais, comerciais e industriais. Disjuntores, cabos, tomadas, interruptores, quadros de distribuição e muito mais.',
        description_en: 'Complete line of electrical materials for residential, commercial, and industrial installations. Breakers, cables, outlets, switches, distribution boards, and more.',
        description_es: 'Línea completa de materiales eléctricos para instalaciones residenciales, comerciales e industriales.',
        features_pt: 'Disjuntores certificados;Cabos de qualidade;Tomadas e interruptores;Quadros de distribuição;Garantia de fábrica;Atende normas técnicas;Entrega na região',
        features_en: 'Certified breakers;Quality cables;Outlets and switches;Distribution boards;Factory warranty;Meets technical standards;Regional delivery',
        features_es: 'Disyuntores certificados;Cables de calidad;Enchufes e interruptores;Cuadros de distribución;Garantía de fábrica;Cumple normas técnicas;Entrega regional',
        image: '/assets/images/produtos-diversos.jpg',
        whatsapp_message_pt: 'Olá! Gostaria de saber mais sobre os materiais elétricos.',
        whatsapp_message_en: 'Hello! I would like to know more about electrical materials.',
        whatsapp_message_es: 'Hola! Me gustaría saber más sobre los materiales eléctricos.',
      },
    ];

    const stmtP = db.prepare(`INSERT INTO products 
      (category_id, name_pt, name_en, name_es, description_pt, description_en, description_es, features_pt, features_en, features_es, image, is_featured, discount_percent, whatsapp_message_pt, whatsapp_message_en, whatsapp_message_es, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    products.forEach(p => {
      stmtP.run([p.category_id, p.name_pt, p.name_en, p.name_es, p.description_pt, p.description_en, p.description_es, p.features_pt, p.features_en, p.features_es, p.image, p.is_featured, p.discount_percent, p.whatsapp_message_pt, p.whatsapp_message_en, p.whatsapp_message_es, p.sort_order]);
    });
    stmtP.free();
    console.log('  ✅ Products seeded');
  } else {
    console.log('  ⏭️  Products already exist');
  }

  // --- Services ---
  const existingServices = db.exec("SELECT COUNT(*) as c FROM services");
  if (existingServices[0].values[0][0] === 0) {
    const services = [
      {
        title_pt: 'Montagem de Painéis Elétricos e Automação', title_en: 'Electrical Panel Assembly & Automation', title_es: 'Montaje de Paneles Eléctricos y Automatización',
        description_pt: 'Montagem de painéis elétricos e automação sob medida para piscicultura, indústrias e estabelecimentos comerciais. Utilizamos equipamentos de altíssima qualidade de nível industrial.',
        description_en: 'Custom electrical panel assembly and automation for fish farming, industries, and commercial establishments. We use top-quality industrial-grade equipment.',
        description_es: 'Montaje de paneles eléctricos y automatización a medida para piscicultura, industrias y establecimientos comerciales.',
        icon: '⚡', sort: 1
      },
      {
        title_pt: 'Rebobinagem e Manutenção de Motores', title_en: 'Motor Rewinding & Maintenance', title_es: 'Rebobinado y Mantenimiento de Motores',
        description_pt: 'Rebobinagem e manutenção de motores elétricos e bombas d\'água. Serviço especializado com garantia de qualidade e agilidade na entrega.',
        description_en: 'Rewinding and maintenance of electric motors and water pumps. Specialized service with quality guarantee and fast delivery.',
        description_es: 'Rebobinado y mantenimiento de motores eléctricos y bombas de agua. Servicio especializado con garantía de calidad.',
        icon: '🔄', sort: 2
      },
      {
        title_pt: 'Automação para Piscicultura', title_en: 'Fish Farming Automation', title_es: 'Automatización para Piscicultura',
        description_pt: 'Soluções completas de automação para monitoramento de oxigênio dissolvido e acionamento automático de aeradores com a sonda OXILIFE FISH. Até 4 grupos de aeradores independentes com acesso remoto por aplicativo.',
        description_en: 'Complete automation solutions for dissolved oxygen monitoring and automatic aerator activation with the OXILIFE FISH probe. Up to 4 independent aerator groups with remote app access.',
        description_es: 'Soluciones completas de automatización para monitoreo de oxígeno disuelto y activación automática de aireadores con la sonda OXILIFE FISH.',
        icon: '🐟', sort: 3
      },
      {
        title_pt: 'Automação Industrial', title_en: 'Industrial Automation', title_es: 'Automatización Industrial',
        description_pt: 'Projetos de automação industrial com instalação de equipamentos liga/desliga com controle remoto ou através do celular. Soluções personalizadas para otimizar seus processos.',
        description_en: 'Industrial automation projects with on/off equipment installation with remote control or smartphone control. Custom solutions to optimize your processes.',
        description_es: 'Proyectos de automatización industrial con instalación de equipos encendido/apagado con control remoto o por celular.',
        icon: '🏭', sort: 4
      },
      {
        title_pt: 'Serviços Elétricos', title_en: 'Electrical Services', title_es: 'Servicios Eléctricos',
        description_pt: 'Serviços elétricos completos para residências, indústrias e propriedades rurais. Instalação, manutenção preventiva e corretiva com atendimento em horários especiais, incluindo madrugada.',
        description_en: 'Complete electrical services for residences, industries, and rural properties. Installation, preventive and corrective maintenance with service during special hours, including overnight.',
        description_es: 'Servicios eléctricos completos para residencias, industrias y propiedades rurales. Instalación, mantenimiento preventivo y correctivo.',
        icon: '🔧', sort: 5
      },
      {
        title_pt: 'Atendimento Fora de Horário Comercial', title_en: 'After-Hours Service', title_es: 'Atención Fuera de Horario Comercial',
        description_pt: 'Um dos nossos principais diferenciais: atendimento fora de horário comercial, em horários especiais incluindo de madrugada. Emergências elétricas não esperam — nós também não.',
        description_en: 'One of our main differentials: after-hours service, including overnight. Electrical emergencies don\'t wait — neither do we.',
        description_es: 'Uno de nuestros principales diferenciales: atención fuera de horario comercial, en horarios especiales incluyendo de madrugada.',
        icon: '🌙', sort: 6
      },
    ];

    const stmtS = db.prepare("INSERT INTO services (title_pt, title_en, title_es, description_pt, description_en, description_es, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    services.forEach(s => {
      stmtS.run([s.title_pt, s.title_en, s.title_es, s.description_pt, s.description_en, s.description_es, s.icon, s.sort]);
    });
    stmtS.free();
    console.log('  ✅ Services seeded');
  } else {
    console.log('  ⏭️  Services already exist');
  }

  // --- FAQ ---
  const existingFaq = db.exec("SELECT COUNT(*) as c FROM faq");
  if (existingFaq[0].values[0][0] === 0) {
    const faqs = [
      {
        question_pt: 'O que é a sonda OXILIFE FISH?',
        question_en: 'What is the OXILIFE FISH probe?',
        question_es: '¿Qué es la sonda OXILIFE FISH?',
        answer_pt: 'A OXILIFE FISH é um sistema de monitoramento e controle do oxigênio no tanque de peixe. Conta com até 4 grupos de aeradores que ligam e desligam separadamente, leitura de temperatura, alarmes configuráveis, histórico em pendrive e acesso remoto pelo celular via aplicativo.',
        answer_en: 'OXILIFE FISH is an oxygen monitoring and control system for fish tanks. It features up to 4 aerator groups that turn on/off independently, temperature reading, configurable alarms, USB drive history, and remote smartphone access via app.',
        answer_es: 'OXILIFE FISH es un sistema de monitoreo y control de oxígeno en tanques de peces. Cuenta con hasta 4 grupos de aireadores independientes, lectura de temperatura, alarmas configurables, historial en pendrive y acceso remoto por celular.',
        sort: 1
      },
      {
        question_pt: 'Quanta economia a sonda OXILIFE FISH proporciona?',
        question_en: 'How much savings does the OXILIFE FISH probe provide?',
        question_es: '¿Cuánto ahorro proporciona la sonda OXILIFE FISH?',
        answer_pt: 'Com a automação dos aeradores em 4 grupos independentes, produtores relatam economia de até 40% na conta de energia elétrica. Os aeradores só funcionam quando realmente necessário, evitando desperdício.',
        answer_en: 'With aerator automation in 4 independent groups, producers report up to 40% savings on electricity bills. Aerators only operate when truly needed, avoiding waste.',
        answer_es: 'Con la automatización de los aireadores en 4 grupos independientes, los productores reportan ahorros de hasta 40% en la cuenta de energía eléctrica.',
        sort: 2
      },
      {
        question_pt: 'Quantas sondas posso usar no mesmo painel?',
        question_en: 'How many probes can I use on the same panel?',
        question_es: '¿Cuántas sondas puedo usar en el mismo panel?',
        answer_pt: 'O sistema suporta opções de até três sondas controladas através do mesmo painel, permitindo monitorar diferentes pontos do tanque simultaneamente para maior segurança.',
        answer_en: 'The system supports options for up to three probes controlled through the same panel, allowing monitoring of different tank points simultaneously for greater safety.',
        answer_es: 'El sistema soporta opciones de hasta tres sondas controladas a través del mismo panel, permitiendo monitorear diferentes puntos del tanque simultáneamente.',
        sort: 3
      },
      {
        question_pt: 'Posso controlar os aeradores pelo celular?',
        question_en: 'Can I control the aerators from my phone?',
        question_es: '¿Puedo controlar los aireadores desde el celular?',
        answer_pt: 'Sim! O sistema conta com acesso remoto pelo celular através de aplicativo. Você pode ligar e desligar os grupos de aeradores manualmente tanto pelo painel da sonda quanto pelo aplicativo, de qualquer lugar.',
        answer_en: 'Yes! The system features remote access via smartphone app. You can manually turn aerator groups on and off from the probe panel or from the app, from anywhere.',
        answer_es: 'Sí! El sistema cuenta con acceso remoto por celular a través de aplicación. Puede encender y apagar los grupos de aireadores desde el panel o desde la app.',
        sort: 4
      },
      {
        question_pt: 'Vocês atendem em quais regiões?',
        question_en: 'Which regions do you serve?',
        question_es: '¿En qué regiones atienden?',
        answer_pt: 'Atendemos em todo o Oeste do Paraná e expandimos para outros estados. Desde 2018, estamos em crescimento constante e podemos atender sua região. Entre em contato para verificar a disponibilidade.',
        answer_en: 'We serve all of Western Paraná and are expanding to other states. Since 2018, we have been in constant growth and can serve your region. Contact us to check availability.',
        answer_es: 'Atendemos en todo el Oeste de Paraná y expandimos a otros estados. Desde 2018, estamos en crecimiento constante.',
        sort: 5
      },
      {
        question_pt: 'Vocês atendem fora do horário comercial?',
        question_en: 'Do you provide after-hours service?',
        question_es: '¿Atienden fuera de horario comercial?',
        answer_pt: 'Sim! Um dos nossos principais diferenciais é o atendimento fora de horário comercial, em horários especiais incluindo de madrugada. Emergências elétricas não esperam!',
        answer_en: 'Yes! One of our main differentials is after-hours service, including overnight. Electrical emergencies don\'t wait!',
        answer_es: 'Sí! Uno de nuestros principales diferenciales es la atención fuera de horario comercial, incluyendo de madrugada.',
        sort: 6
      },
      {
        question_pt: 'Vocês fazem rebobinagem de motores?',
        question_en: 'Do you do motor rewinding?',
        question_es: '¿Hacen rebobinado de motores?',
        answer_pt: 'Sim! A rebobinagem e manutenção de motores elétricos e bombas d\'água foi um dos primeiros serviços da Eletrotech. Temos ampla experiência e garantia de qualidade.',
        answer_en: 'Yes! Motor rewinding and maintenance of electric motors and water pumps was one of Eletrotech\'s first services. We have extensive experience and quality guarantee.',
        answer_es: 'Sí! El rebobinado y mantenimiento de motores eléctricos y bombas de agua fue uno de los primeros servicios de Eletrotech.',
        sort: 7
      },
      {
        question_pt: 'Como solicitar um orçamento?',
        question_en: 'How to request a quote?',
        question_es: '¿Cómo solicitar un presupuesto?',
        answer_pt: 'Basta clicar em qualquer botão de WhatsApp no site e enviar uma mensagem com o produto ou serviço desejado. Nossa equipe responde rapidamente! WhatsApp: (45) 99924-1306.',
        answer_en: 'Simply click any WhatsApp button on the website and send a message with the desired product or service. Our team responds quickly! WhatsApp: (45) 99924-1306.',
        answer_es: 'Simplemente haga clic en cualquier botón de WhatsApp y envíe un mensaje. WhatsApp: (45) 99924-1306.',
        sort: 8
      },
    ];

    const stmtF = db.prepare("INSERT INTO faq (question_pt, question_en, question_es, answer_pt, answer_en, answer_es, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
    faqs.forEach(f => {
      stmtF.run([f.question_pt, f.question_en, f.question_es, f.answer_pt, f.answer_en, f.answer_es, f.sort]);
    });
    stmtF.free();
    console.log('  ✅ FAQ seeded');
  } else {
    console.log('  ⏭️  FAQ already exists');
  }

  // --- Efficiency Stats ---
  const existingStats = db.exec("SELECT COUNT(*) as c FROM efficiency_stats");
  if (existingStats[0].values[0][0] === 0) {
    const stats = [
      { label_pt: 'Economia de Energia', label_en: 'Energy Savings', label_es: 'Ahorro de Energía', value: '40', suffix: '%', icon: '⚡', sort: 1 },
      { label_pt: 'Redução na Mortalidade', label_en: 'Mortality Reduction', label_es: 'Reducción de Mortalidad', value: '90', suffix: '%', icon: '🐟', sort: 2 },
      { label_pt: 'Clientes Atendidos', label_en: 'Clients Served', label_es: 'Clientes Atendidos', value: '200', suffix: '+', icon: '👥', sort: 3 },
      { label_pt: 'Anos de Experiência', label_en: 'Years of Experience', label_es: 'Años de Experiencia', value: '8', suffix: '+', icon: '🏆', sort: 4 },
    ];

    const stmtE = db.prepare("INSERT INTO efficiency_stats (label_pt, label_en, label_es, value, suffix, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stats.forEach(s => {
      stmtE.run([s.label_pt, s.label_en, s.label_es, s.value, s.suffix, s.icon, s.sort]);
    });
    stmtE.free();
    console.log('  ✅ Efficiency stats seeded');
  } else {
    console.log('  ⏭️  Efficiency stats already exist');
  }

  saveDb();
  console.log('🎉 Seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
