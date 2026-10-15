-- ========================================================
-- SCRIPT DE INSERÇÃO DE DADOS (SUPABASE POSTGRESQL)
-- Utiliza dollar-quoting ($$) para evitar erros de aspas simples
-- ========================================================

-- 1. LIMPAR REGISTROS ANTIGOS (OPCIONAL/SEGURO)
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE services RESTART IDENTITY CASCADE;
TRUNCATE TABLE faq RESTART IDENTITY CASCADE;

-- 2. INSERIR PRODUTOS
INSERT INTO products (
  category_id, name_pt, name_en, name_es,
  description_pt, description_en, description_es,
  features_pt, features_en, features_es,
  image, is_featured, discount_percent,
  whatsapp_message_pt, whatsapp_message_en, whatsapp_message_es,
  sort_order
) VALUES
(
  (SELECT id FROM categories WHERE slug = 'sondas'),
  $$OXILIFE FISH — Sonda de Oxigênio Dissolvido$$,
  $$OXILIFE FISH — Dissolved Oxygen Probe$$,
  $$OXILIFE FISH — Sonda de Oxígeno Disuelto$$,
  $$Sistema de monitoramento e controle do oxigênio no tanque de peixe. Separado em quatro grupos de aeradores que ligam e desligam separadamente de acordo com a necessidade e programação do produtor. Também conta com leitura de temperatura para um melhor manejo da produção. Acesso remoto pelo celular através de aplicativo.$$,
  $$Oxygen monitoring and control system for fish tanks. Separated into four aerator groups that turn on and off independently according to the producer's needs and programming. Also features temperature reading for better production management. Remote access via smartphone app.$$,
  $$Sistema de monitoreo y control de oxígeno en tanques de peces. Separado en cuatro grupos de aireadores que se encienden y apagan independientemente según la necesidad y programación del productor. También cuenta con lectura de temperatura.$$,
  $$Até 3 sondas no mesmo painel;4 grupos de aeradores independentes;Alarme para nível de O₂ máximo e mínimo;Alarme para problemas de leitura em segundos;Acesso remoto pelo celular via aplicativo;Liga/desliga manual pelo painel ou app;Histórico de leituras gravado em pendrive;Leitura de temperatura integrada;Equipamentos de nível industrial;Economia de até 40% em energia$$,
  $$Up to 3 probes on the same panel;4 independent aerator groups;Max/min O₂ level alarms;Reading problem alarm within seconds;Remote access via smartphone app;Manual on/off via panel or app;Reading history saved to USB drive;Integrated temperature reading;Industrial-grade equipment;Up to 40% energy savings$$,
  $$Hasta 3 sondas en el mismo panel;4 grupos de aireadores independientes;Alarma para nivel de O₂ máximo y mínimo;Alarma para problemas de lectura en segundos;Acceso remoto por celular vía app;Encendido/apagado manual por panel o app;Historial de lecturas grabado en pendrive;Lectura de temperatura integrada;Equipos de nivel industrial;Ahorro de hasta 40% en energía$$,
  $$/assets/images/painel-sonda.jpg$$,
  true,
  0,
  $$Olá! Gostaria de saber mais sobre a sonda OXILIFE FISH.$$,
  $$Hello! I would like to know more about the OXILIFE FISH probe.$$,
  $$Hola! Me gustaría saber más sobre la sonda OXILIFE FISH.$$,
  1
),
(
  (SELECT id FROM categories WHERE slug = 'sondas'),
  $$Oxímetro Manual$$,
  $$Handheld Oximeter$$,
  $$Oxímetro Manual$$,
  $$Aparelho portátil para medição de oxigênio dissolvido, temperatura e saturação para uso em tanques de peixes. Ferramenta essencial para o manejo diário da piscicultura, permitindo leituras rápidas e precisas em campo.$$,
  $$Portable device for measuring dissolved oxygen, temperature, and saturation for use in fish tanks. Essential tool for daily fish farming management, allowing quick and accurate field readings.$$,
  $$Aparato portátil para medición de oxígeno disuelto, temperatura y saturación para uso en tanques de peces. Herramienta esencial para el manejo diario de la piscicultura.$$,
  $$Medição de oxigênio dissolvido;Leitura de temperatura;Medição de saturação;Portátil e leve;Ideal para campo;Leitura rápida e precisa;Display digital$$,
  $$Dissolved oxygen measurement;Temperature reading;Saturation measurement;Portable and lightweight;Ideal for fieldwork;Quick and accurate reading;Digital display$$,
  $$Medición de oxígeno disuelto;Lectura de temperatura;Medición de saturación;Portátil y liviano;Ideal para campo;Lectura rápida y precisa;Display digital$$,
  $$/assets/images/oximetro.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre o Oxímetro Manual.$$,
  $$Hello! I would like to know more about the Handheld Oximeter.$$,
  $$Hola! Me gustaría saber más sobre el Oxímetro Manual.$$,
  2
),
(
  (SELECT id FROM categories WHERE slug = 'automacao'),
  $$Painel da Sonda OXILIFE FISH$$,
  $$OXILIFE FISH Probe Panel$$,
  $$Panel de la Sonda OXILIFE FISH$$,
  $$Painel de comando completo para a sonda OXILIFE FISH. Equipado com componentes de altíssima qualidade de nível industrial, incluindo contatoras, relés térmicos, disjuntores e controle para até 4 grupos de aeradores. Projeto personalizado conforme a necessidade do produtor.$$,
  $$Complete control panel for the OXILIFE FISH probe. Equipped with top-quality industrial-grade components, including contactors, thermal relays, breakers, and control for up to 4 aerator groups. Custom design according to producer needs.$$,
  $$Panel de comando completo para la sonda OXILIFE FISH. Equipado con componentes de altísima calidad de nivel industrial, incluyendo contactores, relés térmicos, disyuntores y control para hasta 4 grupos de aireadores.$$,
  $$Componentes de nível industrial;Controle de até 4 grupos de aeradores;Proteção trifásica completa;Contatoras de alta durabilidade;Relés térmicos de segurança;Disjuntores certificados;Projeto sob medida;Integração com app celular$$,
  $$Industrial-grade components;Control for up to 4 aerator groups;Complete three-phase protection;High-durability contactors;Safety thermal relays;Certified breakers;Custom design;Smartphone app integration$$,
  $$Componentes de nivel industrial;Control de hasta 4 grupos de aireadores;Protección trifásica completa;Contactores de alta durabilidad;Relés térmicos de seguridad;Disyuntores certificados;Diseño a medida;Integración con app celular$$,
  $$/assets/images/painel-sonda-1.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre o Painel da Sonda OXILIFE FISH.$$,
  $$Hello! I would like to know more about the OXILIFE FISH Probe Panel.$$,
  $$Hola! Me gustaría saber más sobre el Panel de la Sonda OXILIFE FISH.$$,
  3
),
(
  (SELECT id FROM categories WHERE slug = 'automacao'),
  $$Painel Elétrico Industrial$$,
  $$Industrial Electrical Panel$$,
  $$Panel Eléctrico Industrial$$,
  $$Montagem de painéis elétricos industriais e de automação sob medida. Projetado para indústrias, propriedades rurais e estabelecimentos comerciais. Utiliza equipamentos de altíssima qualidade com proteção completa.$$,
  $$Custom industrial and automation electrical panel assembly. Designed for industries, rural properties, and commercial establishments. Uses top-quality equipment with complete protection.$$,
  $$Montaje de paneles eléctricos industriales y de automatización a medida. Diseñado para industrias, propiedades rurales y establecimientos comerciales.$$,
  $$Projeto sob medida;Proteção completa;Contatoras e relés de qualidade;Disjuntores certificados;Chaves de posição;Timers programáveis;Normas NR-10 e NR-12;Assistência técnica$$,
  $$Custom design;Complete protection;Quality contactors and relays;Certified breakers;Position switches;Programmable timers;NR-10 and NR-12 standards;Technical support$$,
  $$Diseño a medida;Protección completa;Contactores y relés de calidad;Disyuntores certificados;Llaves de posición;Temporizadores programables;Normas NR-10 y NR-12;Asistencia técnica$$,
  $$/assets/images/painel-eletrico.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre o Painel Elétrico Industrial.$$,
  $$Hello! I would like to know more about the Industrial Electrical Panel.$$,
  $$Hola! Me gustaría saber más sobre el Panel Eléctrico Industrial.$$,
  4
),
(
  (SELECT id FROM categories WHERE slug = 'motores'),
  $$Motores Elétricos Hércules$$,
  $$Hércules Electric Motors$$,
  $$Motores Eléctricos Hércules$$,
  $$Motores elétricos Hércules novos de diferentes modelos, potências e RPM. Linha completa para aplicações industriais, agrícolas e residenciais. Qualidade comprovada com garantia de fábrica.$$,
  $$New Hércules electric motors in different models, power ratings, and RPMs. Complete line for industrial, agricultural, and residential applications. Proven quality with factory warranty.$$,
  $$Motores eléctricos Hércules nuevos de diferentes modelos, potencias y RPM. Línea completa para aplicaciones industriales, agrícolas y residenciales.$$,
  $$Diferentes modelos e potências;Variações de RPM;Monofásico e trifásico;Para uso industrial e rural;Garantia de fábrica;Alto rendimento;Disponíveis pronta entrega$$,
  $$Different models and power ratings;RPM variations;Single and three-phase;For industrial and rural use;Factory warranty;High efficiency;Available for immediate delivery$$,
  $$Diferentes modelos y potencias;Variaciones de RPM;Monofásico y trifásico;Para uso industrial y rural;Garantía de fábrica;Alto rendimiento;Disponibles entrega inmediata$$,
  $$/assets/images/motores-hercules.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre os Motores Elétricos Hércules.$$,
  $$Hello! I would like to know more about the Hércules Electric Motors.$$,
  $$Hola! Me gustaría saber más sobre los Motores Eléctricos Hércules.$$,
  5
),
(
  (SELECT id FROM categories WHERE slug = 'material-eletrico'),
  $$Materiais para Painéis e Instalações$$,
  $$Panel & Installation Supplies$$,
  $$Materiales para Paneles e Instalaciones$$,
  $$Materiais diversos para painéis e instalações elétricas: contatoras, relés térmicos, disjuntores, chaves de duas e três posições, timers, painéis de PVC e metal e muito mais. Produtos de qualidade com garantia.$$,
  $$Various materials for panels and electrical installations: contactors, thermal relays, breakers, two and three-position switches, timers, PVC and metal panels, and much more. Quality products with warranty.$$,
  $$Materiales diversos para paneles e instalaciones eléctricas: contactores, relés térmicos, disyuntores, llaves de posición, temporizadores, paneles de PVC y metal y mucho más.$$,
  $$Contatoras;Relés térmicos;Disjuntores;Chaves de posição;Timers;Painéis PVC e metal;Borneiras e trilhos;Cabos e fios$$,
  $$Contactors;Thermal relays;Breakers;Position switches;Timers;PVC and metal panels;Terminal blocks and rails;Cables and wires$$,
  $$Contactores;Relés térmicos;Disyuntores;Llaves de posición;Temporizadores;Paneles PVC y metal;Borneras y rieles;Cables y alambres$$,
  $$/assets/images/materiais-paineis.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre os materiais para painéis.$$,
  $$Hello! I would like to know more about panel materials.$$,
  $$Hola! Me gustaría saber más sobre los materiales para paneles.$$,
  6
),
(
  (SELECT id FROM categories WHERE slug = 'residencial'),
  $$Produtos Zagonel — Chuveiros e Torneiras$$,
  $$Zagonel Products — Showers & Faucets$$,
  $$Productos Zagonel — Duchas y Grifos$$,
  $$Linha completa de produtos Zagonel: chuveiros e torneiras elétricas de diferentes modelos. Qualidade e durabilidade para sua residência com economia de energia.$$,
  $$Complete line of Zagonel products: electric showers and faucets in different models. Quality and durability for your home with energy savings.$$,
  $$Línea completa de productos Zagonel: duchas y grifos eléctricos de diferentes modelos. Calidad y durabilidad para su hogar con ahorro de energía.$$,
  $$Diversos modelos;Chuveiros elétricos;Torneiras elétricas;Economia de energia;Garantia Zagonel;Design moderno;Fácil instalação$$,
  $$Various models;Electric showers;Electric faucets;Energy savings;Zagonel warranty;Modern design;Easy installation$$,
  $$Diversos modelos;Duchas eléctricas;Grifos eléctricos;Ahorro de energía;Garantía Zagonel;Diseño moderno;Fácil instalación$$,
  $$/assets/images/produtos-zagonel.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre os produtos Zagonel.$$,
  $$Hello! I would like to know more about Zagonel products.$$,
  $$Hola! Me gustaría saber más sobre los productos Zagonel.$$,
  7
),
(
  (SELECT id FROM categories WHERE slug = 'alarmes'),
  $$Sistema de Alarme para Piscicultura$$,
  $$Fish Farming Alarm System$$,
  $$Sistema de Alarma para Piscicultura$$,
  $$Sistema de alarme para piscicultura com funcionamento sem fio e WiFi. Acompanha aplicativo para celular que permite monitorar e receber alertas em tempo real sobre sua produção, de qualquer lugar.$$,
  $$Fish farming alarm system with wireless and WiFi operation. Includes smartphone app for real-time monitoring and alerts about your production from anywhere.$$,
  $$Sistema de alarma para piscicultura con funcionamiento inalámbrico y WiFi. Incluye aplicación para celular para monitoreo y alertas en tiempo real.$$,
  $$Funcionamento sem fio;Conexão WiFi;Aplicativo para celular;Alertas em tempo real;Monitoramento remoto;Fácil instalação;Bateria de longa duração$$,
  $$Wireless operation;WiFi connection;Smartphone app;Real-time alerts;Remote monitoring;Easy installation;Long battery life$$,
  $$Funcionamiento inalámbrico;Conexión WiFi;Aplicación para celular;Alertas en tiempo real;Monitoreo remoto;Fácil instalación;Batería de larga duración$$,
  NULL,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre o Sistema de Alarme para Piscicultura.$$,
  $$Hello! I would like to know more about the Fish Farming Alarm System.$$,
  $$Hola! Me gustaría saber más sobre el Sistema de Alarma para Piscicultura.$$,
  8
),
(
  (SELECT id FROM categories WHERE slug = 'material-eletrico'),
  $$Produtos Diversos — Material Elétrico$$,
  $$Various Products — Electrical Supplies$$,
  $$Productos Diversos — Material Eléctrico$$,
  $$Linha completa de materiais elétricos para instalações residenciais, comerciais e industriais. Disjuntores, cabos, tomadas, interruptores, quadros de distribuição e muito mais.$$,
  $$Complete line of electrical materials for residential, commercial, and industrial installations. Breakers, cables, outlets, switches, distribution boards, and more.$$,
  $$Línea completa de materiales eléctricos para instalaciones residenciales, comerciales e industriales.$$,
  $$Disjuntores certificados;Cabos de qualidade;Tomadas e interruptores;Quadros de distribuição;Garantia de fábrica;Atende normas técnicas;Entrega na região$$,
  $$Certified breakers;Quality cables;Outlets and switches;Distribution boards;Factory warranty;Meets technical standards;Regional delivery$$,
  $$Disyuntores certificados;Cables de calidad;Enchufes e interruptores;Cuadros de distribución;Garantía de fábrica;Cumple normas técnicas;Entrega regional$$,
  $$/assets/images/produtos-diversos.jpg$$,
  false,
  0,
  $$Olá! Gostaria de saber mais sobre os materiais elétricos.$$,
  $$Hello! I would like to know more about electrical materials.$$,
  $$Hola! Me gustaría saber más sobre los materiales eléctricos.$$,
  9
);

-- 3. INSERIR SERVIÇOS
INSERT INTO services (
  title_pt, title_en, title_es,
  description_pt, description_en, description_es,
  icon, sort_order
) VALUES
(
  $$Montagem de Painéis Elétricos e Automação$$,
  $$Electrical Panel Assembly & Automation$$,
  $$Montaje de Paneles Eléctricos y Automatización$$,
  $$Montagem de painéis elétricos e automação sob medida para piscicultura, indústrias e estabelecimentos comerciais. Utilizamos equipamentos de altíssima qualidade de nível industrial.$$,
  $$Custom electrical panel assembly and automation for fish farming, industries, and commercial establishments. We use top-quality industrial-grade equipment.$$,
  $$Montaje de paneles eléctricos y automatización a medida para piscicultura, industrias y establecimientos comerciales.$$,
  $$⚡$$,
  1
),
(
  $$Rebobinagem e Manutenção de Motores$$,
  $$Motor Rewinding & Maintenance$$,
  $$Rebobinado y Mantenimiento de Motores$$,
  $$Rebobinagem e manutenção de motores elétricos e bombas d'água. Serviço especializado com garantia de qualidade e agilidade na entrega.$$,
  $$Rewinding and maintenance of electric motors and water pumps. Specialized service with quality guarantee and fast delivery.$$,
  $$Rebobinado y mantenimiento de motores eléctricos y bombas de agua. Servicio especializado con garantía de calidad.$$,
  $$🔄$$,
  2
),
(
  $$Automação para Piscicultura$$,
  $$Fish Farming Automation$$,
  $$Automatización para Piscicultura$$,
  $$Soluções completas de automação para monitoramento de oxigênio dissolvido e acionamento automático de aeradores com a sonda OXILIFE FISH. Até 4 grupos de aeradores independentes com acesso remoto por aplicativo.$$,
  $$Complete automation solutions for dissolved oxygen monitoring and automatic aerator activation with the OXILIFE FISH probe. Up to 4 independent aerator groups with remote app access.$$,
  $$Soluciones completas de automatización para monitoreo de oxígeno disuelto y activación automática de aireadores con la sonda OXILIFE FISH.$$,
  $$🐟$$,
  3
),
(
  $$Automação Industrial$$,
  $$Industrial Automation$$,
  $$Automatización Industrial$$,
  $$Projetos de automação industrial com instalação de equipamentos liga/desliga com controle remoto ou através do celular. Soluções personalizadas para otimizar seus processos.$$,
  $$Industrial automation projects with on/off equipment installation with remote control or smartphone control. Custom solutions to optimize your processes.$$,
  $$Proyectos de automatización industrial con instalación de equipos encendido/apagado con control remoto o por celular.$$,
  $$🏭$$,
  4
),
(
  $$Serviços Elétricos$$,
  $$Electrical Services$$,
  $$Servicios Eléctricos$$,
  $$Serviços elétricos completos para residências, indústrias e propriedades rurais. Instalação, manutenção preventiva e corretiva com atendimento em horários especiais, incluindo madrugada.$$,
  $$Complete electrical services for residences, industries, and rural properties. Installation, preventive and corrective maintenance with service during special hours, including overnight.$$,
  $$Servicios eléctricos completos para residencias, industrias y propiedades rurales. Instalación, mantenimiento preventivo y correctivo.$$,
  $$🔧$$,
  5
),
(
  $$Atendimento Fora de Horário Comercial$$,
  $$After-Hours Service$$,
  $$Atención Fuera de Horario Comercial$$,
  $$Um dos nossos principais diferenciais: atendimento fora de horário comercial, em horários especiais incluindo de madrugada. Emergências elétricas não esperam — nós também não.$$,
  $$One of our main differentials: after-hours service, including overnight. Electrical emergencies don't wait — neither do we.$$,
  $$Uno de nuestros principales diferenciales: atención fuera de horario comercial, en horarios especiales incluyendo de madrugada.$$,
  $$🌙$$,
  6
);

-- 4. INSERIR FAQ
INSERT INTO faq (
  question_pt, question_en, question_es,
  answer_pt, answer_en, answer_es,
  sort_order
) VALUES
(
  $$O que é a sonda OXILIFE FISH?$$,
  $$What is the OXILIFE FISH probe?$$,
  $$¿Qué es la sonda OXILIFE FISH?$$,
  $$A OXILIFE FISH é um sistema de monitoramento e controle do oxigênio no tanque de peixe. Conta com até 4 grupos de aeradores que ligam e desligam separadamente, leitura de temperatura, alarmes configuráveis, histórico em pendrive e acesso remoto pelo celular via aplicativo.$$,
  $$OXILIFE FISH is an oxygen monitoring and control system for fish tanks. It features up to 4 aerator groups that turn on/off independently, temperature reading, configurable alarms, USB drive history, and remote smartphone access via app.$$,
  $$OXILIFE FISH es un sistema de monitoreo y control de oxígeno en tanques de peces. Cuenta con hasta 4 grupos de aireadores independientes, lectura de temperatura, alarmas configurables, historial en pendrive y acceso remoto por celular.$$,
  1
),
(
  $$Quanta economia a sonda OXILIFE FISH proporciona?$$,
  $$How much savings does the OXILIFE FISH probe provide?$$,
  $$¿Cuánto ahorro proporciona la sonda OXILIFE FISH?$$,
  $$Com a automação dos aeradores em 4 grupos independentes, produtores relatam economia de até 40% na conta de energia elétrica. Os aeradores só funcionam quando realmente necessário, evitando desperdício.$$,
  $$With aerator automation in 4 independent groups, producers report up to 40% savings on electricity bills. Aerators only operate when truly needed, avoiding waste.$$,
  $$Con la automatización de los aireadores en 4 grupos independientes, los productores reportan ahorros de hasta 40% en la cuenta de energía eléctrica.$$,
  2
),
(
  $$Quantas sondas posso usar no mesmo painel?$$,
  $$How many probes can I use on the same panel?$$,
  $$¿Cuántas sondas puedo usar en el mismo panel?$$,
  $$O sistema suporta opções de até três sondas controladas através do mesmo painel, permitindo monitorar diferentes pontos do tanque simultaneamente para maior segurança.$$,
  $$The system supports options for up to three probes controlled through the same panel, allowing monitoring of different tank points simultaneously for greater safety.$$,
  $$El sistema soporta opciones de hasta tres sondas controladas a través del mismo panel, permitiendo monitorear diferentes puntos del tanque simultáneamente.$$,
  3
),
(
  $$Posso controlar os aeradores pelo celular?$$,
  $$Can I control the aerators from my phone?$$,
  $$¿Puedo controlar los aireadores desde el celular?$$,
  $$Sim! O sistema conta com acesso remoto pelo celular através de aplicativo. Você pode ligar e desligar os grupos de aeradores manualmente tanto pelo painel da sonda quanto pelo aplicativo, de qualquer lugar.$$,
  $$Yes! The system features remote access via smartphone app. You can manually turn aerator groups on and off from the probe panel or from the app, from anywhere.$$,
  $$Sí! El sistema cuenta con acceso remoto por celular a través de aplicación. Puede encender y apagar los grupos de aireadores desde el panel o desde la app.$$,
  4
),
(
  $$Vocês atendem em quais regiões?$$,
  $$Which regions do you serve?$$,
  $$¿En qué regiones atienden?$$,
  $$Atendemos em todo o Oeste do Paraná e expandimos para outros estados. Desde 2018, estamos em crescimento constante e podemos atender sua região. Entre em contato para verificar a disponibilidade.$$,
  $$We serve all of Western Paraná and are expanding to other states. Since 2018, we have been in constant growth and can serve your region. Contact us to check availability.$$,
  $$Atendemos en todo el Oeste de Paraná y expandimos a otros estados. Desde 2018, estamos en crecimiento constante.$$,
  5
),
(
  $$Vocês atendem fora do horário comercial?$$,
  $$Do you provide after-hours service?$$,
  $$¿Atienden fuera de horario comercial?$$,
  $$Sim! Um dos nossos principais diferenciais é o atendimento fora de horário comercial, em horários especiais incluindo de madrugada. Emergências elétricas não esperam!$$,
  $$Yes! One of our main differentials is after-hours service, including overnight. Electrical emergencies don't wait!$$,
  $$Sí! Uno de nuestros principales diferenciales es la atención fuera de horario comercial, incluyendo de madrugada.$$,
  6
),
(
  $$Vocês fazem rebobinagem de motores?$$,
  $$Do you do motor rewinding?$$,
  $$¿Hacen rebobinado de motores?$$,
  $$Sim! A rebobinagem e manutenção de motores elétricos e bombas d'água foi um dos primeiros serviços da Eletrotech. Temos ampla experiência e garantia de qualidade.$$,
  $$Yes! Motor rewinding and maintenance of electric motors and water pumps was one of Eletrotech's first services. We have extensive experience and quality guarantee.$$,
  $$Sí! El rebobinado y mantenimiento de motores eléctricos y bombas de agua fue uno de los primeros servicios de Eletrotech.$$,
  7
),
(
  $$Como solicitar um orçamento?$$,
  $$How to request a quote?$$,
  $$¿Cómo solicitar un presupuesto?$$,
  $$Basta clicar em qualquer botão de WhatsApp no site e enviar uma mensagem com o produto ou serviço desejado. Nossa equipe responde rapidamente! WhatsApp: (45) 99924-1306.$$,
  $$Simply click any WhatsApp button on the website and send a message with the desired product or service. Our team responds quickly! WhatsApp: (45) 99924-1306.$$,
  $$Simplemente haga clic en cualquier botón de WhatsApp y envíe un mensaje. WhatsApp: (45) 99924-1306.$$,
  8
);
