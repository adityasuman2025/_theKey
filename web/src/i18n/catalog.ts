export type Locale = "en" | "es";

type Catalog = Record<string, string | { one: string; other: string }>;

const en: Catalog = {
  // Navigation
  "nav.feed": "Feed",
  "nav.saved": "Saved",
  "nav.courses": "Courses",

  // Header
  "header.user_simulator": "Simulate User",
  "header.language": "Language",

  // Feed
  "feed.title": "Discussion Feed",
  "feed.empty": "No posts in this course yet.",
  "feed.select_course": "Select a course to view posts.",
  "feed.new_post": "New Post",
  "feed.by": "by",

  // Saved
  "saved.title": "Saved Posts",
  "saved.empty": "You haven't saved any posts yet.",

  // Post
  "post.save": "Save",
  "post.saved": "Saved",
  "post.unsave": "Unsave",
  "post.delete": "Delete",
  "post.delete_confirm": "Are you sure you want to delete this post?",
  "saves_count": { one: "1 save", other: "{count} saves" },

  // Form
  "form.title": "Title",
  "form.content": "Content",
  "form.submit": "Post",
  "form.cancel": "Cancel",
  "form.title_placeholder": "What's on your mind?",
  "form.content_placeholder": "Write your post here...",

  // Pagination
  "pagination.prev": "Previous",
  "pagination.next": "Next",
  "pagination.page": "Page {page} of {totalPages}",

  // Loading / errors
  "loading": "Loading...",
  "error.generic": "Something went wrong.",
  "error.retry": "Retry",
};

const es: Catalog = {
  "nav.feed": "Publicaciones",
  "nav.saved": "Guardados",
  "nav.courses": "Cursos",

  "header.user_simulator": "Simular Usuario",
  "header.language": "Idioma",

  "feed.title": "Foro de Discusión",
  "feed.empty": "Aún no hay publicaciones en este curso.",
  "feed.select_course": "Selecciona un curso para ver publicaciones.",
  "feed.new_post": "Nueva Publicación",
  "feed.by": "por",

  "saved.title": "Publicaciones Guardadas",
  "saved.empty": "Aún no has guardado ninguna publicación.",

  "post.save": "Guardar",
  "post.saved": "Guardado",
  "post.unsave": "Quitar",
  "post.delete": "Eliminar",
  "post.delete_confirm": "¿Estás seguro de que quieres eliminar esta publicación?",
  "saves_count": { one: "1 guardado", other: "{count} guardados" },

  "form.title": "Título",
  "form.content": "Contenido",
  "form.submit": "Publicar",
  "form.cancel": "Cancelar",
  "form.title_placeholder": "¿Qué tienes en mente?",
  "form.content_placeholder": "Escribe tu publicación aquí...",

  "pagination.prev": "Anterior",
  "pagination.next": "Siguiente",
  "pagination.page": "Página {page} de {totalPages}",

  "loading": "Cargando...",
  "error.generic": "Algo salió mal.",
  "error.retry": "Reintentar",
};

export const catalogs: Record<Locale, Catalog> = { en, es };

/**
 * Translate a key with optional interpolation and pluralization.
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const entry = catalogs[locale][key];

  if (!entry) return key;

  if (typeof entry === "string") {
    return interpolate(entry, params);
  }

  // Pluralization
  const count = params?.count;
  const form = count === 1 ? entry.one : entry.other;
  return interpolate(form, params);
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}
