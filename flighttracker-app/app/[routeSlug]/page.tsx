import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { RouteWorkspace } from "@/app/_components/RouteWorkspace";
import { auth } from "@/auth";
import { getRouteById } from "@/db/queries/routes/getRouteById";
import { parseRouteSlug } from "@/lib/routeSlug";
import { getSavedRoutesForUser } from "@/lib/savedRoutes";

type RouteDetailPageProps = {
  params: Promise<{ routeSlug: string }>;
};

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { routeSlug } = await params;
  const parsed = parseRouteSlug(routeSlug);
  if (!parsed) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const route = await getRouteById(parsed.routeId);
  if (!route) notFound();

  const savedRoutes = await getSavedRoutesForUser(Number(session.user.id));
  const existingSavedRoute = savedRoutes.find((savedRoute) => savedRoute.routeId === route.id);

  return (
    <main className="app-page">
      <div className="app-page-wide">
        <RouteWorkspace
          route={route}
          initialSaved={Boolean(existingSavedRoute)}
          initialNote={existingSavedRoute?.note ?? ""}
        />
      </div>
    </main>
  );
}
