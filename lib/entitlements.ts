export type AccessType = "free" | "subscription" | "purchase" | "subscription_or_purchase";
export type ViewerAccess = { subscriptionActive: boolean; purchasedMovieIds: string[] };
export function canWatch(movieId: string, accessType: AccessType, viewer: ViewerAccess) {
  if (accessType === "free") return true;
  if (accessType === "subscription") return viewer.subscriptionActive;
  if (accessType === "purchase") return viewer.purchasedMovieIds.includes(movieId);
  return viewer.subscriptionActive || viewer.purchasedMovieIds.includes(movieId);
}
