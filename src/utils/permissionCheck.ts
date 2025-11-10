/**
 * permisos: lista de permisos (resultado de userService.getUserPermissions)
 * moduleName: string
 * operation: "get" | "post" | "put" | "delete"
 */
export function canPerform(permisos: any[], moduleName: string, operation: "get" | "post" | "put" | "delete") {
  for (const p of permisos) {
    if (p.modulo === moduleName) {
      if (operation === "get" && p.puede_get) return true;
      if (operation === "post" && p.puede_post) return true;
      if (operation === "put" && p.puede_put) return true;
      if (operation === "delete" && p.puede_delete) return true;
    }
  }
  return false;
}
