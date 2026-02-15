import type { Dictionary } from "./en";

const es: Dictionary = {
  // ─── Hero ─────────────────────────────────────────
  "hero.tagline": "Elimina el ruido. Descubre la verdad.",
  "hero.placeholder":
    "Pega un enlace, tweet, titular, artículo, afirmación, pregunta o rumor...",
  "hero.timeSensitive": "Tiempo específico",
  "hero.creating": "Creando...",
  "hero.denoise": "Analizar",
  "hero.error": "Algo salió mal. Inténtalo de nuevo.",
  "hero.footer":
    "Extraemos la señal del ruido — no se requiere cuenta.",

  // ─── Time stops ───────────────────────────────────
  "time.last.1d": "Últimas 24 horas",
  "time.last.3d": "Últimos 3 días",
  "time.last.1w": "Última semana",
  "time.last.2w": "Últimas 2 semanas",
  "time.last.1m": "Último mes",
  "time.last.3m": "Últimos 3 meses",
  "time.last.6m": "Últimos 6 meses",
  "time.last.1y": "Último año",
  "time.last.2y": "Últimos 2 años",

  // ─── How it works ─────────────────────────────────
  "howItWorks.label": "Cómo funciona",
  "howItWorks.title": "De ruido a claridad en segundos",
  "howItWorks.step1.title": "Pega cualquier cosa",
  "howItWorks.step1.desc":
    "Un tweet, titular, artículo, afirmación, enlace, pregunta o rumor — cualquier contenido que quieras verificar.",
  "howItWorks.step2.title": "La IA analiza",
  "howItWorks.step2.desc":
    "Nuestro agente cruza referencias con fuentes primarias, datos gubernamentales e investigaciones revisadas por pares en tiempo real.",
  "howItWorks.step3.title": "Ve la señal",
  "howItWorks.step3.desc":
    "Obtén un veredicto claro con puntuaciones de confianza, hechos con fuentes y cada pieza de ruido identificada y explicada.",

  // ─── Impact areas ─────────────────────────────────
  "impact.label": "Impacto",
  "impact.title": "La verdad importa en todas partes",
  "impact.desc1":
    "La desinformación no se limita a un solo tema.",
  "impact.desc2":
    "funciona en todos los ámbitos donde los hechos importan.",
  "impact.politics.title": "Política y legislación",
  "impact.politics.desc":
    "Corta el encuadre partidista, verifica afirmaciones políticas y descubre lo que realmente dice la legislación.",
  "impact.politics.ex1": "Promesas de campaña",
  "impact.politics.ex2": "Registros de voto",
  "impact.politics.ex3": "Impacto de políticas",
  "impact.health.title": "Salud y ciencia",
  "impact.health.desc":
    "Separa la medicina basada en evidencia de la desinformación viral que pone vidas en riesgo.",
  "impact.health.ex1": "Estudios clínicos",
  "impact.health.ex2": "Afirmaciones sobre fármacos",
  "impact.health.ex3": "Tendencias de bienestar",
  "impact.finance.title": "Finanzas y mercados",
  "impact.finance.desc":
    "Verifica afirmaciones del mercado, informes de ganancias y asesoramiento financiero contra datos reales.",
  "impact.finance.ex1": "Consejos bursátiles",
  "impact.finance.ex2": "Afirmaciones cripto",
  "impact.finance.ex3": "Datos económicos",
  "impact.world.title": "Eventos mundiales",
  "impact.world.desc":
    "Obtén los hechos sobre noticias de última hora y eventos globales sin sensacionalismo ni sesgo.",
  "impact.world.ex1": "Conflictos",
  "impact.world.ex2": "Diplomacia",
  "impact.world.ex3": "Desastres",
  "impact.social.title": "Redes sociales",
  "impact.social.desc":
    "Verifica publicaciones virales, hilos y capturas de pantalla antes de compartirlos.",
  "impact.social.ex1": "Afirmaciones virales",
  "impact.social.ex2": "Capturas de pantalla",
  "impact.social.ex3": "Opiniones de influencers",
  "impact.education.title": "Educación e investigación",
  "impact.education.desc":
    "Verifica afirmaciones académicas, citas e investigaciones contra fuentes primarias.",
  "impact.education.ex1": "Resultados de estudios",
  "impact.education.ex2": "Estadísticas",
  "impact.education.ex3": "Afirmaciones históricas",

  // ─── Signal vs Noise (landing comparison) ─────────
  "svn.label": "La diferencia",
  "svn.title": "Ve lo que otros no ven",
  "svn.desc":
    "Todo contenido es una mezcla de hechos verificables y encuadre narrativo. Los separamos para que puedas pensar con claridad.",
  "svn.noise": "Ruido",
  "svn.signal": "Señal",
  "svn.noise1.text":
    '"Desarrollo IMPACTANTE que cambia TODO"',
  "svn.noise1.type": "Sensacionalista",
  "svn.noise2.text":
    '"Los expertos coinciden en que esto no tiene precedentes"',
  "svn.noise2.type": "Atribución vaga",
  "svn.noise3.text": '"¿Podría esto significar el fin de...?"',
  "svn.noise3.type": "Especulación",
  "svn.noise4.text": '"La gente está furiosa por..."',
  "svn.noise4.type": "Encuadre emocional",
  "svn.signal1.text":
    "La FDA aprobó el fármaco X el 15 de enero de 2026 para la condición Y",
  "svn.signal2.text":
    "Tamaño de muestra: 2.340 participantes en 12 centros",
  "svn.signal3.text":
    "El tratamiento mostró una mejora del 23% vs placebo (p<0,01)",
  "svn.signal4.text":
    "3 de 5 revisiones independientes confirmaron la eficacia",

  // ─── Use cases ────────────────────────────────────
  "useCases.label": "Casos de uso",
  "useCases.title": "Empieza con una pregunta",
  "useCases.desc1":
    "Ya seas periodista, investigador, estudiante o simplemente un ciudadano curioso —",
  "useCases.desc2": "te ayuda a pensar por ti mismo.",
  "useCases.verify.label": "Verificar un titular",
  "useCases.verify.prompt": "¿Es cierto que...?",
  "useCases.factCheck.label": "Comprobar una afirmación",
  "useCases.factCheck.prompt": "Alguien me dijo que...",
  "useCases.health.label": "Revisar consejo de salud",
  "useCases.health.prompt": "¿Es seguro este suplemento...?",
  "useCases.policy.label": "Analizar una política",
  "useCases.policy.prompt": "¿Qué hace realmente esta ley...?",
  "useCases.viral.label": "Decodificar contenido viral",
  "useCases.viral.prompt": "Esta publicación se viralizó afirmando...",
  "useCases.worldNews.label": "Entender noticias mundiales",
  "useCases.worldNews.prompt": "¿Qué está pasando realmente en...?",

  // ─── Trust / principles ───────────────────────────
  "trust.label": "Nuestros principios",
  "trust.title": "Construido para la confianza",
  "trust.sourceFirst.title": "Fuentes primero",
  "trust.sourceFirst.desc":
    "Cada afirmación se rastrea hasta fuentes primarias — .gov, .edu, revistas revisadas por pares y registros oficiales.",
  "trust.noBias.title": "Sin sesgo, sin agenda",
  "trust.noBias.desc":
    "No te decimos qué pensar. Separamos los hechos del encuadre para que decidas por ti mismo.",
  "trust.realTime.title": "Verificación en tiempo real",
  "trust.realTime.desc":
    "La búsqueda web en vivo cruza afirmaciones contra los datos más recientes, no bases de datos obsoletas.",

  // ─── Final CTA ────────────────────────────────────
  "cta.title": "Deja de desplazarte. Empieza a saber.",
  "cta.desc":
    "Pega cualquier afirmación, titular o enlace y obtén un análisis claro y con fuentes en segundos. Sin necesidad de cuenta.",
  "cta.button": "Pruébalo ahora",

  // ─── Verdict labels ───────────────────────────────
  "verdict.true": "Verificado",
  "verdict.mostly_true": "Mayormente verdadero",
  "verdict.mixed": "Mixto",
  "verdict.mostly_false": "Mayormente falso",
  "verdict.false": "Falso",
  "verdict.misleading": "Engañoso",
  "verdict.satire": "Sátira",
  "verdict.unverifiable": "No verificable",

  // ─── Signal view ──────────────────────────────────
  "signal.denoising": "Analizando...",
  "signal.bookmark":
    "Guarda esta página en marcadores para volver más tarde",
  "signal.analysis": "Análisis",
  "signal.signalScore": "{score}/100 señal",
  "signal.sectionSignal": "Señal",
  "signal.sectionNoise": "Ruido eliminado",
  "signal.followUp": "Seguimiento",
  "signal.newAnalysis": "Nuevo análisis",
  "signal.copyLink": "Copiar enlace",
  "signal.copied": "Copiado",
  "signal.notFound": "Análisis no encontrado.",
  "signal.tryAgain": "Intentar de nuevo",
  "signal.seeAll": "ver todo",
  "signal.showLess": "ver menos",
  "signal.copyPrompt": "Copiar consulta",

  // ─── Signal categories ────────────────────────────
  "signal.category.fact": "Hecho",
  "signal.category.statistic": "Estadística",
  "signal.category.attribution": "Atribución",
  "signal.category.context": "Contexto",
  "signal.category.event": "Evento",

  // ─── Noise types ──────────────────────────────────
  "noise.type.emotional_language": "Emocional",
  "noise.type.bias": "Sesgo",
  "noise.type.narrative": "Narrativa",
  "noise.type.sensationalism": "Sensacionalista",
  "noise.type.opinion_as_fact": "Opinión",
  "noise.type.speculation": "Especulación",
  "noise.type.missing_context": "Omisión",
  "noise.type.media_amplification": "Amplificación",

  // ─── Share ────────────────────────────────────────
  "share.tooltip": "Compartir como historia",
  "share.title": "Vista previa",
  "share.description":
    "Previsualiza y personaliza tu imagen para compartir",
  "share.includePrompt": "Incluir consulta",
  "share.button": "Compartir",
  "share.error": "Error al generar la imagen",

  // ─── Follow-up panel ──────────────────────────────
  "followUp.title": "Seguimientos",
  "followUp.titleSingle": "Seguimiento",
  "followUp.newConversation": "Nueva conversación",
  "followUp.empty": "No hay conversaciones aún",
  "followUp.emptyHint":
    "Inicia una nueva conversación para hacer preguntas de seguimiento",
  "followUp.untitled": "Conversación sin título",

  // ─── Follow-up chat ───────────────────────────────
  "chat.askTitle": "Haz una pregunta",
  "chat.askHint": "Pregunta lo que quieras sobre este análisis",
  "chat.thinking": "Pensando...",
  "chat.placeholder": "Haz una pregunta de seguimiento...",
  "chat.sourceSingular": "{count} fuente",
  "chat.sourcePlural": "{count} fuentes",

  // ─── Language toggle ──────────────────────────────
  "language.srOnly": "Idioma",

  // ─── Analyzing phrases ────────────────────────────
  "analyzing.0": "Buscando fuentes primarias...",
  "analyzing.1": "Verificando referencias cruzadas...",
  "analyzing.2": "Eliminando lenguaje afectivo...",
  "analyzing.3": "Evaluando credibilidad de fuentes...",
  "analyzing.4": "Separando señal del ruido...",
  "analyzing.5": "Verificando contra registros oficiales...",
  "analyzing.6": "Extrayendo elementos de verdad...",
  "analyzing.7": "Filtrando encuadre narrativo...",
  "analyzing.8": "Pensando...",
  "analyzing.9": "Razonando...",
  "analyzing.10": "Considerando...",
  "analyzing.11": "Analizando...",
  "analyzing.12": "Contemplando...",
  "analyzing.13": "Procesando...",
  "analyzing.14": "Evaluando...",
  "analyzing.15": "Reflexionando...",
  "analyzing.16": "Examinando...",
  "analyzing.17": "Deliberando...",
  "analyzing.18": "Ponderando...",
  "analyzing.19": "Meditando...",
  "analyzing.20": "Cavilando...",
  "analyzing.21": "Rumiando...",
  "analyzing.22": "Sopesando...",
  "analyzing.23": "Midiendo...",
  "analyzing.24": "Valorando...",
  "analyzing.25": "Revisando...",
  "analyzing.26": "Computando...",
  "analyzing.27": "Elucubrando...",
};

export default es;
